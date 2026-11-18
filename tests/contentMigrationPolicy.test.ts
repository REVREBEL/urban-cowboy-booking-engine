// COW-39 same-shaped D1 policy-language adapter, flags and safe fallback.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import { loadPolicyLanguageFromD1, policyLanguageParity, policyLanguageRead } from "../worker/content-adapters.ts";
import { routeContentSource } from "../worker/content-source.ts";
import type { Env } from "../worker/mews/_lib.ts";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");
const TENANT = "contracts-fixture";
const LOCATION = "fixture-location";
const ITEM_ID = "policy-language-item";
const WEBFLOW_ID = "webflow-policy-item";

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

const payload = {
  id: ITEM_ID,
  isDraft: "false",
  isArchived: "false",
  "refundable-language": "Free cancellation",
  "refundable-language-sub-title": "Full refund",
  "partially-refundable-language": "Deposit kept",
  "partially-refundable-language-sub-title": "Cancellation fee",
  "non-refundable-language": "Non refundable",
  "non-refundable-language-sub-title": "Stay locked",
  "at-time-of-booking": "Due today",
  "at-time-of-booking-sub-title": "Charged now",
  "next-due-date": "Final payment",
  "next-due-date-sub-title": "Balance due",
};

function seedPolicy(db: DatabaseSync, status: "published" | "draft", raw = JSON.stringify(payload)) {
  db.prepare(
    `INSERT INTO content_items (id, tenant_id, location_id, kind, slug, status, current_revision_id)
     VALUES (?1, ?2, ?3, 'policy', 'policy-language', ?4, ?5)`,
  ).run(ITEM_ID, TENANT, LOCATION, status, "policy-revision");
  db.prepare(
    `INSERT INTO content_revisions (id, content_item_id, revision, payload_json, created_by)
     VALUES ('policy-revision', ?1, 1, ?2, 'test')`,
  ).run(ITEM_ID, raw);
}

const scope = { tenantId: TENANT, locationId: LOCATION };
const originalFetch = globalThis.fetch;

function stubWebflow(fields: Record<string, unknown> = {}) {
  globalThis.fetch = (async (input: unknown) => {
    const url = String(input);
    if (!url.includes(`/items/${WEBFLOW_ID}/live`)) {
      return new Response("not found", { status: 404 });
    }
    return new Response(JSON.stringify({
      id: WEBFLOW_ID,
      isDraft: false,
      isArchived: false,
      fieldData: { "refundable-language": "Webflow refund", ...fields },
    }), { status: 200, headers: { "content-type": "application/json" } });
  }) as typeof fetch;
}

function envFor(source?: string, db?: D1Database): Env {
  return {
    DB: db,
    TENANT_ID: TENANT,
    ADMIN_TOKEN: "token",
    WEBFLOW_SITE_ID: "site",
    WEBFLOW_CMS_API_TOKEN: "cms-token",
    WEBFLOW_CONTENT_SETTINGS_COLLECTION_ID: "settings",
    WEBFLOW_POLICY_LANGUAGE_ITEM_ID: WEBFLOW_ID,
    CONTENT_SOURCE_POLICY_LANGUAGE: source,
  } as Env;
}

test.after(() => {
  globalThis.fetch = originalFetch;
});

test("published D1 policy rows normalize to the same PolicyLanguage shape", async () => {
  const db = makeDb();
  try {
    seedPolicy(db, "published");
    const result = await loadPolicyLanguageFromD1(d1(db) as D1Database, scope);
    assert.equal(result?.language.refundableLanguage, "Free cancellation");
    assert.equal(result?.language.refundableLanguageSubTitle, "Full refund");
    assert.equal(result?.language.nonRefundableLanguage, "Non refundable");
  } finally {
    db.close();
  }
});

test("draft, malformed, empty, partial and ambiguous rows fall back safely", async () => {
  const variants: Array<[string, "published" | "draft", string]> = [
    ["draft", "draft", JSON.stringify(payload)],
    ["malformed", "published", "{not json"],
    ["empty object", "published", "{}"],
    ["unrelated keys", "published", JSON.stringify({ unexpectedField: "x" })],
    ["partial copy", "published", JSON.stringify({ "refundable-language": "Only one" })],
  ];
  for (const [name, status, raw] of variants) {
    const db = makeDb();
    try {
      seedPolicy(db, status, raw);
      assert.equal(await loadPolicyLanguageFromD1(d1(db) as D1Database, scope), null, name);
    } finally {
      db.close();
    }
  }

  // Two published policies with no location query are ambiguous, so they must
  // not silently select one property's cancellation terms.
  const db = makeDb();
  try {
    for (const [id, location] of [
      ["policy-catskills", "fixture-location"],
      ["policy-denver", "second-location"],
    ] as const) {
      db.prepare(
        `INSERT INTO content_items (id, tenant_id, location_id, kind, slug, status, current_revision_id)
         VALUES (?1, ?2, ?3, 'policy', 'policy-language', 'published', ?4)`,
      ).run(id, TENANT, location, `${id}-r1`);
      db.prepare(
        `INSERT INTO content_revisions (id, content_item_id, revision, payload_json, created_by)
         VALUES (?1, ?2, 1, ?3, 'test')`,
      ).run(`${id}-r1`, id, JSON.stringify({ ...payload, "refundable-language": `Refund ${location}` }));
    }
    assert.equal(await loadPolicyLanguageFromD1(d1(db) as D1Database, { tenantId: TENANT }), null);
    const scoped = await loadPolicyLanguageFromD1(d1(db) as D1Database, {
      tenantId: TENANT,
      locationId: "second-location",
    });
    assert.equal(scoped?.language.refundableLanguage, "Refund second-location");
  } finally {
    db.close();
  }
});

test("per-route flags override the global source and fall back on invalid values", () => {
  assert.equal(routeContentSource(envFor("d1"), "policyLanguage"), "d1");
  assert.equal(routeContentSource(envFor("shadow"), "policyLanguage"), "shadow");
  assert.equal(routeContentSource(envFor("invalid"), "policyLanguage"), "webflow");
  assert.equal(routeContentSource({ CONTENT_SOURCE: "d1" } as Env, "policyLanguage"), "d1");
  assert.equal(
    routeContentSource({ CONTENT_SOURCE: "d1", CONTENT_SOURCE_POLICY_LANGUAGE: "invalid" } as Env, "policyLanguage"),
    "webflow",
  );
  assert.equal(routeContentSource({ CONTENT_SOURCE: "shadow" } as Env, "policyLanguage"), "shadow");
});

test("shadow parity reports per-field differences without changing values", () => {
  const summary = policyLanguageParity(
    { refundableLanguage: "Webflow", atTimeOfBooking: "Today" },
    { refundableLanguage: "D1", atTimeOfBooking: "Today" },
  );
  assert.equal(summary.collection, "policyLanguage");
  assert.equal(summary.matched, 9);
  assert.equal(summary.changed.length, 1);
  assert.equal(summary.changed[0].id, "refundableLanguage");
});

test("d1 mode serves published D1 data with an explicit source header", async () => {
  stubWebflow();
  const db = makeDb();
  try {
    seedPolicy(db, "published");
    const response = await policyLanguageRead({
      request: new Request(`https://example.com/api/content/policy-language?location=${LOCATION}`),
      env: envFor("d1", d1(db) as D1Database),
      waitUntil: () => undefined,
    });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("X-Content-Source"), "d1");
    const body = await response.json() as { language: Record<string, string> };
    assert.equal(body.language.refundableLanguage, "Free cancellation");
  } finally {
    db.close();
  }
});

test("webflow and shadow modes return Webflow content, with shadow flagged", async () => {
  stubWebflow();
  const db = makeDb();
  try {
    seedPolicy(db, "published");
    for (const source of ["webflow", "shadow"] as const) {
      const waits: Promise<unknown>[] = [];
      const response = await policyLanguageRead({
        request: new Request(`https://example.com/api/content/policy-language?location=${LOCATION}`),
        env: envFor(source, d1(db) as D1Database),
        waitUntil: (p) => { waits.push(p); },
      });
      const body = await response.json() as { language: Record<string, string> };
      assert.equal(body.language.refundableLanguage, "Webflow refund");
      if (source === "shadow") {
        assert.equal(response.headers.get("X-Content-Source"), "shadow-webflow");
        assert.equal(waits.length, 1);
        await waits[0];
        const report = db.prepare(
          "SELECT collection, summary_json FROM parity_reports WHERE collection = 'policyLanguage'",
        ).get() as { collection: string; summary_json: string } | undefined;
        assert.equal(report?.collection, "policyLanguage");
        assert.equal(JSON.parse(report?.summary_json ?? "{}").collection, "policyLanguage");
      }
    }
  } finally {
    db.close();
  }
});

test("d1 mode falls back to Webflow when no published D1 row exists", async () => {
  stubWebflow();
  const db = makeDb();
  try {
    const response = await policyLanguageRead({
      request: new Request(`https://example.com/api/content/policy-language?location=${LOCATION}`),
      env: envFor("d1", d1(db) as D1Database),
      waitUntil: () => undefined,
    });
    assert.equal(response.headers.get("X-Content-Source"), "webflow-fallback");
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    const body = await response.json() as { language: Record<string, string> };
    assert.equal(body.language.refundableLanguage, "Webflow refund");
  } finally {
    db.close();
  }
});
