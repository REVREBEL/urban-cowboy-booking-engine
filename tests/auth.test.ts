// Role-test matrix for the verified Cloudflare Access principal.
import assert from "node:assert/strict";
import { generateKeyPairSync, sign, type KeyObject } from "node:crypto";
import test from "node:test";
import { requireAdmin, requireViewer, principalFromClaims, type AuthEnv } from "../worker/auth.ts";

const TEAM = "cow31-test.cloudflareaccess.com";
const AUD = "cow31-test-aud";
const { publicKey, privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const otherKey = generateKeyPairSync("rsa", { modulusLength: 2048 }).privateKey;
const exported = publicKey.export({ format: "jwk" }) as { n: string; e: string };
const jwks = {
  keys: [{ kid: "test-kid", kty: "RSA", alg: "RS256", use: "sig", n: exported.n, e: exported.e }],
};

const realFetch = globalThis.fetch;
globalThis.fetch = (async (input: unknown) => {
  if (String(input) === `https://${TEAM}/cdn-cgi/access/certs`) {
    return new Response(JSON.stringify(jwks), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }
  return new Response("not found", { status: 404 });
}) as typeof fetch;

const b64u = (value: string | Uint8Array) => Buffer.from(value).toString("base64url");

function token(
  overrides: Record<string, unknown> = {},
  options: { kid?: string; alg?: string; key?: KeyObject } = {},
): string {
  const header = { alg: options.alg ?? "RS256", typ: "JWT", kid: options.kid ?? "test-kid" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: "user-1",
    email: "viewer@example.com",
    groups: [] as string[],
    iss: `https://${TEAM}`,
    aud: AUD,
    exp: now + 600,
    nbf: now - 60,
    ...overrides,
  };
  const input = `${b64u(JSON.stringify(header))}.${b64u(JSON.stringify(payload))}`;
  return `${input}.${b64u(sign("RSA-SHA256", Buffer.from(input), options.key ?? privateKey))}`;
}

const request = (jwt?: string, header = "cf-access-jwt-assertion") =>
  new Request("https://example.com/api/recovery", {
    headers: jwt ? { [header]: jwt } : {},
  });

const env = (overrides: Record<string, string> = {}): AuthEnv => ({
  CF_ACCESS_TEAM_DOMAIN: TEAM,
  CF_ACCESS_AUD: AUD,
  ADMIN_EMAILS: "admin@example.com",
  ADMIN_GROUPS: "admin-group-id",
  ...overrides,
});

test.after(() => {
  globalThis.fetch = realFetch;
});

test("fails closed when Access is not configured, even with a legacy shared token", async () => {
  const legacy = env({ ADMIN_TOKEN: "secret" });
  delete legacy.CF_ACCESS_TEAM_DOMAIN;
  delete legacy.CF_ACCESS_AUD;
  assert.equal((await requireViewer(request("secret", "authorization"), legacy))?.status, 401);
  assert.equal((await requireAdmin(request(token()), legacy))?.status, 401);
});

test("rejects missing, malformed and wrongly signed tokens", async () => {
  assert.equal((await requireViewer(request(), env()))?.status, 401);
  assert.equal((await requireViewer(request("not-a-jwt"), env()))?.status, 401);
  assert.equal((await requireViewer(request(token({}, { key: otherKey })), env()))?.status, 401);
  assert.equal((await requireViewer(request(token({}, { kid: "unknown-kid" })), env()))?.status, 401);
  assert.equal((await requireViewer(request(token({}, { alg: "HS256" })), env()))?.status, 401);
});

test("rejects a token for the wrong issuer, audience or expired window", async () => {
  assert.equal((await requireViewer(request(token({ iss: "https://evil.example" })), env()))?.status, 401);
  assert.equal((await requireViewer(request(token({ aud: "other-aud" })), env()))?.status, 401);
  assert.equal((await requireViewer(request(token({ aud: ["other-aud"] })), env()))?.status, 401);
  const now = Math.floor(Date.now() / 1000);
  assert.equal((await requireViewer(request(token({ exp: now - 1 })), env()))?.status, 401);
  assert.equal((await requireViewer(request(token({ nbf: now + 3600 })), env()))?.status, 401);
});

test("a verified viewer can read aggregated analytics but not PII routes", async () => {
  const jwt = token();
  assert.equal(await requireViewer(request(jwt), env()), null);
  assert.equal((await requireAdmin(request(jwt), env()))?.status, 403);
});

test("admin role from an allowlisted email (case-insensitive)", async () => {
  const jwt = token({ email: "Admin@Example.com" });
  assert.equal(await requireAdmin(request(jwt), env({ ADMIN_EMAILS: " admin@example.com " })), null);
});

test("admin role from an allowlisted Access group", async () => {
  const jwt = token({ email: "contractor@example.com", groups: ["ops", "ADMIN-GROUP-ID"] });
  assert.equal(await requireAdmin(request(jwt), env()), null);
});

test("an allowlist alone cannot grant a role without a verified token", async () => {
  assert.equal((await requireAdmin(request(), env({ ADMIN_EMAILS: "admin@example.com" })))?.status, 401);
});

test("Bearer header is accepted as an alternative Access transport", async () => {
  assert.equal(await requireViewer(request(`Bearer ${token()}`, "authorization"), env()), null);
});

test("role matrix is derived only from verified claims and bound allowlists", () => {
  const base = { email: "viewer@example.com", groups: [] as string[] };
  assert.deepEqual(principalFromClaims(base, env()).roles, ["viewer"]);
  assert.deepEqual(
    principalFromClaims({ ...base, email: "admin@example.com" }, env()).roles,
    ["viewer", "admin"],
  );
  assert.deepEqual(
    principalFromClaims({ ...base, groups: ["admin-group-id"] }, env()).roles,
    ["viewer", "admin"],
  );
  assert.deepEqual(principalFromClaims(base, env({ ADMIN_EMAILS: "" })).roles, ["viewer"]);
});
