// COW-106: published-snapshot galleries, stable media identity, per-room merge.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import { applyPublishedGalleries, loadPublishedGalleries } from "../worker/published-galleries.ts";
import { loadPublishedHotspots } from "../worker/published-hotspots.ts";
import { buildSnapshot } from "../worker/content-provider.ts";
import { saveSnapshot } from "../worker/published-snapshots.ts";
import { onRequestGet as roomTypeReviewsGet, type CachedReviewPayload } from "../worker/webflow/room-type-reviews.ts";
import type { Env } from "../worker/mews/_lib.ts";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");
const TENANT = "urban-cowboy";
const ASSET_ID = "aabbccddeeff001122334455";
const OLD_URL = `https://cdn/squarespace/${ASSET_ID}_1600.jpg`;
const NEW_URL = `https://cdn.newprovider/${ASSET_ID}_hero.jpg`;

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
    INSERT INTO locations (id, tenant_id, slug, name) VALUES
      ('catskills','${TENANT}','catskills','Catskills');
    INSERT INTO room_types (id, tenant_id, location_id, mews_room_category_id, name, slug, sort_order) VALUES
      ('room-a','${TENANT}','catskills','mews-a','Suite A','suite-a',1),
      ('room-b','${TENANT}','catskills','mews-b','Suite B','suite-b',2);
    INSERT INTO amenities (id, tenant_id, name, sort_order) VALUES ('tub','${TENANT}','Soaking tub',1);
    INSERT INTO media_assets
      (id, tenant_id, location_id, kind, original_filename, squarespace_asset_id, squarespace_url, width, height) VALUES
      ('media-1','${TENANT}','catskills','image','one.jpg','${ASSET_ID}','${OLD_URL}',1200,800);
    INSERT INTO media_versions (id, media_asset_id, version, squarespace_asset_id, squarespace_url, width, height) VALUES
      ('v-1','media-1',1,'${ASSET_ID}','${OLD_URL}',1200,800);
    INSERT INTO media_asset_metadata (media_asset_id, tenant_id, current_version_id) VALUES
      ('media-1','${TENANT}','v-1');
    INSERT INTO media_placements
      (id, tenant_id, media_asset_id, target_table, target_id, placement_type, display_order) VALUES
      ('place-a','${TENANT}','media-1','room_types','room-a','room_gallery',1);
    INSERT INTO photo_hotspot_mappings
      (id, tenant_id, media_asset_id, placement_id, target_table, target_id, amenity_id,
       source_x, source_y, source_version_id, source_width, source_height, exif_orientation,
       crop_left, crop_top, crop_width, crop_height,
       display_order, status, review_state, review_reason, created_at, updated_at)
    VALUES
      ('pin-1','${TENANT}','media-1','place-a','room_types','room-a','tub',
       0.25,0.75,'v-1',1200,800,1, 100,50,600,400,
       1,'published','approved',NULL,datetime('now'),datetime('now'));
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

function publishRoomGallery(
  db: DatabaseSync,
  rooms: Array<{ id: string; mewsId: string; images: Array<{ mediaAssetId: string; sourceUrl: string }> }>,
) {
  return buildSnapshot("roomGallery", rooms.map((room) => ({
    id: room.id,
    collection: "roomGallery",
    payload: {
      mewsRoomCategoryId: room.mewsId,
      items: room.images.map((image, index) => ({
        mediaAssetId: image.mediaAssetId, sourceUrl: image.sourceUrl, displayOrder: index + 1,
      })),
    },
  }))).then((built) => saveSnapshot(d1(db), { tenantId: TENANT }, "roomGallery", built));
}

function publishRoomDocument(db: DatabaseSync, roomId: string, status: "published" | "draft" = "published") {
  db.prepare(
    `INSERT INTO content_items (id, tenant_id, location_id, kind, slug, status, current_revision_id)
     VALUES (?1, ?2, NULL, 'room_gallery', ?3, ?4, ?5)`,
  ).run(`gallery-${roomId}`, TENANT, roomId, status, `gallery-${roomId}-r1`);
  db.prepare(
    `INSERT INTO content_revisions (id, content_item_id, revision, payload_json, created_by)
     VALUES (?1, ?2, 1, '{"items":[]}', 'test')`,
  ).run(`gallery-${roomId}-r1`, `gallery-${roomId}`);
}

const payload = (): CachedReviewPayload => ({
  fetchedAt: Date.now(),
  reviews: {}, descriptions: {}, amenities: {}, hotspots: {},
  galleries: {
    "mews-a": { roomTypeId: "mews-a", images: ["https://webflow/a.jpg"] },
    "mews-b": { roomTypeId: "mews-b", images: ["https://webflow/b.jpg"] },
  },
});

function envFor(db?: D1Database, flag?: string): Env {
  return { DB: db, TENANT_ID: TENANT, CONTENT_SOURCE_ROOM_GALLERIES: flag } as Env;
}

test("published galleries resolve only for rooms with a published gallery document", async () => {
  const db = makeDb();
  try {
    await publishRoomGallery(db, [
      { id: "room-a", mewsId: "mews-a", images: [{ mediaAssetId: "media-1", sourceUrl: OLD_URL }] },
      { id: "room-b", mewsId: "mews-b", images: [{ mediaAssetId: "media-1", sourceUrl: OLD_URL }] },
    ]);
    publishRoomDocument(db, "room-a");

    const galleries = await loadPublishedGalleries(d1(db) as D1Database, TENANT);
    assert.deepEqual(galleries, {
      "mews-a": { roomTypeId: "mews-a", images: [OLD_URL] },
    });
  } finally {
    db.close();
  }
});

test("unpublished edits stay invisible; a URL-only publish preserves identity and hotspot geometry", async () => {
  const db = makeDb();
  try {
    const connection = d1(db) as D1Database;
    await publishRoomGallery(db, [
      { id: "room-a", mewsId: "mews-a", images: [{ mediaAssetId: "media-1", sourceUrl: OLD_URL }] },
    ]);
    publishRoomDocument(db, "room-a");

    const beforeHotspots = await loadPublishedHotspots(connection, TENANT);
    const beforePlacement = db.prepare(
      "SELECT media_asset_id, target_table, target_id, display_order FROM media_placements WHERE id = 'place-a'",
    ).get();

    // Editing live media/placement tables without publishing must not change guests.
    db.exec(`
      INSERT INTO media_versions (id, media_asset_id, version, squarespace_asset_id, squarespace_url, width, height)
        VALUES ('v-2','media-1',2,'${ASSET_ID}','${NEW_URL}',1200,800);
      UPDATE media_asset_metadata SET current_version_id = 'v-2' WHERE media_asset_id = 'media-1';
    `);
    const unpublished = await loadPublishedGalleries(connection, TENANT);
    assert.equal(unpublished["mews-a"].images[0], OLD_URL);
    assert.equal(
      (db.prepare("SELECT media_asset_id FROM media_placements WHERE id = 'place-a'").get() as { media_asset_id: string }).media_asset_id,
      "media-1",
    );

    // Publishing the URL-only change repoints the snapshot; identity is untouched.
    await publishRoomGallery(db, [
      { id: "room-a", mewsId: "mews-a", images: [{ mediaAssetId: "media-1", sourceUrl: NEW_URL }] },
    ]);
    const after = await loadPublishedGalleries(connection, TENANT);
    const afterHotspots = await loadPublishedHotspots(connection, TENANT);
    const afterPlacement = db.prepare(
      "SELECT media_asset_id, target_table, target_id, display_order FROM media_placements WHERE id = 'place-a'",
    ).get();

    assert.equal(after["mews-a"].images[0], NEW_URL);
    assert.equal(after["mews-a"].roomTypeId, "mews-a");
    assert.deepEqual(afterHotspots, beforeHotspots);
    assert.deepEqual(afterPlacement, beforePlacement);
  } finally {
    db.close();
  }
});

test("per-room merge keeps Webflow galleries for unmigrated rooms", async () => {
  const db = makeDb();
  try {
    const connection = d1(db) as D1Database;
    await publishRoomGallery(db, [
      { id: "room-a", mewsId: "mews-a", images: [{ mediaAssetId: "media-1", sourceUrl: OLD_URL }] },
    ]);
    publishRoomDocument(db, "room-a");

    const result = await applyPublishedGalleries(envFor(connection, "d1"), TENANT, payload());
    assert.equal(result.galleries["mews-a"].images[0], OLD_URL);
    assert.equal(result.galleries["mews-b"].images[0], "https://webflow/b.jpg");
  } finally {
    db.close();
  }
});

test("draft documents, missing snapshots and disabled flags keep Webflow galleries", async () => {
  const db = makeDb();
  try {
    const connection = d1(db) as D1Database;
    const original = payload();

    assert.equal(await applyPublishedGalleries(envFor(connection), TENANT, original), original);
    assert.equal(await applyPublishedGalleries(envFor(undefined, "d1"), TENANT, original), original);

    publishRoomDocument(db, "room-a", "draft");
    await publishRoomGallery(db, [
      { id: "room-a", mewsId: "mews-a", images: [{ mediaAssetId: "media-1", sourceUrl: OLD_URL }] },
    ]);
    const draftOnly = await applyPublishedGalleries(envFor(connection, "d1"), TENANT, original);
    assert.equal(draftOnly.galleries["mews-a"].images[0], "https://webflow/a.jpg");
  } finally {
    db.close();
  }
});

test("no Webflow source: empty D1 stays no-store, then published data is cacheable", async () => {
  const db = makeDb();
  try {
    const connection = d1(db) as D1Database;
    const request = () => roomTypeReviewsGet({
      env: envFor(connection, "d1"),
      waitUntil: () => undefined,
    });

    // No published snapshot or room document: fail closed, never cache an empty gallery.
    const empty = await request();
    assert.equal(empty.status, 200);
    assert.equal(empty.headers.get("cache-control"), "no-store");
    const emptyBody = await empty.json() as { galleries: Record<string, unknown> };
    assert.deepEqual(emptyBody.galleries, {});

    // An existing but empty amenities snapshot is still no usable content.
    const emptyAmenities = await buildSnapshot("roomAmenities", []);
    await saveSnapshot(d1(db), { tenantId: TENANT }, "roomAmenities", emptyAmenities);
    const unusable = await request();
    assert.equal(unusable.headers.get("cache-control"), "no-store");
    const unusableBody = await unusable.json() as { galleries: Record<string, unknown>; amenities: Record<string, unknown> };
    assert.deepEqual(unusableBody.galleries, {});
    assert.deepEqual(unusableBody.amenities, {});

    // Publishing the snapshot and room document makes the response cacheable.
    await publishRoomGallery(db, [
      { id: "room-a", mewsId: "mews-a", images: [{ mediaAssetId: "media-1", sourceUrl: OLD_URL }] },
    ]);
    publishRoomDocument(db, "room-a");
    const published = await request();
    assert.equal(published.status, 200);
    assert.match(published.headers.get("cache-control") ?? "", /max-age=60/);
    const body = await published.json() as { galleries: Record<string, { images: string[] }> };
    assert.deepEqual(body.galleries["mews-a"].images, [OLD_URL]);
  } finally {
    db.close();
  }
});
