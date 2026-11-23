-- COW-81: pending pin removals are isolated until publish. A published pin is
-- never deleted from the guest-visible mapping table before an explicit
-- publish; editors see the pending removal in the admin read.
--
-- Rollback: scripts/d1-rollback/0011_photo_hotspot_deletions_down.sql

CREATE TABLE IF NOT EXISTS photo_hotspot_deletions (
  mapping_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  media_asset_id TEXT NOT NULL,
  snapshot_json TEXT NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants (id),
  FOREIGN KEY (mapping_id) REFERENCES photo_hotspot_mappings (id),
  FOREIGN KEY (tenant_id, mapping_id) REFERENCES photo_hotspot_mappings (tenant_id, id)
);

CREATE INDEX IF NOT EXISTS idx_photo_hotspot_deletions_tenant_asset
  ON photo_hotspot_deletions (tenant_id, media_asset_id);
