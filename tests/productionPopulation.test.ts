// COW-101: local rehearsal of the production D1 population runbook.
// No remote or production system is contacted.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cpSync, readdirSync, readFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import { CONTENT_COLLECTIONS } from "../worker/content-provider.ts";
import { applyBatch, toApiStatements } from "../scripts/lib/d1-api.mjs";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");
const MIGRATIONS = readdirSync(new URL("migrations/", root))
  .filter((file) => file.endsWith(".sql"))
  .sort();

function applySchema(db: DatabaseSync, seed = true) {
  db.exec("PRAGMA foreign_keys = ON");
  for (const file of MIGRATIONS) db.exec(read(`migrations/${file}`));
  if (seed) db.exec(read("seed.sql"));
}

test("all migrations plus seed reconcile with the production counts", () => {
  const db = new DatabaseSync(":memory:");
  applySchema(db);
  assert.deepEqual(db.prepare("PRAGMA foreign_key_check").all(), []);
  assert.equal(db.prepare("PRAGMA integrity_check").get().integrity_check, "ok");
  const expected: Record<string, number> = {
    tenants: 1, locations: 4, location_publication: 4, buildings: 9,
    room_types: 22, room_type_publication: 22, amenities: 76, amenity_editorial: 76,
    events: 8, offers: 8, add_ons: 9, room_type_amenities: 253,
    rate_merchandising: 5, content_items: 25, content_revisions: 25,
  };
  for (const [table, count] of Object.entries(expected)) {
    assert.equal(
      (db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number }).n,
      count, `${table} row count`,
    );
  }
  const drafts = db.prepare(
    "SELECT room_type_id FROM room_type_publication WHERE status='draft'",
  ).all() as Array<{ room_type_id: string }>;
  assert.deepEqual(drafts.map((row) => row.room_type_id), ["6abd4a1debcab0ea7e461c9a"]);
  assert.equal(
    (db.prepare("SELECT COUNT(*) AS n FROM content_provenance").get() as { n: number }).n,
    190,
  );
  db.close();
});

test("no orphan relationships or unscoped structured rows exist after seeding", () => {
  const db = new DatabaseSync(":memory:");
  applySchema(db);
  for (const [table, column] of [["room_type_amenities", "room_type_id"], ["room_type_publication", "room_type_id"]]) {
    const orphans = db.prepare(
      `SELECT COUNT(*) AS n FROM ${table} t LEFT JOIN room_types r ON r.id = t.${column} WHERE r.id IS NULL`,
    ).get() as { n: number };
    assert.equal(orphans.n, 0, `${table} has no orphan room types`);
  }
  assert.equal(
    (db.prepare("SELECT COUNT(*) AS n FROM buildings WHERE location_id IS NULL").get() as { n: number }).n,
    0,
  );
  db.close();
});

test("parameterized apply keeps large snapshots out of SQL text and is atomic", async () => {
  // Production-sized roomGallery payload (~122 assets across 22 rooms).
  const payload = JSON.stringify({
    items: Array.from({ length: 122 }, (_, index) => ({
      mediaAssetId: `mm-${index.toString(16).padStart(24, "0")}`,
      sourceUrl: `https://cdn.prod.website-files.com/site/${index}_very_long_room_photo_filename.jpg`,
      altText: `Room ${index} editorial alt text`,
      caption: null, description: null, displayOrder: index,
    })),
  });
  assert.ok(payload.length > 20_000, "fixture is production-sized");
  const statements = [{
    sql: "INSERT INTO published_snapshots (tenant_id, location_id, collection, version, payload_json, item_count, checksum) VALUES (?1, '', ?2, ?3, ?4, ?5, ?6) ON CONFLICT DO NOTHING",
    params: ["urban-cowboy", "roomGallery", "v1", payload, 122, "v1"],
  }, {
    sql: "UPDATE snapshot_pointers SET current_version = ?1 WHERE collection = ?2",
    params: ["v1", "roomGallery"],
  }];
  const apiStatements = toApiStatements(statements);
  assert.equal(apiStatements.length, 2);
  assert.ok(apiStatements.every((statement) => statement.sql.length < 500), "SQL text stays small");
  assert.equal(apiStatements[0].params[3], payload, "large payload is a bound parameter");

  let calls = 0;
  let sentBody = "";
  const fetchFn = (async (_url: string, init: RequestInit) => {
    calls += 1;
    sentBody = String(init.body);
    return { ok: true, status: 200, json: async () => ({ success: true, result: [{ success: true }, { success: true }] }) } as Response;
  }) as typeof fetch;
  const result = await applyBatch(statements, { token: "test", fetchFn });
  assert.equal(result.applied, 2);
  assert.equal(calls, 1, "media and pointer are sent in one batch");
  assert.ok(sentBody.includes('"batch"'));
  const sent = JSON.parse(sentBody) as { batch: Array<{ sql: string; params: unknown[] }> };
  assert.equal(sent.batch.length, 2);
  assert.ok(!sent.batch[0].sql.includes(payload.slice(0, 80)), "payload is bound, not inlined into SQL text");
  assert.equal(sent.batch[0].params[3], payload);

  const failingFetch = (async () => {
    calls += 1;
    return { ok: false, status: 500, json: async () => ({ success: false, errors: [{ message: "induced" }] }) } as Response;
  }) as typeof fetch;
  await assert.rejects(() => applyBatch(statements, { token: "test", fetchFn: failingFetch }), /D1 batch failed/);
  assert.equal(calls, 2, "induced failure is not retried or split");
});

test("publish-d1-snapshots generates an idempotent, applyable script from a read-only export", () => {
  const dir = mkdtempSync(join(tmpdir(), "d1-populate-"));
  const exportPath = join(dir, "export.sqlite");
  const outPath = join(dir, "snapshots.sql");
  const db = new DatabaseSync(exportPath);
  applySchema(db);
  db.close();

  const output = execFileSync(process.execPath, [
    "scripts/publish-d1-snapshots.mjs", "--db", exportPath, "--out", outPath,
  ], { cwd: new URL("../", import.meta.url).pathname, encoding: "utf8" });
  assert.match(output, /roomGallery/);
  const sql = readFileSync(outPath, "utf8");
  assert.doesNotMatch(sql, /\bBEGIN\b|\bCOMMIT\b/i, "D1 rejects explicit transactions");
  assert.match(sql, /INSERT INTO published_snapshots/);

  const applyPath = join(dir, "apply.sqlite");
  cpSync(exportPath, applyPath);
  const apply = new DatabaseSync(applyPath);
  apply.exec("PRAGMA foreign_keys = ON");
  apply.exec(sql);
  apply.exec(sql); // idempotent replay
  assert.equal(
    (apply.prepare("SELECT COUNT(*) AS n FROM snapshot_pointers").get() as { n: number }).n,
    CONTENT_COLLECTIONS.length,
  );
  assert.equal(
    (apply.prepare("SELECT COUNT(*) AS n FROM published_snapshots").get() as { n: number }).n,
    CONTENT_COLLECTIONS.length,
  );
  assert.equal((apply.prepare("PRAGMA foreign_key_check").all() as unknown[]).length, 0);
  apply.close();
  rmSync(dir, { recursive: true, force: true });
});
