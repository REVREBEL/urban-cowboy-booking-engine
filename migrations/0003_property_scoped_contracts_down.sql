-- Rollback for migrations/0003_property_scoped_contracts.sql.
--
-- Safe to run more than once. Only objects created by 0003 are removed;
-- no table from 0001/0002 is altered. Data written to media_aliases or
-- content_provenance since 0003 was applied is lost by this rollback; take a
-- D1 export first (see docs/application/d1-schema-contracts.md).

DROP INDEX IF EXISTS idx_content_provenance_source;
DROP INDEX IF EXISTS idx_media_assets_scope_kind;
DROP INDEX IF EXISTS idx_room_type_amenities_amenity;
DROP INDEX IF EXISTS idx_amenities_tenant_sort;
DROP INDEX IF EXISTS idx_events_scope_display_starts;
DROP INDEX IF EXISTS idx_rate_merchandising_scope_position;
DROP INDEX IF EXISTS idx_buildings_scope_sort;
DROP INDEX IF EXISTS idx_room_types_scope_sort;
DROP INDEX IF EXISTS idx_content_items_scope_location_kind_status_updated;
DROP INDEX IF EXISTS idx_content_items_scope_kind_status_updated;

DROP TABLE IF EXISTS content_provenance;
DROP TABLE IF EXISTS media_aliases;
