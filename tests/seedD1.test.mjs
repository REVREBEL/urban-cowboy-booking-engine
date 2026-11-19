// Verifies the generated Webflow -> D1 seed against the real schema, with
// SQLite foreign-key enforcement enabled. Run with: npm run test:seed
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { DatabaseSync } from "node:sqlite";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");
const CATSKILLS_ID = "6abc9142d98b325b2821ca23";
const TENANT = "urban-cowboy";

function makeDb() {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON");
  db.exec(read("migrations/0001_init.sql"));
  // 0003 creates the provenance/alias tables that the regenerated seed fills.
  db.exec(read("migrations/0003_property_scoped_contracts.sql"));
  // COW-73: seed.sql now imports published amenity editorial values.
  db.exec(read("migrations/0007_amenity_editorial.sql"));
  db.exec(read("seed.sql"));
  return db;
}
const count = (db, table) => db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n;

test("seed applies cleanly to schema with FK enforcement", () => {
  const db = makeDb();
  assert.deepEqual(db.prepare("PRAGMA foreign_key_check").all(), []);
  assert.equal(db.prepare("PRAGMA integrity_check").get().integrity_check, "ok");
  db.close();
});

test("per-table counts match the reconciliation plan", () => {
  const db = makeDb();
  const expected = {
    tenants: 1,
    locations: 4,
    buildings: 9,
    room_types: 22,
    amenities: 76,
    amenity_editorial: 76,
    events: 8,
    offers: 8,
    add_ons: 9,
    room_type_amenities: 253,
    rate_merchandising: 5,
    content_items: 25,
    content_revisions: 25,
    media_assets: 0,
    media_versions: 0,
    photo_hotspots: 0,
  };
  for (const [table, n] of Object.entries(expected)) {
    assert.equal(count(db, table), n, `${table} row count`);
  }
  db.close();
});

test("location and Mews mappings are populated, not NULL", () => {
  const db = makeDb();
  for (const table of ["buildings", "room_types"]) {
    assert.equal(db.prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE location_id IS NULL`).get().n, 0);
    assert.equal(
      db.prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE location_id != ?`).get(CATSKILLS_ID).n,
      0,
      `${table} should be scoped to Catskills`,
    );
  }
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM room_types WHERE mews_room_category_id IS NULL OR mews_room_category_id = ''").get().n, 0);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM add_ons WHERE mews_product_id IS NULL OR mews_product_id = ''").get().n, 0);
  db.close();
});

test("events satisfy NOT NULL starts_at and publication flags", () => {
  const db = makeDb();
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM events WHERE starts_at IS NULL").get().n, 0);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM events WHERE display_flag = 1").get().n, 8);
  db.close();
});

test("editorial status and field-level fixes are present", () => {
  const db = makeDb();
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM offers WHERE status = 'published'").get().n, 5);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM offers WHERE status = 'draft'").get().n, 3);
  const cake = db.prepare("SELECT description FROM add_ons WHERE id = '6ac3657002f7d9d8f917db42'").get();
  assert.match(cake.description, /^Mark a birthday/);
  assert.equal(db.prepare("SELECT image_name, image_path FROM amenities WHERE image_name IS NOT NULL OR image_path IS NOT NULL").all().length, 0);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM room_type_amenities WHERE excluded = 1").get().n, 21);
  db.close();
});

test("versioned content model carries the three collections with correct publication", () => {
  const db = makeDb();
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM content_items WHERE kind = 'instagram'").get().n, 20);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM content_items WHERE kind = 'outlet'").get().n, 3);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM content_items WHERE kind = 'policy'").get().n, 1);
  assert.equal(db.prepare("SELECT status FROM content_items WHERE kind = 'policy'").get().status, "draft");
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM content_revisions WHERE payload_json IS NULL OR payload_json = ''").get().n, 0);
  db.close();
});

test("every imported record carries source provenance", () => {
  const db = makeDb();
  const report = JSON.parse(read("docs/generated/d1-reconciliation.json"));
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM content_provenance").get().n, report.provenanceRows);
  assert.ok(report.provenanceRows >= 160, "at least the represented source records have provenance");
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM content_provenance WHERE source_snapshot_date IS NULL OR source_hash IS NULL").get().n, 0);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM content_provenance WHERE source_system != 'webflow_cms'").get().n, 0);
  const roomType = db.prepare("SELECT source_id, source_collection, location_id FROM content_provenance WHERE target_table='room_types' LIMIT 1").get();
  assert.equal(roomType.source_collection, "roomTypes");
  assert.ok(roomType.source_id && roomType.location_id);
  db.close();
});

test("published Catskills site settings are imported with exact Webflow semantics", () => {
  const db = makeDb();
  const item = db.prepare("SELECT id, status, location_id, current_revision_id FROM content_items WHERE kind='site_settings'").get();
  assert.ok(item);
  assert.equal(item.status, "published");
  assert.equal(item.location_id, CATSKILLS_ID);
  const payload = JSON.parse(db.prepare("SELECT payload_json FROM content_revisions WHERE id=?").get(item.current_revision_id).payload_json);
  assert.equal(payload.productionLayout, "photo");
  assert.equal(payload.demoLayout, "photo");
  assert.equal(payload.enableDemoEngine, false);
  assert.equal(payload.enableEventDatesQuickSelection, false);
  assert.equal(payload.enableFeatureSection, false);
  db.close();
});

test("no fake foreign keys or placeholder media were introduced", () => {
  const seed = read("seed.sql");
  assert.doesNotMatch(seed, /placeholder-media/i);
  assert.doesNotMatch(seed, /PRAGMA\s+foreign_keys\s*=\s*(OFF|0)/i);
  assert.doesNotMatch(seed, /INSERT\s+OR\s+IGNORE/i);
});

test("seed is idempotent", () => {
  const db = makeDb();
  const before = Object.fromEntries(
    ["tenants", "locations", "buildings", "room_types", "amenities", "amenity_editorial", "events", "offers", "add_ons", "room_type_amenities", "content_items", "content_revisions"]
      .map((t) => [t, count(db, t)]),
  );
  db.exec(read("seed.sql"));
  const after = Object.fromEntries(Object.keys(before).map((t) => [t, count(db, t)]));
  assert.deepEqual(after, before);
  assert.deepEqual(db.prepare("PRAGMA foreign_key_check").all(), []);
  db.close();
});

test("reconciliation report matches generated SQL and source scope", () => {
  const report = JSON.parse(read("docs/generated/d1-reconciliation.json"));
  assert.equal(report.totalSourceRecords, 398);
  assert.equal(report.structurallyRepresentedSourceRecords, 136);
  assert.ok(report.provenanceRows > 0);
  assert.ok(report.files.every((file) => /^[a-f0-9]{64}$/.test(file.sha256)));
  assert.equal(report.relationships.roomAmenityRows, 253);
  assert.equal(report.relationships.hotspotsExcluded, 238);
  assert.equal(report.tenantId, TENANT);
  assert.deepEqual(report.destinationRows.room_type_amenities, 253);
  assert.equal(
    Object.values(report.destinationRows).reduce((a, b) => a + b, 0),
    521,
  );
});

test("each location has its actual IANA time zone", () => {
  const db = makeDb();
  const zones = {
    catskills: "America/New_York",
    denver: "America/Denver",
    "nashville-east": "America/Chicago",
    "nashville-downtown": "America/Chicago",
  };
  const query = db.prepare("SELECT time_zone FROM locations WHERE slug = ?");
  for (const [slug, zone] of Object.entries(zones)) {
    assert.equal(query.get(slug)?.time_zone, zone, slug);
  }
  db.close();
});
