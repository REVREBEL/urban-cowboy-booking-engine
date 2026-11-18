// D1 migration runner contract: ordering, checksum drift and idempotency gate.
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

const root = fileURLToPath(new URL("../", import.meta.url));
const runner = join(root, "scripts", "migrate-d1.mjs");
const committed = JSON.parse(readFileSync(new URL("../migrations/manifest.json", import.meta.url), "utf8"));

function migrate(dir, ...args) {
  return spawnSync(process.execPath, [runner, ...args, "--dir", dir], {
    cwd: root, encoding: "utf8",
  });
}

function fixture(files) {
  const dir = mkdtempSync(join(tmpdir(), "d1-migrate-test-"));
  for (const [name, sql] of Object.entries(files)) {
    writeFileSync(join(dir, name), sql);
  }
  return dir;
}

const first = "CREATE TABLE IF NOT EXISTS t (id INTEGER PRIMARY KEY);\n";
const second = "CREATE INDEX IF NOT EXISTS idx_t ON t (id);\n";

test("committed migrations pass the check gate", () => {
  const result = spawnSync(process.execPath, [runner, "--check"], { cwd: root, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, new RegExp(`Applied ${committed.migrations.length} migration\\(s\\) twice`));
  assert.match(result.stdout, /FK and integrity checks passed/);
});

test("plan records and lists migrations in order without changing the manifest", () => {
  const dir = fixture({ "0001_first.sql": first, "0002_second.sql": second });
  try {
    assert.equal(migrate(dir, "--record").status, 0);
    const before = readFileSync(join(dir, "manifest.json"), "utf8");
    const result = migrate(dir, "--plan");
    assert.equal(result.status, 0, result.stderr);
    assert.ok(result.stdout.indexOf("0001_first.sql") < result.stdout.indexOf("0002_second.sql"));
    assert.match(result.stdout, /0001_first\.sql\s+\w+\s+recorded/);
    assert.equal(readFileSync(join(dir, "manifest.json"), "utf8"), before);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("check applies migrations idempotently", () => {
  const dir = fixture({ "0001_first.sql": first, "0002_second.sql": second });
  try {
    assert.equal(migrate(dir, "--record").status, 0);
    const result = migrate(dir, "--check");
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /twice/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("editing an applied migration is rejected as checksum drift", () => {
  const dir = fixture({ "0001_first.sql": first });
  try {
    assert.equal(migrate(dir, "--record").status, 0);
    writeFileSync(join(dir, "0001_first.sql"), first + "-- edited after apply\n");
    const result = migrate(dir, "--check");
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Checksum drift in 0001_first\.sql/);
    assert.match(result.stderr, /add a new numbered migration instead/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("sequence gaps and conflict markers are rejected before the manifest check", () => {
  const gap = fixture({ "0002_second.sql": second });
  const markers = fixture({ "0001_bad.sql": "<<<<<<< HEAD\n" + first + ">>>>>>> other\n" });
  try {
    const gapResult = migrate(gap, "--check");
    assert.notEqual(gapResult.status, 0);
    assert.match(gapResult.stderr, /sequence gap/);

    const markerResult = migrate(markers, "--check");
    assert.notEqual(markerResult.status, 0);
    assert.match(markerResult.stderr, /Unresolved conflict markers in 0001_bad\.sql/);
  } finally {
    rmSync(gap, { recursive: true, force: true });
    rmSync(markers, { recursive: true, force: true });
  }
});
