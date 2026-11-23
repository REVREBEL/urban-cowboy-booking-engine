// COW-84: the hotspot admin surface is tenant scoped, admin-authorized and
// revisioned. Guest reads and Mews behavior are untouched.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import {
  applyHotspotReplacement,
  createRoomHotspot,
  deleteRoomHotspot,
  listRoomHotspots,
  planHotspotReplacement,
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
      ('room-b','${TENANT}','mews-b','Suite B','suite-b',2),
      ('room-other','${OTHER}','mews-other','Other Suite','other-suite',1);
    INSERT INTO amenities (id, tenant_id, name, sort_order) VALUES
      ('tub','${TENANT}','Soaking tub',1),
      ('view','${TENANT}','Forest view',2),
      ('other-amenity','${OTHER}','Other amenity',1);
    INSERT INTO room_type_amenities (room_type_id, amenity_id, display_order, excluded) VALUES
      ('room-a','tub',1,0), ('room-a','view',2,0), ('room-b','tub',1,0);
    INSERT INTO media_assets (id, tenant_id, location_id, kind, original_filename, squarespace_url) VALUES
      ('media-1','${TENANT}','catskills','image','one.jpg','https://cdn/one'),
      ('media-other','${OTHER}',NULL,'image','other.jpg','https://cdn/other');
    INSERT INTO media_versions (id, media_asset_id, version, squarespace_asset_id, squarespace_url, width, height) VALUES
      ('v-1','media-1',1,'sq-1','https://cdn/one',1200,800),
      ('v-2','media-1',2,'sq-2','https://cdn/one?width=1600',1200,800);
    INSERT INTO media_asset_metadata (media_asset_id, tenant_id, current_version_id) VALUES
      ('media-1','${TENANT}','v-2');
    INSERT INTO media_versions (id, media_asset_id, version, squarespace_asset_id, squarespace_url) VALUES
      ('v-other','media-other',1,'sq-other','https://cdn/other');
    INSERT INTO media_placements
      (id, tenant_id, media_asset_id, target_table, target_id, placement_type, display_order) VALUES
      ('place-1','${TENANT}','media-1','room_types','room-a','gallery',1),
      ('place-2','${TENANT}','media-1','room_types','room-b','gallery',1);
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
  const resulting = JSON.parse(reviewRevision.snapshot_json);
  assert.equal(resulting.sourceX, 0.7, "snapshots store the resulting geometry for rollback");
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
    ctx(db, { mediaAssetId: "media-1", placementId: "place-1", toVersionId: "v-1" }), "room-a", allowAdmin,
  );
  assert.equal(rolled.status, 200);
  assert.equal((await jsonBody(rolled)).restored, 1);
  const mapping = db.prepare("SELECT source_x FROM photo_hotspot_mappings WHERE id = ?").get(id) as any;
  assert.equal(mapping.source_x, 0.9);
});

test("edits to a published pin stay in a draft until publish", async () => {
  const db = makeDb();
  const created = await jsonBody(await createRoomHotspot(ctx(db, createInput()), "room-a", allowAdmin));
  const id = created.mapping.id;
  const published = await publishRoomHotspots(
    ctx(db, { mediaAssetId: "media-1", placementId: "place-1" }), "room-a", allowAdmin,
  );
  assert.equal(published.status, 200);

  const edited = await updateRoomHotspot(
    ctx(db, { sourceX: 0.8, reviewState: "pending" }), "room-a", id, allowAdmin,
  );
  assert.equal((await jsonBody(edited)).draftOnly, true);
  const guestRow = db.prepare("SELECT source_x, review_state FROM photo_hotspot_mappings WHERE id = ?").get(id) as any;
  assert.equal(guestRow.source_x, 0.42);
  assert.equal(guestRow.review_state, "approved");

  const listed = await jsonBody(await listRoomHotspots(ctx(db), "room-a", allowViewer));
  assert.equal(listed.items[0].hasDraft, true);
  assert.equal(listed.items[0].sourceX, 0.8);

  const blocked = await publishRoomHotspots(
    ctx(db, { mediaAssetId: "media-1", placementId: "place-1" }), "room-a", allowAdmin,
  );
  assert.equal(blocked.status, 409);

  await updateRoomHotspot(ctx(db, { reviewState: "approved" }), "room-a", id, allowAdmin);
  const applied = await publishRoomHotspots(
    ctx(db, { mediaAssetId: "media-1", placementId: "place-1" }), "room-a", allowAdmin,
  );
  assert.equal(applied.status, 200);
  const finalRow = db.prepare("SELECT source_x FROM photo_hotspot_mappings WHERE id = ?").get(id) as any;
  assert.equal(finalRow.source_x, 0.8);
  assert.equal(db.prepare("SELECT mapping_id FROM photo_hotspot_drafts").all().length, 0);
});

test("publish and rollback never touch pins on another room's placement", async () => {
  const db = makeDb();
  const a = await jsonBody(await createRoomHotspot(ctx(db, createInput()), "room-a", allowAdmin));
  const b = await jsonBody(await createRoomHotspot(ctx(db, createInput({ placementId: "place-2" })), "room-b", allowAdmin));
  await updateRoomHotspot(ctx(db, { reviewState: "pending" }), "room-a", a.mapping.id, allowAdmin);

  const blocked = await publishRoomHotspots(
    ctx(db, { mediaAssetId: "media-1", placementId: "place-1" }), "room-a", allowAdmin,
  );
  assert.equal(blocked.status, 409);
  const bStatus = db.prepare("SELECT status FROM photo_hotspot_mappings WHERE id = ?").get(b.mapping.id) as any;
  assert.equal(bStatus.status, "draft");

  await updateRoomHotspot(ctx(db, { reviewState: "approved" }), "room-a", a.mapping.id, allowAdmin);
  const published = await publishRoomHotspots(
    ctx(db, { mediaAssetId: "media-1", placementId: "place-1" }), "room-a", allowAdmin,
  );
  assert.equal(published.status, 200);
  const statuses = db.prepare("SELECT id, status FROM photo_hotspot_mappings").all() as Array<{ id: string; status: string }>;
  assert.equal(statuses.find((row) => row.id === a.mapping.id)?.status, "published");
  assert.equal(statuses.find((row) => row.id === b.mapping.id)?.status, "draft");

  const rolled = await rollbackRoomHotspots(
    ctx(db, { mediaAssetId: "media-1", placementId: "place-1", toVersionId: "v-1" }), "room-a", allowAdmin,
  );
  assert.equal(rolled.status, 200);
  assert.equal((await jsonBody(rolled)).restored, 1);
});

test("create rejects mismatched and cross-tenant asset relationships", async () => {
  const db = makeDb();
  const mismatched = await createRoomHotspot(
    ctx(db, createInput({ mediaAssetId: "media-other", sourceVersionId: "v-other" })), "room-a", allowAdmin,
  );
  assert.equal(mismatched.status, 400);
  assert.equal((await jsonBody(mismatched)).error, "placement_asset_mismatch");

  const crossTenantPlacement = await createRoomHotspot(
    ctx(db, createInput({ placementId: "place-1", mediaAssetId: "media-other", sourceVersionId: "v-other" })),
    "room-other", allowAdmin,
  );
  assert.equal(crossTenantPlacement.status, 404);

  const crossTenantVersion = await createRoomHotspot(
    ctx(db, createInput({ mediaAssetId: "media-1", sourceVersionId: "v-other" })), "room-a", allowAdmin,
  );
  assert.equal(crossTenantVersion.status, 404);
});

const replacementInput = (overrides: Record<string, unknown> = {}) => ({
  mediaAssetId: "media-1",
  placementId: "place-1",
  fromVersionId: "v-1",
  toVersionId: "v-2",
  urlOnly: false,
  ...overrides,
});

test("replacement planning is read-only, room scoped and rejects foreign versions", async () => {
  const db = makeDb();
  await createRoomHotspot(ctx(db, createInput()), "room-a", allowAdmin);
  const before = (db.prepare("SELECT source_version_id FROM photo_hotspot_mappings").all() as any[])[0].source_version_id;

  const planned = await planHotspotReplacement(
    ctx(db, replacementInput({ urlOnly: true })), "room-a", allowAdmin,
  );
  assert.equal(planned.status, 200);
  const plan = await jsonBody(planned);
  assert.equal(plan.decision, "url_only");
  assert.equal(plan.reviewRequired, false);
  assert.equal((db.prepare("SELECT source_version_id FROM photo_hotspot_mappings").all() as any[])[0].source_version_id, before);

  const viewer = await planHotspotReplacement(ctx(db, replacementInput()), "room-a", allowViewer);
  assert.equal(viewer.status, 403);
  const crossRoom = await planHotspotReplacement(
    ctx(db, replacementInput({ placementId: "place-2" })), "room-a", allowAdmin,
  );
  assert.equal(crossRoom.status, 400);
  const foreignVersion = await planHotspotReplacement(
    ctx(db, replacementInput({ toVersionId: "v-other" })), "room-a", allowAdmin,
  );
  assert.equal(foreignVersion.status, 400);
  assert.equal((await jsonBody(foreignVersion)).error, "version_asset_mismatch");
});

test("ambiguous replacement stages a reviewed draft and cannot silently publish", async () => {
  const db = makeDb();
  const created = await jsonBody(await createRoomHotspot(ctx(db, createInput()), "room-a", allowAdmin));
  const applied = await applyHotspotReplacement(
    ctx(db, replacementInput()), "room-a", allowAdmin,
  );
  assert.equal(applied.status, 200);
  const result = await jsonBody(applied);
  assert.equal(result.decision, "replacement_review");
  assert.equal(result.reviewRequired, true);

  const mapping = db.prepare("SELECT status, review_state, source_version_id FROM photo_hotspot_mappings").get() as any;
  assert.equal(mapping.status, "draft", "unverified geometry must not be published");
  assert.equal(mapping.review_state, "pending");
  assert.equal(mapping.source_version_id, "v-2", "pin moves to the new version of the same asset");

  const blocked = await publishRoomHotspots(
    ctx(db, { mediaAssetId: "media-1", placementId: "place-1" }), "room-a", allowAdmin,
  );
  assert.equal(blocked.status, 409);

  await updateRoomHotspot(ctx(db, { reviewState: "approved" }), "room-a", created.mapping.id, allowAdmin);
  const published = await publishRoomHotspots(
    ctx(db, { mediaAssetId: "media-1", placementId: "place-1" }), "room-a", allowAdmin,
  );
  assert.equal(published.status, 200);
});

test("crop remap is classified from validated crop rectangles", async () => {
  const db = makeDb();
  await createRoomHotspot(ctx(db, createInput()), "room-a", allowAdmin);
  const sameHash = {
    sha256: "hash-1", phash: null, width: 1200, height: 800, exifOrientation: 1 as const,
  };
  const planned = await planHotspotReplacement(ctx(db, replacementInput({
    fromFingerprint: sameHash,
    toFingerprint: sameHash,
    cropBefore: { left: 0, top: 0, width: 1, height: 1 },
    cropAfter: { left: 0.1, top: 0.1, width: 0.8, height: 0.8 },
  })), "room-a", allowAdmin);
  assert.equal(planned.status, 200);
  assert.equal((await jsonBody(planned)).decision, "crop_remap");
});

test("pin deletion is staged, revisioned and applied only on publish", async () => {
  const db = makeDb();
  const created = await jsonBody(await createRoomHotspot(ctx(db, createInput()), "room-a", allowAdmin));
  await publishRoomHotspots(ctx(db, { mediaAssetId: "media-1", placementId: "place-1" }), "room-a", allowAdmin);

  const staged = await deleteRoomHotspot(
    ctx(db), "room-a", created.mapping.id, allowAdmin,
  );
  assert.equal((await jsonBody(staged)).pendingDelete, true);
  const stillPublished = db.prepare("SELECT status FROM photo_hotspot_mappings WHERE id = ?").get(created.mapping.id) as any;
  assert.equal(stillPublished.status, "published", "guest data is isolated until publish");
  const listed = await jsonBody(await listRoomHotspots(ctx(db), "room-a", allowViewer));
  assert.equal(listed.items.find((item: any) => item.id === created.mapping.id)?.pendingDelete, true);
  assert.ok((db.prepare("SELECT id FROM photo_hotspot_mapping_revisions WHERE mapping_id = ?").all(created.mapping.id) as any[]).length >= 2);

  const denied = await deleteRoomHotspot(ctx(db), "room-a", created.mapping.id, allowViewer);
  assert.equal(denied.status, 403);

  await publishRoomHotspots(ctx(db, { mediaAssetId: "media-1", placementId: "place-1" }), "room-a", allowAdmin);
  const afterPublish = db.prepare("SELECT status, review_reason FROM photo_hotspot_mappings WHERE id = ?").get(created.mapping.id) as any;
  assert.equal(afterPublish.status, "draft");
  assert.equal(afterPublish.review_reason, "deleted");
  const listedAfter = await jsonBody(await listRoomHotspots(ctx(db), "room-a", allowViewer));
  assert.equal(listedAfter.items.some((item: any) => item.id === created.mapping.id), false);
  assert.equal(db.prepare("SELECT mapping_id FROM photo_hotspot_deletions").all().length, 0);
});

test("rollback cancels a pending deletion on the same placement", async () => {
  const db = makeDb();
  const created = await jsonBody(await createRoomHotspot(ctx(db, createInput()), "room-a", allowAdmin));
  await publishRoomHotspots(ctx(db, { mediaAssetId: "media-1", placementId: "place-1" }), "room-a", allowAdmin);
  await deleteRoomHotspot(ctx(db), "room-a", created.mapping.id, allowAdmin);
  const rolled = await rollbackRoomHotspots(
    ctx(db, { mediaAssetId: "media-1", placementId: "place-1", toVersionId: "v-1" }), "room-a", allowAdmin,
  );
  assert.equal(rolled.status, 200);
  assert.equal(db.prepare("SELECT mapping_id FROM photo_hotspot_deletions").all().length, 0);
});

test("a published pin's safe replacement is staged until publish", async () => {
  const db = makeDb();
  const created = await jsonBody(await createRoomHotspot(ctx(db, createInput()), "room-a", allowAdmin));
  await publishRoomHotspots(ctx(db, { mediaAssetId: "media-1", placementId: "place-1" }), "room-a", allowAdmin);
  const sameHash = { sha256: "hash-1", phash: null, width: 1200, height: 800, exifOrientation: 1 as const };

  const applied = await jsonBody(await applyHotspotReplacement(ctx(db, replacementInput({
    fromFingerprint: sameHash, toFingerprint: sameHash,
    cropBefore: { left: 0, top: 0, width: 1, height: 1 },
    cropAfter: { left: 0, top: 0, width: 1, height: 1 },
  })), "room-a", allowAdmin));
  assert.equal(applied.decision, "exact_reupload");
  assert.equal(applied.reviewRequired, false);
  assert.equal(applied.stagedPublished, 1);

  const beforePublish = db.prepare("SELECT source_version_id FROM photo_hotspot_mappings WHERE id = ?").get(created.mapping.id) as any;
  assert.equal(beforePublish.source_version_id, "v-1", "guest row is unchanged before publish");
  const list = await jsonBody(await listRoomHotspots(ctx(db), "room-a", allowViewer));
  assert.equal(list.items.find((item: any) => item.id === created.mapping.id)?.hasDraft, true);

  const published = await publishRoomHotspots(
    ctx(db, { mediaAssetId: "media-1", placementId: "place-1" }), "room-a", allowAdmin,
  );
  assert.equal(published.status, 200);
  const afterPublish = db.prepare("SELECT source_version_id FROM photo_hotspot_mappings WHERE id = ?").get(created.mapping.id) as any;
  assert.equal(afterPublish.source_version_id, "v-2");
});

test("a published pin's review-required replacement cannot publish until approved", async () => {
  const db = makeDb();
  const created = await jsonBody(await createRoomHotspot(ctx(db, createInput()), "room-a", allowAdmin));
  await publishRoomHotspots(ctx(db, { mediaAssetId: "media-1", placementId: "place-1" }), "room-a", allowAdmin);

  const applied = await jsonBody(await applyHotspotReplacement(ctx(db, replacementInput()), "room-a", allowAdmin));
  assert.equal(applied.decision, "replacement_review");
  assert.equal(applied.reviewRequired, true);
  const before = db.prepare("SELECT source_version_id, status FROM photo_hotspot_mappings WHERE id = ?").get(created.mapping.id) as any;
  assert.equal(before.source_version_id, "v-1");
  assert.equal(before.status, "published");

  const blocked = await publishRoomHotspots(
    ctx(db, { mediaAssetId: "media-1", placementId: "place-1" }), "room-a", allowAdmin,
  );
  assert.equal(blocked.status, 409);

  await updateRoomHotspot(ctx(db, { reviewState: "approved" }), "room-a", created.mapping.id, allowAdmin);
  const published = await publishRoomHotspots(
    ctx(db, { mediaAssetId: "media-1", placementId: "place-1" }), "room-a", allowAdmin,
  );
  assert.equal(published.status, 200);
  const after = db.prepare("SELECT source_version_id FROM photo_hotspot_mappings WHERE id = ?").get(created.mapping.id) as any;
  assert.equal(after.source_version_id, "v-2");
});

test("a deletion-only publish succeeds and commits the removal", async () => {
  const db = makeDb();
  const created = await jsonBody(await createRoomHotspot(ctx(db, createInput()), "room-a", allowAdmin));
  await publishRoomHotspots(ctx(db, { mediaAssetId: "media-1", placementId: "place-1" }), "room-a", allowAdmin);
  await deleteRoomHotspot(ctx(db), "room-a", created.mapping.id, allowAdmin);

  const published = await publishRoomHotspots(
    ctx(db, { mediaAssetId: "media-1", placementId: "place-1" }), "room-a", allowAdmin,
  );
  assert.equal(published.status, 200);
  const body = await jsonBody(published);
  assert.equal(body.ok, true);
  assert.equal(body.deletionsApplied, 1);
  const mapping = db.prepare("SELECT status, review_reason FROM photo_hotspot_mappings WHERE id = ?").get(created.mapping.id) as any;
  assert.equal(mapping.status, "draft");
  assert.equal(mapping.review_reason, "deleted");
});

test("rollback after a published deletion cannot resurrect the pin", async () => {
  const db = makeDb();
  const created = await jsonBody(await createRoomHotspot(ctx(db, createInput()), "room-a", allowAdmin));
  await publishRoomHotspots(ctx(db, { mediaAssetId: "media-1", placementId: "place-1" }), "room-a", allowAdmin);
  await deleteRoomHotspot(ctx(db), "room-a", created.mapping.id, allowAdmin);
  await publishRoomHotspots(ctx(db, { mediaAssetId: "media-1", placementId: "place-1" }), "room-a", allowAdmin);

  const rolled = await rollbackRoomHotspots(
    ctx(db, { mediaAssetId: "media-1", placementId: "place-1", toVersionId: "v-1" }), "room-a", allowAdmin,
  );
  const mapping = db.prepare("SELECT status, review_reason FROM photo_hotspot_mappings WHERE id = ?").get(created.mapping.id) as any;
  assert.equal(mapping.status, "draft");
  assert.equal(mapping.review_reason, "deleted");
  const listed = await jsonBody(await listRoomHotspots(ctx(db), "room-a", allowViewer));
  assert.equal(listed.items.some((item: any) => item.id === created.mapping.id), false);
  assert.ok(rolled.status === 200 || rolled.status === 409);
});
