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
const { canonicalJson } = await import("../worker/content-provider.ts");
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
  if (path) {
    // A supplied export is read-only: a dry run must never migrate or mutate it.
    const db = new DatabaseSync(path, { readOnly: true });
    db.exec("PRAGMA foreign_keys = ON");
    const required = [
      "tenants", "locations", "room_types", "media_assets", "media_aliases",
      "media_versions", "media_asset_metadata", "media_placements",
    ];
    const tables = new Set(
      db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((row) => row.name),
    );
    const missing = required.filter((table) => !tables.has(table));
    if (missing.length) {
      db.close();
      throw new Error(`--db is missing required tables: ${missing.join(", ")}`);
    }
    return db;
  }
  const db = new DatabaseSync(":memory:");
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

/**
 * Build the published-snapshot refresh as ordinary SQL in the same BEGIN/COMMIT
 * script as the registry updates. Guests read the immutable roomGallery
 * snapshot, so leaving this out would keep serving old URLs after a successful
 * registry import. If any earlier statement fails, the transaction rolls back
 * and no new snapshot version is published.
 */
function snapshotRefreshStatements(db, tenantId, changedMediaIds, plannedUrls) {
  if (!changedMediaIds.size) return [];
  const pointer = db.prepare(
    "SELECT current_version, previous_version FROM snapshot_pointers WHERE tenant_id=?1 AND location_id='' AND collection='roomGallery'",
  ).get(tenantId);
  if (!pointer) return [];
  const snapshot = db.prepare(
    "SELECT payload_json FROM published_snapshots WHERE tenant_id=?1 AND location_id='' AND collection='roomGallery' AND version=?2",
  ).get(tenantId, pointer.current_version);
  if (!snapshot) return [];

  let payload;
  try { payload = JSON.parse(snapshot.payload_json); } catch { return []; }
  const records = Array.isArray(payload.items) ? payload.items : [];
  const urls = new Map(db.prepare(
    `SELECT a.id AS id, COALESCE(v.squarespace_url, a.squarespace_url) AS source_url
       FROM media_assets a
       LEFT JOIN media_asset_metadata md ON md.media_asset_id=a.id AND md.tenant_id=a.tenant_id
       LEFT JOIN media_versions v ON v.id=md.current_version_id
      WHERE a.tenant_id=?1`,
  ).all(tenantId).map((row) => [row.id, row.source_url]));

  let changed = false;
  for (const record of records) {
    for (const item of record.payload?.items ?? []) {
      if (!changedMediaIds.has(item.mediaAssetId)) continue;
      // The export is read-only and still holds the OLD url; the plan holds the
      // new one. Never derive the published URL from the stale export.
      const next = plannedUrls.get(item.mediaAssetId) ?? urls.get(item.mediaAssetId);
      if (typeof next === "string" && next.length > 0 && next !== item.sourceUrl) {
        item.sourceUrl = next;
        changed = true;
      }
    }
  }
  if (!changed) return [];

  const items = [...records].sort((a, b) => String(a.id).localeCompare(String(b.id)));
  const checksum = createHash("sha256").update(canonicalJson(items)).digest("hex");
  const payloadJson = JSON.stringify({ collection: "roomGallery", version: checksum, itemCount: items.length, items });
  return [
    {
      sql: `INSERT INTO published_snapshots (tenant_id, location_id, collection, version, payload_json, item_count, checksum)
            VALUES (?1, '', 'roomGallery', ?2, ?3, ?4, ?5) ON CONFLICT DO NOTHING`,
      params: [tenantId, checksum, payloadJson, items.length, checksum],
    },
    {
      sql: `INSERT INTO snapshot_pointers (tenant_id, location_id, collection, current_version, previous_version)
            VALUES (?1, '', 'roomGallery', ?2, ?3)
            ON CONFLICT (tenant_id, location_id, collection) DO UPDATE SET
              current_version = excluded.current_version,
              previous_version = CASE
                WHEN snapshot_pointers.current_version = excluded.current_version
                THEN snapshot_pointers.previous_version ELSE excluded.previous_version END,
              updated_at = datetime('now')`,
      params: [tenantId, checksum, pointer.current_version],
    },
  ];
}

async function main() {
  const tenantId = argValue("--tenant") ?? process.env.TENANT_ID ?? DEFAULT_TENANT;
  const locationId = argValue("--location") ?? DEFAULT_LOCATION;
  const roomTypes = loadRoomTypes(await loadJson(argValue("--room-types"), "--room-types"));
  const sqlOut = argValue("--sql-out");
  const dbPath = argValue("--db");
  const now = argValue("--now") ?? new Date().toISOString();

  if (sqlOut && !dbPath) {
    console.error(
      "--sql-out requires --db <export.sqlite>.\n" +
        "The published roomGallery snapshot is what guests read; it must be refreshed\n" +
        "in the same transaction as the registry update. Export the D1 database first.",
    );
    process.exit(1);
  }

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

  const db = makeDb(dbPath, roomTypes);
  const plan = await planPhotoImport(d1Like(db), { tenantId, locationId, snapshot, now });
  const importDecisions = plan.decisions.filter(
    (decision) => decision.kind === "create" || decision.kind === "update",
  );
  const changedMediaIds = new Set(importDecisions.map((decision) => decision.mediaId));
  const plannedUrls = new Map(importDecisions.map((decision) => [decision.mediaId, decision.photo.url]));

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
    // The snapshot refresh is appended to the same transaction: if any import
    // statement fails, COMMIT never happens and no new version is published.
    const refresh = snapshotRefreshStatements(db, tenantId, changedMediaIds, plannedUrls);
    const statements = [...plan.statements, ...refresh];
    await writeFile(sqlOut, renderPhotoImportSql({ ...plan, statements }, snapshot.provider), "utf8");
    console.log(`\nwrote ${statements.length} statements to ${sqlOut} (${refresh.length} snapshot refresh)`);
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
