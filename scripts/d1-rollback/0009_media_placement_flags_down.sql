-- COW-84 rollback: remove per-photo editorial flags.
DROP INDEX IF EXISTS idx_media_placement_flags_tenant;
DROP TABLE IF EXISTS media_placement_flags;
DROP INDEX IF EXISTS idx_media_placements_tenant_id;
