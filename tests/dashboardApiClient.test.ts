// COW-37 centralized dashboard API client contract.
import assert from "node:assert/strict";
import test from "node:test";
import { createDashboardApi, DashboardApiError } from "../src/dashboard/api.ts";

type Call = { url: string; init?: RequestInit };

function client(calls: Call[], respond?: (call: Call) => Response) {
  const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const call = { url: String(input), init };
    calls.push(call);
    return respond?.(call) ?? new Response(JSON.stringify({ items: [] }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;
  return createDashboardApi({ fetchImpl });
}

test("get builds the URL, carries the Access cookie and sends no Supabase token", async () => {
  const calls: Call[] = [];
  const api = client(calls);
  const result = await api.get<{ items: unknown[] }>("/api/content/items", {
    tenant: "urban-cowboy",
    kind: "instagram",
    location: undefined,
  });

  assert.deepEqual(result, { items: [] });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "/api/content/items?tenant=urban-cowboy&kind=instagram");
  const headers = new Headers(calls[0].init?.headers);
  assert.equal(headers.get("accept"), "application/json");
  assert.equal(headers.has("authorization"), false);
  assert.equal(calls[0].init?.credentials, "same-origin");
});

test("post sends JSON with Access cookies and surfaces typed errors", async () => {
  const calls: Call[] = [];
  const api = client(calls, (call) => String(call.init?.body ?? "").includes('"fields"')
    ? new Response(JSON.stringify({ occurrences: ["2027-02-06"] }), { status: 200, headers: { "content-type": "application/json" } })
    : new Response(JSON.stringify({ error: "invalid_input" }), { status: 400, headers: { "content-type": "application/json" } }));

  const result = await api.post<{ occurrences: string[] }>("/api/content/events/preview", { fields: { name: "x" }, from: "2027-02-01", to: "2027-03-31" });
  assert.deepEqual(result.occurrences, ["2027-02-06"]);
  assert.equal(calls[0].init?.method, "POST");
  assert.equal(calls[0].init?.credentials, "same-origin");
  const headers = new Headers(calls[0].init?.headers);
  assert.equal(headers.get("content-type"), "application/json");
  assert.equal(JSON.parse(String(calls[0].init?.body)).fields.name, "x");

  await assert.rejects(
    () => api.post("/api/content/events/preview", {}),
    (error: unknown) => error instanceof DashboardApiError && error.code === "invalid_input",
  );
  await assert.rejects(() => api.post("/etc/passwd", {}), /must start with \/api\//);
});

test("get rejects non-API paths", async () => {
  const api = client([]);
  await assert.rejects(() => api.get("/etc/passwd"), /must start with \/api\//);
});

test("failed responses become typed DashboardApiError", async () => {
  const calls: Call[] = [];
  const api = client(calls, () => new Response(
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
});

test("module and content helpers use the centralized client", async () => {
  const calls: Call[] = [];
  const api = client(calls, (call) => new Response(
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

test("room gallery helpers call the admin routes without a client tenant scope", async () => {
  const calls: Call[] = [];
  const api = client(calls, (call) => new Response(
    JSON.stringify({ roomId: "room-a", items: [{ placementId: "p1" }] }),
    { status: 200, headers: { "content-type": "application/json" } },
  ));

  const rooms = await api.getAdminRooms<{ id: string }>();
  assert.deepEqual(rooms, [{ placementId: "p1" }]);
  assert.equal(calls[0].url, "/api/admin/rooms");
  assert.equal(calls[0].url.includes("tenant="), false);
  assert.equal(calls[0].init?.credentials, "same-origin");

  await api.getRoomGallery<{ placementId: string }>("room/a");
  assert.equal(calls[1].url, "/api/admin/rooms/room%2Fa/photos");
  assert.equal(calls[1].url.includes("tenant="), false);
});
