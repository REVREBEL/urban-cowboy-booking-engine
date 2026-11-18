-- Extra published rows for COW-32 snapshot/parity tests. Applies on top of
-- tests/fixtures/d1-contracts-fixture.sql.

INSERT INTO buildings (id, tenant_id, location_id, name, slug) VALUES
  ('b-1', 'contracts-fixture', 'fixture-location', 'Main Lodge', 'main-lodge');

INSERT INTO room_types (id, tenant_id, location_id, mews_room_category_id, name, slug) VALUES
  ('rt-1', 'contracts-fixture', 'fixture-location', 'mews-rt-1', 'Room One', 'room-one');

INSERT INTO amenities (id, tenant_id, name) VALUES
  ('am-1', 'contracts-fixture', 'Fireplace');

INSERT INTO add_ons (id, tenant_id, location_id, name, status, sort_order) VALUES
  ('addon-1', 'contracts-fixture', 'fixture-location', 'Breakfast', 'published', 1),
  ('addon-draft', 'contracts-fixture', 'fixture-location', 'Draft Only', 'draft', 2);
