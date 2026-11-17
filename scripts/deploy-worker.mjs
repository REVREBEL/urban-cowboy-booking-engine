#!/usr/bin/env node
import { readFileSync, existsSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(repo, ".dev.vars");
if (!existsSync(envPath)) {
  console.error("Missing .dev.vars");
  process.exit(1);
}
const values = {};
for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) values[m[1].trim()] = m[2].trim();
}
const required = ["CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_ZONE_ID"];
for (const k of required) {
  if (!values[k]) { console.error("Missing " + k); process.exit(1); }
}
const secrets = { CLOUDFLARE_API_TOKEN: values.CLOUDFLARE_API_TOKEN };
const dir = mkdtempSync(join(tmpdir(), "uc-deploy-"));
const secretsFile = join(dir, "secrets.json");
writeFileSync(secretsFile, JSON.stringify(secrets), { mode: 0o600 });
const result = spawnSync("npx", ["wrangler", "deploy", "--secrets-file", secretsFile], {
  cwd: repo,
  env: { ...process.env, CLOUDFLARE_API_TOKEN: values.CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID: values.CLOUDFLARE_ACCOUNT_ID },
  stdio: "inherit",
});
rmSync(dir, { recursive: true, force: true });
process.exit(result.status ?? 0);