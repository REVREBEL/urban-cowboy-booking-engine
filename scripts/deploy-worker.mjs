#!/usr/bin/env node
import { readFileSync, existsSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const configPath = join(repo, "wrangler.toml");
const envPath = existsSync(join(repo, ".dev.vars")) ? join(repo, ".dev.vars") : join(repo, ".env");
if (!existsSync(envPath)) { console.error("Missing .dev.vars/.env"); process.exit(1); }

const values = {};
for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) values[m[1].trim()] = m[2].trim();
}
// Allow process env to override local file
for (const k of ["CLOUDFLARE_API_TOKEN","CLOUDFLARE_ACCOUNT_ID","CLOUDFLARE_ZONE_ID"]) {
  if (process.env[k]) values[k] = process.env[k];
}

// Normalize bearer prefix on token
if (values.CLOUDFLARE_API_TOKEN) {
  values.CLOUDFLARE_API_TOKEN = values.CLOUDFLARE_API_TOKEN.replace(/^Bearer\s+/i, "").trim();
}

const required = ["CLOUDFLARE_API_TOKEN"];
for (const k of required) if (!values[k]) { console.error("Missing " + k); process.exit(1); }

// Parse toml vars section minimally: read raw config and inject vars via JSON? 
// Instead, create a temp JSONC config overriding vars with env values.
const baseConfig = readFileSync(configPath, "utf8");
// We'll pass secrets via secrets file and vars via --var flags? Wrangler supports --var key=value.
const varArgs = [];
for (const [k, v] of Object.entries(values)) {
  if (k !== "CLOUDFLARE_API_TOKEN") varArgs.push("--var", `${k}:${v}`);
}

const dir = mkdtempSync(join(tmpdir(), "uc-deploy-"));
const secretsFile = join(dir, "secrets.json");
writeFileSync(secretsFile, JSON.stringify({ CLOUDFLARE_API_TOKEN: values.CLOUDFLARE_API_TOKEN }), { mode: 0o600 });

const result = spawnSync("npx", ["wrangler", "deploy", "--secrets-file", secretsFile, ...varArgs], {
  cwd: repo,
  env: { ...process.env, CLOUDFLARE_API_TOKEN: values.CLOUDFLARE_API_TOKEN },
  stdio: "inherit",
});
rmSync(dir, { recursive: true, force: true });
process.exit(result.status ?? 0);