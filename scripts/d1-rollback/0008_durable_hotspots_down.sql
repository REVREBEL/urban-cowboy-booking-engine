-- COW-34 rollback: remove durable hotspot state. COW-33 media registry tables
-- and legacy photo_hotspots are left intact; no Mews data is affected.
DROP INDEX IF EXISTS idx_hotspot_mapping_revisions_asset;
DROP INDEX IF EXISTS idx_hotspot_mapping_revisions_mapping;
DROP TABLE IF EXISTS photo_hotspot_mapping_revisions;
DROP INDEX IF EXISTS idx_hotspot_mappings_duplicate;
DROP INDEX IF EXISTS idx_hotspot_mappings_tenant_amenity;
DROP INDEX IF EXISTS idx_hotspot_mappings_tenant_review;
DROP INDEX IF EXISTS idx_hotspot_mappings_tenant_media;
DROP TABLE IF EXISTS photo_hotspot_mappings;
DROP INDEX IF EXISTS idx_media_version_fingerprints_phash;
DROP INDEX IF EXISTS idx_media_version_fingerprints_sha;
DROP INDEX IF EXISTS idx_media_version_fingerprints_tenant_asset;
DROP TABLE IF EXISTS media_version_fingerprints;
DROP INDEX IF EXISTS idx_media_version_files_tenant_version;
