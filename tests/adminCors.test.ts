// COW-82: behavioral coverage for the single-origin credentialed CORS boundary.
import assert from "node:assert/strict";
import test from "node:test";
import {
  ADMIN_ORIGIN,
  isAdminOrigin,
  preflightResponse,
  withAdminCors,
} from "../worker/admin-cors.ts";

const request = (origin?: string, method = "GET", preflight = false) => new Request(
  "https://booking.test/api/admin/rooms",
  {
    method,
    headers: {
      ...(origin ? { origin } : {}),
      ...(preflight ? { "access-control-request-method": "GET" } : {}),
    },
  },
);

test("only the approved admin origin is recognized", () => {
  assert.equal(isAdminOrigin(request(ADMIN_ORIGIN)), true);
  assert.equal(isAdminOrigin(request("https://evil.example")), false);
  assert.equal(isAdminOrigin(request()), false);
});

test("preflight is allowed for the admin origin and rejected elsewhere", () => {
  const allowed = preflightResponse(request(ADMIN_ORIGIN, "OPTIONS", true));
  assert.ok(allowed);
  assert.equal(allowed.status, 204);
  assert.equal(allowed.headers.get("access-control-allow-origin"), ADMIN_ORIGIN);
  assert.equal(allowed.headers.get("access-control-allow-credentials"), "true");
  assert.match(allowed.headers.get("access-control-allow-methods") ?? "", /PATCH/);

  assert.equal(preflightResponse(request("https://evil.example", "OPTIONS", true)), null);
  assert.equal(preflightResponse(request(ADMIN_ORIGIN, "GET", true)), null);
  assert.equal(preflightResponse(request(ADMIN_ORIGIN, "OPTIONS", false)), null);
});

test("allowed origin receives credentialed headers; disallowed origin gets none", async () => {
  const original = new Response('{"items":[]}', {
    status: 200,
    headers: { "content-type": "application/json", vary: "Accept-Encoding" },
  });
  const allowed = withAdminCors(request(ADMIN_ORIGIN), original.clone());
  assert.equal(allowed.headers.get("access-control-allow-origin"), ADMIN_ORIGIN);
  assert.equal(allowed.headers.get("access-control-allow-credentials"), "true");
  assert.equal(allowed.headers.get("content-type"), "application/json");
  assert.equal(allowed.headers.get("vary"), "Accept-Encoding, Origin");
  assert.equal(await allowed.text(), '{"items":[]}');

  const denied = withAdminCors(request("https://evil.example"), original.clone());
  assert.equal(denied.headers.get("access-control-allow-origin"), null);
  assert.equal(denied.headers.get("access-control-allow-credentials"), null);
  assert.equal(denied.headers.get("vary"), "Accept-Encoding");
});

test("an existing Vary: Origin is not duplicated", () => {
  const response = withAdminCors(request(ADMIN_ORIGIN), new Response("ok", {
    headers: { vary: "Accept-Encoding, Origin" },
  }));
  assert.equal(response.headers.get("vary"), "Accept-Encoding, Origin");
});
