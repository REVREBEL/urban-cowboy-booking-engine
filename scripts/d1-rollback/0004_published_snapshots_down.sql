-- Rollback for migrations/0004_published_snapshots.sql.
-- Idempotent; drops only objects created by 0004. Snapshot data is lost, so
-- export the D1 database first. Feature flag CONTENT_SOURCE=webflow is the
-- application-level rollback; this script is the schema-level one.

DROP INDEX IF EXISTS idx_add_ons_scope_status_sort;
DROP INDEX IF EXISTS idx_parity_reports_collection;
DROP INDEX IF EXISTS idx_published_snapshots_lookup;

DROP TABLE IF EXISTS parity_reports;
DROP TABLE IF EXISTS snapshot_pointers;
DROP TABLE IF EXISTS published_snapshots;
