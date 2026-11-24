#!/usr/bin/env node
/**
 * Deploy the admin Worker with only its approved nonsecret runtime bindings.
 * The shared .env remains the source of deployment values; no secret is added
 * to cloudflare.config.ts or forwarded as an admin Worker binding.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { parseEnv } from "node:util";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const sourceFlag = args.indexOf("--env-file");
const sourcePath = sourceFlag === -1 ? join(root, ".env") : resolve(args[sourceFlag + 1] ?? "");
const expectedAccountId = "4c154709ffe87621073f9ecfa86a57dd";
const expectedAdminAud = "4bf8d1515fc028e57532548fc1687b5750d68f534a7d0cee0c1542cdf99a3255";
const trustedBookingApiOrigin = "https://urban-cowboy-booking-engine.revrebel.workers.dev";
const requiredVars = [
  "CF_ACCESS_TEAM_DOMAIN",
  "CF_ACCESS_AUD",
  "ADMIN_EMAILS",
  "TENANT_ID",
  "API_BASE_URL",
];
const optionalVars = ["ADMIN_GROUPS", "API_REQUEST_TIMEOUT_MS"];

function fail(message) {
  console.error("Admin deploy configuration error: " + message);
  process.exit(1);
}

if (!sourcePath || !existsSync(sourcePath)) fail("Shared environment file missing: " + sourcePath);
const envText = readFileSync(sourcePath, "utf8");
const assignments = [...envText.matchAll(/^\s*(?:export\s+)?([A-Z_][A-Z0-9_]*)\s*=/gm)];
const seen = new Set();
for (const [, key] of assignments) {
  if (seen.has(key)) fail("Duplicate .env key " + key + "; keep one active value per key");
  seen.add(key);
}
const fromFile = parseEnv(envText);
const value = (key) => fromFile[key]?.trim();
const accountId = value("CLOUDFLARE_ACCOUNT_ID") || process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
const apiToken = (process.env.CLOUDFLARE_API_TOKEN || value("CLOUDFLARE_API_TOKEN") || "")
  .replace(/^Bearer\s+/i, "")
  .trim();

if (!accountId || !/^[0-9a-f]{32}$/i.test(accountId)) fail("Missing/invalid CLOUDFLARE_ACCOUNT_ID");
if (accountId.toLowerCase() !== expectedAccountId) {
  fail("Cloudflare account mismatch. Urban Cowboy belongs to " + expectedAccountId);
}
if (process.env.CLOUDFLARE_ACCOUNT_ID &&
    process.env.CLOUDFLARE_ACCOUNT_ID.trim().toLowerCase() !== expectedAccountId) {
  fail("Shell CLOUDFLARE_ACCOUNT_ID conflicts with the Urban Cowboy account");
}
for (const key of requiredVars) if (!value(key)) fail("Missing required " + key);

const teamDomain = value("CF_ACCESS_TEAM_DOMAIN").replace(/^https?:\/\//i, "").replace(/\/+$/, "");
if (!/^[a-z0-9][a-z0-9.-]*\.cloudflareaccess\.com$/i.test(teamDomain)) {
  fail("CF_ACCESS_TEAM_DOMAIN must be a Cloudflare Access team hostname");
}
if (!/^[a-f0-9]{64}$/i.test(value("CF_ACCESS_AUD"))) {
  fail("CF_ACCESS_AUD must be the 64-character Access application AUD");
}
if (value("CF_ACCESS_AUD").toLowerCase() !== expectedAdminAud) {
  fail("CF_ACCESS_AUD does not match the Urban Cowboy admin Access application");
}
if (!value("ADMIN_EMAILS").split(",").every((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))) {
  fail("ADMIN_EMAILS must contain comma-separated email addresses");
}
if (!/^[a-z0-9][a-z0-9_-]*$/i.test(value("TENANT_ID"))) {
  fail("TENANT_ID must be a simple tenant identifier");
}
let apiBase;
try {
  apiBase = new URL(value("API_BASE_URL"));
} catch {
  fail("API_BASE_URL must be an absolute http(s) origin");
}
if (apiBase.protocol !== "https:" || apiBase.username || apiBase.password ||
    apiBase.search || apiBase.hash || !/^\/+$/.test(apiBase.pathname)) {
  fail("API_BASE_URL must be an https origin without credentials, path, query or fragment");
}
if (apiBase.origin !== trustedBookingApiOrigin) {
  fail("API_BASE_URL is not the approved Urban Cowboy booking Worker origin");
}
const timeout = value("API_REQUEST_TIMEOUT_MS");
if (timeout !== undefined && (!/^\d+$/.test(timeout) || Number(timeout) < 1000 || Number(timeout) > 60000)) {
  fail("API_REQUEST_TIMEOUT_MS must be an integer between 1000 and 60000");
}
if (!checkOnly && !apiToken) fail("Missing CLOUDFLARE_API_TOKEN");

const childEnv = { ...process.env, CLOUDFLARE_ACCOUNT_ID: accountId };
for (const key of [...requiredVars, ...optionalVars]) {
  const bindingValue = value(key);
  if (bindingValue) childEnv[key] = bindingValue;
  else delete childEnv[key];
}
childEnv.CF_ACCESS_TEAM_DOMAIN = teamDomain;
childEnv.API_BASE_URL = apiBase.origin;
if (apiToken) childEnv.CLOUDFLARE_API_TOKEN = apiToken;

console.log("Admin deployment configuration validated from " + sourcePath);
console.log("Runtime bindings: " + [...requiredVars, ...optionalVars.filter((key) => value(key))].join(", "));
if (checkOnly) {
  console.log("Check passed. No build, upload or deployment performed.");
  process.exit(0);
}

const result = spawnSync("npm", ["run", "deploy", "-w", "admin-app"], {
  cwd: root,
  env: childEnv,
  stdio: "inherit",
});
if (result.error) fail("Could not start admin deploy: " + result.error.message);
if (result.status !== 0) fail("Admin deploy failed with exit code " + (result.status ?? "unknown"));
