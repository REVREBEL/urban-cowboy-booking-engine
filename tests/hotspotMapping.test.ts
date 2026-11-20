// COW-34: replacement/re-crop safety on canonical media_id + amenity_id.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import {
  applyReplacement,
  planReplacement,
  publishMappings,
  rollbackMappings,
  type Fingerprint,
} from "../worker/hotspot-mappings.ts";
import { remapCrop, toDisplayPercent } from "../src/lib/hotspotGeometry.ts";
import { hotspotSource } from "../worker/hotspot-source.ts";
import {
  photoHotspotMappingRowSchema,
  type PhotoHotspotMappingRow,
} from "../src/types/d1-contracts.ts";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");
const TENANT = "urban-cowboy";
const SHA_V1 = "a".repeat(64);
const SHA_V2 = "b".repeat(64);

function makeDb() {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON");
  for (const file of [
    "migrations/0001_init.sql",
    "migrations/0003_property_scoped_contracts.sql",
    "migrations/0004_published_snapshots.sql",
    "migrations/0005_media_registry.sql",
    "migrations/0008_durable_hotspots.sql",
  ]) db.exec(read(file));
  db.exec(`
    INSERT INTO tenants (id, slug, name) VALUES ('${TENANT}','${TENANT}','Urban Cowboy');
    INSERT INTO amenities (id, tenant_id, name, sort_order) VALUES ('tub','${TENANT}','Copper Tub',1);
    INSERT INTO media_assets (id, tenant_id, kind, original_filename) VALUES
      ('m1','${TENANT}','image','room.jpg'), ('other','${TENANT}','image','other.jpg');
    INSERT INTO media_versions
      (id, media_asset_id, version, squarespace_asset_id, squarespace_url, width, height) VALUES
      ('m1:v1','m1',1,'sqsp1','urn:media:v1',2000,1000),
      ('m1:v2','m1',2,'sqsp2','urn:media:v2',2000,1000),
      ('m1:v3','m1',3,'sqsp4','urn:media:v3',2000,1000),
      ('other:v1','other',1,'sqsp3','urn:media:other',2000,1000);
    INSERT INTO media_version_files
      (version_id, tenant_id, media_asset_id, sha256, byte_size, mime_type) VALUES
      ('m1:v1','${TENANT}','m1','${SHA_V1}',100,'image/jpeg'),
      ('m1:v2','${TENANT}','m1','${SHA_V2}',100,'image/jpeg'),
      ('m1:v3','${TENANT}','m1','${SHA_V2}',100,'image/jpeg'),
      ('other:v1','${TENANT}','other','${SHA_V1}',100,'image/jpeg');
    INSERT INTO media_version_fingerprints
      (version_id, tenant_id, media_asset_id, sha256, phash, width, height, exif_orientation) VALUES
      ('m1:v1','${TENANT}','m1','${SHA_V1}',NULL,2000,1000,1),
      ('m1:v2','${TENANT}','m1','${SHA_V2}',NULL,2000,1000,1),
      ('m1:v3','${TENANT}','m1','${SHA_V2}',NULL,2000,1000,1),
      ('other:v1','${TENANT}','other','${SHA_V1}',NULL,2000,1000,1);
    INSERT INTO photo_hotspot_mappings
      (id, tenant_id, media_asset_id, amenity_id, source_x, source_y, source_version_id,
       source_width, source_height, exif_orientation, display_order, status, review_state, created_at, updated_at)
      VALUES ('pin-1','${TENANT}','m1','tub',0.6,0.5,'m1:v1',2000,1000,1,0,'published','none',
              datetime('now'), datetime('now'));
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

const v1: Fingerprint = { sha256: SHA_V1, phash: null, width: 2000, height: 1000, exifOrientation: 1 };
const v2: Fingerprint = { sha256: SHA_V2, phash: null, width: 2000, height: 1000, exifOrientation: 1 };
const baseInput = {
  tenantId: TENANT, mediaAssetId: "m1", fromVersionId: "m1:v1", toVersionId: "m1:v2",
  fromFingerprint: v1, toFingerprint: v2,
};
test("the guest hotspot source flag defaults to Webflow and fails closed", () => {
  assert.equal(hotspotSource({} as any), "webflow");
  assert.equal(hotspotSource({ PHOTO_HOTSPOT_SOURCE: "shadow" } as any), "webflow");
  assert.equal(hotspotSource({ PHOTO_HOTSPOT_SOURCE: "D1" } as any), "d1");
  assert.equal(hotspotSource({ PHOTO_HOTSPOT_SOURCE: "nonsense" } as any), "webflow");
});

const row = (db: DatabaseSync): PhotoHotspotMappingRow =>
  photoHotspotMappingRowSchema.parse(
    db.prepare("SELECT * FROM photo_hotspot_mappings WHERE id='pin-1'").get(),
  );

async function carryExact(db: DatabaseSync, actor = "editor@example.test") {
  const plan = await planReplacement(d1(db), {
    ...baseInput, toFingerprint: { ...v2, sha256: SHA_V1 },
  });
  const result = await applyReplacement(d1(db), plan, plan.mappings.map(() => row(db)), {
    fromVersionId: "m1:v1", actor,
  });
  return { plan, result };
}

test("an exact-file reupload carries pins unchanged and keeps them publishable", async () => {
  const db = makeDb();
  const identical: Fingerprint = { ...v2, sha256: SHA_V1 };
  const plan = await planReplacement(d1(db), { ...baseInput, toFingerprint: identical });
  assert.equal(plan.decision, "exact_reupload");
  assert.equal(plan.reviewRequired, false);
  await applyReplacement(d1(db), plan, [row(db)], { fromVersionId: "m1:v1" });
  const after = row(db);
  assert.equal(after.sourceVersionId, "m1:v2");
  assert.equal(after.sourceX, 0.6);
  assert.equal(after.sourceY, 0.5);
  assert.equal(after.reviewState, "none");
  const published = await publishMappings(d1(db), TENANT, "m1", null, "editor");
  assert.deepEqual(published, { ok: true, published: 1 });
});

test("a known crop change remaps framing correctly and stays publishable", async () => {
  const db = makeDb();
  const plan = await planReplacement(d1(db), {
    ...baseInput,
    toFingerprint: { ...v1, sha256: SHA_V1 },
    cropBefore: { left: 0, top: 0, width: 2000, height: 1000 },
    cropAfter: { left: 200, top: 100, width: 1600, height: 800 },
  });
  assert.equal(plan.decision, "crop_remap");
  await applyReplacement(d1(db), plan, [row(db)], { fromVersionId: "m1:v1" });
  const after = row(db);
  assert.equal(after.reviewState, "none");
  assert.equal(after.cropLeft, 200);
  assert.equal(after.sourceX, 0.6);
  // Source-space coordinate plus the new crop yields the correct display percent.
  const displayed = remapCrop({ x: after.sourceX, y: after.sourceY },
    { width: after.sourceWidth!, height: after.sourceHeight! },
    { left: after.cropLeft!, top: after.cropTop!, width: after.cropWidth!, height: after.cropHeight! });
  assert.deepEqual(toDisplayPercent(displayed!), { x: 62.5, y: 50 });
  assert.equal((await publishMappings(d1(db), TENANT, "m1")).ok, true);
});

test("an out-of-bounds crop and a different-angle replacement block publishing", async () => {
  const db = makeDb();
  const cropPlan = await planReplacement(d1(db), {
    ...baseInput,
    toFingerprint: { ...v1, sha256: SHA_V1 },
    cropAfter: { left: 1800, top: 0, width: 500, height: 800 },
  });
  assert.equal(cropPlan.decision, "crop_review");
  await applyReplacement(d1(db), cropPlan, [row(db)], { fromVersionId: "m1:v1" });
  assert.equal(row(db).reviewState, "pending");
  assert.deepEqual(await publishMappings(d1(db), TENANT, "m1"),
    { ok: false, error: "review_pending", pending: 1 });

  const angleDb = makeDb();
  const anglePlan = await planReplacement(d1(angleDb), baseInput);
  assert.equal(anglePlan.decision, "replacement_review");
  await applyReplacement(d1(angleDb), anglePlan, [row(angleDb)], { fromVersionId: "m1:v1" });
  assert.equal(row(angleDb).reviewState, "pending");
  assert.equal(row(angleDb).sourceX, 0.6); // edits preserved, not verified
  assert.equal((await publishMappings(d1(angleDb), TENANT, "m1")).ok, false);
});

test("URL-only changes are a no-op even when stale hash facts are supplied", async () => {
  const db = makeDb();
  const plan = await planReplacement(d1(db), {
    ...baseInput, urlOnly: true, sameHashOnOtherMedia: true,
  });
  assert.equal(plan.decision, "url_only");
  const applied = await applyReplacement(d1(db), plan, [row(db)], { fromVersionId: "m1:v1" });
  assert.equal(applied.written, 0);
  assert.equal(row(db).sourceVersionId, "m1:v1");
  assert.equal(row(db).sourceX, 0.6);
});

test("EXIF orientation changes transform coordinates but still require review", async () => {
  const db = makeDb();
  const plan = await planReplacement(d1(db), {
    ...baseInput,
    toFingerprint: { ...v1, sha256: SHA_V1, exifOrientation: 6 },
  });
  assert.equal(plan.decision, "crop_review");
  await applyReplacement(d1(db), plan, [row(db)], { fromVersionId: "m1:v1" });
  const after = row(db);
  assert.equal(after.exifOrientation, 6);
  assert.equal(after.sourceX, 0.5);
  assert.equal(after.sourceY, 0.6);
  assert.equal(after.reviewState, "pending");
  assert.equal((await publishMappings(d1(db), TENANT, "m1")).ok, false);
});

test("a duplicate on another media id is flagged, never merged", async () => {
  const db = makeDb();
  const plan = await planReplacement(d1(db), {
    ...baseInput, sameHashOnOtherMedia: true, duplicateOfMediaId: "other",
  });
  assert.equal(plan.decision, "duplicate_exact");
  assert.equal(plan.reviewRequired, true);
  await applyReplacement(d1(db), plan, [row(db)], { fromVersionId: "m1:v1" });
  assert.equal(row(db).duplicateOf, "other");
  assert.equal(row(db).reviewState, "pending");
});

test("revision snapshots roll a replacement back to the prior version", async () => {
  const db = makeDb();
  const { plan } = await carryExact(db);
  assert.equal(row(db).sourceVersionId, "m1:v2");
  // A revision snapshots the state before a version change, so rolling back
  // from v2 restores the v1 geometry.
  const rolled = await rollbackMappings(d1(db), TENANT, "m1", "m1:v2", "editor");
  assert.deepEqual(rolled, { ok: true, restored: 1 });
  const after = row(db);
  assert.equal(after.sourceVersionId, "m1:v1");
  assert.equal(after.sourceX, 0.6);
  assert.equal(after.reviewState, "none");

  const missing = await rollbackMappings(d1(db), TENANT, "m1", "m1:v3");
  assert.deepEqual(missing, { ok: false, error: "no_snapshot" });
});

test("rollback refuses to restore a snapshot that still needs review", async () => {
  const db = makeDb();
  const pending = await planReplacement(d1(db), {
    ...baseInput, toFingerprint: { ...v1, sha256: SHA_V1, exifOrientation: 6 },
  });
  await applyReplacement(d1(db), pending, [row(db)], { fromVersionId: "m1:v1" });
  assert.equal(row(db).reviewState, "pending");

  // A later version snapshots the still-pending v2 geometry. Rolling that
  // version back would re-apply unverified coordinates, so it is blocked.
  const next = await planReplacement(d1(db), {
    ...baseInput,
    fromVersionId: "m1:v2", toVersionId: "m1:v3",
    fromFingerprint: { ...v1, sha256: SHA_V1, exifOrientation: 6 },
    toFingerprint: { ...v1, sha256: SHA_V1, exifOrientation: 6 },
  });
  await applyReplacement(d1(db), next, [row(db)], { fromVersionId: "m1:v2" });
  const result = await rollbackMappings(d1(db), TENANT, "m1", "m1:v3");
  assert.equal(result.ok, false);
  assert.equal(result.ok === false && result.error, "review_pending");
});
