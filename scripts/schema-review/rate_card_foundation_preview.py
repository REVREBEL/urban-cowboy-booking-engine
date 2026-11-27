#!/usr/bin/env python3
"""One-shot local schema preview; this is not a production D1 migration."""
import csv
import hashlib
import json
import sqlite3
import sys
from pathlib import Path

db_path, csv_path = map(Path, sys.argv[1:3])
with csv_path.open(newline='', encoding='utf-8-sig') as f:
    rows = list(csv.DictReader(f))
if len({r['id'] for r in rows}) != len(rows):
    raise ValueError('Duplicate rate IDs in export')
db = sqlite3.connect(db_path)
db.execute('PRAGMA foreign_keys=ON')
if db.execute("SELECT COUNT(*) FROM sqlite_schema WHERE type='table' AND name='rates'").fetchone()[0]:
    raise ValueError('rates already exists; refusing to replace data')
if db.execute('SELECT COUNT(*) FROM rate_policies').fetchone()[0]:
    raise ValueError('Existing rate policy assignments require reconciliation')
if not {r['id'] for r in rows} <= {r[0] for r in db.execute('SELECT id FROM offers')}:
    raise ValueError('Some source IDs are missing from offers')
db.execute('BEGIN IMMEDIATE')
try:
    db.execute('ALTER TABLE offers RENAME TO rates')
    for field in ['eyebrow','long_description']:
        db.execute(f'ALTER TABLE rates ADD COLUMN {field} TEXT')
    db.execute('CREATE UNIQUE INDEX idx_review_rates_tenant_id ON rates(tenant_id,id)')
    db.execute('''CREATE TABLE rate_card_themes (
      id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, name TEXT NOT NULL,
      button_color TEXT, text_color TEXT, card_fill TEXT, rate_font TEXT, accent_color_2 TEXT,
      legacy_option_ids_json TEXT,
      UNIQUE(tenant_id,id), FOREIGN KEY(tenant_id) REFERENCES tenants(id))''')
    db.execute('''CREATE TABLE rate_card_configuration (
      tenant_id TEXT NOT NULL, rate_id TEXT NOT NULL, theme_id TEXT,
      default_card INTEGER CHECK(default_card IN (0,1)),
      desktop_overlay_position TEXT, mobile_overlay_position TEXT,
      desktop_overlay_source_option_id TEXT, mobile_overlay_source_option_id TEXT,
      PRIMARY KEY(tenant_id,rate_id),
      FOREIGN KEY(tenant_id,rate_id) REFERENCES rates(tenant_id,id),
      FOREIGN KEY(tenant_id,theme_id) REFERENCES rate_card_themes(tenant_id,id))''')
    for field in ['cancellation_penalty_window','cancellation_full_forfeit_window']:
        db.execute(f'ALTER TABLE policies ADD COLUMN {field} INTEGER')
    for field in ['cancellation_penalty_period_source_id','cancellation_full_forfeit_period_source_id']:
        db.execute(f'ALTER TABLE policies ADD COLUMN {field} TEXT')
    db.execute('DROP TABLE rate_policies')
    db.execute('''CREATE TABLE rate_policies (
      tenant_id TEXT NOT NULL, rate_id TEXT NOT NULL, policy_id TEXT NOT NULL,
      policy_type TEXT NOT NULL DEFAULT 'rate' CHECK(policy_type='rate'),
      display_order INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY(tenant_id,rate_id,policy_id),
      FOREIGN KEY(tenant_id,rate_id) REFERENCES rates(tenant_id,id),
      FOREIGN KEY(tenant_id,policy_id,policy_type) REFERENCES policies(tenant_id,id,type_id))''')
    for row in rows:
        rid = row['id']
        tenant = db.execute('SELECT tenant_id FROM rates WHERE id=?',(rid,)).fetchone()[0]
        db.execute('UPDATE rates SET eyebrow=?,long_description=? WHERE id=?',(row['eyebrow'] or None,row['long-description'] or None,rid))
        style_keys = ['button-color','text-color','card-fill','rate-font','accent-color-2']
        source_style = {k:row[k] for k in style_keys if row[k].strip()}
        theme_id = None
        if source_style:
            # Hashes produce stable preview IDs without treating Webflow option IDs as colors.
            digest=hashlib.sha256(json.dumps(source_style,sort_keys=True).encode()).hexdigest()[:20]
            theme_id='webflow-preview:'+tenant+':'+digest
            db.execute('INSERT OR IGNORE INTO rate_card_themes (id,tenant_id,name,legacy_option_ids_json) VALUES (?,?,?,?)',
                       (theme_id,tenant,'Imported theme '+digest[:6],json.dumps(source_style,sort_keys=True)))
        raw_default=row['default-card'].strip().lower()
        if raw_default not in ('','true','false'): raise ValueError('Unexpected default-card value')
        default=None if not raw_default else int(raw_default=='true')
        db.execute('''INSERT INTO rate_card_configuration (tenant_id,rate_id,theme_id,default_card,desktop_overlay_source_option_id,mobile_overlay_source_option_id)
                      VALUES (?,?,?,?,?,?)''',(tenant,rid,theme_id,default,row['desktop-overlay-position'] or None,row['mobile-overlay-position'] or None))
        p=row['cancellation-penalty-window'].strip()
        pp=row['cancellation-penalty-window-period'].strip()
        full=row['cancellation-full-forfeit-window'].strip()
        fp=row['cancellation-full-forfeit-window-period'].strip()
        if any((p,pp,full,fp)):
            pid='preview-rate-cancellation:'+rid
            db.execute('''INSERT INTO policies (id,tenant_id,type_id,name,active,cancellation_penalty_window,
                cancellation_penalty_period_source_id,cancellation_full_forfeit_window,cancellation_full_forfeit_period_source_id)
                VALUES (?,?,'rate',?,?,?,?,?,?)''',
                (pid,tenant,row['name']+' cancellation',int(row['active'].strip().lower()=='true'),int(p) if p else None,pp or None,int(full) if full else None,fp or None))
            db.execute('INSERT INTO rate_policies (tenant_id,rate_id,policy_id) VALUES (?,?,?)',(tenant,rid,pid))
    if db.execute('PRAGMA foreign_key_check').fetchall() or db.execute('PRAGMA integrity_check').fetchone()[0]!='ok':
        raise ValueError('Integrity check failed')
    db.commit()
except BaseException:
    db.rollback()
    raise
print(f'Prepared {len(rows)} local rate records with card themes, configuration, and linked cancellation policies.')
