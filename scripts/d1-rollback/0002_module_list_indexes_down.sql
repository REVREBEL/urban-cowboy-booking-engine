-- Rollback for migrations/0002_module_list_indexes.sql.
--
-- Drops only the four list indexes. The underlying module tables and their
-- rows are untouched, so re-applying 0002 is sufficient to restore the
-- optimized query plans. Safe to run more than once.

DROP INDEX IF EXISTS idx_events_tenant_display_created;
DROP INDEX IF EXISTS idx_upgrades_tenant_status_created;
DROP INDEX IF EXISTS idx_offers_tenant_status_created;
DROP INDEX IF EXISTS idx_add_ons_tenant_status_created;
