-- COW-97: publication state for editorial source records whose D1 tables have
-- no status column, plus the explicit metadata contract for selectively
-- mirrored Mews reference data. No ARI table is created here.
--
-- `room_types` and `locations` carry identity but no publication state (COW-29
-- F-04/F-05). A physical ADD COLUMN cannot be applied twice by the migration
-- runner, so state lives in additive extension tables following the
-- `amenity_editorial` / `0006_working_revision_pointer` pattern.
--
-- Rows without a publication row keep today's published behavior. The backfill
-- is INSERT OR IGNORE so an editor-owned status set by a later import is never
-- overwritten by a re-applied migration.
--
-- `mews_reference_sync` stores only stable reference identity and reconciliation
-- metadata. The reference_type CHECK deliberately excludes availability,
-- inventory, restrictions and rates: those are read live from Mews and must
-- never become authoritative in D1.
--
-- Rollback: scripts/d1-rollback/0012_editorial_publication_state_down.sql

-- Parent keys for the composite (tenant_id, id) foreign keys below. `id` is a
-- global primary key in 0001, so these indexes cannot reject valid data.
CREATE UNIQUE INDEX IF NOT EXISTS idx_room_types_tenant_id
  ON room_types (tenant_id, id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_locations_tenant_id
  ON locations (tenant_id, id);

CREATE TABLE IF NOT EXISTS room_type_publication (
  tenant_id TEXT NOT NULL,
  room_type_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'published', 'archived')),
  source_snapshot_date TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (tenant_id, room_type_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants (id),
  FOREIGN KEY (room_type_id) REFERENCES room_types (id),
  FOREIGN KEY (tenant_id, room_type_id) REFERENCES room_types (tenant_id, id)
);

CREATE TABLE IF NOT EXISTS location_publication (
  tenant_id TEXT NOT NULL,
  location_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'published', 'archived')),
  source_snapshot_date TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (tenant_id, location_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants (id),
  FOREIGN KEY (location_id) REFERENCES locations (id),
  FOREIGN KEY (tenant_id, location_id) REFERENCES locations (tenant_id, id)
);

CREATE INDEX IF NOT EXISTS idx_room_type_publication_status
  ON room_type_publication (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_location_publication_status
  ON location_publication (tenant_id, status);

-- Stable Mews reference data only. source_system is pinned to 'mews' and the
-- allowed types exclude every ARI concept; the Zod contract mirrors this enum.
CREATE TABLE IF NOT EXISTS mews_reference_sync (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  location_id TEXT,
  reference_type TEXT NOT NULL CHECK (
    reference_type IN ('hotel', 'rate_group', 'product', 'room_category', 'age_category')
  ),
  reference_id TEXT NOT NULL,
  payload_json TEXT,
  source_system TEXT NOT NULL DEFAULT 'mews' CHECK (source_system = 'mews'),
  synced_at TEXT NOT NULL DEFAULT (datetime('now')),
  reconciled_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (tenant_id, reference_type, reference_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants (id),
  FOREIGN KEY (tenant_id, location_id) REFERENCES locations (tenant_id, id)
);

CREATE INDEX IF NOT EXISTS idx_mews_reference_sync_type
  ON mews_reference_sync (tenant_id, reference_type, reference_id);

-- Neutral backfill. Existing production rows are published; a draft is written
-- by the importer from source publication state, not guessed by this migration.
INSERT OR IGNORE INTO room_type_publication (tenant_id, room_type_id, status)
  SELECT tenant_id, id, 'published' FROM room_types;
INSERT OR IGNORE INTO location_publication (tenant_id, location_id, status)
  SELECT tenant_id, id, 'published' FROM locations;
