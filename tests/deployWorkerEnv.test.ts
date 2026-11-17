import assert from "node:assert/strict";
import test from "node:test";
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repo = fileURLToPath(new URL("../", import.meta.url));

test("deployment renderer uses shared .env, keeps credentials private and emits valid config keys", () => {
  const root = mkdtempSync(join(tmpdir(), "urban-cowboy-render-test-"));
  try {
    mkdirSync(join(root, "scripts"));
    cpSync(join(repo, "wrangler.toml"), join(root, "wrangler.toml"));
    cpSync(join(repo, "scripts", "deploy-worker.mjs"), join(root, "scripts", "deploy-worker.mjs"));
    writeFileSync(join(root, "package.json"), '{"type":"module"}\n');
    writeFileSync(join(root, ".dev.vars"), "MEWS_BASE_URL=https://wrong-environment.example\n");
    writeFileSync(join(root, ".env"), [
      "CLOUDFLARE_ACCOUNT_ID=4c154709ffe87621073f9ecfa86a57dd",
      "CLOUDFLARE_API_TOKEN=private-cloudflare-api-token",
      'MEWS_BASE_URL="https://api.mews-demo.com"',
      "MEWS_APP_BASE_URL=https://api.mews-demo.com",
      "MEWS_HOTEL_ID=test-hotel-id",
      "MEWS_CONFIG_ID=test-config-id",
      "MEWS_ADULT_AGE_CATEGORY_ID=test-adult-category",
      "MEWS_CHILD_AGE_CATEGORY_ID=test-child-category",
      "MEWS_CLIENT=REVREBEL Urban Cowboy Booking Engine 1.0.0",
      "WEBFLOW_CMS_API_TOKEN=private-webflow-token",
      "ADMIN_TOKEN=private-admin-token",
      "WEBFLOW_SITE_ID=test-site-id",
    ].join("\n") + "\n", { mode: 0o600 });

    const result = spawnSync(process.execPath, [
      join(root, "scripts", "deploy-worker.mjs"),
      "--render-only",
    ], { cwd: root, encoding: "utf8", env: { PATH: process.env.PATH } });
    assert.equal(result.status, 0, result.stderr);
    const rendered = readFileSync(join(root, ".wrangler.generated.toml"), "utf8");
    assert.match(rendered, /^account_id = "4c154709ffe87621073f9ecfa86a57dd"$/m);
    assert.ok(rendered.indexOf("account_id = ") < rendered.indexOf("[assets]"),
      "account_id must precede every TOML table");
    assert.doesNotMatch(rendered.slice(rendered.indexOf("[[d1_databases]]")), /^account_id\s*=/m);
    assert.match(rendered, /^MEWS_BASE_URL = "https:\/\/api.mews-demo.com"$/m);
    assert.match(rendered, /^MEWS_HOTEL_ID = "test-hotel-id"$/m);
    assert.match(rendered, /^MEWS_CLIENT = "REVREBEL Urban Cowboy Booking Engine 1.0.0"$/m);
    assert.match(rendered, /^WEBFLOW_SITE_ID = "test-site-id"$/m);
    assert.match(rendered, /^\[\[d1_databases\]\]$/m);
    assert.doesNotMatch(rendered, /__ENV_|private-|wrong-environment|CLOUDFLARE_API_TOKEN\s*=/);
    assert.doesNotMatch(rendered, /^WEBHOOK_EVENTS =/m); // omitted if absent
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("deployment renderer fails when required .env values are missing", () => {
  const root = mkdtempSync(join(tmpdir(), "urban-cowboy-render-missing-"));
  try {
    mkdirSync(join(root, "scripts"));
    cpSync(join(repo, "wrangler.toml"), join(root, "wrangler.toml"));
    cpSync(join(repo, "scripts", "deploy-worker.mjs"), join(root, "scripts", "deploy-worker.mjs"));
    writeFileSync(join(root, "package.json"), '{"type":"module"}\n');
    writeFileSync(join(root, ".env"), "CLOUDFLARE_ACCOUNT_ID=4c154709ffe87621073f9ecfa86a57dd\n");
    const result = spawnSync(process.execPath, [
      join(root, "scripts", "deploy-worker.mjs"),
      "--render-only",
    ], { cwd: root, encoding: "utf8", env: { PATH: process.env.PATH } });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Missing required MEWS_BASE_URL/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("deployment renderer rejects a Cloudflare account that does not own Urban Cowboy D1", () => {
  const root = mkdtempSync(join(tmpdir(), "urban-cowboy-wrong-account-"));
  try {
    mkdirSync(join(root, "scripts"));
    cpSync(join(repo, "wrangler.toml"), join(root, "wrangler.toml"));
    cpSync(join(repo, "scripts", "deploy-worker.mjs"), join(root, "scripts", "deploy-worker.mjs"));
    writeFileSync(join(root, "package.json"), '{"type":"module"}\n');
    writeFileSync(join(root, ".env"), [
      "CLOUDFLARE_ACCOUNT_ID=dc163810899ef857be4a3ef92043168fc48d9",
      "MEWS_CLIENT=Urban Cowboy Booking Engine",
      "MEWS_BASE_URL=https://api.mews.com",
      "MEWS_APP_BASE_URL=https://app.mews.com",
      "MEWS_HOTEL_ID=test-hotel",
      "MEWS_CONFIG_ID=test-config",
    ].join("\n") + "\n");
    const result = spawnSync(process.execPath,
      [join(root, "scripts", "deploy-worker.mjs"), "--render-only"],
      { cwd: root, encoding: "utf8", env: { PATH: process.env.PATH } });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Cloudflare account mismatch/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
