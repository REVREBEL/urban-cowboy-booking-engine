-- Additive outlet tables; current content items remain intact.
CREATE TABLE IF NOT EXISTS outlet_types (
      tenant_id TEXT NOT NULL REFERENCES tenants(id), id TEXT NOT NULL,
      name TEXT, help_description TEXT, sort_order INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
      PRIMARY KEY(tenant_id,id));
CREATE TABLE IF NOT EXISTS outlets (
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
      FOREIGN KEY(tenant_id,image_media_asset_id) REFERENCES media_assets(tenant_id,id));
INSERT OR IGNORE INTO outlet_types (tenant_id,id) SELECT i.tenant_id,json_extract(r.payload_json,'$."outlet-type"') FROM content_items i JOIN content_revisions r ON r.id=i.current_revision_id AND r.content_item_id=i.id WHERE i.kind='outlet' AND json_valid(r.payload_json) AND NULLIF(json_extract(r.payload_json,'$."outlet-type"'),'') IS NOT NULL;
INSERT OR IGNORE INTO outlets (id,tenant_id,location_id,name,slug,status,outlet_type_id,outlet_name,short_name,short_description,long_description,hours_of_operation,address_line_1,address_line_2,city,state,postal_code,phone,email,website,instagram,facebook,yelp,reservations_url,google_maps_url)
SELECT i.id,i.tenant_id,i.location_id,json_extract(r.payload_json,'$.name'),i.slug,i.status,NULLIF(json_extract(r.payload_json,'$."outlet-type"'),''),
  NULLIF(json_extract(r.payload_json,'$."outlet-name"'),''),
  NULLIF(json_extract(r.payload_json,'$."outlet-short-name"'),''),
  NULLIF(json_extract(r.payload_json,'$."short-description"'),''),
  NULLIF(json_extract(r.payload_json,'$."long-description"'),''),
  NULLIF(json_extract(r.payload_json,'$."hours-of-operation"'),''),
  NULLIF(json_extract(r.payload_json,'$."street-address-line-1"'),''),
  NULLIF(json_extract(r.payload_json,'$."street-address-line-2"'),''),
  NULLIF(json_extract(r.payload_json,'$."city"'),''),
  NULLIF(json_extract(r.payload_json,'$."state"'),''),
  NULLIF(json_extract(r.payload_json,'$."postal-code"'),''),
  NULLIF(json_extract(r.payload_json,'$."main-phone"'),''),
  NULLIF(json_extract(r.payload_json,'$."email-address"'),''),
  NULLIF(json_extract(r.payload_json,'$."website"'),''),
  NULLIF(json_extract(r.payload_json,'$."instrgram"'),''),
  NULLIF(json_extract(r.payload_json,'$."facebook"'),''),
  NULLIF(json_extract(r.payload_json,'$."yelp"'),''),
  NULLIF(json_extract(r.payload_json,'$."reservations-url"'),''),
  NULLIF(json_extract(r.payload_json,'$."google-maps-link"'),'')
FROM content_items i JOIN content_revisions r ON r.id=i.current_revision_id AND r.content_item_id=i.id WHERE i.kind='outlet' AND json_valid(r.payload_json) AND NULLIF(json_extract(r.payload_json,'$.name'),'') IS NOT NULL;
