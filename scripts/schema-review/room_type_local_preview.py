#!/usr/bin/env python3
"""Local DbGate review only: add Webflow room fields and import a CSV snapshot.

Run once on a disposable SQLite review copy. This is not a D1 migration.
Existing identity, room-amenity and publication fields remain unchanged.
"""
import csv
import sqlite3
import sys
from pathlib import Path

DB, CSV = map(Path, sys.argv[1:3])
fields = {
    'full_name': ('TEXT', 'full-name', 'text'),
    'short_name': ('TEXT', 'short-name', 'text'),
    'name_split_2': ('TEXT', 'name-split-2', 'text'),
    'short_description': ('TEXT', 'short-description', 'text'),
    'long_description': ('TEXT', 'long-description', 'text'),
    'benefit_statement': ('TEXT', 'benefits-statment', 'text'),
    'building_id': ('TEXT REFERENCES buildings(id)', 'building', 'text'),
    'square_feet': ('TEXT', 'square-feet', 'text'),
    'number_of_bedrooms': ('INTEGER', 'number-of-bedrooms', 'int'),
    'number_of_beds': ('INTEGER', 'number-of-beds', 'int'),
    'is_suite': ('INTEGER CHECK(is_suite IN (0,1))', 'suite', 'bool'),
    'is_room': ('INTEGER CHECK(is_room IN (0,1))', 'room', 'bool'),
    'bed_type_source_id': ('TEXT', 'bed-type', 'text'),
    'number_of_units': ('INTEGER', 'number-of-units', 'int'),
    'component_room': ('INTEGER CHECK(component_room IN (0,1))', 'component-room', 'bool'),
    'active': ('INTEGER CHECK(active IN (0,1))', 'active', 'bool'),
    'review': ('TEXT', 'review', 'text'),
    'review_source': ('TEXT', 'review-source', 'text'),
    'review_url': ('TEXT', 'review-url', 'text'),
    'review_date': ('TEXT', 'review-date', 'text'),
    'reviewer_name_or_handle': ('TEXT', 'reviewer-name-or-handle', 'text'),
    'webflow_policy_ids': ('TEXT', 'policies', 'text'),
    'webflow_cms_locale_id': ('TEXT', 'cmsLocaleId', 'text'),
    'webflow_created_on': ('TEXT', 'createdOn', 'text'),
    'webflow_last_updated': ('TEXT', 'lastUpdated', 'text'),
    'webflow_last_published': ('TEXT', 'lastPublished', 'text'),
    'webflow_is_archived': ('INTEGER CHECK(webflow_is_archived IN (0,1))', 'isArchived', 'bool'),
    'webflow_is_draft': ('INTEGER CHECK(webflow_is_draft IN (0,1))', 'isDraft', 'bool'),
}

def convert(value, kind):
    if value is None or not value.strip():
        return None
    if kind == 'int':
        return int(value.strip())
    if kind == 'bool':
        value = value.strip().lower()
        if value not in ('true', 'false'):
            raise ValueError('Invalid boolean value')
        return int(value == 'true')
    return value

with CSV.open(newline='', encoding='utf-8-sig') as source:
    rows = list(csv.DictReader(source))
ids = [r['id'] for r in rows]
if len(ids) != len(set(ids)):
    raise ValueError('Source contains duplicate room IDs')
db = sqlite3.connect(DB)
db.execute('PRAGMA foreign_keys=ON')
existing = {r[0] for r in db.execute('SELECT id FROM room_types')}
if not set(ids) <= existing:
    raise ValueError('Some source room IDs are absent from the review database')
existing_columns = {r[1] for r in db.execute('PRAGMA table_info(room_types)')}
if existing_columns.intersection(fields):
    raise ValueError('Preview columns already exist; refusing to overwrite edits')
db.execute('BEGIN IMMEDIATE')
try:
    for name, (datatype, _, _) in fields.items():
        db.execute(f'ALTER TABLE room_types ADD COLUMN "{name}" {datatype}')
    updates = ','.join('"' + name + '"=?' for name in fields)
    for row in rows:
        values = [convert(row[source], kind) for _, source, kind in fields.values()]
        db.execute('UPDATE room_types SET ' + updates + ' WHERE id=?', (*values, row['id']))
    violations = db.execute('PRAGMA foreign_key_check').fetchall()
    if violations or db.execute('PRAGMA integrity_check').fetchone()[0] != 'ok':
        raise ValueError(f'Integrity check failed: {violations!r}')
    db.commit()
except BaseException:
    db.rollback()
    raise
print(f'Imported {len(rows)} room types and added {len(fields)} fields; integrity checks passed.')
