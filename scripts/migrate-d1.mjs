#!/usr/bin/env node
/**
 * D1 migration runner (COW-31).
 *
 * Wrangler owns the remote ledger and per-migration rollback. This wrapper adds
 * what Wrangler does not: ordered filename validation, checksum drift detection
 * (an applied migration must never be edited), an idempotency/integrity gate for
 * CI, and a guarded remote apply that checks the approved Cloudflare account.
 *
 *   npm run d1:migrate:check    validate + apply twice to a fresh in-memory DB
 *   npm run d1:migrate:plan     print ordered migrations and checksums only
 *   npm run d1:migrate:record   rewrite migrations/manifest.json (review first)
 *   npm run d1:migrate:remote   guarded apply to the approved remote D1
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { DatabaseSync } from "node:sqlite";
import { assertApprovedTarget, D1_TARGET } from "./lib/d1-target.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const dirFlag = args.indexOf("--dir");
const dirArg = dirFlag === -1 ? undefined : args[dirFlag + 1];
if (dirFlag !== -1) args.splice(dirFlag, 2);
const migrationsDir = resolve(dirArg ?? join(root, "migrations"));
const manifestPath = join(migrationsDir, "manifest.json");
const envPath = join(root, ".env");
const configPath = join(root, ".wrangler.generated.toml");
const cli = join(root, "node_modules", ".bin", "wrangler");
const MANIFEST_VERSION = 1;
const NAME_RE = /^\d{4}_[a-z0-9_]+\.sql$/;

function fail(message) {
  console.error("D1 migration aborted: " + message);
  process.exit(1);
}

function run(bin, args, options = {}) {
  const result = spawnSync(bin, args, {
    cwd: root,
    env: options.env,
    encoding: "utf8",
    stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
  });
  if (result.error) fail(result.error.message);
  if (result.status !== 0) {
    if (options.capture) console.error(result.stderr || result.stdout);
    fail([bin, args[0], args[1]].filter(Boolean).join(" ") + " failed");
  }
  return result.stdout ?? "";
}

function sha256(text) {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

function readMigrations() {
  if (!existsSync(migrationsDir)) fail("Missing migrations directory");
  const files = readdirSync(migrationsDir).filter((name) => name.endsWith(".sql"));
  const unexpected = files.filter((name) => !NAME_RE.test(name));
  if (unexpected.length) {
    fail("Migration filenames must be <4-digit-seq>_<snake_case>.sql: " + unexpected.join(", "));
  }
  const ordered = files.sort();
  return ordered.map((file, index) => {
    const id = Number(file.slice(0, 4));
    if (id !== index + 1) {
      fail(`Migration sequence gap at ${file}: expected ${String(index + 1).padStart(4, "0")}`);
    }
    const sql = readFileSync(join(migrationsDir, file), "utf8");
    if (/^(<<<<<<<|=======|>>>>>>>)/m.test(sql)) {
      fail(`Unresolved conflict markers in ${file}`);
    }
    return { id, file, sha256: sha256(sql), sql };
  });
}

function readManifest() {
  if (!existsSync(manifestPath)) return null;
  try {
    return JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch {
    fail("migrations/manifest.json is not valid JSON");
  }
}

function writeManifest(migrations) {
  const body = {
    version: MANIFEST_VERSION,
    migrations: migrations.map(({ id, file, sha256: checksum }) => ({
      id, file, sha256: checksum,
    })),
  };
  writeFileSync(manifestPath, JSON.stringify(body, null, 2) + "\n");
  console.log(`Recorded ${migrations.length} migration(s) in migrations/manifest.json.`);
}

function assertManifest(migrations, manifest) {
  if (!manifest || manifest.version !== MANIFEST_VERSION || !Array.isArray(manifest.migrations)) {
    fail("Missing or unsupported migrations/manifest.json; review files then run --record");
  }
  if (manifest.migrations.length !== migrations.length) {
    fail("Manifest and migrations/ file counts differ; review then run --record deliberately");
  }
  migrations.forEach((migration, index) => {
    const recorded = manifest.migrations[index];
    if (recorded?.id !== migration.id || recorded.file !== migration.file) {
      fail(`Manifest order mismatch at ${migration.file}; review then run --record`);
    }
    if (recorded.sha256 !== migration.sha256) {
      fail(`Checksum drift in ${migration.file}. Applied migrations must never be edited — add a new numbered migration instead.`);
    }
  });
}

function checkApply(migrations) {
  const db = new DatabaseSync(":memory:");
  try {
    db.exec("PRAGMA foreign_keys = ON");
    for (const migration of migrations) db.exec(migration.sql);
    // Every committed migration uses IF NOT EXISTS; re-applying must be a no-op.
    for (const migration of migrations) db.exec(migration.sql);
    const violations = db.prepare("PRAGMA foreign_key_check").all();
    if (violations.length) fail("foreign_key_check failed: " + JSON.stringify(violations));
    const integrity = db.prepare("PRAGMA integrity_check").get().integrity_check;
    if (integrity !== "ok") fail("integrity_check failed: " + integrity);
    console.log(`Applied ${migrations.length} migration(s) twice; FK and integrity checks passed.`);
  } finally {
    db.close();
  }
}

function printPlan(migrations, manifest) {
  console.log("Migration plan (no changes made):");
  for (const migration of migrations) {
    const recorded = manifest?.migrations?.find((entry) => entry.file === migration.file);
    const state = !recorded ? "UNRECORDED" : recorded.sha256 === migration.sha256 ? "recorded" : "DRIFT";
    console.log(`  ${String(migration.id).padStart(4, "0")}  ${migration.file}  ${migration.sha256.slice(0, 12)}  ${state}`);
  }
}

function remoteApply(migrations, manifest) {
  assertManifest(migrations, manifest);
  const { accountId, token } = assertApprovedTarget(envPath);
  if (!existsSync(cli)) fail("Install dependencies before applying remote migrations");
  run(process.execPath, [join(root, "scripts/deploy-worker.mjs"), "--render-only"]);
  if (!existsSync(configPath)) fail("No rendered Wrangler configuration");
  const config = readFileSync(configPath, "utf8");
  if (!config.startsWith('account_id = "' + accountId + '"\n') ||
      !config.includes('database_id = "' + D1_TARGET.databaseId + '"')) {
    fail("Rendered Wrangler config does not match the approved Cloudflare account/D1 database");
  }

  const backupDir = join(root, "backups", "d1");
  mkdirSync(backupDir, { recursive: true, mode: 0o700 });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backup = join(backupDir, `pre-migration-${stamp}.sql`);
  const env = {
    ...process.env,
    CLOUDFLARE_API_TOKEN: token,
    CLOUDFLARE_ACCOUNT_ID: accountId,
    CI: "1", // skip Wrangler's interactive confirmation in automation
  };
  console.log("Backing up remote D1 before schema changes...");
  run(cli, ["d1", "export", D1_TARGET.dbName, "--remote", "--config", configPath, "--output", backup], { env });
  if (!existsSync(backup) || statSync(backup).size < 1000) {
    fail("Backup is missing or unexpectedly small. No migrations applied.");
  }
  console.log("Backup saved locally at " + backup + " (store securely outside Git).");
  console.log("Applying pending migrations to remote D1 via Wrangler...");
  run(cli, ["d1", "migrations", "apply", D1_TARGET.dbName, "--remote", "--config", configPath], { env });
  console.log("Remote migration apply completed. Verify with: npm run d1:migrate:plan");
}

const mode = args[0] ?? "--check";
if (!["--check", "--plan", "--record", "--remote"].includes(mode)) {
  fail("Unknown mode: " + mode);
}
const migrations = readMigrations();
const manifest = readManifest();

if (mode === "--record") {
  writeManifest(migrations);
} else if (mode === "--plan") {
  printPlan(migrations, manifest);
} else if (mode === "--check") {
  assertManifest(migrations, manifest);
  checkApply(migrations);
} else {
  remoteApply(migrations, manifest);
}
