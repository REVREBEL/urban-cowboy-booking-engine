-- COW-33: master media registry extension.
--
-- Additive only. 0001 to 0003 are already applied in production and are not
-- edited here. media_assets.id is the never-reused media_id; media_versions.id
-- is the per-upload version_id. Replacing a photo adds a media_versions row and
-- leaves both the media_id and every placement pointing at it unchanged.
--
-- New metadata lives in extension tables keyed by those immutable IDs so the
-- migration stays idempotent: SQLite has no ADD COLUMN IF NOT EXISTS, and the
-- migration runner applies each file twice to prove idempotency.
--
-- Rollback: scripts/d1-rollback/0004_media_registry_down.sql
-- (rollback scripts are deliberately NOT in migrations_dir: Wrangler applies
-- every *.sql file there as a forward migration).

-- ---------------------------------------------------------------------------
-- Immutable identity
-- ---------------------------------------------------------------------------
-- A logical photo keeps its media_assets.id for its whole life. A reupload adds
-- a row to media_versions with a new version_id. These triggers block accidental
-- identity rewrites even when a writer forgets the service-layer guard.
CREATE TRIGGER IF NOT EXISTS media_assets_id_immutable
BEFORE UPDATE OF id ON media_assets
BEGIN
  SELECT RAISE(ABORT, 'media_id is immutable');
END;

CREATE TRIGGER IF NOT EXISTS media_versions_id_immutable
BEFORE UPDATE OF id ON media_versions
BEGIN
  SELECT RAISE(ABORT, 'version_id is immutable');
END;

CREATE TRIGGER IF NOT EXISTS media_versions_asset_immutable
BEFORE UPDATE OF media_asset_id ON media_versions
BEGIN
  SELECT RAISE(ABORT, 'a version cannot change its media_id');
END;

-- Parent key for the composite FK that keeps current_version_id on the same
-- media asset. media_versions.id is already globally unique; this index makes
-- (media_asset_id, id) usable as a foreign key target.
CREATE UNIQUE INDEX IF NOT EXISTS idx_media_versions_asset_id
  ON media_versions (media_asset_id, id);

-- ---------------------------------------------------------------------------
-- Global media metadata
-- ---------------------------------------------------------------------------
-- One optional row per media asset. A missing row means "no editorial metadata
-- yet" and readers must fall back to media_assets.original_filename/alt_text.
CREATE TABLE IF NOT EXISTS media_asset_metadata (
  media_asset_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  description TEXT,
  caption TEXT,
  tags TEXT,                 -- JSON array of strings; Zod owns the shape
  attribution TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'retired')),
  current_version_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants (id),
  FOREIGN KEY (media_asset_id) REFERENCES media_assets (id),
  FOREIGN KEY (tenant_id, media_asset_id) REFERENCES media_assets (tenant_id, id),
  FOREIGN KEY (current_version_id) REFERENCES media_versions (id),
  FOREIGN KEY (media_asset_id, current_version_id)
    REFERENCES media_versions (media_asset_id, id)
);

-- Provider-specific file facts for one upload. Dimensions already live on
-- media_versions; this table carries Cloudinary identity, hashes and size.
CREATE TABLE IF NOT EXISTS media_version_files (
  version_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  media_asset_id TEXT NOT NULL,
  cloudinary_public_id TEXT,
  cloudinary_version TEXT,
  sha256 TEXT,
  byte_size INTEGER,
  mime_type TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  -- Cloudinary keeps public_id stable across uploads and changes the delivery
  -- version. The pair identifies one delivered file; version_id is the PK.
  UNIQUE (tenant_id, cloudinary_public_id, cloudinary_version),
  FOREIGN KEY (tenant_id) REFERENCES tenants (id),
  FOREIGN KEY (version_id) REFERENCES media_versions (id),
  FOREIGN KEY (media_asset_id) REFERENCES media_assets (id),
  FOREIGN KEY (tenant_id, media_asset_id) REFERENCES media_assets (tenant_id, id)
);

-- ---------------------------------------------------------------------------
-- Placement metadata and gallery order
-- ---------------------------------------------------------------------------
-- A placement is one use of a media asset by an editorial target. Global
-- metadata stays on the asset; overrides and display order belong here so a
-- reupload cannot change them. target_table/target_id are deliberately open
-- strings, matching content_provenance in 0003.
CREATE TABLE IF NOT EXISTS media_placements (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  media_asset_id TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_id TEXT NOT NULL,
  placement_type TEXT NOT NULL,
  alt_text_override TEXT,
  caption_override TEXT,
  description_override TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (tenant_id, target_table, target_id, placement_type, media_asset_id),
  UNIQUE (tenant_id, target_table, target_id, placement_type, display_order),
  FOREIGN KEY (tenant_id) REFERENCES tenants (id),
  FOREIGN KEY (media_asset_id) REFERENCES media_assets (id),
  FOREIGN KEY (tenant_id, media_asset_id) REFERENCES media_assets (tenant_id, id)
);

-- ---------------------------------------------------------------------------
-- Action and revision audit
-- ---------------------------------------------------------------------------
-- Every link/new/replace/retire/placement action writes one row. from/to
-- version IDs make a reupload traceable without rewriting the source row.
CREATE TABLE IF NOT EXISTS media_revisions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  media_asset_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (
    action IN ('create_new', 'link_existing', 'replace', 'retire', 'set_placement')
  ),
  from_version_id TEXT,
  to_version_id TEXT,
  target_table TEXT,
  target_id TEXT,
  actor TEXT,
  note TEXT,
  metadata_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants (id),
  FOREIGN KEY (media_asset_id) REFERENCES media_assets (id),
  FOREIGN KEY (tenant_id, media_asset_id) REFERENCES media_assets (tenant_id, id),
  FOREIGN KEY (from_version_id) REFERENCES media_versions (id),
  FOREIGN KEY (to_version_id) REFERENCES media_versions (id)
);

-- ---------------------------------------------------------------------------
-- Read-path indexes
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_media_asset_metadata_tenant_status
  ON media_asset_metadata (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_media_version_files_asset
  ON media_version_files (tenant_id, media_asset_id);
CREATE INDEX IF NOT EXISTS idx_media_placements_target
  ON media_placements (tenant_id, target_table, target_id, placement_type, display_order);
CREATE INDEX IF NOT EXISTS idx_media_placements_asset
  ON media_placements (tenant_id, media_asset_id);
CREATE INDEX IF NOT EXISTS idx_media_revisions_asset
  ON media_revisions (tenant_id, media_asset_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_revisions_tenant_action
  ON media_revisions (tenant_id, action, created_at DESC);
