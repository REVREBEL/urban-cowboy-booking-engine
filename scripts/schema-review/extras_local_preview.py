#!/usr/bin/env python3
"""One-time local SQLite review preview; not a production D1 migration."""
import csv, hashlib, json, sqlite3, sys
from pathlib import Path
from urllib.parse import urlparse, unquote

db_path, csv_path = map(Path, sys.argv[1:3])
with csv_path.open(newline='', encoding='utf-8-sig') as f:
    rows = list(csv.DictReader(f))
source = {r['id']: r for r in rows}
if len(source) != len(rows):
    raise ValueError('Duplicate source IDs')
db = sqlite3.connect(db_path)
db.execute('PRAGMA foreign_keys=ON')
existing = db.execute('SELECT id,tenant_id,location_id FROM add_ons').fetchall()
if set(source) != {row[0] for row in existing}:
    raise ValueError('Source IDs and local records differ; refusing to migrate')
values = {}
for extra_id, tenant, location in existing:
    revisions = db.execute("SELECT r.payload_json FROM content_items i JOIN content_revisions r ON r.id=i.current_revision_id AND r.content_item_id=i.id WHERE i.kind='add_on' AND i.tenant_id=? AND json_extract(r.payload_json,'$.id')=?", (tenant,extra_id)).fetchall()
    if len(revisions) != 1:
        raise ValueError(f'Expected one current content revision for {extra_id}')
    payload = json.loads(revisions[0][0])
    url = payload.get('imageUrl')
    if not url or urlparse(url).scheme not in ('http','https'):
        raise ValueError(f'Missing image URL for {extra_id}')
    flag = source[extra_id]['enable-quantity'].strip().lower()
    if flag not in ('true','false',''):
        raise ValueError(f'Invalid quantity switch for {extra_id}')
    values[extra_id] = (payload, None if flag=='' else int(flag=='true'))
try:
    db.execute('BEGIN IMMEDIATE')
    db.execute('ALTER TABLE add_ons RENAME TO extras')
    db.execute('ALTER TABLE extras RENAME COLUMN description TO long_description')
    db.execute('ALTER TABLE extras ADD COLUMN item_name TEXT')
    db.execute('ALTER TABLE extras ADD COLUMN short_description TEXT')
    db.execute('ALTER TABLE extras ADD COLUMN slug TEXT')
    db.execute('ALTER TABLE extras ADD COLUMN enable_quantity INTEGER CHECK(enable_quantity IN (0,1))')
    db.execute('CREATE UNIQUE INDEX idx_review_extras_tenant_id ON extras(tenant_id,id)')
    for extra_id, tenant, location in existing:
        payload, flag = values[extra_id]
        row = source[extra_id]
        db.execute('UPDATE extras SET item_name=?,short_description=?,slug=?,enable_quantity=? WHERE id=? AND tenant_id=?',
                   (payload.get('itemName'),payload.get('shortDescription'),row['slug'] or None,flag,extra_id,tenant))
        url = payload['imageUrl']
        matches = db.execute("SELECT media_asset_id FROM media_aliases WHERE tenant_id=? AND alias_type='source_url' AND alias_value=?",(tenant,url)).fetchall()
        if matches:
            asset_id = matches[0][0]
        else:
            digest=hashlib.sha256((tenant+'\0'+url).encode()).hexdigest()[:32]
            asset_id='extra-img-'+digest
            db.execute('INSERT INTO media_assets(id,tenant_id,kind,original_filename) VALUES (?,?,?,?)',(asset_id,tenant,'image',unquote(Path(urlparse(url).path).name)))
            db.execute('INSERT INTO media_aliases(id,tenant_id,media_asset_id,alias_type,alias_value) VALUES (?,?,?,?,?)',('extra-url-'+digest,tenant,asset_id,'source_url',url))
        placement='extra-place-'+hashlib.sha256((tenant+'\0'+extra_id).encode()).hexdigest()[:32]
        db.execute("INSERT INTO media_placements(id,tenant_id,media_asset_id,target_table,target_id,placement_type,display_order) VALUES (?,?,?,'extras',?,'extra_image',0)",(placement,tenant,asset_id,extra_id))
    db.execute('''CREATE TABLE extras_new (
      id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, name TEXT NOT NULL, long_description TEXT,
      mews_product_id TEXT, icon_media_asset_id TEXT, quantity_cap INTEGER,
      sort_order INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'draft',
      created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      item_name TEXT, short_description TEXT, slug TEXT, enable_quantity INTEGER CHECK(enable_quantity IN (0,1)),
      FOREIGN KEY(tenant_id) REFERENCES tenants(id))''')
    db.execute('''INSERT INTO extras_new SELECT id,tenant_id,name,long_description,mews_product_id,icon_media_asset_id,
      quantity_cap,sort_order,status,created_at,updated_at,item_name,short_description,slug,enable_quantity FROM extras''')
    db.execute('DROP TABLE extras')
    db.execute('ALTER TABLE extras_new RENAME TO extras')
    db.execute('CREATE UNIQUE INDEX idx_review_extras_tenant_id ON extras(tenant_id,id)')
    db.execute('CREATE INDEX idx_review_extras_status_sort ON extras(tenant_id,status,sort_order,id)')
    db.execute('''CREATE TABLE location_extras (
      tenant_id TEXT NOT NULL, location_id TEXT NOT NULL, extra_id TEXT NOT NULL,
      PRIMARY KEY(tenant_id,location_id,extra_id),
      FOREIGN KEY(tenant_id,location_id) REFERENCES locations(tenant_id,id),
      FOREIGN KEY(tenant_id,extra_id) REFERENCES extras(tenant_id,id))''')
    for extra_id, tenant, location in existing:
        if location is not None:
            db.execute('INSERT INTO location_extras VALUES (?,?,?)',(tenant,location,extra_id))
    if db.execute('PRAGMA integrity_check').fetchone()[0] != 'ok' or db.execute('PRAGMA foreign_key_check').fetchall():
        raise ValueError('Integrity or foreign key check failed')
    db.commit()
except BaseException:
    db.rollback()
    raise
print(f'Preview applied: {len(existing)} extras, {len(existing)} image placements; integrity checks passed.')
