-- COW-73 rollback: remove the amenity editorial overlay.
-- Draft history lives in content_revisions and is intentionally retained.
DROP INDEX IF EXISTS idx_amenity_editorial_tenant_active;
DROP INDEX IF EXISTS idx_room_type_amenities_room_order;
DROP TABLE IF EXISTS amenity_editorial;
