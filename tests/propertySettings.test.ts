// COW-68: property settings contracts, flagged reads, admin API and routes.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import {
  DEFAULT_SITE_SETTINGS,
  PRODUCTION_PHOTO_LAYOUT_OPTION,
  DEMO_PHOTO_LAYOUT_OPTION,
  parseSiteSettings,
  siteSettingsFromWebflow,
} from "../src/types/site-settings.ts";
import {
  adminSiteSettingsRead,
  loadSiteSettingsFromD1,
  siteSettingsParity,
  siteSettingsRead,
} from "../worker/property-settings.ts";
import { publishEditorItem, saveEditorDraft } from "../worker/content-editor.ts";
import { onRequestStudioConfig } from "../worker/webflow/locations.ts";
import { dashboardPageRequest, isAdminPageRoute } from "../worker/admin-pages.ts";
import { fetchPublishedSiteSettings } from "../src/lib/siteSettingsClient.ts";
import { hasUnsavedChanges } from "../src/dashboard/siteSettingsForm.ts";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");
const TENANT = "urban-cowboy";

function makeDb() {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON");
  for (const file of [
    "migrations/0001_init.sql", "migrations/0002_module_list_indexes.sql",
    "migrations/0003_property_scoped_contracts.sql", "migrations/0004_published_snapshots.sql",
    "migrations/0005_media_registry.sql", "migrations/0006_working_revision_pointer.sql",
    "migrations/0007_amenity_editorial.sql",
  ]) db.exec(read(file));
  db.exec(read("seed.sql"));
  return db;
}

function d1(db: DatabaseSync): any {
  return {
    prepare(sql: string) {
      let params: unknown[] = [];
      return {
        get sql() { return sql; },
        get params() { return params; },
        bind(...v: unknown[]) { params = v; return this; },
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
      } catch (error) { db.exec("ROLLBACK"); throw error; }
    },
  };
}

const admin = { sub: "s", email: "admin@example.test", groups: [], roles: ["admin"], tenantId: TENANT };
const allowAdmin = async () => admin as any;
const deny = async () => new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });

test("site settings preserve Webflow semantics and reject incomplete payloads", () => {
  const full = {
    "production-layout": PRODUCTION_PHOTO_LAYOUT_OPTION,
    "demo-layout": DEMO_PHOTO_LAYOUT_OPTION,
    "enable-demo-engine": true,
    "enable-event-dates-quick-selection": true,
    "enable-feature-section": false,
  };
  assert.deepEqual(siteSettingsFromWebflow(full), {
    productionLayout: "photo", demoLayout: "photo",
    enableDemoEngine: true, enableEventDatesQuickSelection: true, enableFeatureSection: false,
  });
  const incomplete = { ...full } as Record<string, unknown>;
  delete incomplete["enable-demo-engine"];
  assert.equal(siteSettingsFromWebflow(incomplete), null);
  assert.equal(parseSiteSettings({ productionLayout: "card" }), null);
  assert.deepEqual(DEFAULT_SITE_SETTINGS.productionLayout, "card");
});

test("published settings load from the seed and parity reports value changes", async () => {
  const db = makeDb();
  const loaded = await loadSiteSettingsFromD1(d1(db), { tenantId: TENANT });
  assert.ok(loaded);
  assert.equal(loaded.settings.productionLayout, "photo");
  assert.equal(loaded.settings.demoLayout, "photo");
  assert.equal(loaded.settings.enableDemoEngine, false);
  const summary = siteSettingsParity(loaded.settings, DEFAULT_SITE_SETTINGS);
  assert.deepEqual(summary.changed.map((c) => c.id).sort(), ["demoLayout", "productionLayout"]);
  db.close();
});

test("flagged reads default to Webflow and fall back safely in d1 mode", async () => {
  const db = makeDb();
  const webflowSettings = { ...DEFAULT_SITE_SETTINGS, productionLayout: "photo" as const };
  const ctx = {
    request: new Request("https://example.test/api/content/site-settings"),
    env: { DB: d1(db), TENANT_ID: TENANT, CONTENT_SOURCE: "d1" } as any,
    waitUntil: () => {},
  };
  const webflowMode = await siteSettingsRead({ ...ctx, env: { ...ctx.env, CONTENT_SOURCE: "webflow" } });
  assert.equal((await webflowMode.json() as any).source, "webflow");

  const d1Mode = await siteSettingsRead(ctx);
  assert.equal((await d1Mode.json() as any).source, "d1");
  // No shared cache until publish/rollback can purge or the key is versioned.
  assert.match(d1Mode.headers.get("cache-control") ?? "", /no-store/);

  const noDb = await siteSettingsRead({ ...ctx, env: { ...ctx.env, DB: undefined } });
  assert.equal((await noDb.json() as any).source, "webflow-fallback");
  assert.match(noDb.headers.get("cache-control") ?? "", /no-store/);
  assert.equal(webflowSettings.productionLayout, "photo");
  db.close();
});

test("admin settings view is role-gated and exposes published and working values", async () => {
  const db = makeDb();
  const ctx = {
    request: new Request("https://example.test/api/admin/site-settings"),
    env: { DB: d1(db), TENANT_ID: TENANT } as any,
    waitUntil: () => {},
  };
  assert.equal((await adminSiteSettingsRead(ctx, deny)).status, 401);
  const res = await adminSiteSettingsRead(ctx, allowAdmin);
  assert.equal(res.status, 200);
  const body = await res.json() as any;
  assert.equal(body.published.productionLayout, "photo");
  assert.equal(body.working.productionLayout, "photo");
  assert.ok(body.itemId.includes("site-settings-"));
  assert.equal(body.revisions.length, 1);
  assert.match(res.headers.get("cache-control") ?? "", /no-store/);
  db.close();
});

test("draft validation blocks invalid settings on save and publish", async () => {
  const db = makeDb();
  const api = d1(db);
  const item = db.prepare("SELECT id, current_revision_id FROM content_items WHERE kind='site_settings'").get() as any;
  const invalid = { productionLayout: "card" };
  const badSave = await saveEditorDraft({
    request: new Request("https://example.test/api/content/editor/items/x", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: invalid, expectedRevisionId: item.current_revision_id }),
    }),
    env: { DB: api } as any, waitUntil: () => {},
  }, item.id, allowAdmin);
  assert.equal(badSave.status, 400);
  assert.equal((await badSave.json() as any).error, "invalid_site_settings");

  const goodSave = await saveEditorDraft({
    request: new Request("https://example.test/api/content/editor/items/x", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payload: { ...DEFAULT_SITE_SETTINGS, productionLayout: "card" },
        expectedRevisionId: item.current_revision_id,
      }),
    }),
    env: { DB: api } as any, waitUntil: () => {},
  }, item.id, allowAdmin);
  assert.equal(goodSave.status, 200);
  const revisionId = (await goodSave.json() as any).revisionId;
  // Public value is still the published photo layout.
  assert.equal((await loadSiteSettingsFromD1(api, { tenantId: TENANT }))?.settings.productionLayout, "photo");

  const published = await publishEditorItem({
    request: new Request("https://example.test/api/content/editor/items/x/publish", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ revisionId }),
    }),
    env: { DB: api, TENANT_ID: TENANT } as any, waitUntil: () => {},
  }, item.id, allowAdmin);
  assert.equal(published.status, 200);
  assert.equal((await loadSiteSettingsFromD1(api, { tenantId: TENANT }))?.settings.productionLayout, "card");

  const guestRead = await siteSettingsRead({
    request: new Request("https://example.test/api/content/site-settings"),
    env: { DB: api, TENANT_ID: TENANT, CONTENT_SOURCE: "d1" } as any,
    waitUntil: () => {},
  });
  assert.equal((await guestRead.json() as any).settings.productionLayout, "card");
  assert.match(guestRead.headers.get("cache-control") ?? "", /no-store/);
  db.close();
});

test("Studio config uses published D1 enablement in d1 mode", async () => {
  const db = makeDb();
  const env = { DB: d1(db), TENANT_ID: TENANT, CONTENT_SOURCE_SITE_SETTINGS: "d1" } as any;
  const off = await onRequestStudioConfig({
    env, request: new Request("https://example.test/api/studio/config?property=hotel"),
  });
  assert.equal(off.status, 200);
  assert.equal((await off.json() as any).enabled, false); // imported setting is false

  db.exec("UPDATE content_revisions SET payload_json = json_set(payload_json, '$.enableDemoEngine', json('true')) WHERE payload_json LIKE '%productionLayout%'");
  const on = await onRequestStudioConfig({
    env, request: new Request("https://example.test/api/studio/config?property=hotel"),
  });
  assert.equal((await on.json() as any).enabled, true);
  db.close();
});

test("admin routes serve the React dashboard entry, guest routes keep SPA fallback", async () => {
  const requested: string[] = [];
  const assets = {
    async fetch(request: Request) {
      requested.push(new URL(request.url).pathname);
      return new Response("<html>dashboard</html>", { status: 200, headers: { "content-type": "text/html" } });
    },
  };
  for (const path of ["/admin", "/dashboard"]) {
    assert.equal(isAdminPageRoute(path), true);
    const response = await assets.fetch(dashboardPageRequest(new Request(`https://example.test${path}`)));
    assert.equal(response.status, 200);
    assert.match(await response.text(), /dashboard/);
  }
  assert.equal(isAdminPageRoute("/confirmation"), false);
  assert.deepEqual(requested, ["/dashboard.html", "/dashboard.html"]);
});

test("publish cannot release unsaved form edits", () => {
  const working = { ...DEFAULT_SITE_SETTINGS, productionLayout: "photo" as const };
  assert.equal(hasUnsavedChanges(working, working), false);
  assert.equal(hasUnsavedChanges({ ...working, productionLayout: "card" }, working), true);
  assert.equal(hasUnsavedChanges({ ...working, enableFeatureSection: true }, working), true);
  assert.equal(hasUnsavedChanges(working, null), false);
});

test("guest client ignores non-D1 settings responses", async () => {
  const originalFetch = globalThis.fetch;
  const calls: string[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    calls.push(String(input));
    return new Response(JSON.stringify({
      source: "webflow", settings: { ...DEFAULT_SITE_SETTINGS, productionLayout: "photo" },
    }), { status: 200, headers: { "content-type": "application/json" } });
  }) as typeof fetch;
  try {
    assert.equal(await fetchPublishedSiteSettings(), null);
    assert.deepEqual(calls, ["/api/content/site-settings"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
