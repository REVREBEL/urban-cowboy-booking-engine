// COW-108: temporarily imported Webflow photo URLs must resolve for guests.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import { loadPublishedGalleries } from "../worker/published-galleries.ts";
import { loadPublishedHotspots } from "../worker/published-hotspots.ts";
import { buildSnapshot } from "../worker/content-provider.ts";
import { saveSnapshot } from "../worker/published-snapshots.ts";
import { cmsPhotoKeys } from "../src/lib/cmsPhotoHotspots.ts";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");
const TENANT = "urban-cowboy";
const FILE_ID = "aabbccddeeff001122334455";
const TEMP_URL = `https://cdn.prod.website-files.com/site/${FILE_ID}_1600.jpg`;
const NEW_URL = `https://cdn.newprovider.example/${FILE_ID}_hero.jpg`;

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
    -- W2 temporary Webflow import: neutral master ID, stable file alias, mutable URL.
    INSERT INTO media_assets
      (id, tenant_id, location_id, kind, original_filename, squarespace_asset_id, squarespace_url, width, height) VALUES
      ('mm-imported-1','${TENANT}','catskills','image','suite-a.jpg','${FILE_ID}','${TEMP_URL}',1200,800);
    INSERT INTO media_aliases (id, tenant_id, media_asset_id, alias_type, alias_value) VALUES
      ('alias-1','${TENANT}','mm-imported-1','webflow_file_id','${FILE_ID}');
    INSERT INTO media_versions (id, media_asset_id, version, squarespace_asset_id, squarespace_url, width, height) VALUES
      ('mm-imported-1:v1','mm-imported-1',1,'${FILE_ID}','${TEMP_URL}',1200,800);
    INSERT INTO media_asset_metadata (media_asset_id, tenant_id, current_version_id) VALUES
      ('mm-imported-1','${TENANT}','mm-imported-1:v1');
    INSERT INTO media_placements
      (id, tenant_id, media_asset_id, target_table, target_id, placement_type, display_order) VALUES
      ('pl-room-a-mm-imported-1','${TENANT}','mm-imported-1','room_types','room-a','room_gallery',1);
    INSERT INTO photo_hotspot_mappings
      (id, tenant_id, media_asset_id, placement_id, target_table, target_id, amenity_id,
       source_x, source_y, source_version_id, source_width, source_height, exif_orientation,
       crop_left, crop_top, crop_width, crop_height,
       display_order, status, review_state, review_reason, created_at, updated_at)
    VALUES
      ('pin-1','${TENANT}','mm-imported-1','pl-room-a-mm-imported-1','room_types','room-a','tub',
       0.25,0.75,'mm-imported-1:v1',1200,800,1, 100,50,600,400,
       1,'published','approved',NULL,datetime('now'),datetime('now'));
    INSERT INTO content_items (id, tenant_id, location_id, kind, slug, status, current_revision_id) VALUES
      ('gallery-room-a','${TENANT}','catskills','room_gallery','room-a','published','gallery-room-a-r1');
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

async function publishGallerySnapshot(db: DatabaseSync, url: string) {
  const built = await buildSnapshot("roomGallery", [{
    id: "room-a",
    collection: "roomGallery",
    payload: {
      mewsRoomCategoryId: "mews-a",
      items: [{ mediaAssetId: "mm-imported-1", sourceUrl: url, displayOrder: 1 }],
    },
  }]);
  return saveSnapshot(d1(db), { tenantId: TENANT }, "roomGallery", built);
}

test("temporary Webflow URLs resolve in the guest gallery and hotspot payloads", async () => {
  const db = makeDb();
  try {
    const connection = d1(db) as D1Database;
    await publishGallerySnapshot(db, TEMP_URL);

    const galleries = await loadPublishedGalleries(connection, TENANT);
    assert.deepEqual(galleries["mews-a"].images, [TEMP_URL]);

    const hotspots = await loadPublishedHotspots(connection, TENANT);
    const keys = cmsPhotoKeys(TEMP_URL);
    assert.ok(keys.includes(`file:${FILE_ID.toLowerCase()}`));
    const pins = hotspots["room-a"]?.[`file:${FILE_ID.toLowerCase()}`];
    assert.equal(pins?.length, 1);
    assert.deepEqual(
      { id: pins?.[0].id, amenityId: pins?.[0].amenityId, x: pins?.[0].x, y: pins?.[0].y },
      { id: "pin-1", amenityId: "tub", x: 25, y: 75 },
    );
  } finally {
    db.close();
  }
});

test("a URL-only reimport keeps master identity and hotspot geometry after snapshot refresh", async () => {
  const db = makeDb();
  try {
    const connection = d1(db) as D1Database;
    await publishGallerySnapshot(db, TEMP_URL);
    const beforeHotspots = await loadPublishedHotspots(connection, TENANT);

    // W2 URL-only reimport: same master, alias, version id and placement; only the
    // mutable URL changes. The published snapshot must then be refreshed.
    db.exec(`UPDATE media_versions SET squarespace_url = '${NEW_URL}' WHERE id = 'mm-imported-1:v1'`);
    db.exec(`UPDATE media_assets SET squarespace_url = '${NEW_URL}' WHERE id = 'mm-imported-1'`);
    await publishGallerySnapshot(db, NEW_URL);

    const galleries = await loadPublishedGalleries(connection, TENANT);
    const afterHotspots = await loadPublishedHotspots(connection, TENANT);
    const alias = db.prepare("SELECT media_asset_id FROM media_aliases WHERE id = 'alias-1'").get() as { media_asset_id: string };
    const version = db.prepare("SELECT current_version_id FROM media_asset_metadata WHERE media_asset_id = 'mm-imported-1'").get() as { current_version_id: string };

    assert.deepEqual(galleries["mews-a"].images, [NEW_URL]);
    assert.equal(alias.media_asset_id, "mm-imported-1");
    assert.equal(version.current_version_id, "mm-imported-1:v1");
    assert.deepEqual(afterHotspots, beforeHotspots);
    assert.ok(cmsPhotoKeys(NEW_URL).includes(`file:${FILE_ID.toLowerCase()}`));
  } finally {
    db.close();
  }
});
