-- Migration fixture for COW-30 contract/index tests. Self-contained: applies
-- to a bare 0001 + 0002 + 0003 schema (not the Webflow seed).

INSERT INTO tenants (id, slug, name) VALUES
  ('contracts-fixture', 'contracts-fixture', 'Contracts Fixture'),
  ('other-tenant', 'other-tenant', 'Other Tenant');

INSERT INTO locations (id, tenant_id, slug, name, time_zone) VALUES
  ('fixture-location', 'contracts-fixture', 'catskills', 'Catskills', 'America/New_York'),
  ('other-location', 'other-tenant', 'other', 'Other', 'America/New_York');

INSERT INTO media_assets (id, tenant_id, location_id, kind, original_filename) VALUES
  ('fixture-media', 'contracts-fixture', 'fixture-location', 'image', 'room-photo.png'),
  ('other-media', 'other-tenant', 'other-location', 'image', 'other-photo.png');

-- Legacy identity is stored as aliases, never as the media primary identity.
INSERT INTO media_aliases (id, media_asset_id, alias_type, alias_value) VALUES
  ('alias-webflow-file', 'fixture-media', 'webflow_file_id', 'abcdef0123456789abcdef01'),
  ('alias-webflow-url', 'fixture-media', 'webflow_cdn_url', 'https://cdn.prod.website-files.com/site/abcdef0123456789abcdef01_room-photo.png'),
  ('alias-squarespace', 'fixture-media', 'squarespace_asset_id', 'legacy-squarespace-id'),
  ('alias-other', 'other-media', 'webflow_file_id', '111111111111111111111111');

INSERT INTO content_items (id, tenant_id, location_id, kind, slug, status) VALUES
  ('fixture-item-pub', 'contracts-fixture', 'fixture-location', 'instagram', 'published-item', 'published'),
  ('fixture-item-draft', 'contracts-fixture', 'fixture-location', 'policy', 'draft-item', 'draft'),
  ('fixture-item-other', 'other-tenant', 'other-location', 'instagram', 'other-item', 'published');

INSERT INTO content_revisions (id, content_item_id, revision, payload_json, published_at, created_by) VALUES
  ('fixture-revision', 'fixture-item-pub', 1, '{"caption":"Fixture"}', '2026-11-15T00:00:00.000Z', 'importer');

UPDATE content_items SET current_revision_id = 'fixture-revision' WHERE id = 'fixture-item-pub';

INSERT INTO events (id, tenant_id, location_id, title, time_zone, starts_at, display_flag) VALUES
  ('fixture-event', 'contracts-fixture', 'fixture-location', 'Fixture Event', 'America/New_York', '2026-12-01T18:00:00Z', 1),
  ('fixture-event-hidden', 'contracts-fixture', 'fixture-location', 'Hidden Event', 'America/New_York', '2026-12-02T18:00:00Z', 0);

INSERT INTO content_provenance (tenant_id, target_table, target_id, source_system, source_collection, source_id, source_snapshot_date, source_hash) VALUES
  ('contracts-fixture', 'media_assets', 'fixture-media', 'webflow_cms', 'Photo Hotspots', 'fixture-source-photo', '2026-11-15', 'abc123'),
  ('contracts-fixture', 'content_items', 'fixture-item-pub', 'webflow_cms', 'Instagrams', 'fixture-source-instagram', '2026-11-15', 'def456'),
  ('contracts-fixture', 'events', 'fixture-event', 'webflow_cms', 'Events', 'fixture-source-event', '2026-11-15', 'ghi789'),
  ('other-tenant', 'content_items', 'fixture-item-other', 'webflow_cms', 'Instagrams', 'other-source-instagram', '2026-11-15', 'jkl012');
