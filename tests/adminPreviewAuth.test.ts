// COW-114: local admin UI preview is opt-in, local-only, and reaches only the
// local seeded D1 through a strictly gated booking Worker.
import assert from "node:assert/strict";
import test from "node:test";
import { LOCAL_PREVIEW_HEADER } from "../worker/auth.ts";
import {
  isLocalPreviewEnabled,
  LOCAL_PREVIEW_ENV,
  PREVIEW_EMAIL,
  previewAdminSession,
} from "../admin-app/lib/preview-auth.ts";
import { proxyDashboardRequest } from "../admin-app/lib/api-proxy.ts";
import { can } from "../admin-app/lib/auth.ts";

const saved = { ...process.env };
test.after(() => {
  process.env = saved;
});

function setEnv(values: Record<string, string | undefined>) {
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

const previewEnv = {
  NODE_ENV: "development",
  [LOCAL_PREVIEW_ENV]: "1",
  API_BASE_URL: "https://urban-cowboy-booking-engine.revrebel.workers.dev",
};

test("preview requires both an explicit opt-in and a local dev runtime", () => {
  setEnv({ NODE_ENV: undefined, [LOCAL_PREVIEW_ENV]: undefined });
  assert.equal(isLocalPreviewEnabled(), false);

  setEnv({ [LOCAL_PREVIEW_ENV]: "1" });
  assert.equal(isLocalPreviewEnabled(), false, "flag alone is not enough");

  setEnv({ NODE_ENV: "development", [LOCAL_PREVIEW_ENV]: undefined });
  assert.equal(isLocalPreviewEnabled(), false, "dev runtime alone is not enough");

  setEnv({ [LOCAL_PREVIEW_ENV]: "true" });
  assert.equal(isLocalPreviewEnabled(), false, "only the explicit value 1 opts in");

  setEnv({ [LOCAL_PREVIEW_ENV]: "1" });
  assert.equal(isLocalPreviewEnabled(), true);
});

test("a deployed runtime cannot activate preview even with the flag set", () => {
  setEnv({ NODE_ENV: "production", [LOCAL_PREVIEW_ENV]: "1" });
  assert.equal(isLocalPreviewEnabled(), false);
});

test("the preview identity is an admin with no credential material", () => {
  setEnv({ NODE_ENV: "development", [LOCAL_PREVIEW_ENV]: "1", TENANT_ID: "urban-cowboy" });
  const session = previewAdminSession();
  assert.equal(session.email, PREVIEW_EMAIL);
  assert.deepEqual(session.roles, ["viewer", "admin"]);
  assert.equal(session.tenantId, "urban-cowboy");
  assert.equal(session.expiresAt, null);
  assert.equal(can(session, "publish"), true);
  assert.equal(can(session, "destructiveMedia"), true);
  assert.equal(JSON.stringify(session).includes("jwt"), false);
  assert.equal(JSON.stringify(session).includes("assertion"), false);
});

test("preview reads go to the local Worker with only a marker header", async () => {
  setEnv(previewEnv);
  let target: URL | null = null;
  let forwarded: Headers | null = null;
  const response = await proxyDashboardRequest(
    new Request("https://localhost:5174/api/d1/rooms?tenant=urban-cowboy", {
      headers: {
        cookie: "CF_Session=secret",
        authorization: "Bearer client-token",
        "cf-access-jwt-assertion": "client-assertion",
        accept: "application/json",
      },
    }),
    "server-verified-assertion",
    {
      fetchImpl: (async (input: unknown, init?: RequestInit) => {
        target = new URL(String(input));
        forwarded = new Headers(init?.headers);
        return new Response(JSON.stringify({ items: [{ id: "seeded" }] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }) as typeof fetch,
    },
  );
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { items: [{ id: "seeded" }] });
  assert.equal(target?.origin, "http://localhost:8787", "never the deployed API_BASE_URL");
  assert.equal(target?.pathname, "/api/d1/rooms");
  assert.equal(target?.searchParams.get("tenant"), "urban-cowboy");
  assert.equal(forwarded?.get(LOCAL_PREVIEW_HEADER), "1");
  assert.equal(forwarded?.get("cf-access-jwt-assertion"), null);
  assert.equal(forwarded?.get("authorization"), null);
  assert.equal(forwarded?.get("cookie"), null);
  assert.equal(forwarded?.get("accept"), "application/json");
});

test("preview mutations reach the local Worker, never a deployed one", async () => {
  setEnv(previewEnv);
  let target: URL | null = null;
  let forwarded: Headers | null = null;
  let body: string | null = null;
  const response = await proxyDashboardRequest(
    new Request("https://localhost:5174/api/content/editor/items", {
      method: "POST",
      headers: { origin: "https://localhost:5174", "content-type": "application/json" },
      body: '{"name":"seeded"}',
    }),
    "server-verified-assertion",
    {
      fetchImpl: (async (input: unknown, init?: RequestInit) => {
        target = new URL(String(input));
        forwarded = new Headers(init?.headers);
        const raw = init?.body;
        body = typeof raw === "string"
          ? raw
          : raw instanceof ArrayBuffer
            ? new TextDecoder().decode(raw)
            : null;
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }) as typeof fetch,
    },
  );
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(target?.origin, "http://localhost:8787");
  assert.equal(forwarded?.get(LOCAL_PREVIEW_HEADER), "1");
  assert.equal(forwarded?.get("cf-access-jwt-assertion"), null);
  assert.equal(body, '{"name":"seeded"}');
});

test("a missing local Worker fails loudly instead of silently faking data", async () => {
  setEnv(previewEnv);
  const response = await proxyDashboardRequest(
    new Request("https://localhost:5174/api/d1/rooms"),
    "",
    { fetchImpl: (async () => { throw new Error("connection refused"); }) as typeof fetch },
  );
  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), { error: "local_preview_worker_unavailable" });
});

test("with preview disabled, the real proxy path and assertion are preserved", async () => {
  setEnv({ ...previewEnv, NODE_ENV: "production" });
  let target: URL | null = null;
  let forwarded: Headers | null = null;
  const response = await proxyDashboardRequest(
    new Request("https://localhost:5174/api/admin/rooms"),
    "real-assertion",
    {
      fetchImpl: (async (input: unknown, init?: RequestInit) => {
        target = new URL(String(input));
        forwarded = new Headers(init?.headers);
        return new Response(JSON.stringify({ items: [{ id: "real" }] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }) as typeof fetch,
    },
  );
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { items: [{ id: "real" }] });
  assert.equal(target?.origin, "https://urban-cowboy-booking-engine.revrebel.workers.dev");
  assert.equal(forwarded?.get("cf-access-jwt-assertion"), "real-assertion");
  assert.equal(forwarded?.get(LOCAL_PREVIEW_HEADER), null);
});
