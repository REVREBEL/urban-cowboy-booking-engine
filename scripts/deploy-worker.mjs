#!/usr/bin/env node
/**
 * Urban Cowboy deployment: render public Worker bindings from the shared .env
 * and pass explicitly allowlisted private bindings using --secrets-file.
 *
 * npm run deploy                deploy code, rendered vars and Worker secrets
 * npm run deploy:render         generate the ignored config, no remote writes
 * npm run deploy:check          build + Wrangler dry-run, no remote writes
 *
 * The committed wrangler.toml is a template. Never deploy it directly.
 */
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { parseEnv } from "node:util";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const configTemplate = join(root, "wrangler.toml");
const renderedConfig = join(root, ".wrangler.generated.toml");
const args = new Set(process.argv.slice(2));
const renderOnly = args.has("--render-only");
const dryRun = args.has("--dry-run");
const sourceFlag = process.argv.indexOf("--env-file");
const sourcePath = sourceFlag === -1 ? join(root, ".env") : resolve(process.argv[sourceFlag + 1] ?? "");
const workerSecretNames = ["WEBFLOW_CMS_API_TOKEN", "ADMIN_TOKEN"];
const requiredVars = [
  "MEWS_CLIENT",
  "MEWS_BASE_URL",
  "MEWS_APP_BASE_URL",
  "MEWS_HOTEL_ID",
  "MEWS_CONFIG_ID",
  // Baseline Webflow content must never deploy silently empty/default.
  "WEBFLOW_SITE_ID",
  "WEBFLOW_RATE_CARD_COLLECTION_ID",
  "WEBFLOW_CONTENT_SETTINGS_COLLECTION_ID",
  "WEBFLOW_POLICY_LANGUAGE_ITEM_ID",
  "WEBFLOW_ADD_ON_COLLECTION_ID",
  "WEBFLOW_ROOM_TYPE_COLLECTION_ID",
  "WEBFLOW_LOCATION_COLLECTION_ID",
  "WEBFLOW_BUILDING_COLLECTION_ID",
  "WEBFLOW_AMENITY_COLLECTION_ID",
  "WEBFLOW_PHOTO_HOTSPOT_COLLECTION_ID",
  "WEBFLOW_LOCATION_ITEM_ID",
];
const requiredWebflowFlags = [
  "CONTENT_SOURCE",
  "CONTENT_SOURCE_POLICY_LANGUAGE",
  "CONTENT_SOURCE_SITE_SETTINGS",
  "CONTENT_SOURCE_ADD_ONS",
  "CONTENT_SOURCE_ROOM_GALLERIES",
  "PHOTO_HOTSPOT_SOURCE",
];
const requiredSecrets = ["ADMIN_TOKEN"];


function fail(message) {
  console.error("Deploy configuration error: " + message);
  process.exit(1);
}
if (!existsSync(sourcePath)) fail("Shared environment file missing: " + sourcePath);
if (!existsSync(configTemplate)) fail("Missing wrangler.toml");
const envText = readFileSync(sourcePath, "utf8");
// Duplicate assignments in a shared .env are dangerous: later demo values can
// silently override production credentials. Fail before any build or deploy.
const assignments = [...envText.matchAll(/^\s*(?:export\s+)?([A-Z_][A-Z0-9_]*)\s*=/gm)];
const seen = new Set();
for (const [, key] of assignments) {
  if (seen.has(key)) fail("Duplicate .env key " + key + "; keep one active value per key");
  seen.add(key);
}
const fromFile = parseEnv(envText);
// The selected file is authoritative for application runtime bindings.
// Cloudflare credentials may come from the process environment, as in CI.
const value = (key) => fromFile[key]?.trim();
const accountId = value("CLOUDFLARE_ACCOUNT_ID") || process.env.CLOUDFLARE_ACCOUNT_ID;
const apiToken = (process.env.CLOUDFLARE_API_TOKEN || value("CLOUDFLARE_API_TOKEN") || "")
  .replace(/^Bearer\s+/i, "").trim();

if (!accountId || !/^[0-9a-f]{32}$/i.test(accountId)) fail("Missing/invalid CLOUDFLARE_ACCOUNT_ID");
const expectedAccountId = "4c154709ffe87621073f9ecfa86a57dd";
if (accountId.toLowerCase() !== expectedAccountId) {
  fail("Cloudflare account mismatch. Urban Cowboy belongs to " + expectedAccountId + ", but .env points to " + accountId);
}
if (process.env.CLOUDFLARE_ACCOUNT_ID &&
    process.env.CLOUDFLARE_ACCOUNT_ID.toLowerCase() !== expectedAccountId) {
  fail("Shell CLOUDFLARE_ACCOUNT_ID conflicts with the Urban Cowboy account. Unset or correct it.");
}
for (const key of requiredVars) if (!value(key)) fail("Missing required " + key);
for (const key of requiredVars.filter((name) => name.startsWith("WEBFLOW_"))) {
  if (!/^[0-9a-f]{24}$/i.test(value(key))) {
    fail(key + " must be a 24-character Webflow identifier");
  }
}
for (const key of requiredWebflowFlags) {
  const flag = value(key);
  if (!flag) fail("Missing required baseline content flag " + key);
  if (flag.toLowerCase() !== "webflow") {
    fail(key + " must remain webflow for the baseline deployment; cutover requires the reviewed Gate 2 runbook");
  }
}
if (!renderOnly) {
  for (const key of requiredSecrets) if (!value(key)) fail("Missing required Worker secret " + key);
  if (!dryRun && !apiToken) fail("Missing CLOUDFLARE_API_TOKEN");
}

let template = readFileSync(configTemplate, "utf8");
if (/^account_id\s*=/m.test(template)) fail("Remove hardcoded account_id from the TOML template");
if (!template.includes('[[d1_databases]]')) fail("Missing D1 database configuration");
const substituted = [];
template = template.replace(
  /^([A-Z][A-Z0-9_]*)\s*=\s*"__ENV_([A-Z][A-Z0-9_]*)__"\s*$/gm,
  (line, key, referencedKey) => {
    if (key !== referencedKey) fail("Mismatched environment template variable: " + key);
    if (workerSecretNames.includes(key) || key.startsWith("CLOUDFLARE_")) {
      fail("Secret or Cloudflare credential attempted as a plaintext Worker variable: " + key);
    }
    substituted.push(key);
    const v = value(key);
    // Omit optional bindings rather than deploying empty strings.
    return v ? key + " = " + JSON.stringify(v) : "";
  },
);
if (substituted.length === 0 || template.includes("__ENV_")) {
  fail("Unresolved or missing Wrangler variable placeholders");
}
// Account must appear before all TOML tables, not inside [[d1_databases]].
template = "account_id = " + JSON.stringify(accountId) + "\n" + template;
if (!template.includes('database_id = "0d09ca5a-74fe-4e83-a058-b8aa5fb21562"')) {
  fail("D1 database ID does not match the Urban Cowboy Cloudflare account");
}
// Nonsecret values, but keep file private and outside version control anyway.
writeFileSync(renderedConfig, template, { encoding: "utf8", mode: 0o600 });
console.log("Rendered " + substituted.length + " Worker variable declarations from " + sourcePath);
console.log("Mews API endpoint: " + value("MEWS_BASE_URL") + (renderOnly ? " (render-only)" : ""));
console.log("Configuration: .wrangler.generated.toml (gitignored)");
if (renderOnly) process.exit(0);

const env = { ...process.env, CLOUDFLARE_ACCOUNT_ID: accountId };
if (apiToken) env.CLOUDFLARE_API_TOKEN = apiToken;
const wrangler = join(root, "node_modules", ".bin", "wrangler");
if (!existsSync(wrangler)) fail("Install dependencies with npm ci before deploying");

function run(command, commandArgs) {
  const proc = spawnSync(command, commandArgs, { cwd: root, env, stdio: "inherit" });
  if (proc.error) fail("Could not start " + command + ": " + proc.error.message);
  if (proc.status !== 0) throw new Error(`Command failed (${proc.status ?? "unknown"}): ${command}`);
}

run("npm", ["run", "build"]);
const flags = ["deploy", "--config", renderedConfig];
if (dryRun) {
  run(wrangler, [...flags, "--dry-run"]);
  console.log("Dry-run passed. No Worker secrets uploaded and no deployment performed.");
} else {
  const temp = mkdtempSync(join(tmpdir(), "uc-worker-secrets-"));
  const secretsFile = join(temp, "worker-secrets.json");
  try {
    // Only worker-facing secrets. Never upload the Cloudflare API token or
    // other shared-project credentials to the Worker.
    const secrets = Object.fromEntries(workerSecretNames
      .filter((key) => value(key))
      .map((key) => [key, value(key)]));
    writeFileSync(secretsFile, JSON.stringify(secrets), { mode: 0o600 });
    run(wrangler, [...flags, "--secrets-file", secretsFile]);
    console.log("Worker deployed with rendered vars and approved secrets.");
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}
