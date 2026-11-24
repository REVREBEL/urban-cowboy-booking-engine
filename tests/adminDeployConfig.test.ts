import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import test from "node:test";

const script = new URL("../scripts/deploy-admin.mjs", import.meta.url);
const scriptPath = fileURLToPath(script);
const accountId = "4c154709ffe87621073f9ecfa86a57dd";
const aud = "4bf8d1515fc028e57532548fc1687b5750d68f534a7d0cee0c1542cdf99a3255";
const validEnv = [
  `CLOUDFLARE_ACCOUNT_ID=${accountId}`,
  "CF_ACCESS_TEAM_DOMAIN=revrebel.cloudflareaccess.com",
  `CF_ACCESS_AUD=${aud}`,
  "ADMIN_EMAILS=gary@revrebel.io",
  "TENANT_ID=urban-cowboy",
  "API_BASE_URL=https://urban-cowboy-booking-engine.revrebel.workers.dev",
].join("\n");

function check(content: string) {
  const directory = mkdtempSync(join(tmpdir(), "uc-admin-deploy-check-"));
  const path = join(directory, ".env");
  writeFileSync(path, content, { mode: 0o600 });
  try {
    return spawnSync(process.execPath, [scriptPath, "--check", "--env-file", path], {
      encoding: "utf8",
      env: { ...process.env, CLOUDFLARE_API_TOKEN: "", CLOUDFLARE_ACCOUNT_ID: "" },
    });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test("admin deploy check accepts the approved nonsecret binding contract without a token", () => {
  const result = check(validEnv + "\nAPI_REQUEST_TIMEOUT_MS=8000\nADMIN_GROUPS=admin-group\n");
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Runtime bindings: CF_ACCESS_TEAM_DOMAIN, CF_ACCESS_AUD, ADMIN_EMAILS, TENANT_ID, API_BASE_URL, ADMIN_GROUPS, API_REQUEST_TIMEOUT_MS/);
  assert.match(result.stdout, /No build, upload or deployment performed/);
  assert.doesNotMatch(result.stdout + result.stderr, new RegExp(aud));
});

test("admin deploy check rejects duplicate keys and the wrong account before deployment", () => {
  const duplicate = check(validEnv + "\nAPI_BASE_URL=https://other.example\n");
  assert.equal(duplicate.status, 1);
  assert.match(duplicate.stderr, /Duplicate \.env key API_BASE_URL/);

  const wrongAccount = check(validEnv.replace(accountId, "0".repeat(32)));
  assert.equal(wrongAccount.status, 1);
  assert.match(wrongAccount.stderr, /Cloudflare account mismatch/);
});

test("admin deploy check rejects missing or unsafe runtime values", () => {
  const cases: Array<[string, RegExp]> = [
    [validEnv.replace("API_BASE_URL=https://urban-cowboy-booking-engine.revrebel.workers.dev", ""), /Missing required API_BASE_URL/],
    [validEnv.replace(aud, "not-an-aud"), /64-character Access application AUD/],
    [validEnv.replace(aud, "b".repeat(64)), /does not match the Urban Cowboy admin Access application/],
    [validEnv.replace("revrebel.cloudflareaccess.com", "https://revrebel.cloudflareaccess.com/admin"), /team hostname/],
    [validEnv.replace("https://urban-cowboy-booking-engine.revrebel.workers.dev", "https://booking.example/v1"), /https origin/],
    [validEnv.replace("https://urban-cowboy-booking-engine.revrebel.workers.dev", "http://booking.example"), /https origin/],
    [validEnv.replace("https://urban-cowboy-booking-engine.revrebel.workers.dev", "https://unrelated.example"), /approved Urban Cowboy booking Worker origin/],
    [validEnv + "\nAPI_REQUEST_TIMEOUT_MS=5\n", /between 1000 and 60000/],
  ];
  for (const [content, message] of cases) {
    const result = check(content);
    assert.equal(result.status, 1, content);
    assert.match(result.stderr, message);
  }
});
