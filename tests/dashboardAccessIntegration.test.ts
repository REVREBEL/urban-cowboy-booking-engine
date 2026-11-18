// COW-37 bridge test: dashboard API requests work with the Access JWT that
// Cloudflare injects, and a Supabase token alone is not accepted by the Worker.
import assert from "node:assert/strict";
import { generateKeyPairSync, sign } from "node:crypto";
import test from "node:test";
import { createDashboardApi } from "../src/dashboard/api.ts";
import { requireViewer, type AuthEnv } from "../worker/auth.ts";

const TEAM = "cow37-access-test.cloudflareaccess.com";
const AUD = "cow37-access-aud";
const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const jwk = publicKey.export({ format: "jwk" }) as { n: string; e: string };
const jwks = {
  keys: [{ kid: "cow37-kid", kty: "RSA", alg: "RS256", use: "sig", n: jwk.n, e: jwk.e }],
};

const originalFetch = globalThis.fetch;
globalThis.fetch = (async (input: unknown) => {
  if (String(input) === `https://${TEAM}/cdn-cgi/access/certs`) {
    return new Response(JSON.stringify(jwks), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }
  return new Response("not found", { status: 404 });
}) as typeof fetch;

test.after(() => {
  globalThis.fetch = originalFetch;
});

const b64u = (value: string | Uint8Array) => Buffer.from(value).toString("base64url");

function accessJwt(): string {
  const header = { alg: "RS256", typ: "JWT", kid: "cow37-kid" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: "admin-1",
    email: "admin@example.com",
    groups: [],
    iss: `https://${TEAM}`,
    aud: AUD,
    exp: now + 600,
    nbf: now - 60,
  };
  const input = `${b64u(JSON.stringify(header))}.${b64u(JSON.stringify(payload))}`;
  return `${input}.${b64u(sign("RSA-SHA256", Buffer.from(input), privateKey))}`;
}

const env: AuthEnv = {
  CF_ACCESS_TEAM_DOMAIN: TEAM,
  CF_ACCESS_AUD: AUD,
  ADMIN_EMAILS: "admin@example.com",
  TENANT_ID: "urban-cowboy",
};

test("a dashboard API call is authorized by the injected Access JWT", async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const api = createDashboardApi({
    fetchImpl: (async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push({ url: String(input), init });
      return new Response(JSON.stringify({ items: [] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }) as typeof fetch,
  });

  await api.get("/api/analytics/summary", { tenant: "urban-cowboy" });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].init?.credentials, "same-origin");

  const base = `https://dashboard.example${calls[0].url}`;
  const withAccess = new Request(base, calls[0].init);
  // The edge injects this header after validating the Access cookie.
  withAccess.headers.set("cf-access-jwt-assertion", accessJwt());
  assert.equal(await requireViewer(withAccess, env), null);

  const withSupabaseOnly = new Request(base, calls[0].init);
  withSupabaseOnly.headers.set("authorization", "Bearer supabase-access-token");
  assert.equal((await requireViewer(withSupabaseOnly, env))?.status, 401);
});
