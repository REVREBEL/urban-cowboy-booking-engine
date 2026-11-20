-- COW-84 rollback: remove unpublished hotspot edits. Published pins are intact.
DROP INDEX IF EXISTS idx_photo_hotspot_drafts_tenant_asset;
DROP TABLE IF EXISTS photo_hotspot_drafts;
