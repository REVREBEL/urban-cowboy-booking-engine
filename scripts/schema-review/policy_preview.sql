-- Local schema review only. No production migration or data import.
-- Type selects exactly one scope: property, room type, or rate.
CREATE UNIQUE INDEX IF NOT EXISTS idx_review_room_types_tenant_id ON room_types (tenant_id,id);
CREATE TABLE IF NOT EXISTS policy_types (
  tenant_id TEXT NOT NULL,
  id TEXT NOT NULL CHECK (id IN ('property','room_type','rate')),
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  PRIMARY KEY (tenant_id,id),
  FOREIGN KEY (tenant_id) REFERENCES tenants (id)
);
CREATE TABLE IF NOT EXISTS policies (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  type_id TEXT NOT NULL,
  name TEXT NOT NULL,
  short_name TEXT,
  short_description TEXT,
  long_description TEXT,
  image_name TEXT,
  image_path TEXT,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  UNIQUE (tenant_id,id,type_id),
  FOREIGN KEY (tenant_id,type_id) REFERENCES policy_types (tenant_id,id)
);
CREATE TABLE IF NOT EXISTS location_policies (
  tenant_id TEXT NOT NULL,
  location_id TEXT NOT NULL,
  policy_id TEXT NOT NULL,
  policy_type TEXT NOT NULL DEFAULT 'property' CHECK (policy_type='property'),
  display_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (tenant_id,location_id,policy_id),
  FOREIGN KEY (tenant_id,location_id) REFERENCES locations (tenant_id,id),
  FOREIGN KEY (tenant_id,policy_id,policy_type) REFERENCES policies (tenant_id,id,type_id)
);
CREATE TABLE IF NOT EXISTS room_type_policies (
  tenant_id TEXT NOT NULL,
  room_type_id TEXT NOT NULL,
  policy_id TEXT NOT NULL,
  policy_type TEXT NOT NULL DEFAULT 'room_type' CHECK (policy_type='room_type'),
  display_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (tenant_id,room_type_id,policy_id),
  FOREIGN KEY (tenant_id,room_type_id) REFERENCES room_types (tenant_id,id),
  FOREIGN KEY (tenant_id,policy_id,policy_type) REFERENCES policies (tenant_id,id,type_id)
);
-- Rate identity model is pending; this is a placeholder external reference,
-- not a foreign key or a confirmed mapping to any particular Mews entity.
CREATE TABLE IF NOT EXISTS rate_policies (
  tenant_id TEXT NOT NULL,
  rate_reference_id TEXT NOT NULL,
  policy_id TEXT NOT NULL,
  policy_type TEXT NOT NULL DEFAULT 'rate' CHECK (policy_type='rate'),
  display_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (tenant_id,rate_reference_id,policy_id),
  FOREIGN KEY (tenant_id,policy_id,policy_type) REFERENCES policies (tenant_id,id,type_id)
);
INSERT OR IGNORE INTO policy_types (tenant_id,id,name,sort_order) SELECT id,'property','Property',10 FROM tenants;
INSERT OR IGNORE INTO policy_types (tenant_id,id,name,sort_order) SELECT id,'room_type','Room Type',20 FROM tenants;
INSERT OR IGNORE INTO policy_types (tenant_id,id,name,sort_order) SELECT id,'rate','Rate',30 FROM tenants;
CREATE TRIGGER IF NOT EXISTS trg_review_policy_types_after_tenant AFTER INSERT ON tenants BEGIN
  INSERT OR IGNORE INTO policy_types (tenant_id,id,name,sort_order) VALUES
    (NEW.id,'property','Property',10), (NEW.id,'room_type','Room Type',20), (NEW.id,'rate','Rate',30);
END;
