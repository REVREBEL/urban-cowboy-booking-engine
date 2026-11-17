#!/usr/bin/env node
/**
 * Safe, explicit remote D1 content deployment. Intentionally separate from
 * npm run deploy (Worker code and bindings).
 *
 * Validates local schema/seed, snapshots remote data, applies idempotent seed,
 * and checks actual remote table counts and location time zones.
 */
import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { parseEnv } from "node:util";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dbName = "urban-cowboy-content";
const expectedAccount = "4c154709ffe87621073f9ecfa86a57dd";
const expectedD1 = "0d09ca5a-74fe-4e83-a058-b8aa5fb21562";
const envPath = join(root, ".env");
const configPath = join(root, ".wrangler.generated.toml");
const seedPath = join(root, "seed.sql");
const cli = join(root, "node_modules", ".bin", "wrangler");
const expectedCounts = {
  tenants: 1, locations: 4, buildings: 9, room_types: 22, amenities: 76,
  events: 8, offers: 8, add_ons: 9, room_type_amenities: 253,
  rate_merchandising: 5, content_items: 24, content_revisions: 24,
};
const expectedZones = {
  catskills: "America/New_York", denver: "America/Denver",
  "nashville-east": "America/Chicago", "nashville-downtown": "America/Chicago",
};

function fail(message) {
  console.error("D1 deploy aborted: " + message);
  process.exit(1);
}
function run(bin, args, options = {}) {
  const result = spawnSync(bin, args, {
    cwd: root, env: options.env, encoding: "utf8",
    stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
  });
  if (result.error) fail(result.error.message);
  if (result.status !== 0) {
    if (options.capture) console.error(result.stderr || result.stdout);
    fail([bin, args[0], args[1]].filter(Boolean).join(" ") + " failed");
  }
  return result.stdout ?? "";
}
if (!existsSync(envPath)) fail("Missing project .env");
if (!existsSync(seedPath)) fail("Missing seed.sql");
if (!existsSync(cli)) fail("Install dependencies before running deploy:d1");
const fromFile = parseEnv(readFileSync(envPath, "utf8"));
const accountId = fromFile.CLOUDFLARE_ACCOUNT_ID?.trim();
const activeShellAccount = process.env.CLOUDFLARE_ACCOUNT_ID;
if (accountId !== expectedAccount) fail("Shared .env Cloudflare account does not own Urban Cowboy D1");
if (activeShellAccount && activeShellAccount !== expectedAccount) {
  fail("Shell CLOUDFLARE_ACCOUNT_ID conflicts with Urban Cowboy's account");
}
const token = (process.env.CLOUDFLARE_API_TOKEN || fromFile.CLOUDFLARE_API_TOKEN || "")
  .replace(/^Bearer\s+/i, "").trim();
if (!token) fail("Missing Cloudflare API token for remote D1 access");
const env = { ...process.env, CLOUDFLARE_API_TOKEN: token, CLOUDFLARE_ACCOUNT_ID: expectedAccount };

console.log("Validating seed against the real D1 schema and foreign keys...");
run("npm", ["run", "test:seed"], { env });
console.log("Refreshing ignored Wrangler configuration from shared .env...");
run(process.execPath, [join(root, "scripts/deploy-worker.mjs"), "--render-only"], { env });
if (!existsSync(configPath)) fail("No rendered Wrangler configuration");
const config = readFileSync(configPath, "utf8");
if (!config.startsWith('account_id = "' + expectedAccount + '"\n') ||
    !config.includes('database_id = "' + expectedD1 + '"')) {
  fail("Rendered Wrangler config does not match approved Cloudflare account/D1 database");
}
const seed = readFileSync(seedPath, "utf8");
if (!seed.includes("ON CONFLICT") || seed.includes("placeholder-media")) {
  fail("Seed is not the reviewed idempotent import or includes invalid media IDs");
}
for (const [slug, zone] of Object.entries(expectedZones)) {
  if (!seed.split("\n").some(line =>
    line.startsWith("INSERT INTO locations") &&
    line.includes("'" + slug + "'") && line.includes("'" + zone + "'"))) {
    fail("seed.sql missing correct local timezone for " + slug);
  }
}

// Wrangler remote export includes schema and data. Never overwrite prior backups.
const backupDir = join(root, "backups", "d1");
mkdirSync(backupDir, { recursive: true, mode: 0o700 });
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const backup = join(backupDir, "urban-cowboy-content-" + timestamp + ".sql");
console.log("Backing up remote database before writes...");
run(cli, ["d1", "export", dbName, "--remote", "--config", configPath, "--output", backup], { env });
if (!existsSync(backup) || statSync(backup).size < 1000) {
  fail("Export is missing or unexpectedly small. No changes made.");
}
console.log("Backup saved locally at " + backup + " (never commit backup data).");

console.log("Applying reviewed idempotent seed.sql to remote D1...");
run(cli, ["d1", "execute", dbName, "--remote", "--yes", "--config", configPath, "--file", seedPath], { env });

// D1 exposes JSON for machine-readable SQL assertions. Never assume successful
// import alone proves record counts, foreign-key linkage or timezone correctness.
function query(sql) {
  const output = run(cli, [
    "d1", "execute", dbName, "--remote", "--config", configPath,
    "--command", sql, "--json",
  ], { env, capture: true }).trim();
  let payload;
  try {
    payload = JSON.parse(output);
  } catch {
    const start = output.search(/[\[{]/);
    if (start === -1) fail("Wrangler did not return JSON for reconciliation");
    try { payload = JSON.parse(output.slice(start)); }
    catch { fail("Could not parse Wrangler D1 JSON output"); }
  }
  const set = Array.isArray(payload) ? payload[0] : payload;
  if (!set?.success || !Array.isArray(set.results)) {
    fail("D1 reconciliation query failed or returned unexpected JSON");
  }
  return set.results;
}
for (const [table, count] of Object.entries(expectedCounts)) {
  const rows = query("SELECT COUNT(*) AS n FROM " + table);
  if (Number(rows[0]?.n) !== count) {
    fail(table + " expected " + count + " rows but D1 returned " + rows[0]?.n);
  }
  console.log("  " + table + ": " + count + " ✓");
}
const zones = query("SELECT slug,time_zone FROM locations");
for (const [slug, expected] of Object.entries(expectedZones)) {
  const actual = zones.find(row => row.slug === slug)?.time_zone;
  if (actual !== expected) fail(slug + " timezone expected " + expected + ", received " + actual);
}
for (const table of ["room_types", "buildings"]) {
  const rows = query("SELECT COUNT(*) AS n FROM " + table + " WHERE location_id IS NULL");
  if (Number(rows[0]?.n) !== 0) fail(table + " has unassigned location IDs");
}
console.log("Remote D1 reconciliation passed.");
console.log("Media assets/hotspots remain intentionally excluded until source media IDs exist.");
