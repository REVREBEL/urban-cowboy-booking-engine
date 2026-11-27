#!/usr/bin/env python3
"""One-time local SQLite review preview; not a production D1 migration."""
import json, sqlite3, sys

db=sqlite3.connect(sys.argv[1]);db.execute('PRAGMA foreign_keys=ON')
rows=db.execute("""SELECT i.id,i.tenant_id,i.location_id,i.slug,i.status,r.payload_json
  FROM content_items i LEFT JOIN content_revisions r ON r.id=i.current_revision_id AND r.content_item_id=i.id
  WHERE i.kind='outlet'""").fetchall()
if not rows or any(r[5] is None for r in rows):
    raise ValueError('Outlets have missing current revisions or no records')
try:
    db.execute('BEGIN IMMEDIATE')
    db.execute('''CREATE TABLE outlet_types (
      tenant_id TEXT NOT NULL REFERENCES tenants(id), id TEXT NOT NULL,
      name TEXT, help_description TEXT, sort_order INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
      PRIMARY KEY(tenant_id,id))''')
    db.execute('''CREATE TABLE outlets (
      id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, location_id TEXT,
      name TEXT NOT NULL, outlet_name TEXT, short_name TEXT, slug TEXT, status TEXT,
      outlet_type_id TEXT, short_description TEXT, long_description TEXT, hours_of_operation TEXT,
      address_line_1 TEXT, address_line_2 TEXT, city TEXT, state TEXT, postal_code TEXT,
      phone TEXT, email TEXT, website TEXT, instagram TEXT, facebook TEXT, yelp TEXT,
      reservations_url TEXT, google_maps_url TEXT, image_media_asset_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(tenant_id) REFERENCES tenants(id),
      FOREIGN KEY(tenant_id,location_id) REFERENCES locations(tenant_id,id),
      FOREIGN KEY(tenant_id,outlet_type_id) REFERENCES outlet_types(tenant_id,id),
      FOREIGN KEY(tenant_id,image_media_asset_id) REFERENCES media_assets(tenant_id,id))''')
    mapping=('outlet-name','outlet-short-name','short-description','long-description','hours-of-operation',
      'street-address-line-1','street-address-line-2','city','state','postal-code',
      'main-phone','email-address','website','instrgram','facebook','yelp','reservations-url','google-maps-link')
    for ident,tenant,location,slug,status,raw in rows:
        p=json.loads(raw)
        if p.get('id')!=ident or not p.get('name'):
            raise ValueError('Outlet payload identity or name mismatch')
        option=p.get('outlet-type') or None
        if option: db.execute('INSERT OR IGNORE INTO outlet_types(tenant_id,id) VALUES (?,?)',(tenant,option))
        vals=[p.get(k) or None for k in mapping]
        db.execute('''INSERT INTO outlets (id,tenant_id,location_id,name,slug,status,outlet_type_id,
          outlet_name,short_name,short_description,long_description,hours_of_operation,
          address_line_1,address_line_2,city,state,postal_code,phone,email,website,instagram,facebook,yelp,reservations_url,google_maps_url)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',
          (ident,tenant,location,p['name'],slug,status,option,*vals))
    if db.execute('PRAGMA integrity_check').fetchone()[0]!='ok' or db.execute('PRAGMA foreign_key_check').fetchall():
        raise ValueError('Integrity or foreign key check failed')
    db.commit()
except BaseException:
    db.rollback();raise
print(f'Created outlets and outlet_types; imported {len(rows)} outlets. Integrity checks passed.')
