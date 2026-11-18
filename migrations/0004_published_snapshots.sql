-- COW-32: versioned published snapshots, pointers and parity reports.
--
-- Additive only. Rollback: scripts/d1-rollback/0004_published_snapshots_down.sql
-- (outside migrations_dir so Wrangler never applies it as a forward migration).
--
-- Snapshots are immutable: a refresh writes a new version row and repoints.
-- The pointer keeps the previous version so a flag-off rollback can restore it.
-- location_id = '' means the tenant-wide snapshot for a collection; using an
-- empty string instead of NULL keeps the composite primary keys total.

CREATE TABLE IF NOT EXISTS published_snapshots (
  tenant_id TEXT NOT NULL,
  location_id TEXT NOT NULL DEFAULT '',
  collection TEXT NOT NULL,
  version TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  item_count INTEGER NOT NULL,
  checksum TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (tenant_id, location_id, collection, version),
  FOREIGN KEY (tenant_id) REFERENCES tenants (id)
  -- location_id is intentionally not an FK: '' is the tenant-wide sentinel
  -- and concrete IDs are validated by the tenant-scoped read path.
);

CREATE TABLE IF NOT EXISTS snapshot_pointers (
  tenant_id TEXT NOT NULL,
  location_id TEXT NOT NULL DEFAULT '',
  collection TEXT NOT NULL,
  current_version TEXT NOT NULL,
  previous_version TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (tenant_id, location_id, collection),
  FOREIGN KEY (tenant_id) REFERENCES tenants (id)
);

CREATE TABLE IF NOT EXISTS parity_reports (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  location_id TEXT NOT NULL DEFAULT '',
  collection TEXT NOT NULL,
  version TEXT,
  difference_count INTEGER NOT NULL,
  summary_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants (id)
);

CREATE INDEX IF NOT EXISTS idx_published_snapshots_lookup
  ON published_snapshots (tenant_id, location_id, collection, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_parity_reports_collection
  ON parity_reports (tenant_id, collection, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_add_ons_scope_status_sort
  ON add_ons (tenant_id, location_id, status, sort_order, id);
CREATE INDEX IF NOT EXISTS idx_add_ons_tenant_status_sort
  ON add_ons (tenant_id, status, sort_order, id);
