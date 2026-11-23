// COW-106: published D1 galleries, stable media identity and URL-only changes.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import { applyPublishedGalleries, loadPublishedGalleries } from "../worker/published-galleries.ts";
import { loadPublishedHotspots } from "../worker/published-hotspots.ts";
import type { CachedReviewPayload } from "../worker/webflow/room-type-reviews.ts";
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
      ('room-a','${TENANT}','catskills','mews-a','Suite A','suite-a',1);
    INSERT INTO amenities (id, tenant_id, name, sort_order) VALUES ('tub','${TENANT}','Soaking tub',1);
    INSERT INTO media_assets
      (id, tenant_id, location_id, kind, original_filename, squarespace_asset_id, squarespace_url, width, height) VALUES
      ('media-1','${TENANT}','catskills','image','one.jpg','${ASSET_ID}','${OLD_URL}',1200,800);
    INSERT INTO media_versions (id, media_asset_id, version, squarespace_asset_id, squarespace_url, width, height) VALUES
      ('v-1','media-1',1,'${ASSET_ID}','${OLD_URL}',1200,800);
    INSERT INTO media_version_files (version_id, tenant_id, media_asset_id, cloudinary_public_id, cloudinary_version) VALUES
      ('v-1','${TENANT}','media-1','cld/one','v1');
    INSERT INTO media_asset_metadata (media_asset_id, tenant_id, current_version_id) VALUES
      ('media-1','${TENANT}','v-1');
    INSERT INTO media_version_fingerprints
      (version_id, tenant_id, media_asset_id, sha256, phash, width, height, exif_orientation) VALUES
      ('v-1','${TENANT}','media-1','h',NULL,1200,800,1);
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

const payload = (): CachedReviewPayload => ({
  fetchedAt: Date.now(),
  reviews: {}, descriptions: {}, amenities: {},
  galleries: { "mews-a": { roomTypeId: "mews-a", images: ["https://webflow/old.jpg"] } },
  hotspots: {},
});

function envFor(db?: D1Database, flag?: string): Env {
  return { DB: db, TENANT_ID: TENANT, CONTENT_SOURCE_ROOM_GALLERIES: flag } as Env;
}

test("published gallery URLs resolve by stable media ID and Mews room category", async () => {
  const db = makeDb();
  try {
    const galleries = await loadPublishedGalleries(d1(db) as D1Database, TENANT);
    assert.deepEqual(galleries, {
      "mews-a": { roomTypeId: "mews-a", images: [OLD_URL] },
    });
  } finally {
    db.close();
  }
});

test("a URL-only provider switch preserves identity, room links, hotspot IDs and geometry", async () => {
  const db = makeDb();
  try {
    const connection = d1(db) as D1Database;
    const beforeGalleries = await loadPublishedGalleries(connection, TENANT);
    const beforePins = await loadPublishedHotspots(connection, TENANT);
    const beforePlacement = db.prepare(
      "SELECT media_asset_id, target_table, target_id, display_order FROM media_placements WHERE id = 'place-a'",
    ).get();

    // Provider switch = a new current version with a new URL. No placement,
    // mapping, room or amenity row is touched.
    db.exec(`
      INSERT INTO media_versions (id, media_asset_id, version, squarespace_asset_id, squarespace_url, width, height)
        VALUES ('v-2','media-1',2,'${ASSET_ID}','${NEW_URL}',1200,800);
      INSERT INTO media_version_files (version_id, tenant_id, media_asset_id, cloudinary_public_id, cloudinary_version)
        VALUES ('v-2','${TENANT}','media-1','cld/new','v2');
      UPDATE media_asset_metadata SET current_version_id = 'v-2' WHERE media_asset_id = 'media-1';
    `);

    const afterGalleries = await loadPublishedGalleries(connection, TENANT);
    const afterPins = await loadPublishedHotspots(connection, TENANT);
    const afterPlacement = db.prepare(
      "SELECT media_asset_id, target_table, target_id, display_order FROM media_placements WHERE id = 'place-a'",
    ).get();

    assert.equal(afterGalleries["mews-a"].images[0], NEW_URL);
    assert.equal(afterGalleries["mews-a"].roomTypeId, beforeGalleries["mews-a"].roomTypeId);
    assert.deepEqual(afterPlacement, beforePlacement);
    assert.deepEqual(afterPins, beforePins);
    assert.equal(Object.keys(afterPins).length, 1);
  } finally {
    db.close();
  }
});

test("excluded, parked and draft data never reaches the guest gallery", async () => {
  const db = makeDb();
  try {
    const connection = d1(db) as D1Database;
    db.exec(`INSERT INTO media_placement_flags (placement_id, tenant_id, excluded) VALUES ('place-a','${TENANT}',1)`);
    assert.deepEqual(await loadPublishedGalleries(connection, TENANT), {});

    db.exec("UPDATE media_placement_flags SET excluded = 0 WHERE placement_id = 'place-a'");
    db.exec("UPDATE media_placements SET display_order = 1000001 WHERE id = 'place-a'");
    assert.deepEqual(await loadPublishedGalleries(connection, TENANT), {});

    db.exec("UPDATE media_placements SET display_order = 1 WHERE id = 'place-a'");
    db.exec(`
      INSERT INTO content_items (id, tenant_id, location_id, kind, slug, status, current_revision_id)
        VALUES ('draft-gallery','${TENANT}','catskills','room_gallery','room-a','draft','draft-r1');
      INSERT INTO content_revisions (id, content_item_id, revision, payload_json, created_by)
        VALUES ('draft-r1','draft-gallery',1,'{"items":[]}','test');
    `);
    const galleries = await loadPublishedGalleries(connection, TENANT);
    assert.equal(galleries["mews-a"].images[0], OLD_URL);
  } finally {
    db.close();
  }
});

test("the overlay is flag-gated and keeps Webflow data on any empty or failed D1 read", async () => {
  const db = makeDb();
  try {
    const connection = d1(db) as D1Database;
    const original = payload();

    assert.equal(await applyPublishedGalleries(envFor(connection), TENANT, original), original);
    assert.equal(await applyPublishedGalleries(envFor(undefined, "d1"), TENANT, original), original);

    const overridden = await applyPublishedGalleries(envFor(connection, "d1"), TENANT, original);
    assert.equal(overridden.galleries["mews-a"].images[0], OLD_URL);

    db.exec(`INSERT INTO media_placement_flags (placement_id, tenant_id, excluded) VALUES ('place-a','${TENANT}',1)`);
    const emptyRead = await applyPublishedGalleries(envFor(connection, "d1"), TENANT, original);
    assert.equal(emptyRead.galleries["mews-a"].images[0], "https://webflow/old.jpg");
  } finally {
    db.close();
  }
});
