// COW-99: provider-neutral Webflow photo import and master media identity.
// Run with: node --test tests/webflowPhotoImport.test.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import {
  fetchWebflowRoomTypeItems,
  webflowPhotoSourceAdapter,
} from "../worker/photo-source-webflow.ts";
import {
  applyPhotoImport,
  planPhotoImport,
  renderPhotoImportSql,
  type D1Like,
  type PhotoImportInput,
} from "../worker/photo-source-import.ts";
import type { CanonicalRoomType, PhotoSourceSnapshot } from "../worker/photo-source-adapter.ts";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");
const payload = JSON.parse(read("tests/fixtures/webflow-room-types-photos.json"));
const roomTypes = JSON.parse(read("tests/fixtures/webflow-photo-room-types.json")) as CanonicalRoomType[];
const TENANT = "wf-tenant";
const LOCATION = "wf-location";
const NOW = "2026-11-23T00:00:00Z";
const MIGRATIONS = [
  "migrations/0001_init.sql",
  "migrations/0003_property_scoped_contracts.sql",
  "migrations/0005_media_registry.sql",
  "migrations/0009_media_placement_flags.sql",
];

function makeDb(): DatabaseSync {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON");
  for (const file of MIGRATIONS) db.exec(read(file));
  db.exec(`
    INSERT INTO tenants (id, slug, name) VALUES ('${TENANT}','${TENANT}','Wf Tenant');
    INSERT INTO locations (id, tenant_id, slug, name, time_zone) VALUES
      ('${LOCATION}','${TENANT}','catskills','Catskills','America/New_York');
    INSERT INTO room_types (id, tenant_id, location_id, mews_room_category_id, name, slug, sort_order) VALUES
      ('rt-alpine','${TENANT}','${LOCATION}','mews-alpine','Alpine','alpine',1),
      ('rt-walden','${TENANT}','${LOCATION}','mews-walden','Walden','walden',2);
  `);
  return db;
}

function d1(db: DatabaseSync): D1Like {
  return {
    prepare(sql: string) {
      let params: unknown[] = [];
      return {
        bind(...values: unknown[]) { params = values; return this; },
        async all<T>() { return { results: db.prepare(sql).all(...params) as T[] }; },
      };
    },
  };
}

function executor(db: DatabaseSync) {
  return {
    async exec(statements: readonly { sql: string; params: unknown[] }[]) {
      db.exec("BEGIN");
      try {
        for (const statement of statements) db.prepare(statement.sql).run(...statement.params);
        db.exec("COMMIT");
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    },
  };
}

function snapshot(overrides: Partial<PhotoSourceSnapshot> = {}): PhotoSourceSnapshot {
  return {
    ...webflowPhotoSourceAdapter.parse({
      payload, roomTypes, sourceUrl: "fixture", fetchedAt: NOW, digest: "abc",
    }),
    ...overrides,
  };
}

const input = (snap: PhotoSourceSnapshot): PhotoImportInput => ({
  tenantId: TENANT, locationId: LOCATION, snapshot: snap, now: NOW,
});

test("Webflow adapter resolves rooms from explicit refs and reports bad input", () => {
  const snap = snapshot();
  assert.equal(snap.provider, "webflow");
  assert.equal(snap.photos.length, 3);
  assert.deepEqual(snap.photos.map((p) => p.roomTypeRef), ["rt-alpine", "rt-alpine", "rt-walden"]);
  assert.deepEqual(snap.roomTypeRefs, ["rt-alpine", "rt-walden"]);
  assert.equal(snap.photos[0].sourceAssetId, "webflow_file_id:aaaaaaaaaaaaaaaaaaaaaaaa");
  assert.equal(snap.photos[0].aliases[0].aliasType, "webflow_file_id");
  assert.deepEqual(snap.issues.map((i) => i.kind), ["unmatched-room", "invalid-url"]);
});

test("first import creates permanent master IDs, aliases and ordered placements", async () => {
  const db = makeDb();
  const plan = await planPhotoImport(d1(db), input(snapshot()));
  assert.equal(plan.summary.create, 3);
  await applyPhotoImport(executor(db), plan);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM media_assets").get().n, 3);
  assert.ok(db.prepare("PRAGMA foreign_key_check").all().length === 0);
  const placements = db.prepare(
    "SELECT target_id, display_order FROM media_placements ORDER BY target_id, display_order",
  ).all() as Array<{ target_id: string; display_order: number }>;
  assert.deepEqual(placements.map((p) => [p.target_id, p.display_order]), [
    ["rt-alpine", 1], ["rt-alpine", 2], ["rt-walden", 1],
  ]);
  const sql = renderPhotoImportSql(plan, "webflow");
  assert.match(sql, /BEGIN;/);
  assert.doesNotMatch(sql, /DELETE/i);
  db.close();
});

test("a URL change updates the same master ID and placement", async () => {
  const db = makeDb();
  const original = snapshot();
  await applyPhotoImport(executor(db), await planPhotoImport(d1(db), input(original)));
  const before = db.prepare(
    "SELECT id, squarespace_url FROM media_assets WHERE id IN (SELECT media_asset_id FROM media_aliases WHERE alias_value='aaaaaaaaaaaaaaaaaaaaaaaa')",
  ).get() as { id: string; squarespace_url: string };

  const changedUrl = "https://cdn.prod.website-files.com/site/aaaaaaaaaaaaaaaaaaaaaaaa_v2.jpg";
  const changed = snapshot({
    photos: original.photos.map((photo) =>
      photo.sourceAssetId === "webflow_file_id:aaaaaaaaaaaaaaaaaaaaaaaa"
        ? { ...photo, url: changedUrl }
        : photo),
  });
  const plan = await planPhotoImport(d1(db), input(changed));
  const decision = plan.decisions.find((d) => d.photo.sourceAssetId === "webflow_file_id:aaaaaaaaaaaaaaaaaaaaaaaa");
  assert.equal(decision?.kind, "update");
  assert.equal(decision?.kind === "update" && decision.urlChanged, true);
  assert.equal(plan.summary.create, 0);
  await applyPhotoImport(executor(db), plan);

  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM media_assets").get().n, 3);
  const after = db.prepare("SELECT squarespace_url FROM media_assets WHERE id=?").get(before.id) as { squarespace_url: string };
  assert.equal(after.squarespace_url, changedUrl);
  const placement = db.prepare(
    "SELECT id FROM media_placements WHERE media_asset_id=? AND target_id='rt-alpine'",
  ).get(before.id) as { id: string };
  assert.equal(placement.id, `pl-rt-alpine-${before.id}`);
  db.close();
});

test("a provider switch reuses the master ID through an explicit alias link", async () => {
  const db = makeDb();
  const original = snapshot();
  await applyPhotoImport(executor(db), await planPhotoImport(d1(db), input(original)));
  const existing = db.prepare(
    "SELECT media_asset_id FROM media_aliases WHERE alias_value='aaaaaaaaaaaaaaaaaaaaaaaa'",
  ).get() as { media_asset_id: string };

  const switched = snapshot({
    photos: [{
      ...original.photos[0],
      url: "https://images.example.com/alpine-new.png",
      aliases: [{ aliasType: "squarespace_asset_id", aliasValue: "sqsp-abc" }],
      sameAs: { aliasType: "webflow_file_id", aliasValue: "aaaaaaaaaaaaaaaaaaaaaaaa" },
    }],
  });
  const plan = await planPhotoImport(d1(db), input(switched));
  assert.equal(plan.decisions[0].kind, "update");
  assert.equal(plan.decisions[0].kind === "update" && plan.decisions[0].mediaId, existing.media_asset_id);
  await applyPhotoImport(executor(db), plan);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM media_assets").get().n, 3);
  assert.equal(db.prepare(
    "SELECT media_asset_id FROM media_aliases WHERE alias_value='sqsp-abc'",
  ).get()?.media_asset_id, existing.media_asset_id);
  db.close();
});

test("duplicate source aliases are reported and skipped", async () => {
  const db = makeDb();
  const base = snapshot();
  const duplicated = snapshot({
    photos: [base.photos[0], { ...base.photos[0], position: 2 }],
  });
  const plan = await planPhotoImport(d1(db), input(duplicated));
  assert.equal(plan.summary.duplicate, 1);
  assert.equal(plan.summary.create, 1);
  await applyPhotoImport(executor(db), plan);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM media_assets").get().n, 1);
  db.close();
});

test("room remapping keeps the master ID and never deletes the old placement", async () => {
  const db = makeDb();
  const original = snapshot();
  await applyPhotoImport(executor(db), await planPhotoImport(d1(db), input(original)));
  const mediaId = (db.prepare(
    "SELECT media_asset_id FROM media_aliases WHERE alias_value='aaaaaaaaaaaaaaaaaaaaaaaa'",
  ).get() as { media_asset_id: string }).media_asset_id;

  const remapped = snapshot({
    photos: [{ ...original.photos[0], roomTypeRef: "rt-walden", position: 3 }],
    roomTypeRefs: ["rt-walden"],
  });
  const plan = await planPhotoImport(d1(db), input(remapped));
  assert.equal(plan.decisions[0].kind, "update");
  assert.equal(plan.decisions[0].kind === "update" && plan.decisions[0].mediaId, mediaId);
  await applyPhotoImport(executor(db), plan);
  const placements = db.prepare(
    "SELECT target_id FROM media_placements WHERE media_asset_id=?",
  ).all(mediaId) as Array<{ target_id: string }>;
  assert.deepEqual(placements.map((p) => p.target_id).sort(), ["rt-alpine", "rt-walden"]);
  db.close();
});

test("an empty source reports removals without deleting anything", async () => {
  const db = makeDb();
  const original = snapshot();
  await applyPhotoImport(executor(db), await planPhotoImport(d1(db), input(original)));
  const empty = snapshot({ photos: [] });
  const plan = await planPhotoImport(d1(db), input(empty));
  assert.equal(plan.statements.length, 0);
  assert.equal(plan.summary.removed, 3);
  await applyPhotoImport(executor(db), plan);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM media_assets").get().n, 3);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM media_placements").get().n, 3);
  db.close();
});

test("an alias owned by another tenant is never reused", async () => {
  const db = makeDb();
  db.exec(`
    INSERT INTO tenants (id, slug, name) VALUES ('other','other','Other');
    INSERT INTO media_assets (id, tenant_id, kind, squarespace_asset_id, squarespace_url)
      VALUES ('foreign-asset','other','image','foreign','https://example.com/foreign.jpg');
    INSERT INTO media_aliases (id, tenant_id, media_asset_id, alias_type, alias_value)
      VALUES ('foreign-alias','other','foreign-asset','webflow_file_id','aaaaaaaaaaaaaaaaaaaaaaaa');
  `);
  const plan = await planPhotoImport(d1(db), input(snapshot()));
  assert.ok(plan.decisions.every((d) => d.kind === "create"));
  assert.ok(db.prepare("SELECT tenant_id FROM media_aliases WHERE alias_value='aaaaaaaaaaaaaaaaaaaaaaaa'").get()?.tenant_id === "other");
  db.close();
});

test("live Webflow fetch is paginated and uses the injected fetch function", async () => {
  const pages = [
    { items: [{ id: "a" }] },
    { items: [{ id: "b" }] },
    { items: [] },
  ];
  let call = 0;
  const fetchFn = (async (url: string) => {
    assert.match(url, /offset=\d+$/);
    return { ok: true, status: 200, json: async () => pages[call++] } as Response;
  }) as typeof fetch;
  const items = await fetchWebflowRoomTypeItems({
    siteId: "site", collectionId: "collection", token: "token", fetchFn, limit: 1,
  });
  assert.deepEqual(items.map((item) => item.id), ["a", "b"]);
  await assert.rejects(() => fetchWebflowRoomTypeItems({ siteId: "", collectionId: "c", token: "t" }));
});
