-- Initial amenity redesign foundation. Existing amenity rows and readers stay
-- in place until a later migration consolidates editorial data and assigns types.
-- NULL property overrides inherit the shared amenity value.
CREATE UNIQUE INDEX IF NOT EXISTS idx_amenities_tenant_id ON amenities (tenant_id, id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_locations_tenant_id ON locations (tenant_id, id);

CREATE TABLE IF NOT EXISTS amenity_types (
  tenant_id TEXT NOT NULL,
  id TEXT NOT NULL,
  name TEXT NOT NULL,
  help_description TEXT,
  examples TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  PRIMARY KEY (tenant_id, id),
  FOREIGN KEY (tenant_id) REFERENCES tenants (id)
);

CREATE TABLE IF NOT EXISTS amenity_categories (
  tenant_id TEXT NOT NULL,
  id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  PRIMARY KEY (tenant_id, id),
  FOREIGN KEY (tenant_id) REFERENCES tenants (id)
);

CREATE TABLE IF NOT EXISTS location_amenities (
  tenant_id TEXT NOT NULL,
  location_id TEXT NOT NULL,
  amenity_id TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
  short_name_override TEXT,
  short_description_override TEXT,
  long_description_override TEXT,
  benefit_headline_override TEXT,
  benefit_body_override TEXT,
  image_name_override TEXT,
  image_path_override TEXT,
  PRIMARY KEY (tenant_id, location_id, amenity_id),
  FOREIGN KEY (tenant_id, location_id) REFERENCES locations (tenant_id, id),
  FOREIGN KEY (tenant_id, amenity_id) REFERENCES amenities (tenant_id, id)
);
CREATE INDEX IF NOT EXISTS idx_location_amenities_amenity ON location_amenities (tenant_id, amenity_id);

INSERT OR IGNORE INTO amenity_types (tenant_id,id,name,help_description,examples,sort_order)
  SELECT id,'feature','Feature','A physical detail or built-in specification of a specific unit or room.','Radiant heated bathroom floors; river stone fireplace; copper clawfoot tub; double-pane windows; en-suite bathroom.',10 FROM tenants;
INSERT OR IGNORE INTO amenity_types (tenant_id,id,name,help_description,examples,sort_order)
  SELECT id,'amenity','Amenity','A shared facility, lifestyle perk, or guest service provided by the property or hotel.','Outdoor cedar soaking tub; wood-burning sauna; vintage bowling alley; 24/7 concierge; fitness center.',20 FROM tenants;
INSERT OR IGNORE INTO amenity_types (tenant_id,id,name,sort_order) SELECT id,'accessibility','Accessibility',30 FROM tenants;
INSERT OR IGNORE INTO amenity_types (tenant_id,id,name,sort_order) SELECT id,'wellness','Wellness',40 FROM tenants;
INSERT OR IGNORE INTO amenity_types (tenant_id,id,name,sort_order) SELECT id,'nature_environment','Nature / Environment',50 FROM tenants;
INSERT OR IGNORE INTO amenity_categories (tenant_id,id,name,sort_order) SELECT id,'property','Property',10 FROM tenants;
INSERT OR IGNORE INTO amenity_categories (tenant_id,id,name,sort_order) SELECT id,'rooms','Rooms',20 FROM tenants;
INSERT OR IGNORE INTO amenity_categories (tenant_id,id,name,sort_order) SELECT id,'outlet','Outlet',30 FROM tenants;
INSERT OR IGNORE INTO amenity_categories (tenant_id,id,name,sort_order) SELECT id,'location','Location',40 FROM tenants;
INSERT OR IGNORE INTO amenity_categories (tenant_id,id,name,sort_order) SELECT id,'other','Other',50 FROM tenants;

-- Seed defaults for tenants created after the migration (including fresh installs).
CREATE TRIGGER IF NOT EXISTS trg_tenant_amenity_lookup_defaults AFTER INSERT ON tenants
BEGIN
  INSERT OR IGNORE INTO amenity_types (tenant_id,id,name,help_description,examples,sort_order) VALUES
    (NEW.id,'feature','Feature','A physical detail or built-in specification of a specific unit or room.','Radiant heated bathroom floors; river stone fireplace; copper clawfoot tub; double-pane windows; en-suite bathroom.',10),
    (NEW.id,'amenity','Amenity','A shared facility, lifestyle perk, or guest service provided by the property or hotel.','Outdoor cedar soaking tub; wood-burning sauna; vintage bowling alley; 24/7 concierge; fitness center.',20),
    (NEW.id,'accessibility','Accessibility',NULL,NULL,30),
    (NEW.id,'wellness','Wellness',NULL,NULL,40),
    (NEW.id,'nature_environment','Nature / Environment',NULL,NULL,50);
  INSERT OR IGNORE INTO amenity_categories (tenant_id,id,name,sort_order) VALUES
    (NEW.id,'property','Property',10), (NEW.id,'rooms','Rooms',20),
    (NEW.id,'outlet','Outlet',30), (NEW.id,'location','Location',40),
    (NEW.id,'other','Other',50);
END;
