// COW-84: gallery edits are drafted, then written through to canonical D1
// placements on publish. Imported parked rows and source URLs are never touched.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import {
  createEditorDraft,
  publishEditorItem,
  type Authorize,
  type EditorCtx,
} from "../worker/content-editor.ts";
import { galleryWriteThrough } from "../worker/gallery-publication.ts";
import { listAdminMedia, type RoomMediaAuthorize } from "../worker/room-media.ts";
import { getSnapshot } from "../worker/published-snapshots.ts";
import { listRoomGallery } from "../worker/d1.ts";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");
const TENANT = "urban-cowboy";
const OTHER = "other-tenant";

function makeDb() {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON");
  for (const file of [
    "migrations/0001_init.sql", "migrations/0002_module_list_indexes.sql",
    "migrations/0003_property_scoped_contracts.sql", "migrations/0004_published_snapshots.sql",
    "migrations/0005_media_registry.sql", "migrations/0006_working_revision_pointer.sql",
    "migrations/0007_amenity_editorial.sql", "migrations/0008_durable_hotspots.sql",
    "migrations/0009_media_placement_flags.sql",
  ]) db.exec(read(file));
  db.exec(`
    INSERT INTO tenants (id, slug, name) VALUES
      ('${TENANT}','${TENANT}','Urban Cowboy'), ('${OTHER}','${OTHER}','Other');
    INSERT INTO locations (id, tenant_id, slug, name) VALUES ('catskills','${TENANT}','catskills','Catskills');
    INSERT INTO room_types (id, tenant_id, mews_room_category_id, name, slug, sort_order) VALUES
      ('room-a','${TENANT}','mews-a','Suite A','suite-a',1),
      ('room-other','${OTHER}','mews-other','Other','other',1);
    INSERT INTO media_assets (id, tenant_id, kind, original_filename, squarespace_asset_id, squarespace_url, alt_text) VALUES
      ('m1','${TENANT}','image','one.jpg','sq-1','https://cdn/one.jpg','One'),
      ('m2','${TENANT}','image','two.jpg','sq-2','https://cdn/two.jpg',NULL),
      ('m3','${TENANT}','image','parked.jpg','sq-3','https://cdn/parked.jpg',NULL),
      ('m-other','${OTHER}','image','other.jpg','sq-o','https://cdn/other.jpg',NULL);
    INSERT INTO media_versions (id, media_asset_id, version, squarespace_asset_id, squarespace_url, width, height) VALUES
      ('v1','m1',1,'sq-1','https://cdn/one.jpg',1200,800),
      ('v2','m2',1,'sq-2','https://cdn/two.jpg',900,600),
      ('v3','m3',1,'sq-3','https://cdn/parked.jpg',640,480);
    INSERT INTO media_asset_metadata (media_asset_id, tenant_id, current_version_id) VALUES
      ('m1','${TENANT}','v1'), ('m2','${TENANT}','v2'), ('m3','${TENANT}','v3');
    INSERT INTO media_version_files (version_id, tenant_id, media_asset_id) VALUES
      ('v1','${TENANT}','m1'), ('v2','${TENANT}','m2'), ('v3','${TENANT}','m3');
    INSERT INTO media_placements
      (id, tenant_id, media_asset_id, target_table, target_id, placement_type, display_order) VALUES
      ('p1','${TENANT}','m1','room_types','room-a','room_gallery',1),
      ('p2','${TENANT}','m2','room_types','room-a','room_gallery',2),
      ('p-park','${TENANT}','m3','room_types','room-a','room_gallery',1000001);
  `);
  return db;
}

function d1(db: DatabaseSync): any {
  return {
    prepare(sql: string) {
      let params: unknown[] = [];
      return {
        get sql() { return sql; },
        get params() { return params; },
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

const admin = {
  sub: "admin-1", email: "admin@example.test", groups: [],
  roles: ["viewer", "admin"] as ("viewer" | "admin")[], tenantId: TENANT,
};
const viewer = { ...admin, roles: ["viewer"] as ("viewer" | "admin")[] };
const allowAdmin: Authorize = async (_r, _e, role) =>
  role === "admin" ? admin : new Response("denied", { status: 403 });
const allowViewer: RoomMediaAuthorize = async (_r, _e, role) =>
  role === "viewer" ? viewer : new Response("denied", { status: 403 });
const deny: RoomMediaAuthorize = async () => new Response("denied", { status: 401 });

const orderOf = (db: DatabaseSync, mediaId: string) =>
  (db.prepare("SELECT display_order AS n FROM media_placements WHERE media_asset_id = ?1").get(mediaId) as any).n;

async function applyPayload(db: DatabaseSync, items: unknown[]) {
  const result = await galleryWriteThrough(d1(db), TENANT, "room-a", JSON.stringify({ items }));
  assert.ok(!("error" in result), JSON.stringify(result));
  await d1(db).batch(result.statements);
}

test("reorder, metadata and exclusion write through without touching parked imports", async () => {
  const db = makeDb();
  await applyPayload(db, [
    { mediaAssetId: "m2", displayOrder: 1, excluded: true,
      altText: "Editor alt", caption: "Editor caption", description: "Editor description" },
    { mediaAssetId: "m1", displayOrder: 2, excluded: false,
      altText: null, caption: null, description: null },
  ]);
  assert.equal(orderOf(db, "m2"), 1);
  assert.equal(orderOf(db, "m1"), 2);
  assert.equal(orderOf(db, "m3"), 1000001);

  const flag = db.prepare("SELECT excluded FROM media_placement_flags WHERE placement_id='p2'").get() as any;
  assert.equal(flag.excluded, 1);
  const overrides = db.prepare(
    "SELECT alt_text_override, caption_override, description_override FROM media_placements WHERE id='p2'",
  ).get() as any;
  assert.equal(overrides.alt_text_override, "Editor alt");
  assert.equal(overrides.caption_override, "Editor caption");
  assert.equal(overrides.description_override, "Editor description");

  const rows = await listRoomGallery(d1(db), TENANT, "room-a");
  assert.deepEqual(rows.map((row) => row.mediaAssetId), ["m2", "m1", "m3"]);
  assert.equal(rows[0].excluded, true);
  assert.equal(rows[0].sourceUrl, "https://cdn/two.jpg");
});

test("unlinking removes only the editor-selected active placement", async () => {
  const db = makeDb();
  await applyPayload(db, [
    { mediaAssetId: "m2", displayOrder: 1, excluded: false, altText: null, caption: null, description: null },
  ]);
  assert.equal(db.prepare("SELECT count(*) AS n FROM media_placements WHERE id='p1'").get()!.n, 0);
  assert.equal(db.prepare("SELECT count(*) AS n FROM media_placements WHERE id='p-park'").get()!.n, 1);
  assert.equal(orderOf(db, "m2"), 1);
});

test("foreign media and duplicate ids are rejected before any write", async () => {
  const db = makeDb();
  const foreign = await galleryWriteThrough(d1(db), TENANT, "room-a", JSON.stringify({
    items: [{ mediaAssetId: "m-other", displayOrder: 1, excluded: false }],
  }));
  assert.ok("error" in foreign && foreign.error === "media_not_in_tenant");
  const duplicate = await galleryWriteThrough(d1(db), TENANT, "room-a", JSON.stringify({
    items: [
      { mediaAssetId: "m1", displayOrder: 1, excluded: false },
      { mediaAssetId: "m1", displayOrder: 2, excluded: false },
    ],
  }));
  assert.ok("error" in duplicate && duplicate.error === "invalid_room_gallery");
  assert.equal(orderOf(db, "m1"), 1);
});

test("a draft stays out of canonical rows and the published snapshot until publish", async () => {
  const db = makeDb();
  const before = await getSnapshot(d1(db), { tenantId: TENANT }, "roomGallery");
  const ctx = (body: unknown): EditorCtx => ({
    request: new Request("https://example.test/api/content/editor/items", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    }),
    env: { DB: d1(db) } as any,
    waitUntil: () => {},
  });
  const created = await json(await createEditorDraft(ctx({
    kind: "room_gallery", slug: "room-a",
    payload: { items: [{ mediaAssetId: "m2", displayOrder: 1, excluded: false }] },
  }), allowAdmin));
  assert.equal(created.status, "draft");
  assert.equal(orderOf(db, "m2"), 2);
  assert.equal((await getSnapshot(d1(db), { tenantId: TENANT }, "roomGallery"))?.version ?? null,
    before?.version ?? null);

  const published = await json(await publishEditorItem(ctx({}), created.id, allowAdmin));
  assert.equal(published.status, "published");
  assert.equal(published.amenitySnapshotsRefreshed, true);
  assert.equal(orderOf(db, "m2"), 1);
  const after = await getSnapshot(d1(db), { tenantId: TENANT }, "roomGallery");
  assert.notEqual(after?.version, before?.version ?? null);
  const publishedRows = JSON.parse(after!.payloadJson) as { items: { id: string; payload: { items: unknown[] } }[] };
  const room = publishedRows.items.find((item) => item.id === "room-a")!;
  assert.equal((room.payload.items as unknown[]).length, 1);
});

test("admin media catalog is tenant scoped and viewer readable", async () => {
  const db = makeDb();
  const ctx = (authorize: RoomMediaAuthorize) => ({
    request: new Request("https://example.test/api/admin/media"),
    env: { DB: d1(db) } as any, waitUntil: () => {},
  });
  assert.equal((await listAdminMedia(ctx(deny), deny)).status, 401);
  const res = await listAdminMedia(ctx(allowViewer), allowViewer);
  const body = await json(res);
  assert.deepEqual(body.items.map((item: any) => item.id), ["m1", "m2", "m3"]);
  assert.equal(body.items[0].sourceUrl, "https://cdn/one.jpg");
});

async function json(res: Response): Promise<any> {
  return res.json();
}
