// COW-104 same-shaped D1 add-ons adapter, flags, scoping and safe fallback.
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
  name?: string;
  description?: string | null;
  mewsProductId?: string | null;
  tenant?: string;
  location?: string | null;
  status?: "published" | "draft";
}

function seedAddOn(db: DatabaseSync, row: Seed) {
  db.prepare(
    `INSERT INTO add_ons (id, tenant_id, location_id, name, description, mews_product_id, sort_order, status)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, 0, ?7)`,
  ).run(
    row.id,
    row.tenant ?? TENANT,
    row.location === undefined ? LOCATION : row.location,
    row.name ?? `Name ${row.id}`,
    row.description === undefined ? `Description ${row.id}` : row.description,
    row.mewsProductId === undefined ? `mews-${row.id}` : row.mewsProductId,
    row.status ?? "published",
  );
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

test("published D1 add-ons normalize to the AddOnCmsItem contract; drafts are excluded", async () => {
  const db = makeDb();
  try {
    seedAddOn(db, { id: "add-on-1", name: "Late checkout", description: "Stay longer", mewsProductId: "mews-1" });
    seedAddOn(db, { id: "add-on-draft", status: "draft" });
    const result = await loadAddOnsFromD1(d1(db) as D1Database, scope);
    assert.ok(result);
    assert.equal(result.length, 1);
    assert.deepEqual(result[0], {
      id: "add-on-1",
      name: "Late checkout",
      itemName: "Late checkout",
      shortDescription: "Stay longer",
      longDescription: "Stay longer",
      mewsProductId: "mews-1",
      imageUrl: null,
    });
  } finally {
    db.close();
  }
});

test("tenant and location scoping are enforced for published rows", async () => {
  const db = makeDb();
  try {
    seedAddOn(db, { id: "local" });
    seedAddOn(db, { id: "other-location-row", location: SECOND_LOCATION });
    seedAddOn(db, { id: "other-tenant-row", tenant: "other-tenant", location: "other-location" });

    const local = await loadAddOnsFromD1(d1(db) as D1Database, scope);
    assert.deepEqual(local?.map((item) => item.id), ["local"]);

    const tenantWide = await loadAddOnsFromD1(d1(db) as D1Database, { tenantId: TENANT });
    assert.deepEqual(tenantWide?.map((item) => item.id), ["local", "other-location-row"]);
  } finally {
    db.close();
  }
});

test("missing or unnameable published rows fall back safely", async () => {
  const empty = makeDb();
  try {
    assert.equal(await loadAddOnsFromD1(d1(empty) as D1Database, scope), null);
  } finally {
    empty.close();
  }

  const blank = makeDb();
  try {
    seedAddOn(blank, { id: "blank-name", name: "   " });
    assert.equal(await loadAddOnsFromD1(d1(blank) as D1Database, scope), null);
  } finally {
    blank.close();
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

test("parity reports changed fields without changing values", () => {
  const base = {
    id: WEBFLOW_ID,
    itemName: null,
    shortDescription: null,
    longDescription: null,
    mewsProductId: "mews-wf",
    imageUrl: null,
  };
  const summary = addOnsParity(
    [{ ...base, name: "Webflow extra" }],
    [{ ...base, name: "D1 extra" }],
  );
  assert.equal(summary.collection, "addOns");
  assert.equal(summary.changed.length, 1);
  assert.equal(summary.changed[0].id, WEBFLOW_ID);
});

test("d1 mode serves published D1 data with an explicit source header and no Webflow call", async () => {
  stubWebflow([webflowItem]);
  const db = makeDb();
  try {
    seedAddOn(db, { id: "d1-add-on", name: "D1 extra" });
    const response = await addOnsRead({
      request: new Request(`https://example.com/api/content/add-ons?location=${LOCATION}`),
      env: envFor("d1", d1(db) as D1Database),
      waitUntil: () => undefined,
    });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("X-Content-Source"), "d1");
    assert.equal(fetchCalls, 0);
    const body = await response.json() as { addOns: Array<Record<string, unknown>> };
    assert.deepEqual(body.addOns.map((item) => item.id), ["d1-add-on"]);
    assert.equal(body.addOns[0].name, "D1 extra");
  } finally {
    db.close();
  }
});

test("d1 mode falls back to Webflow when no published D1 rows exist", async () => {
  stubWebflow([webflowItem]);
  const db = makeDb();
  try {
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
    seedAddOn(db, { id: "d1-add-on", name: "D1 extra" });
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
