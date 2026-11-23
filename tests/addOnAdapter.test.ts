// COW-104 same-shaped D1 add-ons adapter: full CMS fields, cutover marker, flags.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import { addOnsParity, addOnsRead, loadAddOnsFromD1 } from "../worker/add-on-adapter.ts";
import { routeContentSource } from "../worker/content-source.ts";
import type { Env } from "../worker/mews/_lib.ts";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");
const TENANT = "contracts-fixture";
const LOCATION = "fixture-location";
const SECOND_LOCATION = "second-location";
const COLLECTION_ID = "add-on-collection";
const WEBFLOW_ID = "webflow-add-on";

function makeDb() {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON");
  for (const file of [
    "migrations/0001_init.sql",
    "migrations/0002_module_list_indexes.sql",
    "migrations/0003_property_scoped_contracts.sql",
    "migrations/0004_published_snapshots.sql",
    "migrations/0005_media_registry.sql",
    "tests/fixtures/d1-contracts-fixture.sql",
  ]) db.exec(read(file));
  return db;
}

function d1(db: DatabaseSync): any {
  const statement = (sql: string, params: unknown[] = []): any => ({
    bind(...values: unknown[]) { return statement(sql, values); },
    async all() { return { results: db.prepare(sql).all(...params) }; },
    async first() { return db.prepare(sql).get(...params) ?? null; },
    async run() { return db.prepare(sql).run(...params); },
  });
  return { prepare: (sql: string) => statement(sql) };
}

interface Seed {
  id: string;
  kind: string;
  slug: string;
  payload: Record<string, unknown>;
  status?: "published" | "draft";
  location?: string | null;
  tenant?: string;
}

function seedContent(db: DatabaseSync, row: Seed) {
  const revision = `${row.id}-r1`;
  db.prepare(
    `INSERT INTO content_items (id, tenant_id, location_id, kind, slug, status, current_revision_id)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`,
  ).run(row.id, row.tenant ?? TENANT, row.location === undefined ? LOCATION : row.location,
    row.kind, row.slug, row.status ?? "published", revision);
  db.prepare(
    `INSERT INTO content_revisions (id, content_item_id, revision, payload_json, created_by)
     VALUES (?1, ?2, 1, ?3, 'test')`,
  ).run(revision, row.id, JSON.stringify(row.payload));
}

const addOnPayload = (overrides: Record<string, unknown> = {}) => ({
  id: "wf-extra",
  name: "Display name",
  itemName: "Distinct item name",
  shortDescription: "Short card copy",
  longDescription: "Longer description that differs from short copy",
  mewsProductId: "mews-product-1",
  imageUrl: "https://cdn.example.com/extra.png",
  ...overrides,
});

function seedMarker(db: DatabaseSync, expectedCount: number, overrides: Partial<Seed> = {}) {
  seedContent(db, {
    id: "add-on-sync", kind: "add_on_sync", slug: "complete",
    payload: { expectedCount }, ...overrides,
  });
}

const scope = { tenantId: TENANT, locationId: LOCATION };
const originalFetch = globalThis.fetch;
let fetchCalls = 0;

function stubWebflow(items: Array<Record<string, unknown>> = []) {
  fetchCalls = 0;
  globalThis.fetch = (async (input: unknown) => {
    fetchCalls += 1;
    const url = String(input);
    if (!url.includes(`/collections/${COLLECTION_ID}/items/live`)) {
      return new Response("not found", { status: 404 });
    }
    return new Response(JSON.stringify({ items }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;
}

const webflowItem = {
  id: WEBFLOW_ID,
  fieldData: {
    name: "Webflow extra",
    "item-name": "WF extra",
    "short-description": "short",
    "long-description": "long",
    "mews-product-id": "mews-wf",
    image: { url: "https://example.com/add-on.png" },
  },
};

function envFor(source?: string, db?: D1Database): Env {
  return {
    DB: db,
    TENANT_ID: TENANT,
    WEBFLOW_CMS_API_TOKEN: "cms-token",
    WEBFLOW_ADD_ON_COLLECTION_ID: COLLECTION_ID,
    CONTENT_SOURCE_ADD_ONS: source,
  } as Env;
}

test.after(() => {
  globalThis.fetch = originalFetch;
});

test("a complete published CMS collection preserves every distinct display field", async () => {
  const db = makeDb();
  try {
    seedMarker(db, 1);
    seedContent(db, { id: "add-on-1", kind: "add_on", slug: "wf-extra", payload: addOnPayload() });
    const result = await loadAddOnsFromD1(d1(db) as D1Database, scope);
    assert.deepEqual(result, [{
      id: "wf-extra",
      name: "Display name",
      itemName: "Distinct item name",
      shortDescription: "Short card copy",
      longDescription: "Longer description that differs from short copy",
      mewsProductId: "mews-product-1",
      imageUrl: "https://cdn.example.com/extra.png",
    }]);
  } finally {
    db.close();
  }
});

test("a partial collection falls back even when published rows exist", async () => {
  const db = makeDb();
  try {
    seedMarker(db, 2);
    seedContent(db, { id: "add-on-1", kind: "add_on", slug: "wf-extra", payload: addOnPayload() });
    assert.equal(await loadAddOnsFromD1(d1(db) as D1Database, scope), null);
  } finally {
    db.close();
  }
});

test("a missing, draft or malformed cutover marker keeps Webflow authoritative", async () => {
  const cases: Array<[string, (db: DatabaseSync) => void]> = [
    ["no marker", () => undefined],
    ["draft marker", (db) => seedMarker(db, 1, { status: "draft" })],
    ["malformed marker", (db) => seedContent(db, {
      id: "add-on-sync", kind: "add_on_sync", slug: "complete", payload: { expectedCount: "1" },
    })],
    ["zero count", (db) => seedMarker(db, 0)],
  ];
  for (const [name, setup] of cases) {
    const db = makeDb();
    try {
      setup(db);
      seedContent(db, { id: "add-on-1", kind: "add_on", slug: "wf-extra", payload: addOnPayload() });
      assert.equal(await loadAddOnsFromD1(d1(db) as D1Database, scope), null, name);
    } finally {
      db.close();
    }
  }
});

test("an incomplete CMS payload falls back rather than filling fields with null", async () => {
  const variants: Array<[string, Record<string, unknown>]> = [
    ["missing imageUrl", { imageUrl: undefined }],
    ["missing itemName", { itemName: undefined }],
    ["missing longDescription", { longDescription: undefined }],
    ["wrong image type", { imageUrl: 42 }],
    ["empty name", { name: "   " }],
  ];
  for (const [name, overrides] of variants) {
    const db = makeDb();
    try {
      seedMarker(db, 1);
      seedContent(db, { id: "add-on-1", kind: "add_on", slug: "wf-extra", payload: addOnPayload(overrides) });
      assert.equal(await loadAddOnsFromD1(d1(db) as D1Database, scope), null, name);
    } finally {
      db.close();
    }
  }
});

test("tenant and location scoping are enforced for the marker and the collection", async () => {
  const db = makeDb();
  try {
    seedMarker(db, 1);
    seedContent(db, { id: "add-on-1", kind: "add_on", slug: "wf-extra", payload: addOnPayload() });
    seedMarker(db, 1, { id: "other-sync", location: SECOND_LOCATION });
    assert.equal(await loadAddOnsFromD1(d1(db) as D1Database, { tenantId: TENANT, locationId: SECOND_LOCATION }), null);
    assert.equal(await loadAddOnsFromD1(d1(db) as D1Database, { tenantId: "other-tenant" }), null);
  } finally {
    db.close();
  }
});

test("per-route flag overrides the global source and fails safe on invalid values", () => {
  assert.equal(routeContentSource(envFor("d1"), "addOns"), "d1");
  assert.equal(routeContentSource(envFor("shadow"), "addOns"), "shadow");
  assert.equal(routeContentSource(envFor("invalid"), "addOns"), "webflow");
  assert.equal(routeContentSource({ CONTENT_SOURCE: "d1" } as Env, "addOns"), "d1");
  assert.equal(
    routeContentSource({ CONTENT_SOURCE: "d1", CONTENT_SOURCE_ADD_ONS: "invalid" } as Env, "addOns"),
    "webflow",
  );
  assert.equal(
    routeContentSource({ CONTENT_SOURCE: "d1", CONTENT_SOURCE_ADD_ONS: "webflow" } as Env, "addOns"),
    "webflow",
  );
});

test("parity detects unequal descriptions and images, not just ids", () => {
  const base = addOnPayload();
  const summary = addOnsParity(
    [{ ...base, id: "a", itemName: "A title", shortDescription: "A short", longDescription: "A long", imageUrl: "https://cdn/a.png" }],
    [{ ...base, id: "a", itemName: "B title", shortDescription: "B short", longDescription: "B long", imageUrl: "https://cdn/b.png" }],
  );
  const changed = summary.changed.map((entry: { id: string }) => entry.id).sort();
  assert.deepEqual(changed, [
    "a:imageUrl", "a:itemName", "a:longDescription", "a:shortDescription",
  ]);
});

test("d1 mode serves complete D1 data with a source header and no Webflow call", async () => {
  stubWebflow([webflowItem]);
  const db = makeDb();
  try {
    seedMarker(db, 1);
    seedContent(db, { id: "add-on-1", kind: "add_on", slug: "wf-extra", payload: addOnPayload() });
    const response = await addOnsRead({
      request: new Request(`https://example.com/api/content/add-ons?location=${LOCATION}`),
      env: envFor("d1", d1(db) as D1Database),
      waitUntil: () => undefined,
    });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("X-Content-Source"), "d1");
    assert.equal(fetchCalls, 0);
    const body = await response.json() as { addOns: Array<Record<string, unknown>> };
    assert.equal(body.addOns[0].itemName, "Distinct item name");
    assert.equal(body.addOns[0].imageUrl, "https://cdn.example.com/extra.png");
  } finally {
    db.close();
  }
});

test("d1 mode falls back to Webflow for a partial collection", async () => {
  stubWebflow([webflowItem]);
  const db = makeDb();
  try {
    seedMarker(db, 2);
    seedContent(db, { id: "add-on-1", kind: "add_on", slug: "wf-extra", payload: addOnPayload() });
    const response = await addOnsRead({
      request: new Request(`https://example.com/api/content/add-ons?location=${LOCATION}`),
      env: envFor("d1", d1(db) as D1Database),
      waitUntil: () => undefined,
    });
    assert.equal(response.headers.get("X-Content-Source"), "webflow-fallback");
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    const body = await response.json() as { addOns: Array<{ id: string; name: string }> };
    assert.equal(body.addOns[0].id, WEBFLOW_ID);
    assert.equal(body.addOns[0].name, "Webflow extra");
  } finally {
    db.close();
  }
});

test("webflow and shadow modes return Webflow content; shadow persists parity only on change", async () => {
  stubWebflow([webflowItem]);
  const db = makeDb();
  try {
    seedMarker(db, 1);
    seedContent(db, { id: "add-on-1", kind: "add_on", slug: "wf-extra", payload: addOnPayload() });
    const waits: Promise<unknown>[] = [];
    const webflow = await addOnsRead({
      request: new Request(`https://example.com/api/content/add-ons?location=${LOCATION}`),
      env: envFor("webflow", d1(db) as D1Database),
      waitUntil: (p) => { waits.push(p); },
    });
    assert.equal(webflow.headers.get("X-Content-Source"), null);

    const shadow = await addOnsRead({
      request: new Request(`https://example.com/api/content/add-ons?location=${LOCATION}`),
      env: envFor("shadow", d1(db) as D1Database),
      waitUntil: (p) => { waits.push(p); },
    });
    assert.equal(shadow.headers.get("X-Content-Source"), "shadow-webflow");
    const body = await shadow.json() as { addOns: Array<{ name: string }> };
    assert.equal(body.addOns[0].name, "Webflow extra");
    assert.equal(waits.length, 1);
    await waits[0];

    const count = () => (db.prepare("SELECT COUNT(*) AS n FROM parity_reports WHERE collection = 'addOns'").get() as { n: number }).n;
    assert.equal(count(), 1);

    const secondWaits: Promise<unknown>[] = [];
    await addOnsRead({
      request: new Request(`https://example.com/api/content/add-ons?location=${LOCATION}`),
      env: envFor("shadow", d1(db) as D1Database),
      waitUntil: (p) => { secondWaits.push(p); },
    });
    await Promise.all(secondWaits);
    assert.equal(count(), 1);
  } finally {
    db.close();
  }
});
