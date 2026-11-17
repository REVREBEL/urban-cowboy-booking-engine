-- D1 foundation for Urban Cowboy platform migration.
-- Mews remains source of truth for availability/rates/reservations.
-- D1 owns editorial content, settings, revisions, media IDs, merchandising,
-- guest recovery state and reporting read models.

CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS buildings (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  location_id TEXT,
  name TEXT NOT NULL,
  slug TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants (id),
  FOREIGN KEY (location_id) REFERENCES locations (id)
);

CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  time_zone TEXT NOT NULL DEFAULT 'America/New_York',
  mews_hotel_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (tenant_id, slug),
  FOREIGN KEY (tenant_id) REFERENCES tenants (id)
);

CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  location_id TEXT,
  kind TEXT NOT NULL,            -- image | video | document
  original_filename TEXT,
  squarespace_asset_id TEXT,      -- CDN/storage identity, never PK
  squarespace_url TEXT,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants (id),
  FOREIGN KEY (location_id) REFERENCES locations (id)
);

CREATE TABLE IF NOT EXISTS media_versions (
  id TEXT PRIMARY KEY,
  media_asset_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  squarespace_asset_id TEXT NOT NULL,
  squarespace_url TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (media_asset_id, version),
  FOREIGN KEY (media_asset_id) REFERENCES media_assets (id)
);

CREATE TABLE IF NOT EXISTS content_items (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  location_id TEXT,
  kind TEXT NOT NULL,            -- rate_card | add_on | event | offer | upgrade | policy
  slug TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',  -- draft | published | archived
  current_revision_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (tenant_id, location_id, kind, slug),
  FOREIGN KEY (tenant_id) REFERENCES tenants (id),
  FOREIGN KEY (location_id) REFERENCES locations (id)
);

CREATE TABLE IF NOT EXISTS content_revisions (
  id TEXT PRIMARY KEY,
  content_item_id TEXT NOT NULL,
  revision INTEGER NOT NULL,
  payload_json TEXT NOT NULL,
  published_at TEXT,
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (content_item_id, revision),
  FOREIGN KEY (content_item_id) REFERENCES content_items (id)
);

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  actor TEXT,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  metadata_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_media_assets_tenant ON media_assets (tenant_id);
CREATE INDEX IF NOT EXISTS idx_content_items_tenant_kind ON content_items (tenant_id, kind);
CREATE INDEX IF NOT EXISTS idx_content_revisions_item ON content_revisions (content_item_id);

-- Commercial modules: events, add-ons, offers, upgrades (D1 editorial; Mews validates price/eligibility).
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  location_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  venue TEXT,
  time_zone TEXT NOT NULL DEFAULT 'America/New_York',
  starts_at TEXT NOT NULL,
  ends_at TEXT,
  recurrence_rule TEXT,
  capacity INTEGER,
  display_flag INTEGER NOT NULL DEFAULT 1,
  media_asset_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants (id),
  FOREIGN KEY (location_id) REFERENCES locations (id),
  FOREIGN KEY (media_asset_id) REFERENCES media_assets (id)
);

CREATE TABLE IF NOT EXISTS add_ons (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  location_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  mews_product_id TEXT,
  icon_media_asset_id TEXT,
  quantity_cap INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants (id),
  FOREIGN KEY (location_id) REFERENCES locations (id)
);

CREATE TABLE IF NOT EXISTS offers (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  location_id TEXT,
  name TEXT NOT NULL,
  headline TEXT,
  description TEXT,
  rate_product_id TEXT,
  cta_label TEXT,
  starts_at TEXT,
  ends_at TEXT,
  member_only INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants (id),
  FOREIGN KEY (location_id) REFERENCES locations (id)
);

CREATE TABLE IF NOT EXISTS upgrades (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  location_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  priority INTEGER NOT NULL DEFAULT 0,
  audience_rule TEXT,
  room_rule TEXT,
  media_asset_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants (id),
  FOREIGN KEY (location_id) REFERENCES locations (id),
  FOREIGN KEY (media_asset_id) REFERENCES media_assets (id)
);

-- Guest engagement & recovery.
CREATE TABLE IF NOT EXISTS guest_sessions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  location_id TEXT,
  anonymous_id TEXT NOT NULL,
  known_email TEXT,
  consent_status TEXT NOT NULL DEFAULT 'unknown',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants (id)
);

CREATE TABLE IF NOT EXISTS email_captures (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  email TEXT NOT NULL,
  source TEXT,
  consent_provenance TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (session_id) REFERENCES guest_sessions (id)
);

CREATE TABLE IF NOT EXISTS saved_room_matches (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  room_category_id TEXT NOT NULL,
  check_in TEXT,
  check_out TEXT,
  adults INTEGER,
  children INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (session_id) REFERENCES guest_sessions (id)
);

CREATE TABLE IF NOT EXISTS cart_abandonments (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  reservation_id TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  recovered_value REAL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (session_id) REFERENCES guest_sessions (id)
);

CREATE TABLE IF NOT EXISTS recovery_campaigns (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  template_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants (id)
);

-- Analytics read models.
CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  location_id TEXT,
  session_id TEXT,
  event_type TEXT NOT NULL,
  payload_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants (id)
);

CREATE TABLE IF NOT EXISTS analytics_daily (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  location_id TEXT,
  day TEXT NOT NULL,
  metric TEXT NOT NULL,
  value REAL NOT NULL DEFAULT 0,
  UNIQUE (tenant_id, location_id, day, metric),
  FOREIGN KEY (tenant_id) REFERENCES tenants (id)
);
CREATE TABLE IF NOT EXISTS room_types (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  location_id TEXT,
  mews_room_category_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants (id),
  FOREIGN KEY (location_id) REFERENCES locations (id)
);

CREATE TABLE IF NOT EXISTS amenities (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  image_name TEXT,
  image_path TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants (id)
);

CREATE TABLE IF NOT EXISTS room_type_amenities (
  room_type_id TEXT NOT NULL,
  amenity_id TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  excluded INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (room_type_id, amenity_id),
  FOREIGN KEY (room_type_id) REFERENCES room_types (id),
  FOREIGN KEY (amenity_id) REFERENCES amenities (id)
);

CREATE TABLE IF NOT EXISTS photo_hotspots (
  id TEXT PRIMARY KEY,
  media_asset_id TEXT NOT NULL,
  media_version INTEGER NOT NULL,
  x REAL NOT NULL,
  y REAL NOT NULL,
  amenity_id TEXT,
  label TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (media_asset_id) REFERENCES media_assets (id),
  FOREIGN KEY (amenity_id) REFERENCES amenities (id)
);

CREATE TABLE IF NOT EXISTS rate_merchandising (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  location_id TEXT,
  rate_product_id TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  styling TEXT,
  geo_targeting TEXT,
  cancellation_rules TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants (id),
  FOREIGN KEY (location_id) REFERENCES locations (id)
);
