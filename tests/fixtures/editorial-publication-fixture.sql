-- COW-97 fixture: editor-owned publication state and Mews reference metadata.
-- Self-contained on 0001 + 0012 with foreign keys enabled.

INSERT INTO tenants (id, slug, name) VALUES
  ('pub-fixture', 'pub-fixture', 'Publication Fixture'),
  ('other-tenant', 'other-tenant', 'Other Tenant');

INSERT INTO locations (id, tenant_id, slug, name, time_zone) VALUES
  ('pub-location', 'pub-fixture', 'catskills', 'Catskills', 'America/New_York'),
  ('pub-location-2', 'pub-fixture', 'denver', 'Denver', 'America/Denver'),
  ('other-location', 'other-tenant', 'other', 'Other', 'America/New_York');

INSERT INTO room_types (id, tenant_id, location_id, mews_room_category_id, name, slug, sort_order) VALUES
  ('pub-room-live', 'pub-fixture', 'pub-location', 'mews-live', 'Live Room', 'live', 1),
  ('pub-room-draft', 'pub-fixture', 'pub-location', 'mews-draft', 'Draft Room', 'draft', 2),
  ('pub-room-archived', 'pub-fixture', 'pub-location-2', 'mews-archived', 'Archived Room', 'archived', 3),
  ('pub-room-other', 'other-tenant', 'other-location', 'mews-other', 'Other Room', 'other', 1);

INSERT INTO room_type_publication (tenant_id, room_type_id, status, source_snapshot_date) VALUES
  ('pub-fixture', 'pub-room-live', 'published', '2026-11-15'),
  ('pub-fixture', 'pub-room-draft', 'draft', '2026-11-15'),
  ('pub-fixture', 'pub-room-archived', 'archived', '2026-11-15'),
  ('other-tenant', 'pub-room-other', 'published', '2026-11-15');

INSERT INTO location_publication (tenant_id, location_id, status, source_snapshot_date) VALUES
  ('pub-fixture', 'pub-location', 'published', '2026-11-15'),
  ('pub-fixture', 'pub-location-2', 'draft', '2026-11-15');

INSERT INTO mews_reference_sync
  (id, tenant_id, location_id, reference_type, reference_id, payload_json, source_system, synced_at, reconciled_at)
VALUES
  ('sync-hotel', 'pub-fixture', 'pub-location', 'hotel', 'mews-hotel-1', '{"name":"Catskills"}', 'mews', '2026-11-20T00:00:00Z', '2026-11-21T00:00:00Z'),
  ('sync-rate-group', 'pub-fixture', NULL, 'rate_group', 'mews-rate-group-1', NULL, 'mews', '2026-11-20T00:00:00Z', NULL),
  ('sync-other', 'other-tenant', 'other-location', 'product', 'mews-product-1', NULL, 'mews', '2026-11-20T00:00:00Z', NULL);
