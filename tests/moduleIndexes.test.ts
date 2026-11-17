// Guards the D1 module-list indexes added in migrations/0002_module_list_indexes.sql.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");

const moduleQueries: Array<[string, string, string]> = [
  ["add_ons", "idx_add_ons_tenant_status_created", "status = 'published'"],
  ["offers", "idx_offers_tenant_status_created", "status = 'published'"],
  ["upgrades", "idx_upgrades_tenant_status_created", "status = 'published'"],
  ["events", "idx_events_tenant_display_created", "display_flag = 1"],
];

function makeDb(withIndexes: boolean) {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON");
  db.exec(read("migrations/0001_init.sql"));
  db.exec("INSERT INTO tenants (id, slug, name) VALUES ('urban-cowboy', 'urban-cowboy', 'Urban Cowboy')");
  if (withIndexes) db.exec(read("migrations/0002_module_list_indexes.sql"));
  return db;
}

function insertRows(db: DatabaseSync) {
  for (const [table] of moduleQueries) {
    for (let i = 0; i < 20; i++) {
      const createdAt = `2026-01-${String(i + 1).padStart(2, "0")}`;
      if (table === "events") {
        db.prepare(
          "INSERT INTO events (id, tenant_id, title, starts_at, display_flag, created_at) " +
          "VALUES (?1, 'urban-cowboy', ?2, ?3, ?4, ?5)",
        ).run(`${table}-${i}`, `${table} ${i}`, createdAt, i % 2, createdAt);
      } else {
        db.prepare(
          `INSERT INTO ${table} (id, tenant_id, name, status, created_at) ` +
          "VALUES (?1, 'urban-cowboy', ?2, ?3, ?4)",
        ).run(`${table}-${i}`, `${table} ${i}`, i % 2 ? "published" : "draft", createdAt);
      }
    }
  }
}

function planFor(db: DatabaseSync, table: string, filter: string) {
  return db.prepare(
    `EXPLAIN QUERY PLAN SELECT * FROM ${table} WHERE tenant_id = 'urban-cowboy' AND ${filter} ORDER BY created_at DESC`,
  ).all().map((row: any) => String(row.detail)).join(" | ");
}

test("0002 creates an index for each module list query", () => {
  const db = makeDb(true);
  for (const [table, index] of moduleQueries) {
    const names = db.prepare(`PRAGMA index_list('${table}')`).all().map((row: any) => row.name);
    assert.ok(names.includes(index), `${table} should have ${index}`);
  }
  db.close();
});

test("module list queries use the indexes instead of scanning and sorting", () => {
  const db = makeDb(true);
  insertRows(db);
  for (const [table, index, filter] of moduleQueries) {
    const plan = planFor(db, table, filter);
    assert.match(plan, new RegExp(`USING INDEX ${index}`), `${table} plan: ${plan}`);
    assert.doesNotMatch(plan, new RegExp(`SCAN ${table}`), `${table} plan: ${plan}`);
    assert.doesNotMatch(plan, /TEMP B-TREE FOR ORDER BY/, `${table} plan: ${plan}`);
  }
  db.close();
});

test("without 0002 the same queries scan and sort (baseline)", () => {
  const db = makeDb(false);
  for (const [table, , filter] of moduleQueries) {
    const plan = planFor(db, table, filter);
    assert.match(plan, new RegExp(`SCAN ${table}`), `${table} plan: ${plan}`);
    assert.match(plan, /TEMP B-TREE FOR ORDER BY/, `${table} plan: ${plan}`);
  }
  db.close();
});

test("0002 is idempotent", () => {
  const db = makeDb(true);
  const before = db.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type = 'index' AND name LIKE 'idx_%'").get().n;
  db.exec(read("migrations/0002_module_list_indexes.sql"));
  const after = db.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type = 'index' AND name LIKE 'idx_%'").get().n;
  assert.equal(after, before);
  db.close();
});
