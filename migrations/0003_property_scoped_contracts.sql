-- COW-30: property-scoped schema contracts.
--
-- Additive only. 0001_init.sql and 0002_module_list_indexes.sql are already
-- applied in production and are not edited here. Mews remains the
-- transactional authority; these objects only make editorial identity,
-- provenance and tenant/location-scoped reads explicit.
--
-- Rollback: migrations/0003_property_scoped_contracts_down.sql

-- ---------------------------------------------------------------------------
-- Legacy identity aliases
-- ---------------------------------------------------------------------------
-- media_assets/media_versions intentionally carry no legacy-provider columns
-- as primary identity. A legacy ID (Webflow fileId/CDN URL, Squarespace asset
-- ID/URL, or a Mews asset ID) lives here as an alias to a stable internal
-- media_asset_id. Adding a new legacy provider never requires a schema change.
CREATE TABLE IF NOT EXISTS media_aliases (
  id TEXT PRIMARY KEY,
  media_asset_id TEXT NOT NULL,
  alias_type TEXT NOT NULL CHECK (
    alias_type IN (
      'webflow_file_id',
      'webflow_cdn_url',
      'squarespace_asset_id',
      'squarespace_url',
      'mews_asset_id'
    )
  ),
  alias_value TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (alias_type, alias_value),
  FOREIGN KEY (media_asset_id) REFERENCES media_assets (id)
);

-- ---------------------------------------------------------------------------
-- Source provenance
-- ---------------------------------------------------------------------------
-- One row per migrated/target record. The composite primary key makes the
-- mapping idempotent and lets a reader answer "where did this row come from"
-- without depending on a mutable source URL or filename.
CREATE TABLE IF NOT EXISTS content_provenance (
  tenant_id TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_id TEXT NOT NULL,
  source_system TEXT NOT NULL CHECK (
    source_system IN ('webflow_cms', 'mews', 'n8n', 'manual', 'import')
  ),
  source_collection TEXT,
  source_id TEXT,
  source_snapshot_date TEXT,
  source_hash TEXT,
  imported_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (tenant_id, target_table, target_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants (id)
);

-- ---------------------------------------------------------------------------
-- Property-scoped indexes
-- ---------------------------------------------------------------------------
-- content_items list: tenant + optional location, kind, publication state,
-- ordered by most recent update. Two shapes so both scoped and unscoped reads
-- stay indexed.
-- updated_at is DESC to match the list query's ORDER BY updated_at DESC, id;
-- without it SQLite still sorts the result in a temporary B-tree.
CREATE INDEX IF NOT EXISTS idx_content_items_scope_kind_status_updated
  ON content_items (tenant_id, kind, status, updated_at DESC, id);
CREATE INDEX IF NOT EXISTS idx_content_items_scope_location_kind_status_updated
  ON content_items (tenant_id, location_id, kind, status, updated_at DESC, id);

-- Structured editorial tables: tenant + location scoping plus their natural
-- presentation/sort order.
CREATE INDEX IF NOT EXISTS idx_room_types_scope_sort
  ON room_types (tenant_id, location_id, sort_order, id);
CREATE INDEX IF NOT EXISTS idx_buildings_scope_sort
  ON buildings (tenant_id, location_id, sort_order, id);
CREATE INDEX IF NOT EXISTS idx_rate_merchandising_scope_position
  ON rate_merchandising (tenant_id, location_id, position, id);
CREATE INDEX IF NOT EXISTS idx_events_scope_display_starts
  ON events (tenant_id, location_id, display_flag, starts_at, id);
CREATE INDEX IF NOT EXISTS idx_amenities_tenant_sort
  ON amenities (tenant_id, sort_order, id);

-- Reverse amenity lookup (the room_type_amenities primary key already covers
-- the forward, by-room direction).
CREATE INDEX IF NOT EXISTS idx_room_type_amenities_amenity
  ON room_type_amenities (amenity_id);

-- Media and provenance lookups.
CREATE INDEX IF NOT EXISTS idx_media_assets_scope_kind
  ON media_assets (tenant_id, location_id, kind, id);
CREATE INDEX IF NOT EXISTS idx_content_provenance_source
  ON content_provenance (tenant_id, source_system, source_collection);
