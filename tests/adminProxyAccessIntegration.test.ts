import assert from "node:assert/strict";
import { generateKeyPairSync, sign } from "node:crypto";
import test from "node:test";
import { sessionFromClaims } from "../admin-app/lib/auth.ts";
import { BOOKING_API_ORIGIN } from "../admin-app/lib/env.ts";
import { proxyDashboardRequest } from "../admin-app/lib/api-proxy.ts";
import { verifyAccessJwt } from "../worker/access.ts";
import { authorizeScopedRequest, type AuthEnv } from "../worker/auth.ts";

const TEAM = "cow95-access-test.cloudflareaccess.com";
const AUD = "4bf8d1515fc028e57532548fc1687b5750d68f534a7d0cee0c1542cdf99a3255";
const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const jwk = publicKey.export({ format: "jwk" }) as { n: string; e: string };
const jwks = {
  keys: [{ kid: "cow95-kid", kty: "RSA", alg: "RS256", use: "sig", n: jwk.n, e: jwk.e }],
};
const forgedPrivateKey = generateKeyPairSync("rsa", { modulusLength: 2048 }).privateKey;
const env: AuthEnv = {
  CF_ACCESS_TEAM_DOMAIN: TEAM,
  CF_ACCESS_AUD: AUD,
  ADMIN_EMAILS: "admin@example.com",
  TENANT_ID: "urban-cowboy",
};

const originalFetch = globalThis.fetch;
const previousBase = process.env.API_BASE_URL;
const previousTimeout = process.env.API_REQUEST_TIMEOUT_MS;
globalThis.fetch = (async (input: unknown) => {
  if (String(input) === `https://${TEAM}/cdn-cgi/access/certs`) {
    return new Response(JSON.stringify(jwks), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }
  return new Response("not found", { status: 404 });
}) as typeof fetch;
process.env.API_BASE_URL = BOOKING_API_ORIGIN;
delete process.env.API_REQUEST_TIMEOUT_MS;

test.after(() => {
  globalThis.fetch = originalFetch;
  if (previousBase === undefined) delete process.env.API_BASE_URL;
  else process.env.API_BASE_URL = previousBase;
  if (previousTimeout === undefined) delete process.env.API_REQUEST_TIMEOUT_MS;
  else process.env.API_REQUEST_TIMEOUT_MS = previousTimeout;
});

const b64u = (value: string | Uint8Array) => Buffer.from(value).toString("base64url");

function accessJwt(options: {
  email?: string;
  expired?: boolean;
  aud?: string;
  issuer?: string;
  forged?: boolean;
} = {}): string {
  const header = { alg: "RS256", typ: "JWT", kid: "cow95-kid" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: options.email === "admin@example.com" ? "admin-1" : "viewer-1",
    email: options.email ?? "viewer@example.com",
    groups: [],
    iss: `https://${options.issuer ?? TEAM}`,
    aud: options.aud ?? AUD,
    exp: options.expired ? now - 1 : now + 600,
    nbf: now - 60,
  };
  const input = `${b64u(JSON.stringify(header))}.${b64u(JSON.stringify(payload))}`;
  const key = options.forged ? forgedPrivateKey : privateKey;
  return `${input}.${b64u(sign("RSA-SHA256", Buffer.from(input), key))}`;
}

async function adminSession(token: string) {
  const claims = await verifyAccessJwt(token, env);
  return claims ? sessionFromClaims(claims, env) : null;
}

function workerRequest(token: string, role: "viewer" | "admin", path = "/api/admin/rooms") {
  return authorizeScopedRequest(
    new Request(`${BOOKING_API_ORIGIN}${path}`, {
      headers: { "cf-access-jwt-assertion": token },
    }),
    env,
    role,
  );
}

function workerFetch(role: "viewer" | "admin"): typeof fetch {
  return async (input, init) => {
    const request = new Request(String(input), {
      method: init?.method,
      headers: init?.headers,
      body: init?.body,
    });
    const denied = await authorizeScopedRequest(request, env, role);
    if (denied instanceof Response) return denied;
    return new Response(JSON.stringify({ items: [] }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
}

test("a real signed admin assertion passes both verifiers and the proxy", async () => {
  const token = accessJwt({ email: "admin@example.com" });
  assert.deepEqual((await adminSession(token))?.roles, ["viewer", "admin"]);
  assert.equal((await workerRequest(token, "admin"))?.tenantId, "urban-cowboy");

  const response = await proxyDashboardRequest(
    new Request("https://admin.example/api/admin/rooms"),
    token,
    { fetchImpl: workerFetch("viewer") },
  );
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { items: [] });
});

test("a real signed viewer assertion reads through the proxy but cannot mutate", async () => {
  const token = accessJwt();
  assert.deepEqual((await adminSession(token))?.roles, ["viewer"]);
  assert.equal((await workerRequest(token, "viewer"))?.tenantId, "urban-cowboy");
  assert.equal((await workerRequest(token, "admin", "/api/content/editor/items"))?.status, 403);

  const read = await proxyDashboardRequest(
    new Request("https://admin.example/api/admin/media"),
    token,
    { fetchImpl: workerFetch("viewer") },
  );
  assert.equal(read.status, 200);

  const write = await proxyDashboardRequest(
    new Request("https://admin.example/api/content/editor/items", {
      method: "POST",
      headers: { origin: "https://admin.example", "content-type": "application/json" },
      body: JSON.stringify({ kind: "policy", slug: "gate2-test", payload: {} }),
    }),
    token,
    { fetchImpl: workerFetch("admin") },
  );
  assert.equal(write.status, 403);
  assert.deepEqual(await write.json(), { error: "forbidden" });
});

test("a signed admin mutation passes both verifiers through the proxy", async () => {
  const token = accessJwt({ email: "admin@example.com" });
  const response = await proxyDashboardRequest(
    new Request("https://admin.example/api/content/editor/items", {
      method: "POST",
      headers: { origin: "https://admin.example", "content-type": "application/json" },
      body: JSON.stringify({ kind: "policy", slug: "gate2-test", payload: {} }),
    }),
    token,
    { fetchImpl: workerFetch("admin") },
  );
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { items: [] });
});

test("a caller-supplied tenant is rejected at the worker boundary", async () => {
  const token = accessJwt({ email: "admin@example.com" });
  const response = await proxyDashboardRequest(
    new Request("https://admin.example/api/admin/rooms?tenant=other-tenant"),
    token,
    { fetchImpl: workerFetch("viewer") },
  );
  assert.equal(response.status, 403);
});

test("an upstream denial passes through without credential leakage", async () => {
  const token = accessJwt({ email: "admin@example.com" });
  let forwarded = new Headers();
  const response = await proxyDashboardRequest(
    new Request("https://admin.example/api/admin/rooms", {
      headers: {
        cookie: "CF_Session=secret",
        authorization: "Bearer browser",
        "cf-access-jwt-assertion": "client-forged",
      },
    }),
    token,
    {
      fetchImpl: (async (_input: unknown, init?: RequestInit) => {
        forwarded = new Headers(init?.headers);
        return new Response(JSON.stringify({ error: "forbidden" }), {
          status: 403,
          headers: { "content-type": "application/json" },
        });
      }) as typeof fetch,
    },
  );
  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), { error: "forbidden" });
  assert.equal(forwarded.get("cf-access-jwt-assertion"), token);
  assert.equal(forwarded.get("cookie"), null);
  assert.equal(forwarded.get("authorization"), null);
});

test("expired, wrong-audience, wrong-issuer and forged assertions fail both verifiers", async () => {
  const tokens = [
    accessJwt({ expired: true }),
    accessJwt({ aud: "b".repeat(64) }),
    accessJwt({ issuer: "other.cloudflareaccess.com" }),
    accessJwt({ forged: true }),
  ];
  for (const token of tokens) {
    assert.equal(await adminSession(token), null);
    assert.equal((await workerRequest(token, "viewer"))?.status, 401);
  }
});
