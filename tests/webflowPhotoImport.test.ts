// COW-99: provider-neutral Webflow photo import and master media identity.
// Run with: node --test tests/webflowPhotoImport.test.ts
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
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
import { buildSnapshot, loadPublishedCollection } from "../worker/content-provider.ts";
import { saveSnapshot } from "../worker/published-snapshots.ts";
import {
  loadPublishedGalleries,
  refreshPublishedGalleryUrls,
} from "../worker/published-galleries.ts";

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
  "migrations/0004_published_snapshots.sql",
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

/** Full D1-shaped adapter for snapshot helpers (all/first/run/bind). */
function d1Db(db: DatabaseSync): any {
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

test("one source image can be placed in two rooms with a single master asset", async () => {
  const db = makeDb();
  const base = snapshot().photos[0];
  const shared = snapshot({
    photos: [
      base,
      { ...base, roomTypeRef: "rt-walden", position: 2 },
    ],
    roomTypeRefs: ["rt-alpine", "rt-walden"],
  });
  const plan = await planPhotoImport(d1(db), input(shared));
  assert.equal(plan.summary.duplicate, 0);
  assert.equal(plan.summary.create, 1);
  assert.equal(plan.summary.update, 1);
  assert.equal(plan.decisions[0].mediaId === plan.decisions[1].mediaId, true);
  await applyPhotoImport(executor(db), plan);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM media_assets").get().n, 1);
  const placements = db.prepare("SELECT target_id FROM media_placements ORDER BY target_id").all() as Array<{ target_id: string }>;
  assert.deepEqual(placements.map((p) => p.target_id), ["rt-alpine", "rt-walden"]);
  db.close();
});

test("an existing arbitrary v1 and current v2 are preserved on URL reimport", async () => {
  const db = makeDb();
  const original = snapshot();
  await applyPhotoImport(executor(db), await planPhotoImport(d1(db), input(original)));
  const mediaId = (db.prepare(
    "SELECT media_asset_id FROM media_aliases WHERE alias_value='aaaaaaaaaaaaaaaaaaaaaaaa'",
  ).get() as { media_asset_id: string }).media_asset_id;

  // Simulate a registry asset whose v1 has a different primary key and whose
  // current version is a replacement (v2), with real hotspot revision history.
  db.exec(`
    DELETE FROM media_asset_metadata WHERE media_asset_id='${mediaId}';
    DELETE FROM media_versions WHERE media_asset_id='${mediaId}';
    INSERT INTO media_versions (id, media_asset_id, version, squarespace_asset_id, squarespace_url)
      VALUES ('legacy-v1-custom','${mediaId}',1,'legacy','https://legacy/v1.jpg'),
             ('legacy-v2-custom','${mediaId}',2,'legacy','https://legacy/v2.jpg');
    INSERT INTO media_asset_metadata (media_asset_id, tenant_id, current_version_id)
      VALUES ('${mediaId}','${TENANT}','legacy-v2-custom');
  `);

  const changedUrl = "https://cdn.prod.website-files.com/site/aaaaaaaaaaaaaaaaaaaaaaaa_v3.jpg";
  const changed = snapshot({
    photos: original.photos.map((photo) =>
      photo.sourceAssetId === "webflow_file_id:aaaaaaaaaaaaaaaaaaaaaaaa"
        ? { ...photo, url: changedUrl }
        : photo),
  });
  const plan = await planPhotoImport(d1(db), input(changed));
  assert.equal(plan.decisions.some((d) => d.kind === "update" && d.mediaId === mediaId), true);
  assert.equal(plan.statements.some((s) => s.sql.includes("INSERT INTO media_versions")), false);
  assert.equal(plan.statements.some((s) => s.sql.includes("media_asset_metadata")), false);
  await applyPhotoImport(executor(db), plan);

  assert.equal(db.prepare("SELECT squarespace_url FROM media_assets WHERE id=?").get(mediaId)?.squarespace_url, changedUrl);
  assert.equal(
    (db.prepare("SELECT squarespace_url FROM media_versions WHERE id='legacy-v1-custom'").get() as { squarespace_url: string }).squarespace_url,
    "https://legacy/v1.jpg",
    "historical v1 URL is untouched",
  );
  assert.equal(
    (db.prepare("SELECT squarespace_url FROM media_versions WHERE id='legacy-v2-custom'").get() as { squarespace_url: string }).squarespace_url,
    changedUrl,
    "current version URL is updated for published gallery reads",
  );
  assert.deepEqual(
    (db.prepare("SELECT id FROM media_versions WHERE media_asset_id=? ORDER BY version").all(mediaId) as Array<{ id: string }>).map((row) => row.id),
    ["legacy-v1-custom", "legacy-v2-custom"],
  );
  assert.equal(
    (db.prepare("SELECT current_version_id FROM media_asset_metadata WHERE media_asset_id=?").get(mediaId) as { current_version_id: string }).current_version_id,
    "legacy-v2-custom",
  );
  assert.equal(db.prepare("PRAGMA foreign_key_check").all().length, 0);
  db.close();
});

test("repeating the same import is idempotent", async () => {
  const db = makeDb();
  const snap = snapshot();
  const first = await planPhotoImport(d1(db), input(snap));
  await applyPhotoImport(executor(db), first);
  const second = await planPhotoImport(d1(db), input(snap));
  assert.equal(second.summary.create, 0);
  assert.equal(second.summary.update, 3);
  assert.equal(second.summary.duplicate, 0);
  assert.equal(second.statements.some((s) => s.sql.includes("INSERT INTO media_versions")), false);
  assert.equal(second.statements.some((s) => s.sql.startsWith("UPDATE media_placements")), false);
  await applyPhotoImport(executor(db), second);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM media_assets").get().n, 3);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM media_placements").get().n, 3);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM media_aliases").get().n, 3);
  db.close();
});

test("a published gallery serves the refreshed URL without touching the draft", async () => {
  const db = makeDb();
  const api = d1Db(db);
  const snap = snapshot();
  await applyPhotoImport(executor(db), await planPhotoImport(d1(db), input(snap)));

  // Publish the gallery document and its roomGallery snapshot.
  db.exec(`
    INSERT INTO content_items (id, tenant_id, location_id, kind, slug, status)
      VALUES ('gallery-ci','${TENANT}','${LOCATION}','room_gallery','rt-alpine','published');
    INSERT INTO content_revisions (id, content_item_id, revision, payload_json, created_by)
      VALUES ('gallery-r','gallery-ci',1,'{"items":[]}','test');
  `);
  const records = await loadPublishedCollection(api, { tenantId: TENANT }, "roomGallery");
  assert.ok(records.length > 0);
  const built = await buildSnapshot("roomGallery", records);
  await saveSnapshot(api, { tenantId: TENANT }, "roomGallery", built);
  const before = await loadPublishedGalleries(api, TENANT);
  assert.ok(Object.values(before).some((gallery) => gallery.images.some((url) => url.includes("alpine.jpg"))));

  // An editor draft with a different order must survive the import refresh.
  const draftPayload = '{"items":[{"mediaAssetId":"custom","displayOrder":5}]}';
  db.exec(`
    INSERT INTO content_items (id, tenant_id, location_id, kind, slug, status)
      VALUES ('gallery-draft','${TENANT}','${LOCATION}','room_gallery','rt-walden','draft');
    INSERT INTO content_revisions (id, content_item_id, revision, payload_json, created_by)
      VALUES ('draft-r','gallery-draft',1,'${draftPayload}','editor');
  `);

  const mediaId = (db.prepare(
    "SELECT media_asset_id FROM media_aliases WHERE alias_value='aaaaaaaaaaaaaaaaaaaaaaaa'",
  ).get() as { media_asset_id: string }).media_asset_id;
  const changedUrl = "https://cdn.prod.website-files.com/site/aaaaaaaaaaaaaaaaaaaaaaaa_new.jpg";
  const changed = snapshot({
    photos: snap.photos.map((photo) =>
      photo.sourceAssetId === "webflow_file_id:aaaaaaaaaaaaaaaaaaaaaaaa"
        ? { ...photo, url: changedUrl }
        : photo),
  });
  await applyPhotoImport(executor(db), await planPhotoImport(d1(db), input(changed)));
  const refresh = await refreshPublishedGalleryUrls(api, TENANT, new Set([mediaId]));
  assert.equal(refresh.refreshed, true);

  const guest = await loadPublishedGalleries(api, TENANT);
  assert.ok(Object.values(guest).some((gallery) => gallery.images.includes(changedUrl)));
  assert.equal(
    (db.prepare("SELECT payload_json FROM content_revisions WHERE id='draft-r'").get() as { payload_json: string }).payload_json,
    draftPayload,
    "unpublished draft is untouched",
  );
  db.close();
});

test("a URL reimport with null dimensions keeps known geometry", async () => {
  const db = makeDb();
  const snap = snapshot();
  await applyPhotoImport(executor(db), await planPhotoImport(d1(db), input(snap)));
  const mediaId = (db.prepare(
    "SELECT media_asset_id FROM media_aliases WHERE alias_value='aaaaaaaaaaaaaaaaaaaaaaaa'",
  ).get() as { media_asset_id: string }).media_asset_id;
  const changed = snapshot({
    photos: snap.photos.map((photo) =>
      photo.sourceAssetId === "webflow_file_id:aaaaaaaaaaaaaaaaaaaaaaaa"
        ? { ...photo, url: "https://cdn.prod.website-files.com/site/aaaaaaaaaaaaaaaaaaaaaaaa_v2.jpg", width: null, height: null }
        : photo),
  });
  const plan = await planPhotoImport(d1(db), input(changed));
  await applyPhotoImport(executor(db), plan);
  const version = db.prepare("SELECT width, height FROM media_versions WHERE id=?").get(`${mediaId}:v1`) as { width: number; height: number };
  assert.equal(version.width, 1600);
  assert.equal(version.height, 1000);
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

test("a dry run opens --db read-only and leaves the export unchanged", () => {
  const dir = mkdtempSync(join(tmpdir(), "wf-photos-"));
  const dbPath = join(dir, "d1-export.sqlite");
  const db = new DatabaseSync(dbPath);
  db.exec("PRAGMA foreign_keys = ON");
  for (const file of MIGRATIONS) db.exec(read(file));
  db.exec(`
    INSERT INTO tenants (id, slug, name) VALUES ('urban-cowboy','urban-cowboy','UC');
    INSERT INTO locations (id, tenant_id, slug, name, time_zone) VALUES ('6abc9142d98b325b2821ca23','urban-cowboy','catskills','Catskills','America/New_York');
    INSERT INTO room_types (id, tenant_id, location_id, mews_room_category_id, name, slug, sort_order) VALUES
      ('rt-alpine','urban-cowboy','6abc9142d98b325b2821ca23','mews-alpine','Alpine','alpine',1),
      ('rt-walden','urban-cowboy','6abc9142d98b325b2821ca23','mews-walden','Walden','walden',2);
  `);
  db.close();

  const digest = (path: string) => createHash("sha256").update(readFileSync(path)).digest("hex");
  const before = digest(dbPath);
  const output = execFileSync(process.execPath, [
    "scripts/sync-webflow-photos.mjs",
    "--file", "tests/fixtures/webflow-room-types-photos.json",
    "--room-types", "tests/fixtures/webflow-photo-room-types.json",
    "--db", dbPath,
    "--now", NOW,
  ], { cwd: new URL("../", import.meta.url).pathname, encoding: "utf8" });
  assert.match(output, /created\s+:\s+3/);
  assert.equal(digest(dbPath), before, "dry run must not modify the supplied database file");
  rmSync(dir, { recursive: true, force: true });
});
