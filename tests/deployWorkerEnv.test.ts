import assert from "node:assert/strict";
import test from "node:test";
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repo = fileURLToPath(new URL("../", import.meta.url));

const baselineEnvLines = [
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
  "WEBFLOW_SITE_ID=111111111111111111111111",
  "WEBFLOW_RATE_CARD_COLLECTION_ID=222222222222222222222222",
  "WEBFLOW_CONTENT_SETTINGS_COLLECTION_ID=333333333333333333333333",
  "WEBFLOW_POLICY_LANGUAGE_ITEM_ID=444444444444444444444444",
  "WEBFLOW_ADD_ON_COLLECTION_ID=555555555555555555555555",
  "WEBFLOW_ROOM_TYPE_COLLECTION_ID=666666666666666666666666",
  "WEBFLOW_LOCATION_COLLECTION_ID=777777777777777777777777",
  "WEBFLOW_BUILDING_COLLECTION_ID=888888888888888888888888",
  "WEBFLOW_AMENITY_COLLECTION_ID=999999999999999999999999",
  "WEBFLOW_PHOTO_HOTSPOT_COLLECTION_ID=aaaaaaaaaaaaaaaaaaaaaaaa",
  "WEBFLOW_LOCATION_ITEM_ID=bbbbbbbbbbbbbbbbbbbbbbbb",
  "CONTENT_SOURCE=webflow",
  "CONTENT_SOURCE_POLICY_LANGUAGE=webflow",
  "CONTENT_SOURCE_SITE_SETTINGS=webflow",
  "CONTENT_SOURCE_ADD_ONS=webflow",
  "CONTENT_SOURCE_ROOM_GALLERIES=webflow",
  "PHOTO_HOTSPOT_SOURCE=webflow",
];

test("deployment renderer uses shared .env, keeps credentials private and emits valid config keys", () => {
  const root = mkdtempSync(join(tmpdir(), "urban-cowboy-render-test-"));
  try {
    mkdirSync(join(root, "scripts"));
    cpSync(join(repo, "wrangler.toml"), join(root, "wrangler.toml"));
    cpSync(join(repo, "scripts", "deploy-worker.mjs"), join(root, "scripts", "deploy-worker.mjs"));
    writeFileSync(join(root, "package.json"), '{"type":"module"}\n');
    writeFileSync(join(root, ".dev.vars"), "MEWS_BASE_URL=https://wrong-environment.example\n");
    writeFileSync(join(root, ".env"), baselineEnvLines.join("\n") + "\n", { mode: 0o600 });

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
    assert.match(rendered, /^WEBFLOW_SITE_ID = "111111111111111111111111"$/m);
    assert.match(rendered, /^CONTENT_SOURCE_SITE_SETTINGS = "webflow"$/m);
    assert.match(rendered, /^PHOTO_HOTSPOT_SOURCE = "webflow"$/m);
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
    assert.match(result.stderr, /Missing required MEWS_CLIENT/);
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
      // Must be a valid 32-hex Cloudflare account ID, otherwise the format
      // check rejects it before the ownership check can run.
      "CLOUDFLARE_ACCOUNT_ID=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
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

test("deployment renderer rejects a missing Webflow content identifier", () => {
  const root = mkdtempSync(join(tmpdir(), "urban-cowboy-missing-webflow-id-"));
  try {
    mkdirSync(join(root, "scripts"));
    cpSync(join(repo, "wrangler.toml"), join(root, "wrangler.toml"));
    cpSync(join(repo, "scripts", "deploy-worker.mjs"), join(root, "scripts", "deploy-worker.mjs"));
    writeFileSync(join(root, "package.json"), '{"type":"module"}\n');
    const lines = baselineEnvLines.filter((line) => !line.startsWith("WEBFLOW_LOCATION_COLLECTION_ID="));
    writeFileSync(join(root, ".env"), lines.join("\n") + "\n", { mode: 0o600 });
    const result = spawnSync(process.execPath,
      [join(root, "scripts", "deploy-worker.mjs"), "--render-only"],
      { cwd: root, encoding: "utf8", env: { PATH: process.env.PATH } });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Missing required WEBFLOW_LOCATION_COLLECTION_ID/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("deployment renderer rejects a placeholder Webflow identifier", () => {
  const root = mkdtempSync(join(tmpdir(), "urban-cowboy-placeholder-webflow-id-"));
  try {
    mkdirSync(join(root, "scripts"));
    cpSync(join(repo, "wrangler.toml"), join(root, "wrangler.toml"));
    cpSync(join(repo, "scripts", "deploy-worker.mjs"), join(root, "scripts", "deploy-worker.mjs"));
    writeFileSync(join(root, "package.json"), '{"type":"module"}\n');
    const lines = baselineEnvLines.map((line) =>
      line.startsWith("WEBFLOW_LOCATION_COLLECTION_ID=")
        ? "WEBFLOW_LOCATION_COLLECTION_ID=__SET_WEBFLOW_LOCATION_COLLECTION_ID__"
        : line,
    );
    writeFileSync(join(root, ".env"), lines.join("\n") + "\n", { mode: 0o600 });
    const result = spawnSync(process.execPath,
      [join(root, "scripts", "deploy-worker.mjs"), "--render-only"],
      { cwd: root, encoding: "utf8", env: { PATH: process.env.PATH } });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /WEBFLOW_LOCATION_COLLECTION_ID must be a 24-character Webflow identifier/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("deployment renderer refuses a D1 cutover under the baseline guard", () => {
  const root = mkdtempSync(join(tmpdir(), "urban-cowboy-baseline-flag-"));
  try {
    mkdirSync(join(root, "scripts"));
    cpSync(join(repo, "wrangler.toml"), join(root, "wrangler.toml"));
    cpSync(join(repo, "scripts", "deploy-worker.mjs"), join(root, "scripts", "deploy-worker.mjs"));
    writeFileSync(join(root, "package.json"), '{"type":"module"}\n');
    const lines = baselineEnvLines.map((line) =>
      line === "CONTENT_SOURCE_SITE_SETTINGS=webflow"
        ? "CONTENT_SOURCE_SITE_SETTINGS=d1"
        : line,
    );
    writeFileSync(join(root, ".env"), lines.join("\n") + "\n", { mode: 0o600 });
    const result = spawnSync(process.execPath,
      [join(root, "scripts", "deploy-worker.mjs"), "--render-only"],
      { cwd: root, encoding: "utf8", env: { PATH: process.env.PATH } });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /CONTENT_SOURCE_SITE_SETTINGS must remain webflow/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
