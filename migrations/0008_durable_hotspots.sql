-- COW-34: durable hotspot identity and replacement/re-crop safety.
--
-- The legacy `photo_hotspots` table in 0001 has no tenant scope, review state or
-- source geometry, so hotspot writes were blocked (photo-admin-parity.md).
-- These tables are additive and only use CREATE ... IF NOT EXISTS because the
-- migration runner applies every file twice to prove idempotency.
--
-- Identity is media_assets.id + (optional) media_placements.id, never a source
-- URL, resize parameter or Webflow/Squarespace file id. Geometry is normalized
-- source-space X/Y with the crop rectangle kept separately, so a responsive
-- re-crop cannot drift a pin.
--
-- Production guest reads are unchanged: the D1 path is behind a flag that
-- defaults to webflow. No Mews data is modelled here.
--
-- Rollback: scripts/d1-rollback/0008_durable_hotspots_down.sql

CREATE UNIQUE INDEX IF NOT EXISTS idx_media_version_files_tenant_version
  ON media_version_files (tenant_id, version_id);

-- Per-version file facts used for duplicate classification. A URL-only import
-- has no binary, so sha256/phash stay NULL and no near-duplicate is inferred.
CREATE TABLE IF NOT EXISTS media_version_fingerprints (
  version_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  media_asset_id TEXT NOT NULL,
  sha256 TEXT,
  phash TEXT,
  width INTEGER,
  height INTEGER,
  exif_orientation INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants (id),
  FOREIGN KEY (media_asset_id) REFERENCES media_assets (id),
  FOREIGN KEY (version_id) REFERENCES media_versions (id),
  FOREIGN KEY (tenant_id, media_asset_id) REFERENCES media_assets (tenant_id, id),
  FOREIGN KEY (tenant_id, version_id) REFERENCES media_version_files (tenant_id, version_id)
);

CREATE INDEX IF NOT EXISTS idx_media_version_fingerprints_tenant_asset
  ON media_version_fingerprints (tenant_id, media_asset_id);
CREATE INDEX IF NOT EXISTS idx_media_version_fingerprints_sha
  ON media_version_fingerprints (tenant_id, sha256);
CREATE INDEX IF NOT EXISTS idx_media_version_fingerprints_phash
  ON media_version_fingerprints (tenant_id, phash);

-- One durable pin. `source_version_id` is the version on which the normalized
-- source coordinates were authored; carrying a pin forward never rewrites them
-- unless a verified crop remap is applied.
CREATE TABLE IF NOT EXISTS photo_hotspot_mappings (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  media_asset_id TEXT NOT NULL,
  placement_id TEXT,
  target_table TEXT,
  target_id TEXT,
  amenity_id TEXT NOT NULL,
  source_x REAL NOT NULL CHECK (source_x >= 0 AND source_x <= 1),
  source_y REAL NOT NULL CHECK (source_y >= 0 AND source_y <= 1),
  source_version_id TEXT NOT NULL,
  source_width INTEGER,
  source_height INTEGER,
  exif_orientation INTEGER NOT NULL DEFAULT 1,
  crop_left REAL,
  crop_top REAL,
  crop_width REAL,
  crop_height REAL,
  display_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  review_state TEXT NOT NULL DEFAULT 'none' CHECK (review_state IN ('none', 'pending', 'approved')),
  review_reason TEXT,
  derived_from TEXT,
  duplicate_of TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants (id),
  FOREIGN KEY (media_asset_id) REFERENCES media_assets (id),
  FOREIGN KEY (tenant_id, media_asset_id) REFERENCES media_assets (tenant_id, id),
  FOREIGN KEY (amenity_id) REFERENCES amenities (id),
  FOREIGN KEY (source_version_id) REFERENCES media_versions (id),
  FOREIGN KEY (derived_from) REFERENCES photo_hotspot_mappings (id)
);

CREATE INDEX IF NOT EXISTS idx_hotspot_mappings_tenant_media
  ON photo_hotspot_mappings (tenant_id, media_asset_id, placement_id, status, display_order);
CREATE INDEX IF NOT EXISTS idx_hotspot_mappings_tenant_review
  ON photo_hotspot_mappings (tenant_id, review_state, status);
CREATE INDEX IF NOT EXISTS idx_hotspot_mappings_tenant_amenity
  ON photo_hotspot_mappings (tenant_id, amenity_id);
CREATE INDEX IF NOT EXISTS idx_hotspot_mappings_duplicate
  ON photo_hotspot_mappings (tenant_id, duplicate_of);

-- Immutable snapshots make rollback possible: each carry/remap/review stores
-- the geometry that was in force before it, so a prior version can be restored
-- without recomputing a crop that may no longer be valid.
CREATE TABLE IF NOT EXISTS photo_hotspot_mapping_revisions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  mapping_id TEXT NOT NULL,
  media_asset_id TEXT NOT NULL,
  from_version_id TEXT,
  to_version_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (
    action IN ('create', 'carry', 'remap', 'review', 'publish', 'rollback')
  ),
  snapshot_json TEXT NOT NULL,
  actor TEXT,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants (id),
  FOREIGN KEY (mapping_id) REFERENCES photo_hotspot_mappings (id),
  FOREIGN KEY (media_asset_id) REFERENCES media_assets (id),
  FOREIGN KEY (from_version_id) REFERENCES media_versions (id),
  FOREIGN KEY (to_version_id) REFERENCES media_versions (id)
);

CREATE INDEX IF NOT EXISTS idx_hotspot_mapping_revisions_mapping
  ON photo_hotspot_mapping_revisions (tenant_id, mapping_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hotspot_mapping_revisions_asset
  ON photo_hotspot_mapping_revisions (tenant_id, media_asset_id, to_version_id);
