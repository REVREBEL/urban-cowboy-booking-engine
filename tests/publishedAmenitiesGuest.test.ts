// COW-73: guests read published D1 amenity values, with Webflow as fallback.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import { applyPublishedAmenities } from "../worker/published-amenities.ts";
import { buildSnapshot, loadPublishedCollection } from "../worker/content-provider.ts";
import { saveSnapshot } from "../worker/published-snapshots.ts";
import type { CachedReviewPayload } from "../worker/webflow/room-type-reviews.ts";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");
const TENANT = "urban-cowboy";

function d1(db: DatabaseSync): any {
  return {
    prepare(sql: string) {
      let params: unknown[] = [];
      return {
        bind(...values: unknown[]) { params = values; return this; },
        async all() { return { results: db.prepare(sql).all(...params) }; },
        async first() { return db.prepare(sql).get(...params) ?? null; },
        async run() {
          db.prepare(sql).run(...params);
          return { success: true, meta: { changes: (db.prepare("SELECT changes() AS n").get() as any).n } };
        },
      };
    },
    async batch(statements: Array<{ sql: string; params: unknown[] }>) {
      db.exec("BEGIN");
      try {
        const results = statements.map((s) => {
          db.prepare(s.sql).run(...s.params);
          return { success: true, meta: { changes: (db.prepare("SELECT changes() AS n").get() as any).n } };
        });
        db.exec("COMMIT");
        return results;
      } catch (err) {
        db.exec("ROLLBACK");
        throw err;
      }
    },
  };
}

function makeDb() {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON");
  for (const file of [
    "migrations/0001_init.sql",
    "migrations/0004_published_snapshots.sql",
    "migrations/0007_amenity_editorial.sql",
    "migrations/0012_editorial_publication_state.sql",
  ]) db.exec(read(file));
  db.exec(`
    INSERT INTO tenants (id, slug, name) VALUES ('${TENANT}','${TENANT}','Urban Cowboy');
    INSERT INTO room_types (id, tenant_id, mews_room_category_id, name, slug, sort_order) VALUES
      ('room-a','${TENANT}','mews-a','Suite A','suite-a',1),
      ('room-b','${TENANT}','mews-b','Suite B','suite-b',2),
      ('room-unmigrated','${TENANT}','mews-unmigrated','Unmigrated','unmigrated',3),
      ('6abd4a1debcab0ea7e461c9a','${TENANT}','mews-draft','Draft Room','draft',4);
    INSERT INTO room_type_publication (tenant_id, room_type_id, status, source_snapshot_date) VALUES
      ('${TENANT}','room-a','published','2026-11-15'),
      ('${TENANT}','room-b','published','2026-11-15'),
      ('${TENANT}','6abd4a1debcab0ea7e461c9a','draft','2026-11-15');
    -- Only rooms with a published room_amenities document are guest-facing.
    INSERT INTO content_items (id, tenant_id, kind, slug, status) VALUES
      ('ci-a','${TENANT}','room_amenities','room-a','published'),
      ('ci-b','${TENANT}','room_amenities','room-b','published'),
      ('ci-draft','${TENANT}','room_amenities','6abd4a1debcab0ea7e461c9a','published');
    INSERT INTO amenities (id, tenant_id, name, image_name, image_path, sort_order) VALUES
      ('tub','${TENANT}','Copper Tub',NULL,NULL,1),
      ('speaker','${TENANT}','Marshall Speaker',NULL,NULL,2),
      ('hidden','${TENANT}','Inactive Detail',NULL,NULL,3);
    INSERT INTO amenity_editorial (amenity_id, tenant_id, short_name, short_description, long_description, active) VALUES
      ('tub','${TENANT}','Soaking Tub','A deep soak','Long description',1),
      ('speaker','${TENANT}','Speaker','Music','Speaker detail',1),
      ('hidden','${TENANT}','Hidden','No','No',0);
    INSERT INTO room_type_amenities (room_type_id, amenity_id, display_order, excluded) VALUES
      ('room-a','speaker',0,0), ('room-a','tub',1,1), ('room-a','hidden',2,0),
      ('room-b','tub',0,0);
  `);
  return db;
}

const payload = (): CachedReviewPayload => ({
  fetchedAt: Date.now(),
  reviews: {}, descriptions: {}, galleries: {},
  amenities: {
    "mews-a": [{
      id: "tub", name: "Old Tub", shortName: "Old", shortDescription: "old short",
      longDescription: "old long", iconPath: null, imageUrl: "https://images.test/tub.jpg",
    }],
    "mews-fallback": [{
      id: "webflow-only", name: "Webflow Amenity", shortName: "Webflow",
      shortDescription: null, longDescription: null, iconPath: null, imageUrl: null,
    }],
  },
  hotspots: {},
});

async function publish(db: DatabaseSync) {
  const records = await loadPublishedCollection(d1(db), { tenantId: TENANT }, "roomAmenities");
  await saveSnapshot(d1(db), { tenantId: TENANT }, "roomAmenities",
    await buildSnapshot("roomAmenities", records));
}

test("no D1 snapshot leaves the Webflow payload untouched", async () => {
  const db = makeDb();
  const original = payload();
  const result = await applyPublishedAmenities({ DB: d1(db) } as any, TENANT, original);
  assert.deepEqual(result, original);
  const noDb = await applyPublishedAmenities({} as any, TENANT, payload());
  assert.equal(noDb.amenities["mews-a"][0].shortName, "Old");
});

test("published D1 values drive order, content, icons and restriction", async () => {
  const db = makeDb();
  await publish(db);
  const result = await applyPublishedAmenities(
    { DB: d1(db), TENANT_ID: TENANT } as any, TENANT, payload(),
  );
  const mapped = result.amenities["mews-a"];
  assert.deepEqual(mapped.map((a) => a.id), ["speaker", "tub"]); // display order, inactive filtered
  assert.equal(mapped[0].shortName, "Speaker");
  assert.equal(mapped[0].shortDescription, "Music");
  assert.equal(mapped[1].name, "Copper Tub");
  assert.equal(mapped[1].longDescription, "Long description");
  assert.equal(mapped[1].restricted, true);
  // The Webflow Image field URL survives even though the prose comes from D1.
  assert.equal(mapped[1].imageUrl, "https://images.test/tub.jpg");

  assert.deepEqual(result.amenities["mews-b"].map((a) => a.id), ["tub"]);
  assert.deepEqual(result.amenities["mews-fallback"].map((a) => a.id), ["webflow-only"]);
});

test("unmigrated rooms keep Webflow amenities; an intentionally empty migrated room stays empty", async () => {
  const db = makeDb();
  const original = payload();
  original.amenities["mews-unmigrated"] = [{
    id: "webflow-only", name: "Webflow Amenity", shortName: "Webflow",
    shortDescription: null, longDescription: null, iconPath: null, imageUrl: null,
  }];
  await publish(db);
  const result = await applyPublishedAmenities(
    { DB: d1(db), TENANT_ID: TENANT } as any, TENANT, original,
  );
  assert.deepEqual(result.amenities["mews-unmigrated"].map((a) => a.id), ["webflow-only"]);
  assert.ok(!("mews-draft" in result.amenities));

  // Deleting every assignment from a migrated room is a deliberate empty list.
  db.prepare("DELETE FROM room_type_amenities WHERE room_type_id = 'room-b'").run();
  await publish(db);
  const emptied = await applyPublishedAmenities(
    { DB: d1(db), TENANT_ID: TENANT } as any, TENANT, original,
  );
  assert.deepEqual(emptied.amenities["mews-b"], []);
});

test("a throwing D1 read never disrupts the Webflow room-content response", async () => {
  const db = makeDb();
  await publish(db);
  const throwingDb = {
    prepare() { throw new Error("D1 unavailable"); },
  } as any;
  const original = payload();
  const result = await applyPublishedAmenities(
    { DB: throwingDb, TENANT_ID: TENANT } as any, TENANT, original,
  );
  assert.deepEqual(result, original);
});

test("restricted amenities rejoin the general list when tagged on a room photo", () => {
  // Source-contract style: the journey module uses directory imports that the
  // node:test ESM loader cannot resolve, so assert the published behavior here.
  const tour = read("src/journey/tour.ts");
  const photoTour = read("src/journey/RoomPhotoTour.tsx");
  assert.match(tour, /amenity\.restricted !== true \|\| hotspotAmenityIds\?\.has\(amenity\.id\) === true/);
  assert.match(photoTour, /new Set\(\[\.\.\.photoHighlightsMap\.values\(\)\]\.flat\(\)/);
  assert.match(photoTour, /roomAmenities\(room, hotspotAmenityIds\)/);
});

test("valid icon name resolves to a site-local asset when the path is blank", async () => {
  const db = makeDb();
  db.prepare("UPDATE amenities SET image_path = NULL, image_name = 'marshall_speaker.svg' WHERE id = 'speaker'").run();
  await publish(db);
  const result = await applyPublishedAmenities(
    { DB: d1(db), TENANT_ID: TENANT } as any, TENANT, payload(),
  );
  assert.equal(result.amenities["mews-a"][0].iconPath,
    "/assets/icons/icons-simple/marshall_speaker.svg");
});
