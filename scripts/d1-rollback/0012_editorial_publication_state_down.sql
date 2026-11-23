-- COW-97: idempotent rollback for 0012. Drops only the objects created by that
-- migration. Existing room_types/locations rows and their data survive; the two
-- unique parent indexes are also removed because nothing else depends on them.
-- Foreign keys stay clean; run PRAGMA foreign_key_check after applying.

DROP INDEX IF EXISTS idx_mews_reference_sync_type;
DROP INDEX IF EXISTS idx_room_type_publication_status;
DROP INDEX IF EXISTS idx_location_publication_status;

DROP TABLE IF EXISTS mews_reference_sync;
DROP TABLE IF EXISTS room_type_publication;
DROP TABLE IF EXISTS location_publication;

DROP INDEX IF EXISTS idx_locations_tenant_id;
DROP INDEX IF EXISTS idx_room_types_tenant_id;
