-- Extra published rows for COW-32 snapshot/parity tests. Applies on top of
-- tests/fixtures/d1-contracts-fixture.sql.

INSERT INTO buildings (id, tenant_id, location_id, name, slug) VALUES
  ('b-1', 'contracts-fixture', 'fixture-location', 'Main Lodge', 'main-lodge');

INSERT INTO room_types (id, tenant_id, location_id, mews_room_category_id, name, slug) VALUES
  ('rt-1', 'contracts-fixture', 'fixture-location', 'mews-rt-1', 'Room One', 'room-one'),
  -- Known Webflow draft (COW-29 F-04), now carried by room_type_publication (COW-97).
  ('6abd4a1debcab0ea7e461c9a', 'contracts-fixture', 'fixture-location', 'mews-rt-draft', 'Walden Forest Bathing Suite with Den', 'walden-draft');

INSERT INTO room_type_publication (tenant_id, room_type_id, status, source_snapshot_date) VALUES
  ('contracts-fixture', 'rt-1', 'published', '2026-11-15'),
  ('contracts-fixture', '6abd4a1debcab0ea7e461c9a', 'draft', '2026-11-15');

INSERT INTO amenities (id, tenant_id, name) VALUES
  ('am-1', 'contracts-fixture', 'Fireplace');

INSERT INTO add_ons (id, tenant_id, location_id, name, status, sort_order) VALUES
  ('addon-1', 'contracts-fixture', 'fixture-location', 'Breakfast', 'published', 1),
  ('addon-draft', 'contracts-fixture', 'fixture-location', 'Draft Only', 'draft', 2);

-- Published policy language for COW-39 parity snapshots.
INSERT INTO content_items (id, tenant_id, location_id, kind, slug, status, current_revision_id) VALUES
  ('policy-language-1', 'contracts-fixture', 'fixture-location', 'policy', 'policy-language', 'published', 'policy-language-r1');

INSERT INTO content_revisions (id, content_item_id, revision, payload_json, created_by) VALUES
  ('policy-language-r1', 'policy-language-1', 1, '{"refundable-language":"Free cancellation","refundable-language-sub-title":"Full refund","partially-refundable-language":"Deposit kept","partially-refundable-language-sub-title":"Cancellation fee","non-refundable-language":"No refund","non-refundable-language-sub-title":"Stay locked","at-time-of-booking":"Due today","at-time-of-booking-sub-title":"Charged now","next-due-date":"Final payment","next-due-date-sub-title":"Balance due"}', 'test');
