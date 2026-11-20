-- COW-84: author-controlled gallery state for the React room photo editor.
--
-- media_placements holds importer-owned identity, order and editorial text.
-- This additive, tenant-scoped overlay holds author-controlled exclusion and
-- notes without ALTER TABLE, so the twice-applied migration check stays valid.
-- All writes are tenant scoped, audited in media_revisions, and reversible.
-- Guest reads are unchanged until the published-state cutover gate passes.
--
-- Rollback: scripts/d1-rollback/0009_gallery_editorial_down.sql

CREATE TABLE IF NOT EXISTS gallery_editorial (
  placement_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  is_excluded INTEGER NOT NULL DEFAULT 0 CHECK (is_excluded IN (0, 1)),
  note TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants (id),
  FOREIGN KEY (placement_id) REFERENCES media_placements (id)
);

CREATE INDEX IF NOT EXISTS idx_gallery_editorial_tenant_excluded
  ON gallery_editorial (tenant_id, is_excluded);
