-- COW-81 rollback: drop pending hotspot removals. Published and draft pins stay.
DROP INDEX IF EXISTS idx_photo_hotspot_deletions_tenant_asset;
DROP TABLE IF EXISTS photo_hotspot_deletions;
