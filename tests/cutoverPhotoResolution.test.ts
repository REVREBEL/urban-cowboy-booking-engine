// COW-108: end-to-end W2 import -> published snapshot -> guest gallery/hotspots.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import { webflowPhotoSourceAdapter } from "../worker/photo-source-webflow.ts";
import { applyPhotoImport, planPhotoImport, type D1Like } from "../worker/photo-source-import.ts";
import type { CanonicalRoomType } from "../worker/photo-source-adapter.ts";
import { loadPublishedCollection, buildSnapshot } from "../worker/content-provider.ts";
import { saveSnapshot } from "../worker/published-snapshots.ts";
import { loadPublishedGalleries } from "../worker/published-galleries.ts";
import { loadPublishedHotspots } from "../worker/published-hotspots.ts";
import { cmsPhotoKeys } from "../src/lib/cmsPhotoHotspots.ts";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");
const TENANT = "urban-cowboy";
const LOCATION = "catskills";
const FILE_ID = "aabbccddeeff001122334455";
const TEMP_URL = `https://cdn.prod.website-files.com/site/${FILE_ID}_1600.jpg`;
const NEW_URL = `https://cdn.newprovider.example/${FILE_ID}_hero.jpg`;
const NOW = "2026-11-24T00:00:00Z";
const ROOM_TYPES: CanonicalRoomType[] = [
  { id: "room-a", name: "Suite A", slug: "suite-a", mewsRoomCategoryId: "mews-a" },
];

function makeDb() {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON");
  for (let id = 1; id <= 11; id += 1) {
    const name = readdirSync(new URL("../migrations/", import.meta.url))
      .find((file) => file.startsWith(`${String(id).padStart(4, "0")}_`) && file.endsWith(".sql"));
    if (name) db.exec(read(`migrations/${name}`));
  }
  db.exec(`
    INSERT INTO tenants (id, slug, name) VALUES ('${TENANT}','${TENANT}','Urban Cowboy');
    INSERT INTO locations (id, tenant_id, slug, name, time_zone) VALUES
      ('${LOCATION}','${TENANT}','catskills','Catskills','America/New_York');
    INSERT INTO room_types (id, tenant_id, location_id, mews_room_category_id, name, slug, sort_order) VALUES
      ('room-a','${TENANT}','${LOCATION}','mews-a','Suite A','suite-a',1);
    INSERT INTO amenities (id, tenant_id, name, sort_order) VALUES ('tub','${TENANT}','Soaking tub',1);
    INSERT INTO content_items (id, tenant_id, location_id, kind, slug, status, current_revision_id) VALUES
      ('gallery-room-a','${TENANT}','${LOCATION}','room_gallery','room-a','published','gallery-room-a-r1');
    INSERT INTO content_revisions (id, content_item_id, revision, payload_json, created_by) VALUES
      ('gallery-room-a-r1','gallery-room-a',1,'{"items":[]}','test');
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

function executor(db: DatabaseSync) {
  return {
    async exec(statements: readonly { sql: string; params: unknown[] }[]) {
      db.exec("BEGIN");
      try {
        for (const statement of statements) db.prepare(statement.sql).run(...statement.params);
        db.exec("COMMIT");
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    },
  };
}

function photoPayload(url: string) {
  return {
    items: [{
      id: "wf-room-a",
      isDraft: false,
      isArchived: false,
      fieldData: {
        "mews-room-type-id": "mews-a",
        images: [{ fileId: FILE_ID, url, alt: "Suite A", width: 1200, height: 800 }],
      },
    }],
  };
}

/** Run the real W2 importer against the test database. */
async function importPhotos(db: DatabaseSync, url: string) {
  const snapshot = webflowPhotoSourceAdapter.parse({
    payload: photoPayload(url), roomTypes: ROOM_TYPES,
    sourceUrl: "fixture", fetchedAt: NOW, digest: "abc",
  });
  const plan = await planPhotoImport(d1(db) as D1Like, {
    tenantId: TENANT, locationId: LOCATION, snapshot, now: NOW,
  });
  await applyPhotoImport(executor(db), plan);
  return plan;
}

/** Production refresh path: published rows -> immutable snapshot -> pointer. */
async function refreshGallerySnapshot(db: DatabaseSync) {
  const scope = { tenantId: TENANT };
  const records = await loadPublishedCollection(d1(db), scope, "roomGallery");
  const built = await buildSnapshot("roomGallery", records);
  await saveSnapshot(d1(db), scope, "roomGallery", built);
  return built;
}

function seedPublishedPin(db: DatabaseSync) {
  const placement = db.prepare(
    "SELECT id, media_asset_id FROM media_placements WHERE tenant_id = ?1 AND target_id = ?2",
  ).get(TENANT, "room-a") as { id: string; media_asset_id: string };
  const version = db.prepare(
    "SELECT id FROM media_versions WHERE media_asset_id = ?1",
  ).get(placement.media_asset_id) as { id: string };
  db.prepare(
    `INSERT INTO photo_hotspot_mappings
      (id, tenant_id, media_asset_id, placement_id, target_table, target_id, amenity_id,
       source_x, source_y, source_version_id, source_width, source_height, exif_orientation,
       crop_left, crop_top, crop_width, crop_height,
       display_order, status, review_state, review_reason, created_at, updated_at)
     VALUES (?1,?2,?3,?4,'room_types','room-a','tub',0.25,0.75,?5,1200,800,1,
            100,50,600,400,1,'published','approved',NULL,datetime('now'),datetime('now'))`,
  ).run("pin-1", TENANT, placement.media_asset_id, placement.id, version.id);
  return placement;
}

test("imported Webflow URLs resolve for guests through the real import and refresh", async () => {
  const db = makeDb();
  try {
    const connection = d1(db) as D1Database;
    const first = await importPhotos(db, TEMP_URL);
    assert.equal(first.summary.create, 1);
    const placement = seedPublishedPin(db);
    await refreshGallerySnapshot(db);

    const galleries = await loadPublishedGalleries(connection, TENANT);
    assert.deepEqual(galleries["mews-a"].images, [TEMP_URL]);

    const hotspots = await loadPublishedHotspots(connection, TENANT);
    const key = `file:${FILE_ID.toLowerCase()}`;
    assert.ok(cmsPhotoKeys(TEMP_URL).includes(key));
    const pins = hotspots["room-a"]?.[key];
    assert.equal(pins?.length, 1);
    assert.deepEqual(
      { id: pins?.[0].id, amenityId: pins?.[0].amenityId, x: pins?.[0].x, y: pins?.[0].y },
      { id: "pin-1", amenityId: "tub", x: 25, y: 75 },
    );

    const alias = db.prepare("SELECT media_asset_id FROM media_aliases WHERE tenant_id = ?1").get(TENANT) as { media_asset_id: string };
    assert.equal(alias.media_asset_id, placement.media_asset_id);
  } finally {
    db.close();
  }
});

test("a URL-only reimport preserves identity and geometry after production refresh", async () => {
  const db = makeDb();
  try {
    const connection = d1(db) as D1Database;
    await importPhotos(db, TEMP_URL);
    const placement = seedPublishedPin(db);
    await refreshGallerySnapshot(db);
    const beforeHotspots = await loadPublishedHotspots(connection, TENANT);

    // The real importer resolves the same alias and updates the current version
    // URL in place — no new master, alias, version or placement.
    const second = await importPhotos(db, NEW_URL);
    assert.equal(second.summary.update, 1);
    assert.equal(second.summary.create, 0);
    await refreshGallerySnapshot(db);

    const galleries = await loadPublishedGalleries(connection, TENANT);
    const afterHotspots = await loadPublishedHotspots(connection, TENANT);
    const mediaCount = (db.prepare("SELECT COUNT(*) AS n FROM media_assets WHERE tenant_id = ?1").get(TENANT) as { n: number }).n;
    const versionCount = (db.prepare("SELECT COUNT(*) AS n FROM media_versions").get() as { n: number }).n;
    const placementCount = (db.prepare("SELECT COUNT(*) AS n FROM media_placements WHERE tenant_id = ?1").get(TENANT) as { n: number }).n;
    const currentVersion = (db.prepare("SELECT current_version_id FROM media_asset_metadata WHERE media_asset_id = ?1").get(placement.media_asset_id) as { current_version_id: string }).current_version_id;

    assert.deepEqual(galleries["mews-a"].images, [NEW_URL]);
    assert.equal(mediaCount, 1);
    assert.equal(versionCount, 1);
    assert.equal(placementCount, 1);
    assert.ok(currentVersion.endsWith(":v1"));
    assert.deepEqual(afterHotspots, beforeHotspots);
    assert.ok(cmsPhotoKeys(NEW_URL).includes(`file:${FILE_ID.toLowerCase()}`));
  } finally {
    db.close();
  }
});
