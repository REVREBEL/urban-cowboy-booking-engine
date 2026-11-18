-- Rollback for migrations/0006_working_revision_pointer.sql.
-- Drops only the working pointer table; content_items and published pointers
-- are untouched. Safe to run more than once.

DROP INDEX IF EXISTS idx_content_item_pointers_working;
DROP TABLE IF EXISTS content_item_pointers;
