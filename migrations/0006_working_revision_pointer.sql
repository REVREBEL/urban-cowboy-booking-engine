-- COW-38: separate the working (draft) revision pointer from the published one.
--
-- content_items.current_revision_id stays the PUBLISHED pointer and is never
-- moved by a draft edit. The working pointer lives here so a draft revision ID
-- cannot leak into published snapshots or other readers of content_items.
-- All DDL is IF NOT EXISTS and the backfill is INSERT OR IGNORE, so the
-- migration runner's twice-applied integrity check stays valid.
--
-- Rollback: scripts/d1-rollback/0006_working_revision_pointer_down.sql

CREATE TABLE IF NOT EXISTS content_item_pointers (
  tenant_id TEXT NOT NULL,
  content_item_id TEXT NOT NULL,
  working_revision_id TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (tenant_id, content_item_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants (id),
  FOREIGN KEY (content_item_id) REFERENCES content_items (id)
);

INSERT OR IGNORE INTO content_item_pointers (tenant_id, content_item_id, working_revision_id)
  SELECT tenant_id, id, current_revision_id FROM content_items
  WHERE current_revision_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_content_item_pointers_working
  ON content_item_pointers (tenant_id, working_revision_id);
