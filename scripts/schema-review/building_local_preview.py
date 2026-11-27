#!/usr/bin/env python3
"""One-time local SQLite building review preview; not a D1 migration."""
import csv, sqlite3, sys
from pathlib import Path

db_path, csv_path = map(Path,sys.argv[1:3])
with csv_path.open(newline='',encoding='utf-8-sig') as f:
    rows=list(csv.DictReader(f))
ids=[r['id'] for r in rows]
if len(ids)!=len(set(ids)):
    raise ValueError('Duplicate building source IDs')
db=sqlite3.connect(db_path)
db.execute('PRAGMA foreign_keys=ON')
if set(ids)!={r[0] for r in db.execute('SELECT id FROM buildings')}:
    raise ValueError('Source and local building IDs differ')
for r in rows:
    if r['isArchived'].lower() not in ('true','false') or r['isDraft'].lower() not in ('true','false'):
        raise ValueError('Unknown publication flag')
try:
    db.execute('BEGIN IMMEDIATE')
    for field in ('subheadline','short_description','long_description','feature_benefits','status'):
        db.execute(f'ALTER TABLE buildings ADD COLUMN {field} TEXT')
    for r in rows:
        status='archived' if r['isArchived'].lower()=='true' else ('draft' if r['isDraft'].lower()=='true' else ('published' if r['lastPublished'] else None))
        db.execute('UPDATE buildings SET subheadline=?,short_description=?,long_description=?,feature_benefits=?,status=? WHERE id=?',
            (r['subheadline'] or None,r['short-description'] or None,r['long-description'] or None,r['feature-benefits'] or None,status,r['id']))
    if db.execute('PRAGMA integrity_check').fetchone()[0]!='ok' or db.execute('PRAGMA foreign_key_check').fetchall():
        raise ValueError('Integrity or foreign key check failed')
    db.commit()
except BaseException:
    db.rollback()
    raise
print(f'Added building content and status for {len(rows)} records; integrity checks passed.')
