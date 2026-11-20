// COW-84: the hotspot admin surface is tenant scoped, admin-authorized and
// revisioned. Guest reads and Mews behavior are untouched.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import {
  createRoomHotspot,
  listRoomHotspots,
  publishRoomHotspots,
  rollbackRoomHotspots,
  updateRoomHotspot,
  type HotspotAdminAuthorize,
  type HotspotAdminCtx,
} from "../worker/hotspot-admin.ts";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");
const TENANT = "urban-cowboy";
const OTHER = "other-tenant";

function makeDb() {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON");
  for (let id = 1; id <= 8; id += 1) {
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
      ('room-other','${OTHER}','mews-other','Other Suite','other-suite',1);
    INSERT INTO amenities (id, tenant_id, name, sort_order) VALUES
      ('tub','${TENANT}','Soaking tub',1),
      ('view','${TENANT}','Forest view',2),
      ('other-amenity','${OTHER}','Other amenity',1);
    INSERT INTO room_type_amenities (room_type_id, amenity_id, display_order, excluded) VALUES
      ('room-a','tub',1,0), ('room-a','view',2,0);
    INSERT INTO media_assets (id, tenant_id, location_id, kind, original_filename, squarespace_url) VALUES
      ('media-1','${TENANT}','catskills','image','one.jpg','https://cdn/one');
    INSERT INTO media_versions (id, media_asset_id, version, squarespace_asset_id, squarespace_url, width, height) VALUES
      ('v-1','media-1',1,'sq-1','https://cdn/one',1200,800),
      ('v-2','media-1',2,'sq-2','https://cdn/one?width=1600',1200,800);
    INSERT INTO media_asset_metadata (media_asset_id, tenant_id, current_version_id) VALUES
      ('media-1','${TENANT}','v-2');
    INSERT INTO media_placements
      (id, tenant_id, media_asset_id, target_table, target_id, placement_type, display_order) VALUES
      ('place-1','${TENANT}','media-1','room_types','room-a','gallery',1);
  `);
  return db;
}

function d1(db: DatabaseSync): any {
  return {
    prepare(sql: string) {
      let params: unknown[] = [];
      const statement = {
        __sql: sql,
        __bind: [] as unknown[],
        bind(...values: unknown[]) { statement.__bind = values; params = values; return statement; },
        async all() { return { results: db.prepare(sql).all(...params) }; },
        async first() { return db.prepare(sql).get(...params) ?? null; },
        async run() { return db.prepare(sql).run(...params); },
      };
      return statement;
    },
    async batch(statements: any[]) {
      return statements.map((statement) => ({
        meta: { changes: db.prepare(statement.__sql).run(...statement.__bind).changes },
      }));
    },
  };
}

const viewer = { sub: "v", email: "viewer@example.test", groups: [], roles: ["viewer" as const], tenantId: TENANT };
const admin = { ...viewer, sub: "a", email: "admin@example.test", roles: ["admin" as const] };
const allowViewer: HotspotAdminAuthorize = async () => viewer;
const allowAdmin: HotspotAdminAuthorize = async () => admin;
const deny: HotspotAdminAuthorize = async () => new Response("denied", { status: 401 });

function ctx(db: DatabaseSync, body?: unknown): HotspotAdminCtx {
  return {
    request: new Request("https://example.test/api/admin/rooms/room-a/hotspots", {
      method: body === undefined ? "GET" : "POST",
      headers: { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
    env: { DB: d1(db), TENANT_ID: TENANT } as any,
    waitUntil: () => {},
  };
}
const jsonBody = (res: Response) => res.json() as Promise<any>;
const createInput = (overrides: Record<string, unknown> = {}) => ({
  mediaAssetId: "media-1", placementId: "place-1", amenityId: "tub",
  sourceX: 0.42, sourceY: 0.58, sourceVersionId: "v-1",
  displayOrder: 0, ...overrides,
});

test("listRoomHotspots returns tenant-scoped pins and room-eligible amenities", async () => {
  const db = makeDb();
  const res = await listRoomHotspots(ctx(db), "room-a", allowViewer);
  assert.equal(res.status, 200);
  const body = await jsonBody(res);
  assert.deepEqual(body.items, []);
  assert.deepEqual(body.amenities.map((a: any) => a.id), ["tub", "view"]);

  const crossTenant = await listRoomHotspots(ctx(db), "room-other", allowViewer);
  assert.equal(crossTenant.status, 404);
  const denied = await listRoomHotspots(ctx(db), "room-a", deny);
  assert.equal(denied.status, 401);
});

test("createRoomHotspot validates placement, version and amenity eligibility", async () => {
  const db = makeDb();
  const viewerRes = await createRoomHotspot(ctx(db, createInput()), "room-a", allowViewer);
  assert.equal(viewerRes.status, 403);

  const badAmenity = await createRoomHotspot(
    ctx(db, createInput({ amenityId: "not-assigned" })), "room-a", allowAdmin,
  );
  assert.equal(badAmenity.status, 400);
  assert.deepEqual(await jsonBody(badAmenity), { error: "amenity_not_eligible" });

  const badCoords = await createRoomHotspot(
    ctx(db, createInput({ sourceX: 1.4 })), "room-a", allowAdmin,
  );
  assert.equal(badCoords.status, 400);

  const created = await createRoomHotspot(ctx(db, createInput()), "room-a", allowAdmin);
  assert.equal(created.status, 201);
  const body = await jsonBody(created);
  assert.equal(body.mapping.status, "draft");
  assert.equal(body.mapping.reviewState, "none");
  assert.equal(body.mapping.targetTable, "room_types");
  assert.equal(body.mapping.targetId, "room-a");
  assert.equal(db.prepare("SELECT id FROM photo_hotspot_mapping_revisions").all().length, 1);
});

test("updateRoomHotspot persists source-space coordinates and review state with a snapshot", async () => {
  const db = makeDb();
  const created = await jsonBody(await createRoomHotspot(ctx(db, createInput()), "room-a", allowAdmin));
  const id = created.mapping.id;

  const updated = await updateRoomHotspot(
    ctx(db, { sourceX: 0.7, sourceY: 0.2, reviewState: "pending", amenityId: "view" }),
    "room-a", id, allowAdmin,
  );
  assert.equal(updated.status, 200);
  const mapping = (await jsonBody(updated)).mapping;
  assert.equal(mapping.sourceX, 0.7);
  assert.equal(mapping.sourceY, 0.2);
  assert.equal(mapping.reviewState, "pending");
  assert.equal(mapping.amenityId, "view");

  const revisions = db.prepare(
    "SELECT action, snapshot_json FROM photo_hotspot_mapping_revisions",
  ).all() as Array<{ action: string; snapshot_json: string }>;
  assert.deepEqual(revisions.map((row) => row.action).sort(), ["create", "review"]);
  const reviewRevision = revisions.find((row) => row.action === "review");
  assert.ok(reviewRevision);
  const before = JSON.parse(reviewRevision.snapshot_json);
  assert.equal(before.sourceX, 0.42);
});

test("publish blocks pending geometry and succeeds after approval", async () => {
  const db = makeDb();
  const created = await jsonBody(await createRoomHotspot(ctx(db, createInput()), "room-a", allowAdmin));
  const id = created.mapping.id;
  await updateRoomHotspot(ctx(db, { reviewState: "pending" }), "room-a", id, allowAdmin);

  const blocked = await publishRoomHotspots(
    ctx(db, { mediaAssetId: "media-1", placementId: "place-1" }), "room-a", allowAdmin,
  );
  assert.equal(blocked.status, 409);
  assert.equal((await jsonBody(blocked)).error, "review_pending");

  await updateRoomHotspot(ctx(db, { reviewState: "approved" }), "room-a", id, allowAdmin);
  const published = await publishRoomHotspots(
    ctx(db, { mediaAssetId: "media-1", placementId: "place-1" }), "room-a", allowAdmin,
  );
  assert.equal(published.status, 200);
  assert.equal((await jsonBody(published)).published, 1);
  const rows = db.prepare("SELECT status, review_state FROM photo_hotspot_mappings").all() as any[];
  assert.equal(rows[0].status, "published");
  assert.equal(rows[0].review_state, "approved");
});

test("rollback restores an earlier geometry snapshot", async () => {
  const db = makeDb();
  const created = await jsonBody(await createRoomHotspot(ctx(db, createInput()), "room-a", allowAdmin));
  const id = created.mapping.id;
  await updateRoomHotspot(ctx(db, { sourceX: 0.9 }), "room-a", id, allowAdmin);
  const rolled = await rollbackRoomHotspots(
    ctx(db, { mediaAssetId: "media-1", toVersionId: "v-1" }), "room-a", allowAdmin,
  );
  assert.equal(rolled.status, 200);
  assert.equal((await jsonBody(rolled)).restored, 1);
  const mapping = db.prepare("SELECT source_x FROM photo_hotspot_mappings WHERE id = ?").get(id) as any;
  assert.equal(mapping.source_x, 0.42);
});
