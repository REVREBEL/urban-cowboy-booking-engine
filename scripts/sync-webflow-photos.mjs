#!/usr/bin/env node
// COW-99: temporary Webflow photo URL importer.
//
// Read-only by default. Resolves stable master media IDs through the provider
// adapter, prints a dry-run report, and optionally emits a reviewable SQL script.
//   node scripts/sync-webflow-photos.mjs --file photos.json --room-types rooms.json
//   node scripts/sync-webflow-photos.mjs --api --room-types rooms.json --sql-out /tmp/photos.sql
//
// Live Webflow fetch needs WEBFLOW_SITE_ID, WEBFLOW_ROOM_TYPE_COLLECTION_ID and
// WEBFLOW_CMS_API_TOKEN. Use --db <sqlite-file> seeded from D1 for an accurate
// diff; without it the plan treats every photo as new but still derives the
// same deterministic master IDs.

import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";

const { webflowPhotoSourceAdapter, fetchWebflowRoomTypeItems } = await import("../worker/photo-source-webflow.ts");
const { planPhotoImport, renderPhotoImportSql } = await import("../worker/photo-source-import.ts");
const { DatabaseSync } = await import("node:sqlite");

const DEFAULT_TENANT = "urban-cowboy";
const DEFAULT_LOCATION = "6abc9142d98b325b2821ca23";
const MIGRATIONS = [
  "migrations/0001_init.sql",
  "migrations/0003_property_scoped_contracts.sql",
  "migrations/0005_media_registry.sql",
  "migrations/0009_media_placement_flags.sql",
];

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

async function loadJson(path, label) {
  if (!path) throw new Error(`${label} is required`);
  return JSON.parse(await readFile(path, "utf8"));
}

function loadRoomTypes(raw) {
  const list = Array.isArray(raw) ? raw : raw.roomTypes;
  if (!Array.isArray(list)) throw new Error("room types file must be an array or { roomTypes: [] }");
  return list.map((room) => ({
    id: String(room.id),
    name: String(room.name ?? ""),
    slug: room.slug == null ? null : String(room.slug),
    mewsRoomCategoryId: room.mewsRoomCategoryId ?? room.mews_room_category_id ?? null,
  }));
}

function makeDb(path, roomTypes) {
  const db = new DatabaseSync(path ?? ":memory:");
  db.exec("PRAGMA foreign_keys = ON");
  for (const migration of MIGRATIONS) db.exec(readFileSync(new URL(`../${migration}`, import.meta.url), "utf8"));
  if (!path) {
    // A standalone dry run has no D1 export, so seed the canonical room types
    // supplied with --room-types to make matching meaningful.
    db.exec(`
      INSERT INTO tenants (id, slug, name) VALUES ('${DEFAULT_TENANT}','${DEFAULT_TENANT}','Urban Cowboy');
      INSERT INTO locations (id, tenant_id, slug, name, time_zone)
        VALUES ('${DEFAULT_LOCATION}','${DEFAULT_TENANT}','catskills','Catskills','America/New_York');
    `);
    const insert = db.prepare(
      "INSERT INTO room_types (id, tenant_id, location_id, mews_room_category_id, name, slug, sort_order) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
    );
    for (const room of roomTypes) {
      insert.run(room.id, DEFAULT_TENANT, DEFAULT_LOCATION,
        room.mewsRoomCategoryId ?? `unbound-${room.id}`, room.name, room.slug, 0);
    }
  }
  return db;
}

function d1Like(db) {
  return {
    prepare(sql) {
      let params = [];
      return {
        bind(...values) { params = values; return this; },
        async all() { return { results: db.prepare(sql).all(...params) }; },
      };
    },
  };
}

async function main() {
  const tenantId = argValue("--tenant") ?? process.env.TENANT_ID ?? DEFAULT_TENANT;
  const locationId = argValue("--location") ?? DEFAULT_LOCATION;
  const roomTypes = loadRoomTypes(await loadJson(argValue("--room-types"), "--room-types"));
  const sqlOut = argValue("--sql-out");
  const now = argValue("--now") ?? new Date().toISOString();

  let payload;
  let sourceUrl;
  if (argValue("--api")) {
    payload = {
      items: await fetchWebflowRoomTypeItems({
        siteId: process.env.WEBFLOW_SITE_ID ?? "",
        collectionId: process.env.WEBFLOW_ROOM_TYPE_COLLECTION_ID ?? "",
        token: process.env.WEBFLOW_CMS_API_TOKEN ?? "",
      }),
    };
    sourceUrl = "webflow-cms:live";
  } else {
    const file = argValue("--file");
    payload = await loadJson(file, "--file (or --api)");
    sourceUrl = file;
  }

  const digest = createHash("sha256").update(JSON.stringify(payload)).digest("hex").slice(0, 16);
  const snapshot = webflowPhotoSourceAdapter.parse({
    payload, roomTypes, sourceUrl, fetchedAt: now, digest,
  });

  const db = makeDb(argValue("--db"), roomTypes);
  const plan = await planPhotoImport(d1Like(db), { tenantId, locationId, snapshot, now });

  console.log(`provider    : ${snapshot.provider}`);
  console.log(`source      : ${sourceUrl}`);
  console.log(`sha256/16   : ${digest}`);
  console.log(`photos      : ${snapshot.photos.length}`);
  console.log(`created     : ${plan.summary.create}`);
  console.log(`updated     : ${plan.summary.update}`);
  console.log(`duplicates  : ${plan.summary.duplicate}`);
  console.log(`invalid     : ${plan.summary.invalid}`);
  console.log(`unresolved  : ${plan.summary.unresolvedRoom}`);
  console.log(`source issues: ${snapshot.issues.length}`);
  console.log(`reported removed (not applied): ${plan.summary.removed}`);

  for (const issue of snapshot.issues) console.log(`  issue [${issue.kind}] ${issue.detail}`);
  for (const decision of plan.decisions) {
    if (decision.kind === "invalid" || decision.kind === "unresolved-room" || decision.kind === "duplicate") {
      console.log(`  skip [${decision.kind}] ${decision.photo.sourceAssetId}: ${decision.detail ?? ""}`);
    }
  }

  if (sqlOut) {
    await writeFile(sqlOut, renderPhotoImportSql(plan, snapshot.provider), "utf8");
    console.log(`\nwrote ${plan.statements.length} statements to ${sqlOut}`);
    console.log("\napply with:");
    console.log(`  wrangler d1 execute urban-cowboy-content --local  --file ${sqlOut}`);
  } else {
    console.log("\nread-only: pass --sql-out <path> to emit the import script");
  }
  db.close();
}

main().catch((error) => {
  console.error(error?.stack ?? String(error));
  process.exit(1);
});
