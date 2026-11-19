// COW-72: the React admin's room gallery reads stay tenant-scoped and ordered.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import { listRoomGallery, listRooms, type RoomMediaAuthorize, type RoomMediaCtx } from "../worker/room-media.ts";
import { roomGalleryRowSchema } from "../src/types/d1-contracts.ts";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");
const TENANT = "urban-cowboy";
const OTHER = "other-tenant";

function makeDb() {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON");
  for (const file of [
    "migrations/0001_init.sql",
    "migrations/0002_module_list_indexes.sql",
    "migrations/0003_property_scoped_contracts.sql",
    "migrations/0004_published_snapshots.sql",
    "migrations/0005_media_registry.sql",
  ]) db.exec(read(file));

  db.exec(`
    INSERT INTO tenants (id, slug, name) VALUES
      ('${TENANT}','${TENANT}','Urban Cowboy'),
      ('${OTHER}','${OTHER}','Other Tenant');
    INSERT INTO locations (id, tenant_id, slug, name) VALUES
      ('catskills','${TENANT}','catskills','Catskills'),
      ('other-loc','${OTHER}','other','Other');
    INSERT INTO room_types (id, tenant_id, mews_room_category_id, name, slug, sort_order) VALUES
      ('room-a','${TENANT}','mews-a','Suite A','suite-a',2),
      ('room-b','${TENANT}','mews-b','Suite B','suite-b',1),
      ('room-other','${OTHER}','mews-other','Other Suite','other-suite',1);
    INSERT INTO media_assets (id, tenant_id, location_id, kind, original_filename, width, height, alt_text) VALUES
      ('media-1','${TENANT}','catskills','image','one.png',1200,800,'First photo'),
      ('media-2','${TENANT}','catskills','image','two.png',900,600,NULL),
      ('media-other','${OTHER}','other-loc','image','other.png',100,100,'Other');
    INSERT INTO media_versions (id, media_asset_id, version, squarespace_asset_id, squarespace_url) VALUES
      ('v-1','media-1',1,'sq-1','https://cdn/1'),
      ('v-2','media-2',1,'sq-2','https://cdn/2');
    INSERT INTO media_asset_metadata (media_asset_id, tenant_id, description, caption, tags, current_version_id) VALUES
      ('media-1','${TENANT}','Desc one','Caption one','["room","suite"]','v-1'),
      ('media-2','${TENANT}',NULL,NULL,NULL,'v-2');
    INSERT INTO media_version_files (version_id, tenant_id, media_asset_id, cloudinary_public_id, cloudinary_version, sha256) VALUES
      ('v-1','${TENANT}','media-1','urban-cowboy/one','v1','hash-1'),
      ('v-2','${TENANT}','media-2','urban-cowboy/two','v2','hash-2');
    -- Inserted out of display order, plus a non-gallery placement that must be excluded.
    INSERT INTO media_placements (id, tenant_id, media_asset_id, target_table, target_id, placement_type, display_order) VALUES
      ('place-2','${TENANT}','media-2','room_types','room-a','gallery',2),
      ('place-1','${TENANT}','media-1','room_types','room-a','gallery',1),
      ('place-cover','${TENANT}','media-1','room_types','room-a','cover',0),
      ('place-other','${OTHER}','media-other','room_types','room-other','gallery',1);
  `);
  return db;
}

/** D1-shaped adapter over node:sqlite. */
function d1(db: DatabaseSync): any {
  return {
    prepare(sql: string) {
      let params: unknown[] = [];
      return {
        bind(...values: unknown[]) { params = values; return this; },
        async all() { return { results: db.prepare(sql).all(...params) }; },
        async first() { return db.prepare(sql).get(...params) ?? null; },
        async run() { return db.prepare(sql).run(...params); },
      };
    },
  };
}

const allowViewer: RoomMediaAuthorize = async () => null;
const deny: RoomMediaAuthorize = async () =>
  new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });

function ctx(db: DatabaseSync | null, tenant = TENANT, path = "/api/admin/rooms"): RoomMediaCtx {
  return {
    request: new Request(`https://example.test${path}`),
    env: { DB: db ? d1(db) : undefined, TENANT_ID: tenant } as any,
    waitUntil: () => {},
  };
}

const jsonBody = (res: Response) => res.json() as Promise<any>;

test("listRooms returns only rooms in the Worker-bound tenant, ordered", async () => {
  const db = makeDb();
  const res = await listRooms(ctx(db), allowViewer);
  assert.equal(res.status, 200);
  const body = await jsonBody(res);
  assert.deepEqual(body.items, [
    { id: "room-b", name: "Suite B", slug: "suite-b" },
    { id: "room-a", name: "Suite A", slug: "suite-a" },
  ]);
  assert.equal(body.items.some((room: any) => room.id === "room-other"), false);
});

test("listRooms denies unauthenticated callers before touching D1", async () => {
  const res = await listRooms(ctx(null), deny);
  assert.equal(res.status, 401);
  assert.deepEqual(await jsonBody(res), { error: "unauthorized" });
});

test("listRoomGallery orders by display_order and parses registry rows to camelCase", async () => {
  const db = makeDb();
  const res = await listRoomGallery(ctx(db), "room-a", allowViewer);
  assert.equal(res.status, 200);
  const body = await jsonBody(res);
  assert.equal(body.roomId, "room-a");
  assert.deepEqual(body.items.map((item: any) => item.mediaAssetId), ["media-1", "media-2"]);
  assert.deepEqual(body.items.map((item: any) => item.displayOrder), [1, 2]);

  const first = body.items[0];
  assert.equal(first.placementId, "place-1");
  assert.equal(first.altText, "First photo");
  assert.equal(first.caption, "Caption one");
  assert.deepEqual(first.tags, ["room", "suite"]);
  assert.equal(first.currentVersionId, "v-1");
  assert.equal(first.cloudinaryPublicId, "urban-cowboy/one");
  assert.equal(first.sha256, "hash-1");
  assert.equal(body.items[1].tags, null);
  assert.equal(body.items.length, 2, "non-gallery placements are excluded");
});

test("listRoomGallery rejects a room from another tenant", async () => {
  const db = makeDb();
  const res = await listRoomGallery(ctx(db), "room-other", allowViewer);
  assert.equal(res.status, 404);
  assert.deepEqual(await jsonBody(res), { error: "room_not_found" });
});

test("listRoomGallery ignores a caller-supplied tenant query parameter", async () => {
  const db = makeDb();
  const res = await listRoomGallery(
    ctx(db, TENANT, `/api/admin/rooms/room-a/photos?tenant=${OTHER}`),
    "room-a",
    allowViewer,
  );
  assert.equal(res.status, 200);
  // The other tenant has no placements on room-a; only the bound tenant's rows return.
  assert.deepEqual((await jsonBody(res)).items.map((item: any) => item.mediaAssetId), ["media-1", "media-2"]);
});

test("listRoomGallery denies unauthenticated callers before touching D1", async () => {
  const res = await listRoomGallery(ctx(null), "room-a", deny);
  assert.equal(res.status, 401);
  assert.deepEqual(await jsonBody(res), { error: "unauthorized" });
});

test("listRoomGallery reports missing D1 as unavailable", async () => {
  const res = await listRoomGallery(ctx(null), "room-a", allowViewer);
  assert.equal(res.status, 503);
});

test("roomGalleryRowSchema transforms a stored row and rejects malformed tags", () => {
  const row = {
    placement_id: "p1", media_asset_id: "m1", display_order: 0,
    original_filename: "photo.png", width: 100, height: 80, alt_text: "A room",
    caption: null, description: null, tags: '["room"]', current_version_id: "v1",
    cloudinary_public_id: "cld/photo", cloudinary_version: "v1", sha256: "h",
  };
  assert.deepEqual(roomGalleryRowSchema.parse(row).tags, ["room"]);
  assert.equal(roomGalleryRowSchema.parse(row).displayOrder, 0);
  assert.equal(roomGalleryRowSchema.safeParse({ ...row, tags: "not-json" }).success, false);
});
