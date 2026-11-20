-- COW-84: per-photo editorial exclusion, kept in an extension table because
-- SQLite has no idempotent ADD COLUMN and the migration runner applies each
-- file twice. One row per COW-33 placement; absence means "not excluded".
--
-- Rollback: scripts/d1-rollback/0009_media_placement_flags_down.sql

CREATE UNIQUE INDEX IF NOT EXISTS idx_media_placements_tenant_id
  ON media_placements (tenant_id, id);

CREATE TABLE IF NOT EXISTS media_placement_flags (
  placement_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  excluded INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (placement_id) REFERENCES media_placements (id),
  FOREIGN KEY (tenant_id, placement_id) REFERENCES media_placements (tenant_id, id)
);

CREATE INDEX IF NOT EXISTS idx_media_placement_flags_tenant
  ON media_placement_flags (tenant_id, excluded);
