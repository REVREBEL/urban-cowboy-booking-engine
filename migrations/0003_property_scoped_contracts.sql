-- COW-30: property-scoped schema contracts.
--
-- Additive only. 0001_init.sql and 0002_module_list_indexes.sql are already
-- applied in production and are not edited here. Mews remains the
-- transactional authority; these objects only make editorial identity,
-- provenance and tenant/location-scoped reads explicit.
--
-- Rollback: scripts/d1-rollback/0003_property_scoped_contracts_down.sql
-- (rollback scripts are deliberately NOT in migrations_dir: Wrangler applies
-- every *.sql file there as a forward migration).

-- ---------------------------------------------------------------------------
-- Legacy identity aliases
-- ---------------------------------------------------------------------------
-- A legacy ID (Webflow fileId/CDN URL, Squarespace asset ID/URL, Mews asset ID)
-- is an alias to a stable internal media_asset_id, never a primary identity.
-- alias_type is intentionally a free-text column: the Zod contract owns the
-- allowed values, so adding a provider needs no database migration.
CREATE TABLE IF NOT EXISTS media_aliases (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  media_asset_id TEXT NOT NULL,
  alias_type TEXT NOT NULL,
  alias_value TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (tenant_id, alias_type, alias_value),
  FOREIGN KEY (tenant_id) REFERENCES tenants (id),
  FOREIGN KEY (media_asset_id) REFERENCES media_assets (id)
);

-- ---------------------------------------------------------------------------
-- Source provenance
-- ---------------------------------------------------------------------------
-- One row per imported/target record. The composite primary key makes the
-- mapping idempotent. location_id is denormalised from the source row so a
-- location-scoped provenance lookup cannot leak across locations.
CREATE TABLE IF NOT EXISTS content_provenance (
  tenant_id TEXT NOT NULL,
  location_id TEXT,
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
  FOREIGN KEY (tenant_id) REFERENCES tenants (id),
  FOREIGN KEY (location_id) REFERENCES locations (id)
);

-- ---------------------------------------------------------------------------
-- Property-scoped indexes
-- ---------------------------------------------------------------------------
-- The scoped query helpers in worker/d1.ts use explicit predicates for each
-- supported combination (location present/absent, kind present/absent) so the
-- optimizer can rely on the index prefix. updated_at is DESC to match
-- ORDER BY updated_at DESC, id without a temporary B-tree sort.
CREATE INDEX IF NOT EXISTS idx_content_items_scope_kind_status_updated
  ON content_items (tenant_id, kind, status, updated_at DESC, id);
CREATE INDEX IF NOT EXISTS idx_content_items_scope_location_kind_status_updated
  ON content_items (tenant_id, location_id, kind, status, updated_at DESC, id);
CREATE INDEX IF NOT EXISTS idx_content_items_tenant_status_updated
  ON content_items (tenant_id, status, updated_at DESC, id);
CREATE INDEX IF NOT EXISTS idx_content_items_loc_status_updated
  ON content_items (tenant_id, location_id, status, updated_at DESC, id);

-- Tenant-wide and location-scoped event/media lists.
CREATE INDEX IF NOT EXISTS idx_events_scope_display_starts
  ON events (tenant_id, location_id, display_flag, starts_at, id);
CREATE INDEX IF NOT EXISTS idx_events_tenant_display_starts
  ON events (tenant_id, display_flag, starts_at, id);
CREATE INDEX IF NOT EXISTS idx_media_assets_scope_kind
  ON media_assets (tenant_id, location_id, kind, id);
CREATE INDEX IF NOT EXISTS idx_media_assets_scope_id
  ON media_assets (tenant_id, location_id, id);
CREATE INDEX IF NOT EXISTS idx_media_assets_tenant_kind
  ON media_assets (tenant_id, kind, id);
CREATE INDEX IF NOT EXISTS idx_media_assets_tenant_id
  ON media_assets (tenant_id, id);

-- Other structured editorial tables: tenant + location scoping plus their
-- natural presentation/sort order.
CREATE INDEX IF NOT EXISTS idx_room_types_scope_sort
  ON room_types (tenant_id, location_id, sort_order, id);
CREATE INDEX IF NOT EXISTS idx_buildings_scope_sort
  ON buildings (tenant_id, location_id, sort_order, id);
CREATE INDEX IF NOT EXISTS idx_rate_merchandising_scope_position
  ON rate_merchandising (tenant_id, location_id, position, id);
CREATE INDEX IF NOT EXISTS idx_amenities_tenant_sort
  ON amenities (tenant_id, sort_order, id);

-- Reverse amenity lookup (the room_type_amenities primary key already covers
-- the forward, by-room direction).
CREATE INDEX IF NOT EXISTS idx_room_type_amenities_amenity
  ON room_type_amenities (amenity_id);

-- Media alias reverse lookup and provenance filters. The UNIQUE constraint
-- already provides the (tenant_id, alias_type, alias_value) lookup index.
CREATE INDEX IF NOT EXISTS idx_media_aliases_asset
  ON media_aliases (media_asset_id, alias_type);
CREATE INDEX IF NOT EXISTS idx_content_provenance_location
  ON content_provenance (tenant_id, location_id);
CREATE INDEX IF NOT EXISTS idx_content_provenance_source
  ON content_provenance (tenant_id, source_system, source_collection);
