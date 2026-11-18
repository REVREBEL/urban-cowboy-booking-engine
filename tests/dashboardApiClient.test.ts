// COW-37 centralized dashboard API client contract.
import assert from "node:assert/strict";
import test from "node:test";
import { createDashboardApi, DashboardApiError } from "../src/dashboard/api.ts";

type Call = { url: string; init?: RequestInit };

function client(token: string | null, calls: Call[], respond?: (call: Call) => Response) {
  const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const call = { url: String(input), init };
    calls.push(call);
    return respond?.(call) ?? new Response(JSON.stringify({ items: [] }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;
  return createDashboardApi({ getToken: async () => token, fetchImpl });
}

test("get builds the URL, sends the token in a header and omits credentials", async () => {
  const calls: Call[] = [];
  const api = client("jwt-token", calls);
  const result = await api.get<{ ok: boolean }>("/api/content/items", {
    tenant: "urban-cowboy",
    kind: "instagram",
    location: undefined,
  });

  assert.deepEqual(result, { items: [] });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "/api/content/items?tenant=urban-cowboy&kind=instagram");
  const headers = new Headers(calls[0].init?.headers);
  assert.equal(headers.get("authorization"), "Bearer jwt-token");
  assert.equal(headers.get("accept"), "application/json");
  assert.equal(calls[0].init?.credentials, "omit");
  assert.equal(calls[0].url.includes("jwt-token"), false);
});

test("get works without a token and rejects non-API paths", async () => {
  const calls: Call[] = [];
  const api = client(null, calls);
  await api.get("/api/analytics/summary");
  assert.equal(new Headers(calls[0].init?.headers).has("authorization"), false);
  await assert.rejects(() => api.get("/etc/passwd"), /must start with \/api\//);
});

test("failed responses become typed DashboardApiError", async () => {
  const calls: Call[] = [];
  const api = client("token", calls, () => new Response(
    JSON.stringify({ error: "forbidden", message: "Tenant scope denied" }),
    { status: 403, headers: { "content-type": "application/json" } },
  ));
  await assert.rejects(
    () => api.get("/api/recovery", { tenant: "other" }),
    (error: unknown) => {
      assert.ok(error instanceof DashboardApiError);
      assert.equal(error.status, 403);
      assert.equal(error.code, "forbidden");
      assert.equal(error.message, "Tenant scope denied");
      return true;
    },
  );
  assert.equal(calls[0].url.includes("other"), true);
  assert.equal(calls[0].url.includes("token"), false);
});

test("module and content helpers use the centralized client", async () => {
  const calls: Call[] = [];
  const api = client("token", calls, (call) => new Response(
    JSON.stringify({ items: [{ id: "x", title: call.url }] }),
    { status: 200, headers: { "content-type": "application/json" } },
  ));

  const addOns = await api.getD1Module<{ id: string; title: string }>("add-ons");
  assert.equal(addOns[0].title, "/api/d1/add-ons?tenant=urban-cowboy");

  const events = await api.getD1Module("events", "lodge");
  assert.equal(events[0].title, "/api/content/events?tenant=lodge");

  const offers = await api.getD1Module("offers");
  assert.equal(offers[0].title, "/api/content/offers?tenant=urban-cowboy");

  const policy = await api.getContentItems("policy", "urban-cowboy", "loc-1");
  assert.equal(policy[0].title, "/api/content/items?tenant=urban-cowboy&kind=policy&location=loc-1");
});
