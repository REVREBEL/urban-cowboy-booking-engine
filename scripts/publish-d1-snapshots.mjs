#!/usr/bin/env node
// COW-101: generate a reviewable SQL script that publishes the initial D1
// snapshots from a read-only D1 export. Nothing is written to the export.
//
//   node scripts/publish-d1-snapshots.mjs --db local.sqlite --out /tmp/snapshots.sql

import { readFileSync, writeFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

const { CONTENT_COLLECTIONS, loadPublishedCollection, buildSnapshot } = await import("../worker/content-provider.ts");

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

function literal(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function openExport(path) {
  if (!path) throw new Error("--db <export.sqlite> is required");
  const db = new DatabaseSync(path, { readOnly: true });
  const required = [
    "tenants", "locations", "room_types", "content_items", "content_revisions",
    "published_snapshots", "snapshot_pointers",
  ];
  const tables = new Set(db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((row) => row.name));
  const missing = required.filter((table) => !tables.has(table));
  if (missing.length) {
    db.close();
    throw new Error(`--db is missing required tables: ${missing.join(", ")}`);
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
        async first() { return db.prepare(sql).get(...params) ?? null; },
        async run() { db.prepare(sql).run(...params); return { success: true }; },
      };
    },
  };
}

async function main() {
  const tenantId = argValue("--tenant") ?? process.env.TENANT_ID ?? "urban-cowboy";
  const out = argValue("--out");
  if (!out) throw new Error("--out <file.sql> is required");
  const db = openExport(argValue("--db"));
  const api = d1Like(db);
  const statements = [];

  console.log(`tenant: ${tenantId}`);
  for (const collection of CONTENT_COLLECTIONS) {
    const records = await loadPublishedCollection(api, { tenantId }, collection);
    const built = await buildSnapshot(collection, records);
    const previous = db.prepare(
      "SELECT current_version, previous_version FROM snapshot_pointers WHERE tenant_id=?1 AND location_id='' AND collection=?2",
    ).get(tenantId, collection);
    if (previous?.current_version === built.version) {
      console.log(`  ${collection}: unchanged (${records.length} items)`);
      continue;
    }
    statements.push({
      sql: `INSERT INTO published_snapshots (tenant_id, location_id, collection, version, payload_json, item_count, checksum)
            VALUES (?1, '', ?2, ?3, ?4, ?5, ?6) ON CONFLICT DO NOTHING`,
      params: [tenantId, collection, built.version, built.payloadJson, built.itemCount, built.checksum],
    });
    statements.push({
      sql: `INSERT INTO snapshot_pointers (tenant_id, location_id, collection, current_version, previous_version)
            VALUES (?1, '', ?2, ?3, ?4)
            ON CONFLICT (tenant_id, location_id, collection) DO UPDATE SET
              current_version = excluded.current_version,
              previous_version = CASE
                WHEN snapshot_pointers.current_version = excluded.current_version
                THEN snapshot_pointers.previous_version ELSE excluded.previous_version END,
              updated_at = datetime('now')`,
      params: [tenantId, collection, built.version, previous?.current_version ?? null],
    });
    console.log(`  ${collection}: ${records.length} items -> ${built.version.slice(0, 12)}`);
  }

  if (statements.length) {
    const lines = [
      "-- COW-101 initial published snapshots",
      "-- Review before applying. Each version is content-addressed and immutable.",
      "-- Wrangler D1 file imports are atomic; no explicit transaction statements.",
      ...statements.map((statement) => {
        let index = 0;
        const sql = statement.sql.replace(/\?(\d+)/g, (_match, position) => {
          index += 1;
          return literal(statement.params[Number(position) - 1]);
        });
        return sql.trim() + ";";
      }),
    ];
    writeFileSync(out, lines.join("\n") + "\n", "utf8");
    console.log(`wrote ${statements.length} statements to ${out}`);
  } else {
    console.log("all snapshots are already current; no script written");
  }
  db.close();
}

main().catch((error) => {
  console.error(error?.stack ?? String(error));
  process.exit(1);
});
