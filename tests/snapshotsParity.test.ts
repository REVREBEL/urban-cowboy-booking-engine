// COW-32: published snapshots, shadow parity, flags, headers and fallback.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import {
  CONTENT_COLLECTIONS,
  buildSnapshot,
  canonicalJson,
  loadPublishedCollection,
  sha256Hex,
  toParityItems,
  type PublishedRecord,
} from "../worker/content-provider.ts";
import {
  getSnapshot,
  getSnapshotPointer,
  rollbackSnapshot,
  saveSnapshot,
} from "../worker/published-snapshots.ts";
import { diffParity } from "../worker/shadow-read.ts";
import { contentSource, NO_STORE_HEADERS, snapshotHeaders } from "../worker/content-source.ts";
import { snapshotGet } from "../worker/content-routes.ts";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");

function makeDb() {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON");
  for (const file of [
    "migrations/0001_init.sql",
    "migrations/0002_module_list_indexes.sql",
    "migrations/0003_property_scoped_contracts.sql",
    "migrations/0004_published_snapshots.sql",
    "tests/fixtures/d1-contracts-fixture.sql",
    "tests/fixtures/snapshots-fixture.sql",
  ]) db.exec(read(file));
  return db;
}

/** D1-shaped adapter supporting bind/all/first/run. */
function d1(db: DatabaseSync): any {
  return {
    prepare(sql: string) {
      let params: unknown[] = [];
      return {
        bind(...values: unknown[]) { params = values; return this; },
        async all() { return { results: db.prepare(sql).all(...params) }; },
        async first() { return db.prepare(sql).get(...params) ?? null; },
        async run() { db.prepare(sql).run(...params); return { success: true }; },
      };
    },
  };
}

const scope = { tenantId: "contracts-fixture", locationId: "fixture-location" };
const record = (id: string, name: string): PublishedRecord => ({
  id, collection: "locations", payload: { slug: id, name, published: true },
});

test("canonical JSON is stable across key order and snapshots are content-addressed", async () => {
  assert.equal(canonicalJson({ b: 1, a: 2 }), canonicalJson({ a: 2, b: 1 }));
  const a = await buildSnapshot("locations", [record("b", "B"), record("a", "A")]);
  const reordered = await buildSnapshot("locations", [record("a", "A"), record("b", "B")]);
  assert.equal(a.version, reordered.version);
  assert.equal(a.itemCount, 2);
  assert.equal(a.checksum, a.version);
  assert.match(a.version, /^[a-f0-9]{64}$/);
  const changed = await buildSnapshot("locations", [record("a", "A"),
    { ...record("b", "B"), payload: { ...record("b", "B").payload, name: "Changed" } },
  ]);
  assert.notEqual(changed.version, a.version);
  assert.equal(await sha256Hex("abc"), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
});

test("snapshots can be pinned, refreshed and rolled back", async () => {
  const db = makeDb();
  const api = d1(db);
  const v1 = await buildSnapshot("locations", [record("a", "A")]);
  const v2 = await buildSnapshot("locations", [record("a", "A2")]);
  const v3 = await buildSnapshot("locations", [record("a", "A3")]);

  const p1 = await saveSnapshot(api, scope, "locations", v1);
  assert.equal(p1.currentVersion, v1.version);
  assert.equal(p1.previousVersion, null);

  await saveSnapshot(api, scope, "locations", v2);
  assert.equal((await getSnapshotPointer(api, scope, "locations"))?.previousVersion, v1.version);

  // Re-saving the same version is idempotent and keeps the rollback target.
  await saveSnapshot(api, scope, "locations", v2);
  assert.equal((await getSnapshotPointer(api, scope, "locations"))?.previousVersion, v1.version);

  const sameVersionAgain = await buildSnapshot("locations", [record("a", "A3")]);
  await saveSnapshot(api, scope, "locations", sameVersionAgain);
  assert.equal((await getSnapshotPointer(api, scope, "locations"))?.previousVersion, v2.version);

  assert.equal((await getSnapshot(api, scope, "locations"))?.version, v3.version);
  assert.equal((await getSnapshot(api, scope, "locations", v1.version))?.version, v1.version);
  assert.equal(await getSnapshot(api, scope, "locations", "missing-version"), null);

  const rolled = await rollbackSnapshot(api, scope, "locations");
  assert.equal(rolled?.currentVersion, v2.version);
  assert.equal((await getSnapshot(api, scope, "locations"))?.version, v2.version);
  assert.equal((await rollbackSnapshot(api, scope, "locations"))?.currentVersion, v3.version);
  db.close();
});

test("parity diff reports added, removed, changed and matched records", () => {
  const summary = diffParity("locations", [
    { id: "a", slug: "a", name: "A", published: true },
    { id: "b", slug: "b", name: "B2", published: true },
    { id: "c", slug: "c", name: "C", published: true },
  ], [
    { id: "a", slug: "a", name: "A", published: true },
    { id: "b", slug: "b", name: "B", published: true },
    { id: "d", slug: "d", name: "D", published: true },
  ]);
  assert.deepEqual(summary.added, ["c"]);
  assert.deepEqual(summary.removed, ["d"]);
  assert.deepEqual(summary.changed.map((c) => c.id), ["b"]);
  assert.equal(summary.changed[0].fields[0].field, "name");
  assert.equal(summary.matched, 1);
  assert.equal(summary.sourceCount, 3);
  assert.equal(summary.targetCount, 3);
});

test("typed provider loads every published collection for a tenant", async () => {
  const db = makeDb();
  const api = d1(db);
  for (const collection of CONTENT_COLLECTIONS) {
    const records = await loadPublishedCollection(api, { tenantId: scope.tenantId }, collection);
    assert.ok(records.length > 0, `${collection} should have published rows`);
    assert.ok(records.every((r) => r.collection === collection && r.id && r.payload));
  }
  const rooms = await loadPublishedCollection(api, scope, "roomTypes");
  assert.equal(rooms.length, 1);
  assert.equal(rooms[0].payload.mewsRoomCategoryId, "mews-rt-1");
  assert.equal(toParityItems(rooms)[0].slug, "room-one");

  // Draft add-ons are excluded from published snapshots; implicit collections
  // (no status column) are published by presence, explicit ones are not.
  const addOns = await loadPublishedCollection(api, scope, "addOns");
  assert.deepEqual(addOns.map((r) => r.id), ["addon-1"]);
  const unknownPublication = toParityItems([{
    id: "x", collection: "events", payload: { name: "No status" },
  }]);
  assert.equal(unknownPublication[0].published, false);
  db.close();
});

test("tenant-wide snapshots use the empty-string location sentinel without an FK violation", async () => {
  const db = makeDb();
  const api = d1(db);
  const tenantWide = { tenantId: scope.tenantId };
  const built = await buildSnapshot("locations", [record("a", "A")]);
  await saveSnapshot(api, tenantWide, "locations", built);
  assert.equal((await getSnapshot(api, tenantWide, "locations"))?.version, built.version);
  assert.equal((await getSnapshotPointer(api, tenantWide, "locations"))?.currentVersion, built.version);
  assert.deepEqual(db.prepare("PRAGMA foreign_key_check").all(), []);
  db.close();
});

test("snapshot reads are admin-only outside d1 mode and carry pinned cache headers", async () => {
  const db = makeDb();
  const api = d1(db);
  const v1 = await buildSnapshot("locations", [record("a", "A")]);
  await saveSnapshot(api, scope, "locations", v1);
  const env: any = { DB: api, TENANT_ID: scope.tenantId, CONTENT_SOURCE: "webflow" };
  const ctx = { request: new Request("https://example.test/api/content/snapshots/locations?location=fixture-location"), env, waitUntil: () => {} };

  const denied = await snapshotGet(ctx, "locations");
  assert.equal(denied.status, 401);
  assert.match(denied.headers.get("cache-control") ?? "", /no-store/);

  env.CONTENT_SOURCE = "d1";
  const publicRead = await snapshotGet(ctx, "locations");
  assert.equal(publicRead.status, 200);
  assert.equal(publicRead.headers.get("etag"), `"${v1.version}"`);
  assert.match(publicRead.headers.get("cache-control") ?? "", /s-maxage/);
  assert.equal((await publicRead.json()).version, v1.version);

  const pinned = await snapshotGet({ ...ctx, request: new Request("https://example.test/api/content/snapshots/locations?version=" + v1.version + "&location=fixture-location") }, "locations");
  assert.equal(pinned.headers.get("x-snapshot-pinned"), "true");

  const missing = await snapshotGet({ ...ctx, request: new Request("https://example.test/api/content/snapshots/locations?version=nope&location=fixture-location") }, "locations");
  assert.equal(missing.status, 404);
  db.close();
});

test("a missing D1 snapshot falls back to Webflow instead of failing", async () => {
  const env: any = { DB: undefined, TENANT_ID: scope.tenantId, CONTENT_SOURCE: "d1" };
  const ctx = { request: new Request("https://example.test/api/content/snapshots/locations"), env, waitUntil: () => {} };
  const fallback = await snapshotGet(ctx, "locations", async () => [
    { id: "web-1", slug: "web-1", name: "Web", published: true },
  ]);
  assert.equal(fallback.status, 200);
  assert.equal(fallback.headers.get("x-content-fallback"), "webflow");
  assert.equal((await fallback.json()).itemCount, 1);

  const unavailable = await snapshotGet(ctx, "locations", async () => null);
  assert.equal(unavailable.status, 503);
  assert.match(unavailable.headers.get("cache-control") ?? "", /no-store/);
});

test("feature flag and cache policy default to the safe path", () => {
  assert.equal(contentSource({} as any), "webflow");
  assert.equal(contentSource({ CONTENT_SOURCE: "shadow" } as any), "shadow");
  assert.equal(contentSource({ CONTENT_SOURCE: "d1" } as any), "d1");
  assert.equal(contentSource({ CONTENT_SOURCE: "unexpected" } as any), "webflow");
  const headers = snapshotHeaders("v-1", "d1");
  assert.equal(headers.ETag, '"v-1"');
  assert.match(headers["Cache-Control"], /s-maxage/);
  assert.match(NO_STORE_HEADERS["Cache-Control"], /no-store/);
});

test("0004 rollback removes only its own objects", () => {
  const db = makeDb();
  const before = db.prepare("SELECT COUNT(*) AS n FROM content_items").get().n;
  db.exec(read("scripts/d1-rollback/0004_published_snapshots_down.sql"));
  for (const table of ["published_snapshots", "snapshot_pointers", "parity_reports"]) {
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table' AND name=?").get(table).n, 0);
  }
  for (const index of ["idx_add_ons_tenant_status_created", "idx_content_items_tenant_kind"]) {
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type='index' AND name=?").get(index).n, 1, `${index} survives`);
  }
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM content_items").get().n, before);
  db.exec(read("scripts/d1-rollback/0004_published_snapshots_down.sql")); // idempotent
  db.exec(read("migrations/0004_published_snapshots.sql")); // re-applies
  db.close();
});
