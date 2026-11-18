-- Rollback for migrations/0005_media_registry.sql.
--
-- Safe to run more than once. Only objects created by 0005 are removed; no
-- object from 0001 to 0004 is altered. Metadata, placements and revision rows
-- added since 0005 was applied are lost by this rollback. Take a D1 export
-- first (see docs/application/d1-schema-contracts.md).
--
-- This file lives outside migrations_dir on purpose: Wrangler treats every
-- *.sql in migrations_dir as a forward migration.

DROP INDEX IF EXISTS idx_media_versions_asset_id;
DROP INDEX IF EXISTS idx_media_revisions_tenant_action;
DROP INDEX IF EXISTS idx_media_revisions_asset;
DROP INDEX IF EXISTS idx_media_placements_asset;
DROP INDEX IF EXISTS idx_media_placements_target;
DROP INDEX IF EXISTS idx_media_version_files_asset;
DROP INDEX IF EXISTS idx_media_asset_metadata_tenant_status;

DROP TRIGGER IF EXISTS media_versions_asset_immutable;
DROP TRIGGER IF EXISTS media_versions_id_immutable;
DROP TRIGGER IF EXISTS media_assets_id_immutable;

DROP TABLE IF EXISTS media_revisions;
DROP TABLE IF EXISTS media_placements;
DROP TABLE IF EXISTS media_version_files;
DROP TABLE IF EXISTS media_asset_metadata;
