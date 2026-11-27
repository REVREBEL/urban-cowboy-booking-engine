#!/usr/bin/env python3
"""LOCAL REVIEW ONLY: import the Webflow feature copy into content revisions.

Creates one location-scoped content item per populated headline/paragraph pair.
Does not update site settings or publish content. Not a production migration.
"""
import csv
import hashlib
import json
import sqlite3
import sys
from pathlib import Path

db_path, source_path = map(Path, sys.argv[1:3])
source_bytes = source_path.read_bytes()
with source_path.open(newline='', encoding='utf-8-sig') as stream:
    rows = list(csv.DictReader(stream))
if len({row['id'] for row in rows}) != len(rows):
    raise ValueError('Duplicate source location IDs')
db = sqlite3.connect(db_path)
db.execute('PRAGMA foreign_keys=ON')
known = dict(db.execute('SELECT id, tenant_id FROM locations'))
if not {r['id'] for r in rows} <= known.keys():
    raise ValueError('Export contains a location missing from the local database')
source_hash = hashlib.sha256(source_bytes).hexdigest()
planned = []
for row in rows:
    for position in range(1, 4):
        headline = row[f'feature-headline-{position}']
        paragraph = row[f'feature-paragraph-{position}']
        if not headline.strip() and not paragraph.strip():
            continue
        item_id = f'preview-location-feature-{row["id"]}-{position}'
        planned.append((row, position, item_id, headline, paragraph))
db.execute('BEGIN IMMEDIATE')
try:
    for row, position, item_id, headline, paragraph in planned:
        location_id, tenant_id = row['id'], known[row['id']]
        existing = db.execute(
            'SELECT id FROM content_items WHERE tenant_id=? AND location_id=? AND kind=? AND slug=?',
            (tenant_id, location_id, 'location_feature', f'feature-{position}'),
        ).fetchone()
        if existing:
            raise ValueError(f'Feature item already exists for location {location_id}, position {position}')
        revision_id = item_id + '-r1'
        payload = json.dumps({'headline': headline or None, 'paragraph': paragraph or None, 'displayOrder': position}, ensure_ascii=False)
        db.execute(
            'INSERT INTO content_items (id,tenant_id,location_id,kind,slug,status,current_revision_id) VALUES (?,?,?,?,?,?,NULL)',
            (item_id,tenant_id,location_id,'location_feature',f'feature-{position}','draft'),
        )
        db.execute(
            'INSERT INTO content_revisions (id,content_item_id,revision,payload_json,created_by) VALUES (?,?,1,?,?)',
            (revision_id,item_id,payload,'local-review-import'),
        )
        db.execute('INSERT INTO content_item_pointers (tenant_id,content_item_id,working_revision_id) VALUES (?,?,?)', (tenant_id,item_id,revision_id))
        db.execute(
            'INSERT INTO content_provenance (tenant_id,location_id,target_table,target_id,source_system,source_collection,source_id,source_snapshot_date,source_hash) VALUES (?,?,?,?,?,?,?,?,?)',
            (tenant_id,location_id,'content_items',item_id,'webflow_cms','locations',location_id,'2026-11-15',source_hash),
        )
    if db.execute('PRAGMA foreign_key_check').fetchall() or db.execute('PRAGMA integrity_check').fetchone()[0] != 'ok':
        raise ValueError('Database integrity check failed')
    db.commit()
except BaseException:
    db.rollback()
    raise
print(f'Imported {len(planned)} draft feature items for local review; existing site settings unchanged.')
