// COW-114: local admin UI preview is opt-in, local-only and API-safe.
import assert from "node:assert/strict";
import test from "node:test";
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

test("preview API reads are local fixtures and never call the booking Worker", async () => {
  setEnv({
    NODE_ENV: "development",
    [LOCAL_PREVIEW_ENV]: "1",
    API_BASE_URL: "https://urban-cowboy-booking-engine.revrebel.workers.dev",
  });
  let fetchCalls = 0;
  const response = await proxyDashboardRequest(
    new Request("https://localhost:5174/api/admin/rooms", {
      headers: {
        cookie: "CF_Session=secret",
        authorization: "Bearer client-token",
        "cf-access-jwt-assertion": "client-assertion",
      },
    }),
    "server-verified-assertion",
    { fetchImpl: (async () => { fetchCalls += 1; return new Response("unexpected"); }) as typeof fetch },
  );
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { items: [], preview: true });
  assert.equal(fetchCalls, 0, "no upstream call in preview mode");
});

test("preview API mutations are refused without contacting the booking Worker", async () => {
  setEnv({ NODE_ENV: "development", [LOCAL_PREVIEW_ENV]: "1" });
  let fetchCalls = 0;
  const response = await proxyDashboardRequest(
    new Request("https://localhost:5174/api/content/editor/items", {
      method: "POST",
      headers: { origin: "https://localhost:5174", "content-type": "application/json" },
      body: "{}",
    }),
    "server-verified-assertion",
    { fetchImpl: (async () => { fetchCalls += 1; return new Response("unexpected"); }) as typeof fetch },
  );
  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), { error: "preview_read_only" });
  assert.equal(fetchCalls, 0);
});

test("with production parity restored, the real proxy path is used", async () => {
  setEnv({
    NODE_ENV: "production",
    [LOCAL_PREVIEW_ENV]: "1",
    API_BASE_URL: "https://urban-cowboy-booking-engine.revrebel.workers.dev",
  });
  let forwarded: Headers | null = null;
  const response = await proxyDashboardRequest(
    new Request("https://localhost:5174/api/admin/rooms"),
    "real-assertion",
    {
      fetchImpl: (async (_input: unknown, init?: RequestInit) => {
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
  assert.equal(forwarded instanceof Headers && forwarded.get("cf-access-jwt-assertion"), "real-assertion");
});
