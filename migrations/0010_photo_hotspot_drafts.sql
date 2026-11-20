-- COW-84: isolate editor changes to published pins until explicit publish.
-- A published photo_hotspot_mappings row is what guests read; edits to it live
-- here as a snapshot and are applied by publishRoomHotspots. Additive and
-- idempotent because the migration runner applies every file twice.
--
-- Rollback: scripts/d1-rollback/0010_photo_hotspot_drafts_down.sql

CREATE UNIQUE INDEX IF NOT EXISTS idx_photo_hotspot_mappings_tenant_id
  ON photo_hotspot_mappings (tenant_id, id);

CREATE TABLE IF NOT EXISTS photo_hotspot_drafts (
  mapping_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  media_asset_id TEXT NOT NULL,
  snapshot_json TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants (id),
  FOREIGN KEY (mapping_id) REFERENCES photo_hotspot_mappings (id),
  FOREIGN KEY (tenant_id, mapping_id) REFERENCES photo_hotspot_mappings (tenant_id, id)
);

CREATE INDEX IF NOT EXISTS idx_photo_hotspot_drafts_tenant_asset
  ON photo_hotspot_drafts (tenant_id, media_asset_id);
