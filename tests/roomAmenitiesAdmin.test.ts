// COW-73: tenant-scoped amenity admin reads and the publish-time write-through
// into canonical D1 records. Drafts must never change what guests can read.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import {
  createEditorDraft,
  publishEditorItem,
  rollbackEditorItem,
  saveEditorDraft,
  type Authorize,
  type EditorCtx,
} from "../worker/content-editor.ts";
import {
  getRoomAmenities,
  listAdminAmenities,
  type RoomAmenitiesAuthorize,
  type RoomAmenitiesCtx,
} from "../worker/room-amenities.ts";
import { loadPublishedCollection } from "../worker/content-provider.ts";

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
    "migrations/0006_working_revision_pointer.sql",
    "migrations/0007_amenity_editorial.sql",
    "migrations/0012_editorial_publication_state.sql",
  ]) db.exec(read(file));
  db.exec(`
    INSERT INTO tenants (id, slug, name) VALUES
      ('${TENANT}','${TENANT}','Urban Cowboy'), ('${OTHER}','${OTHER}','Other');
    INSERT INTO locations (id, tenant_id, slug, name) VALUES
      ('catskills','${TENANT}','catskills','Catskills');
    INSERT INTO room_types (id, tenant_id, location_id, mews_room_category_id, name, slug, sort_order) VALUES
      ('room-a','${TENANT}','catskills','mews-a','Suite A','suite-a',1),
      ('room-b','${TENANT}','catskills','mews-b','Suite B','suite-b',2),
      ('room-other','${OTHER}',NULL,'mews-other','Other Suite','other-suite',1);
    INSERT INTO amenities (id, tenant_id, name, image_name, image_path, sort_order) VALUES
      ('tub','${TENANT}','Copper Tub',NULL,NULL,1),
      ('speaker','${TENANT}','Marshall Speaker',NULL,NULL,2),
      ('other-amenity','${OTHER}','Foreign Amenity',NULL,NULL,1);
    INSERT INTO amenity_editorial (amenity_id, tenant_id, short_name, short_description, long_description, active) VALUES
      ('tub','${TENANT}','Tub','Soak','Long soak',1),
      ('speaker','${TENANT}','Speaker',NULL,NULL,1);
    INSERT INTO room_type_amenities (room_type_id, amenity_id, display_order, excluded) VALUES
      ('room-a','tub',0,0), ('room-a','speaker',1,1), ('room-b','tub',0,0);
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

const viewer = {
  sub: "viewer-1", email: "viewer@example.test", groups: [], roles: ["viewer"] as ("viewer" | "admin")[],
  tenantId: TENANT,
};
const admin = { ...viewer, sub: "admin-1", email: "admin@example.test", roles: ["viewer", "admin"] as ("viewer" | "admin")[] };
const noTenant = { ...viewer, tenantId: "" };

const allowViewer: RoomAmenitiesAuthorize = async (_r, _e, role) =>
  role === "viewer" ? viewer : new Response("denied", { status: 403 });
const allowAdmin: Authorize = async (_r, _e, role) =>
  role === "admin" ? admin : new Response("denied", { status: 403 });
const deny: RoomAmenitiesAuthorize = async () => new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
const allowNoTenant: RoomAmenitiesAuthorize = async () => noTenant;

function readCtx(db: DatabaseSync, path = "https://example.test/api/admin/amenities"): RoomAmenitiesCtx {
  return { request: new Request(path), env: { DB: d1(db) } as any, waitUntil: () => {} };
}
function writeCtx(db: DatabaseSync, body: unknown): EditorCtx {
  return {
    request: new Request("https://example.test/api/content/editor/items", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    }),
    env: { DB: d1(db) } as any,
    waitUntil: () => {},
  };
}
const jsonBody = async (res: Response): Promise<any> => res.json();

test("amenity catalog and room assignments are viewer-readable and fail closed", async () => {
  const db = makeDb();
  assert.equal((await listAdminAmenities(readCtx(db), deny)).status, 401);
  assert.equal((await listAdminAmenities(readCtx(db), allowNoTenant)).status, 503);

  const catalog = await jsonBody(await listAdminAmenities(readCtx(db), allowViewer));
  assert.equal(catalog.items.length, 2); // only this tenant's amenities
  const tub = catalog.items.find((item: any) => item.id === "tub");
  assert.equal(tub.shortName, "Tub");
  assert.equal(tub.shortDescription, "Soak");
  assert.equal(tub.status, null);

  assert.equal((await getRoomAmenities(readCtx(db, "https://example.test/api/admin/rooms/room-other/amenities"), "room-other", allowViewer)).status, 404);
  const room = await jsonBody(await getRoomAmenities(readCtx(db, "https://example.test/api/admin/rooms/room-a/amenities"), "room-a", allowViewer));
  assert.equal(room.items.length, 2);
  assert.deepEqual(room.items.map((item: any) => item.amenityId), ["tub", "speaker"]);
  assert.deepEqual(room.items.map((item: any) => item.displayOrder), [0, 1]);
  assert.equal(room.items[1].excluded, true); // restricted-amenity-ids -> excluded
  assert.equal(room.items[1].active, true);
});

test("room assignment drafts do not change published rows until publish, and rollback restores them", async () => {
  const db = makeDb();
  const body = {
    kind: "room_amenities", slug: "room-a",
    payload: { items: [{ amenityId: "speaker", displayOrder: 0, excluded: false }] },
  };
  const created = await jsonBody(await createEditorDraft(writeCtx(db, body), allowAdmin));
  assert.equal(created.status, "draft");

  // Still the seeded published state while only a draft exists.
  let published = await loadPublishedCollection(d1(db), { tenantId: TENANT }, "roomAmenities");
  const suiteA = published.find((record) => record.id === "room-a")!;
  assert.equal((suiteA.payload.amenities as any[]).length, 2);

  const pub = await jsonBody(await publishEditorItem(writeCtx(db, {}), created.id, allowAdmin));
  assert.equal(pub.status, "published");
  assert.equal(pub.amenitySnapshotsRefreshed, true);
  published = await loadPublishedCollection(d1(db), { tenantId: TENANT }, "roomAmenities");
  const after = published.find((record) => record.id === "room-a")!;
  assert.deepEqual((after.payload.amenities as any[]).map((a: any) => a.amenityId), ["speaker"]);
  assert.equal((db.prepare("SELECT COUNT(*) AS n FROM room_type_amenities WHERE room_type_id='room-a'").get() as any).n, 1);

  // A further draft is visible to the editor but not to guests.
  const saved = await jsonBody(await saveEditorDraft(writeCtx(db, {
    payload: { items: [{ amenityId: "tub", displayOrder: 0, excluded: true }] },
    expectedRevisionId: pub.revisionId,
  }), created.id, allowAdmin));
  assert.equal(saved.snapshotRefreshed, false);
  assert.notEqual(saved.revisionId, pub.revisionId);
  const room = await jsonBody(await getRoomAmenities(readCtx(db, "https://example.test/api/admin/rooms/room-a/amenities"), "room-a", allowViewer));
  assert.equal(room.hasUnpublishedDraft, true);
  assert.deepEqual(room.draft.items.map((item: any) => item.amenityId), ["tub"]);
  assert.deepEqual(room.items.map((item: any) => item.amenityId), ["speaker"]);

  const rolled = await jsonBody(await rollbackEditorItem(writeCtx(db, { revisionId: pub.revisionId }), created.id, allowAdmin));
  assert.equal(rolled.status, "published");
  published = await loadPublishedCollection(d1(db), { tenantId: TENANT }, "roomAmenities");
  const restored = published.find((record) => record.id === "room-a")!;
  assert.deepEqual((restored.payload.amenities as any[]).map((a: any) => a.amenityId), ["speaker"]);
});

test("amenity content publish updates canonical editorial, icon and snapshot", async () => {
  const db = makeDb();
  const created = await jsonBody(await createEditorDraft(writeCtx(db, {
    kind: "amenity_content", slug: "tub",
    payload: {
      shortName: "Bath", shortDescription: "New short", longDescription: "New long",
      imagePath: "assets/icons/icons-simple/marshall_speaker.svg", imageName: null, active: false,
    },
  }), allowAdmin));
  const pub = await jsonBody(await publishEditorItem(writeCtx(db, {}), created.id, allowAdmin));
  assert.equal(pub.status, "published");

  const editorial = db.prepare("SELECT short_name, short_description, long_description, active FROM amenity_editorial WHERE amenity_id='tub'").get() as any;
  assert.equal(editorial.short_name, "Bath");
  assert.equal(editorial.short_description, "New short");
  assert.equal(editorial.long_description, "New long");
  assert.equal(editorial.active, 0);
  const amenity = db.prepare("SELECT image_path, image_name FROM amenities WHERE id='tub'").get() as any;
  assert.equal(amenity.image_path, "assets/icons/icons-simple/marshall_speaker.svg");
  assert.equal(amenity.image_name, null);

  const published = await loadPublishedCollection(d1(db), { tenantId: TENANT }, "amenities");
  const tub = published.find((record) => record.id === "tub")!;
  assert.equal((tub.payload as any).shortName, "Bath");
  assert.equal((tub.payload as any).active, false);
  const roomDocs = await loadPublishedCollection(d1(db), { tenantId: TENANT }, "roomAmenities");
  const suiteA = roomDocs.find((record) => record.id === "room-a")!;
  assert.equal(((suiteA.payload.amenities as any[]).some((a) => a.amenityId === "tub")), false); // inactive hidden
});

test("invalid amenity documents and cross-tenant ids are rejected", async () => {
  const db = makeDb();
  const badIcon = await createEditorDraft(writeCtx(db, {
    kind: "amenity_content", slug: "tub",
    payload: { shortName: "Tub", shortDescription: null, longDescription: null, imagePath: "https://evil.test/x.svg", imageName: null, active: true },
  }), allowAdmin);
  assert.equal(badIcon.status, 400);

  const duplicate = await createEditorDraft(writeCtx(db, {
    kind: "room_amenities", slug: "room-a",
    payload: { items: [
      { amenityId: "tub", displayOrder: 0, excluded: false },
      { amenityId: "tub", displayOrder: 1, excluded: false },
    ] },
  }), allowAdmin);
  assert.equal(duplicate.status, 400);

  const foreign = await createEditorDraft(writeCtx(db, {
    kind: "room_amenities", slug: "room-a",
    payload: { items: [{ amenityId: "other-amenity", displayOrder: 0, excluded: false }] },
  }), allowAdmin);
  assert.equal(foreign.status, 201);
  const published = await publishEditorItem(writeCtx(db, {}), (await jsonBody(foreign)).id, allowAdmin);
  assert.equal(published.status, 400);
  assert.match(await published.text(), /amenity_not_in_tenant/);
});
