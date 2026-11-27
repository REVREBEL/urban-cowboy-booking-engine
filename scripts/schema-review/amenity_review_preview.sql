-- LOCAL REVIEW PREVIEW ONLY. Not a production D1 migration.
-- Run once against a copy with 0013 already applied. Do not use with Wrangler.
PRAGMA foreign_keys=OFF;
PRAGMA legacy_alter_table=ON;
BEGIN IMMEDIATE;
ALTER TABLE amenities RENAME TO amenities_before_review;
CREATE TABLE amenities (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  short_name TEXT,
  short_description TEXT,
  long_description TEXT,
  benefit_headline TEXT,
  benefit_body TEXT,
  slug TEXT,
  type_id TEXT,
  category_id TEXT,
  global_amenity INTEGER CHECK (global_amenity IN (0,1)),
  image_name TEXT,
  image_path TEXT,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  FOREIGN KEY (tenant_id) REFERENCES tenants (id),
  FOREIGN KEY (tenant_id,type_id) REFERENCES amenity_types (tenant_id,id),
  FOREIGN KEY (tenant_id,category_id) REFERENCES amenity_categories (tenant_id,id),
  UNIQUE (tenant_id,id)
);
INSERT INTO amenities (id,tenant_id,name,short_name,short_description,long_description,image_name,image_path,active,sort_order,created_at,updated_at)
SELECT a.id,a.tenant_id,a.name,e.short_name,e.short_description,e.long_description,a.image_name,a.image_path,COALESCE(e.active,1),a.sort_order,a.created_at,e.updated_at
FROM amenities_before_review AS a LEFT JOIN amenity_editorial AS e ON e.amenity_id=a.id AND e.tenant_id=a.tenant_id;
DROP TABLE amenity_editorial;
DROP TABLE amenities_before_review;
CREATE INDEX IF NOT EXISTS idx_amenities_tenant_sort ON amenities(tenant_id,sort_order,id);
COMMIT;
PRAGMA legacy_alter_table=OFF;
PRAGMA foreign_keys=ON;
