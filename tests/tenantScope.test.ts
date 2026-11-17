// Tenant scope for the private analytics and recovery routes.
import assert from "node:assert/strict";
import { generateKeyPairSync, sign } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { analyticsSummary } from "../worker/d1-analytics.ts";
import { authorizeScopedRequest } from "../worker/auth.ts";
import { recoveryList } from "../worker/d1-recovery.ts";

const TEAM = "cow31-scope-test.cloudflareaccess.com";
const AUD = "cow31-scope-aud";
const TENANT = "urban-cowboy";
const OTHER = "other-property";

const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const jwk = publicKey.export({ format: "jwk" }) as { n: string; e: string };
const jwks = {
  keys: [{ kid: "scope-kid", kty: "RSA", alg: "RS256", use: "sig", n: jwk.n, e: jwk.e }],
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

function token(email: string): string {
  const header = { alg: "RS256", typ: "JWT", kid: "scope-kid" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: "principal-1",
    email,
    groups: [] as string[],
    iss: `https://${TEAM}`,
    aud: AUD,
    exp: now + 600,
    nbf: now - 60,
  };
  const input = `${b64u(JSON.stringify(header))}.${b64u(JSON.stringify(payload))}`;
  return `${input}.${b64u(sign("RSA-SHA256", Buffer.from(input), privateKey))}`;
}

const viewerJwt = token("viewer@example.com");
const adminJwt = token("admin@example.com");

function request(path: string, jwt: string): Request {
  return new Request(`https://example.com${path}`, {
    headers: { "cf-access-jwt-assertion": jwt },
  });
}

function fixture() {
  const db = new DatabaseSync(":memory:");
  db.exec(`
    CREATE TABLE analytics_daily (tenant_id TEXT NOT NULL, day TEXT NOT NULL, metric TEXT NOT NULL, value REAL NOT NULL);
    CREATE TABLE guest_sessions (id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL);
    CREATE TABLE cart_abandonments (id TEXT PRIMARY KEY, session_id TEXT NOT NULL, created_at TEXT NOT NULL);
  `);
  db.prepare("INSERT INTO analytics_daily (tenant_id, day, metric, value) VALUES (?1, ?2, ?3, ?4)")
    .run(TENANT, "2026-11-17", "revenue", 100);
  db.prepare("INSERT INTO analytics_daily (tenant_id, day, metric, value) VALUES (?1, ?2, ?3, ?4)")
    .run(OTHER, "2026-11-17", "revenue", 9000);
  db.prepare("INSERT INTO guest_sessions (id, tenant_id) VALUES (?1, ?2)").run("session-own", TENANT);
  db.prepare("INSERT INTO guest_sessions (id, tenant_id) VALUES (?1, ?2)").run("session-other", OTHER);
  db.prepare("INSERT INTO cart_abandonments (id, session_id, created_at) VALUES (?1, ?2, ?3)")
    .run("cart-own", "session-own", "2026-11-17T10:00:00Z");
  db.prepare("INSERT INTO cart_abandonments (id, session_id, created_at) VALUES (?1, ?2, ?3)")
    .run("cart-other", "session-other", "2026-11-17T11:00:00Z");

  const queries: string[] = [];
  const bindings: unknown[][] = [];
  const d1 = {
    prepare(sql: string) {
      queries.push(sql);
      return {
        bind(...values: unknown[]) {
          bindings.push(values);
          return {
            async all() {
              return { results: db.prepare(sql).all(...values), success: true };
            },
          };
        },
      };
    },
  };
  const env = {
    CF_ACCESS_TEAM_DOMAIN: TEAM,
    CF_ACCESS_AUD: AUD,
    ADMIN_EMAILS: "admin@example.com",
    TENANT_ID: TENANT,
    DB: d1,
  };
  return { db, env, queries, bindings };
}

test("authorizeScopedRequest returns the configured tenant from server bindings", async () => {
  const f = fixture();
  try {
    const result = await authorizeScopedRequest(request("/api/analytics/summary", viewerJwt), f.env, "viewer");
    assert.ok(!(result instanceof Response));
    assert.equal(result.tenantId, TENANT);
  } finally {
    f.db.close();
  }
});

test("analytics binds the configured tenant and accepts a matching caller value", async () => {
  const f = fixture();
  try {
    const response = await analyticsSummary({
      request: request("/api/analytics/summary?tenant=urban-cowboy", viewerJwt),
      env: f.env,
    });
    assert.equal(response.status, 200);
    const body = await response.json() as { items: Array<{ tenant_id: string }> };
    assert.deepEqual(body.items.map((row) => row.tenant_id), [TENANT]);
    assert.deepEqual(f.bindings, [[TENANT]]);
  } finally {
    f.db.close();
  }
});

test("cross-tenant analytics is denied before D1 is queried", async () => {
  const f = fixture();
  try {
    const response = await analyticsSummary({
      request: request("/api/analytics/summary?tenant=other-property", viewerJwt),
      env: f.env,
    });
    assert.equal(response.status, 403);
    assert.deepEqual(await response.json(), { error: "forbidden" });
    assert.equal(f.queries.length, 0);
  } finally {
    f.db.close();
  }
});

test("recovery binds the configured tenant for an admin", async () => {
  const f = fixture();
  try {
    const response = await recoveryList({ request: request("/api/recovery", adminJwt), env: f.env });
    assert.equal(response.status, 200);
    const body = await response.json() as { items: Array<{ id: string }> };
    assert.deepEqual(body.items.map((row) => row.id), ["cart-own"]);
    assert.deepEqual(f.bindings, [[TENANT]]);
  } finally {
    f.db.close();
  }
});

test("an admin cannot select another tenant's guest data", async () => {
  const f = fixture();
  try {
    const response = await recoveryList({
      request: request("/api/recovery?tenant=other-property", adminJwt),
      env: f.env,
    });
    assert.equal(response.status, 403);
    assert.equal(f.queries.length, 0);
  } finally {
    f.db.close();
  }
});

test("a viewer cannot reach recovery at any tenant", async () => {
  const f = fixture();
  try {
    const response = await recoveryList({ request: request("/api/recovery", viewerJwt), env: f.env });
    assert.equal(response.status, 403);
    assert.equal(f.queries.length, 0);
  } finally {
    f.db.close();
  }
});

test("missing tenant scope fails closed before D1 is queried", async () => {
  const f = fixture();
  try {
    const env = { ...f.env };
    delete env.TENANT_ID;
    const response = await analyticsSummary({ request: request("/api/analytics/summary", viewerJwt), env });
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { error: "tenant_scope_not_configured" });
    assert.equal(f.queries.length, 0);
  } finally {
    f.db.close();
  }
});
