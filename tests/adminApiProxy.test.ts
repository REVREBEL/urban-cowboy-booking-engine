import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createAdminDashboardApi } from "../admin-app/lib/dashboard-api.ts";
import { isAllowedDashboardApiPath, proxyDashboardRequest } from "../admin-app/lib/api-proxy.ts";

function withProxyEnv(apiBaseUrl: string | undefined, run: () => void | Promise<void>) {
  const previousBase = process.env.API_BASE_URL;
  const previousTimeout = process.env.API_REQUEST_TIMEOUT_MS;
  if (apiBaseUrl === undefined) delete process.env.API_BASE_URL;
  else process.env.API_BASE_URL = apiBaseUrl;
  delete process.env.API_REQUEST_TIMEOUT_MS;
  return Promise.resolve()
    .then(run)
    .finally(() => {
      if (previousBase === undefined) delete process.env.API_BASE_URL;
      else process.env.API_BASE_URL = previousBase;
      if (previousTimeout === undefined) delete process.env.API_REQUEST_TIMEOUT_MS;
      else process.env.API_REQUEST_TIMEOUT_MS = previousTimeout;
    });
}

function dashboardRequest(path: string, init: RequestInit = {}): Request {
  return new Request(`https://admin.example${path}`, init);
}

test("proxy allows dashboard API families and rejects local, guest and traversal paths", () => {
  for (const path of [
    "/api/admin/rooms",
    "/api/content/editor/items",
    "/api/d1/add-ons",
    "/api/analytics/summary",
    "/api/recovery",
  ]) {
    assert.equal(isAllowedDashboardApiPath(path), true, path);
  }
  for (const path of [
    "/api/auth/session",
    "/api/health",
    "/api/mews/configuration",
    "/api/admin/../auth/session",
    "/api/admin/%2e%2e/auth/session",
    "/api/admin/%2Fauth/session",
    "/api/admin/%5Cauth",
    "/admin/rooms",
  ]) {
    assert.equal(isAllowedDashboardApiPath(path), false, path);
  }
});

test("GET proxy forwards query and verified assertion without browser credentials", async () => {
  await withProxyEnv("https://booking.example///", async () => {
    const calls: Array<{ url: URL; init?: RequestInit }> = [];
    const response = await proxyDashboardRequest(
      dashboardRequest("/api/admin/rooms?tenant=urban-cowboy", {
        headers: {
          accept: "application/json",
          cookie: "CF_Session=browser-secret",
          authorization: "Bearer browser-token",
          "cf-access-jwt-assertion": "browser-supplied-token",
          origin: "https://admin.example",
        },
      }),
      "  verified-token  ",
      {
        fetchImpl: async (input, init) => {
          calls.push({ url: new URL(String(input)), init });
          return new Response(JSON.stringify({ items: [] }), {
            status: 200,
            headers: {
              "content-type": "application/json",
              "x-content-source": "d1",
              "cache-control": "public, max-age=600",
              "set-cookie": "upstream=do-not-forward",
            },
          });
        },
      },
    );

    assert.equal(calls.length, 1);
    assert.equal(calls[0].url.href, "https://booking.example/api/admin/rooms?tenant=urban-cowboy");
    assert.equal(calls[0].init?.method, "GET");
    assert.equal(calls[0].init?.redirect, "manual");
    const headers = new Headers(calls[0].init?.headers);
    assert.equal(headers.get("cf-access-jwt-assertion"), "verified-token");
    assert.equal(headers.get("accept"), "application/json");
    assert.equal(headers.get("cookie"), null);
    assert.equal(headers.get("authorization"), null);
    assert.equal(headers.get("origin"), null);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "no-store, private");
    assert.equal(response.headers.get("x-content-source"), "d1");
    assert.equal(response.headers.get("set-cookie"), null);
    assert.deepEqual(await response.json(), { items: [] });
  });
});

test("mutation proxy preserves the body and rejects missing or foreign origins", async () => {
  await withProxyEnv("https://booking.example", async () => {
    const calls: Array<{ url: URL; init?: RequestInit }> = [];
    const fetchImpl: typeof fetch = async (input, init) => {
      calls.push({ url: new URL(String(input)), init });
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    };
    const payload = JSON.stringify({ slug: "gate2-proxy-test" });
    const response = await proxyDashboardRequest(
      dashboardRequest("/api/content/editor/items", {
        method: "POST",
        headers: {
          origin: "https://admin.example",
          "content-type": "application/json",
          cookie: "CF_Session=browser-secret",
          "cf-access-jwt-assertion": "untrusted-client-token",
        },
        body: payload,
      }),
      "verified-token",
      { fetchImpl },
    );
    assert.equal(response.status, 200);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].init?.method, "POST");
    assert.equal(new TextDecoder().decode(calls[0].init?.body as ArrayBuffer), payload);
    assert.equal(new Headers(calls[0].init?.headers).get("cf-access-jwt-assertion"), "verified-token");

    for (const origin of [undefined, "https://evil.example"]) {
      const headers = new Headers({ "content-type": "application/json" });
      if (origin) headers.set("origin", origin);
      const denied = await proxyDashboardRequest(
        dashboardRequest("/api/content/editor/items", { method: "POST", headers, body: payload }),
        "verified-token",
        { fetchImpl },
      );
      assert.equal(denied.status, 403);
      assert.deepEqual(await denied.json(), { error: "origin_not_allowed" });
    }
    assert.equal(calls.length, 1);
  });
});

test("proxy rejects unsupported methods, disallowed paths and missing assertions before fetch", async () => {
  await withProxyEnv("https://booking.example", async () => {
    let calls = 0;
    const fetchImpl: typeof fetch = async () => {
      calls += 1;
      return new Response("{}", { status: 200 });
    };
    const cases: Array<[Request, string, number, string]> = [
      [dashboardRequest("/api/admin/rooms", { method: "OPTIONS" }), "verified", 405, "method_not_allowed"],
      [dashboardRequest("/api/mews/configuration"), "verified", 404, "not_found"],
      [dashboardRequest("/api/admin/rooms"), "", 401, "unauthorized"],
    ];
    for (const [request, assertion, status, error] of cases) {
      const response = await proxyDashboardRequest(request, assertion, { fetchImpl });
      assert.equal(response.status, status);
      assert.deepEqual(await response.json(), { error });
    }
    assert.equal(calls, 0);
  });
});

test("missing or malformed API configuration fails closed", async () => {
  for (const base of [undefined, "", "booking.example", "https://booking.example/v1", "ftp://booking.example", "https://admin.example"]) {
    await withProxyEnv(base, async () => {
      let calls = 0;
      const response = await proxyDashboardRequest(dashboardRequest("/api/admin/rooms"), "verified", {
        fetchImpl: async () => {
          calls += 1;
          return new Response("{}", { status: 200 });
        },
      });
      assert.equal(response.status, 503);
      assert.deepEqual(await response.json(), { error: "api_proxy_not_configured" });
      assert.equal(calls, 0);
    });
  }
});

test("upstream failures and redirects become bounded proxy errors", async () => {
  await withProxyEnv("https://booking.example", async () => {
    const unavailable = await proxyDashboardRequest(dashboardRequest("/api/admin/rooms"), "verified", {
      fetchImpl: async () => {
        throw new Error("network details must not reach the browser");
      },
    });
    assert.equal(unavailable.status, 502);
    assert.deepEqual(await unavailable.json(), { error: "upstream_unavailable" });

    const redirect = await proxyDashboardRequest(dashboardRequest("/api/admin/rooms"), "verified", {
      fetchImpl: async () => new Response(null, { status: 302, headers: { location: "https://evil.example" } }),
    });
    assert.equal(redirect.status, 502);
    assert.deepEqual(await redirect.json(), { error: "upstream_redirect_rejected" });
  });
});

test("worker authorization status and body pass through the proxy", async () => {
  await withProxyEnv("https://booking.example", async () => {
    for (const status of [401, 403, 404, 409, 500]) {
      const response = await proxyDashboardRequest(dashboardRequest("/api/admin/rooms"), "verified", {
        fetchImpl: async () => new Response(JSON.stringify({ error: `worker-${status}` }), {
          status,
          headers: { "content-type": "application/json" },
        }),
      });
      assert.equal(response.status, status);
      assert.deepEqual(await response.json(), { error: `worker-${status}` });
      assert.equal(response.headers.get("cache-control"), "no-store, private");
    }
  });
});

test("dashboard client keeps API calls on the admin origin", async (t) => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  t.mock.method(globalThis, "fetch", async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), init });
    return new Response(JSON.stringify({ items: [] }), { status: 200 });
  });
  const api = createAdminDashboardApi();
  await api.getAdminRooms();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "/api/admin/rooms");
  assert.equal(calls[0].init?.credentials, "same-origin");
});

test("API route verifies the session before invoking the server proxy", () => {
  const route = new URL("../admin-app/app/api/[...path]/route.ts", import.meta.url);
  const source = readFileSync(route, "utf8");
  assert.match(source, /getAdminSession\(\)/);
  assert.match(source, /can\(session, "read"\)/);
  assert.match(source, /assertionFromHeaders\(await headers\(\)\)/);
  assert.match(source, /proxyDashboardRequest\(request, assertion\)/);
  assert.doesNotMatch(source, /API_BASE_URL/);
});
