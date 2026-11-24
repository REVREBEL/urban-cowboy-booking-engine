// COW-82: guest hotspot reads must be published-only, tenant scoped and
// fail-safe. Webflow stays the default; D1 is an explicit flag.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import { applyPublishedHotspots, loadPublishedHotspots } from "../worker/published-hotspots.ts";
import type { CachedReviewPayload } from "../worker/webflow/room-type-reviews.ts";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");
const TENANT = "urban-cowboy";
const OTHER = "other-tenant";
const ASSET_ID = "aabbccddeeff001122334455"; // 24-hex canonical file id

function makeDb() {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON");
  for (let id = 1; id <= 11; id += 1) {
    const name = readdirSync(new URL("../migrations/", import.meta.url))
      .find((file) => file.startsWith(`${String(id).padStart(4, "0")}_`) && file.endsWith(".sql"));
    if (name) db.exec(read(`migrations/${name}`));
  }
  db.exec(`
    INSERT INTO tenants (id, slug, name) VALUES
      ('${TENANT}','${TENANT}','Urban Cowboy'), ('${OTHER}','${OTHER}','Other');
    INSERT INTO locations (id, tenant_id, slug, name) VALUES
      ('catskills','${TENANT}','catskills','Catskills');
    INSERT INTO room_types (id, tenant_id, mews_room_category_id, name, slug, sort_order) VALUES
      ('room-a','${TENANT}','mews-a','Suite A','suite-a',1),
      ('room-b','${TENANT}','mews-b','Suite B','suite-b',2);
    INSERT INTO amenities (id, tenant_id, name, sort_order) VALUES
      ('tub','${TENANT}','Soaking tub',1),
      ('view','${TENANT}','Forest view',2);
    INSERT INTO media_assets
      (id, tenant_id, location_id, kind, original_filename, squarespace_asset_id, squarespace_url) VALUES
      ('media-1','${TENANT}','catskills','image','one.jpg','${ASSET_ID}',
       'https://cdn/squarespace/${ASSET_ID}_1600.jpg'),
      ('media-other','${OTHER}',NULL,'image','other.jpg',
       'ffffeeeeddddccccbbbbbaaa','https://cdn/other/ffffeeeeddddccccbbbbbaaa_1600.jpg');
    INSERT INTO media_versions (id, media_asset_id, version, squarespace_asset_id, squarespace_url) VALUES
      ('v-1','media-1',1,'${ASSET_ID}','https://cdn/squarespace/${ASSET_ID}_1600.jpg');
    INSERT INTO media_version_files (version_id, tenant_id, media_asset_id, cloudinary_public_id, cloudinary_version) VALUES
      ('v-1','${TENANT}','media-1','cld/one','v1');
    INSERT INTO media_asset_metadata (media_asset_id, tenant_id, current_version_id) VALUES
      ('media-1','${TENANT}','v-1');
    INSERT INTO media_version_fingerprints
      (version_id, tenant_id, media_asset_id, sha256, phash, width, height, exif_orientation) VALUES
      ('v-1','${TENANT}','media-1','h',NULL,1200,800,1);
    INSERT INTO media_placements
      (id, tenant_id, media_asset_id, target_table, target_id, placement_type, display_order) VALUES
      ('place-a','${TENANT}','media-1','room_types','room-a','gallery',1),
      ('place-b','${TENANT}','media-1','room_types','room-b','gallery',1);
  `);
  return db;
}

function d1(db: DatabaseSync): any {
  return {
    prepare(sql: string) {
      let params: unknown[] = [];
      const statement = {
        bind(...values: unknown[]) { params = values; return statement; },
        async all() { return { results: db.prepare(sql).all(...params) }; },
        async first() { return db.prepare(sql).get(...params) ?? null; },
        async run() { return db.prepare(sql).run(...params); },
      };
      return statement;
    },
  };
}

type Row = {
  id: string; tenant: string; media: string; room: string; placement: string; amenity: string;
  x: number; y: number; status: string; review: string; reason: string | null;
  sourceWidth?: number; sourceHeight?: number; orientation?: number;
  crop?: { left: number; top: number; width: number; height: number } | null;
};
function insertPin(db: DatabaseSync, row: Row) {
  const sw = row.sourceWidth ?? 1200;
  const sh = row.sourceHeight ?? 800;
  const orient = row.orientation ?? 1;
  const crop = row.crop;
  db.exec(`
    INSERT INTO photo_hotspot_mappings
      (id, tenant_id, media_asset_id, placement_id, target_table, target_id, amenity_id,
       source_x, source_y, source_version_id, source_width, source_height, exif_orientation,
       crop_left, crop_top, crop_width, crop_height,
       display_order, status, review_state, review_reason, created_at, updated_at)
    VALUES
      ('${row.id}','${row.tenant}','${row.media}','${row.placement}','room_types','${row.room}','${row.amenity}',
       ${row.x}, ${row.y},'v-1', ${sw}, ${sh}, ${orient},
       ${crop ? crop.left : 'NULL'}, ${crop ? crop.top : 'NULL'},
       ${crop ? crop.width : 'NULL'}, ${crop ? crop.height : 'NULL'},
       1, '${row.status}', '${row.review}',
       ${row.reason ? `'${row.reason}'` : 'NULL'}, datetime('now'), datetime('now'))`);
}

const payload = (): CachedReviewPayload => ({
  fetchedAt: Date.now(),
  reviews: {}, descriptions: {}, galleries: {}, amenities: {},
  hotspots: { "file:webflow": [{ id: "wf", amenityId: "tub", photoKey: "file:webflow", x: 1, y: 1, order: 0 }] },
});

test("loadPublishedHotspots returns only published, approved, non-deleted pins", async () => {
  const db = makeDb();
  insertPin(db, { id: "published", tenant: TENANT, media: "media-1", room: "room-a", placement: "place-a", amenity: "tub", x: 0.25, y: 0.75, status: "published", review: "approved", reason: null });
  insertPin(db, { id: "draft", tenant: TENANT, media: "media-1", room: "room-a", placement: "place-a", amenity: "tub", x: 0.5, y: 0.5, status: "draft", review: "none", reason: null });
  insertPin(db, { id: "pending", tenant: TENANT, media: "media-1", room: "room-a", placement: "place-a", amenity: "tub", x: 0.6, y: 0.6, status: "published", review: "pending", reason: "crop_review" });
  insertPin(db, { id: "deleted", tenant: TENANT, media: "media-1", room: "room-a", placement: "place-a", amenity: "tub", x: 0.7, y: 0.7, status: "draft", review: "approved", reason: "deleted" });
  insertPin(db, { id: "other", tenant: OTHER, media: "media-other", room: "room-a", placement: "place-a", amenity: "tub", x: 0.1, y: 0.1, status: "published", review: "approved", reason: null });

  const byRoom = await loadPublishedHotspots(d1(db), TENANT);
  assert.deepEqual(Object.keys(byRoom), ["room-a"]);
  const map = byRoom["room-a"];
  assert.deepEqual(Object.keys(map), [`file:${ASSET_ID}`]);
  assert.equal(map[`file:${ASSET_ID}`].length, 1);
  const pin = map[`file:${ASSET_ID}`][0];
  assert.equal(pin.id, "published");
  assert.equal(pin.x, 25, "normalized source coords become guest percentages");
  assert.equal(pin.y, 75);
  assert.equal(pin.amenityId, "tub");
});

test("photo identity is stable across URL resize variants", async () => {
  const db = makeDb();
  insertPin(db, { id: "p1", tenant: TENANT, media: "media-1", room: "room-a", placement: "place-a", amenity: "tub", x: 0.3, y: 0.3, status: "published", review: "approved", reason: null });
  const withVariantUrl = d1(db);
  // Same asset id, a different ?format= resize URL still produces the same key.
  db.exec(`UPDATE media_assets SET squarespace_url = 'https://cdn/squarespace/${ASSET_ID}_640.jpg?format=webp' WHERE id = 'media-1'`);
  const byRoom = await loadPublishedHotspots(withVariantUrl, TENANT);
  assert.ok(byRoom["room-a"]?.[`file:${ASSET_ID}`], "stable file key survives a resize variant");
});

test("applyPublishedHotspots is a no-op on the default Webflow source", async () => {
  const db = makeDb();
  insertPin(db, { id: "p1", tenant: TENANT, media: "media-1", room: "room-a", placement: "place-a", amenity: "tub", x: 0.3, y: 0.3, status: "published", review: "approved", reason: null });
  const original = payload();
  const result = await applyPublishedHotspots({ DB: d1(db), TENANT_ID: TENANT } as any, TENANT, original);
  assert.equal(result, original, "flag off returns the exact Webflow payload");
});

test("applyPublishedHotspots replaces hotspots with D1 pins when enabled", async () => {
  const db = makeDb();
  insertPin(db, { id: "p1", tenant: TENANT, media: "media-1", room: "room-a", placement: "place-a", amenity: "tub", x: 0.3, y: 0.3, status: "published", review: "approved", reason: null });
  insertPin(db, { id: "draft", tenant: TENANT, media: "media-1", room: "room-a", placement: "place-a", amenity: "tub", x: 0.9, y: 0.9, status: "draft", review: "none", reason: null });
  const result = await applyPublishedHotspots(
    { DB: d1(db), TENANT_ID: TENANT, PHOTO_HOTSPOT_SOURCE: "d1" } as any, TENANT, payload(),
  );
  assert.deepEqual(Object.keys(result.hotspotsByRoom ?? {}), ["room-a"]);
  const map = result.hotspotsByRoom!["room-a"];
  assert.deepEqual(Object.keys(map), [`file:${ASSET_ID}`]);
  assert.equal(map[`file:${ASSET_ID}`].length, 1);
  assert.equal(map[`file:${ASSET_ID}`][0].id, "p1");
  assert.deepEqual(result.hotspots, {}, "flat map stays empty so legacy clients see no wrong pins");
});

test("a D1 failure falls back to the Webflow hotspot payload", async () => {
  const original = payload();
  const brokenDb = {
    prepare() { throw new Error("D1 unavailable"); },
  } as any;
  const result = await applyPublishedHotspots(
    { DB: brokenDb, TENANT_ID: TENANT, PHOTO_HOTSPOT_SOURCE: "d1" } as any, TENANT, original,
  );
  assert.equal(result, original, "guest request still returns Webflow hotspots on D1 outage");
});

test("the guest room-content response applies the published hotspot overlay", () => {
  const reviews = read("worker/webflow/room-type-reviews.ts");
  assert.match(reviews, /applyPublishedHotspots\(env, env\.TENANT_ID, guest, onReadError\)/);
  // The flag is fail-safe: webflow by default, d1 only when explicitly set.
  const source = read("worker/hotspot-source.ts");
  assert.match(source, /value === "d1" \? "d1" : "webflow"/);
});

test("one asset placed in two rooms keeps each room's pins separate", async () => {
  const db = makeDb();
  insertPin(db, { id: "pin-a", tenant: TENANT, media: "media-1", room: "room-a", placement: "place-a", amenity: "tub", x: 0.2, y: 0.2, status: "published", review: "approved", reason: null });
  insertPin(db, { id: "pin-b", tenant: TENANT, media: "media-1", room: "room-b", placement: "place-b", amenity: "view", x: 0.8, y: 0.8, status: "published", review: "approved", reason: null });
  const byRoom = await loadPublishedHotspots(d1(db), TENANT);
  assert.deepEqual(Object.keys(byRoom).sort(), ["room-a", "room-b"]);
  const a = byRoom["room-a"][`file:${ASSET_ID}`];
  const b = byRoom["room-b"][`file:${ASSET_ID}`];
  assert.deepEqual(a.map((pin) => pin.id), ["pin-a"]);
  assert.deepEqual(b.map((pin) => pin.id), ["pin-b"]);
  assert.equal(a[0].x, 20);
  assert.equal(b[0].x, 80);
});

test("a crop-remapped published pin is displayed in crop coordinates", async () => {
  const db = makeDb();
  // Source 1200x800, pin at source (600,400) = 0.5/0.5; displayed crop is the
  // right half of the source: left=600 top=0 width=600 height=800. The pin is
  // therefore at 0.0/0.5 of the cropped display, not 0.5/0.5.
  insertPin(db, {
    id: "cropped", tenant: TENANT, media: "media-1", room: "room-a", placement: "place-a",
    amenity: "tub", x: 0.5, y: 0.5, status: "published", review: "approved", reason: null,
    sourceWidth: 1200, sourceHeight: 800,
    crop: { left: 600, top: 0, width: 600, height: 800 },
  });
  const byRoom = await loadPublishedHotspots(d1(db), TENANT);
  const pin = byRoom["room-a"][`file:${ASSET_ID}`][0];
  assert.equal(pin.x, 0);
  assert.equal(pin.y, 50);
});

test("EXIF orientation is applied for a rotated displayed version", async () => {
  const db = makeDb();
  // Mapping authored on orientation 1; current version is orientation 6 (90° CW).
  insertPin(db, {
    id: "rotated", tenant: TENANT, media: "media-1", room: "room-a", placement: "place-a",
    amenity: "tub", x: 0.2, y: 0.3, status: "published", review: "approved", reason: null,
    sourceWidth: 1200, sourceHeight: 800, orientation: 1,
  });
  db.exec("UPDATE media_version_fingerprints SET exif_orientation = 6 WHERE version_id = 'v-1'");
  const byRoom = await loadPublishedHotspots(d1(db), TENANT);
  const pin = byRoom["room-a"][`file:${ASSET_ID}`][0];
  // transformOrientation(0.2,0.3, 1 -> 6) is not the raw 20/30.
  assert.notDeepEqual([pin.x, pin.y], [20, 30]);
  assert.ok(pin.x >= 0 && pin.x <= 100 && pin.y >= 0 && pin.y <= 100);
});
