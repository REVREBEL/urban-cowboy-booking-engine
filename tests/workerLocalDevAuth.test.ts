// COW-114: the local D1 preview bypass is triple-gated and cannot activate in
// a deployed Worker. The real Access verification path is unchanged.
import assert from "node:assert/strict";
import test from "node:test";
import {
  LOCAL_PREVIEW_HEADER,
  PREVIEW_EMAIL,
  authorizeScopedRequest,
  isLocalDevPreview,
  requireAdmin,
  requireViewer,
  type AuthEnv,
} from "../worker/auth.ts";

const previewHeader = { [LOCAL_PREVIEW_HEADER]: "1" };
const request = (url = "http://localhost:8787/api/d1/rooms", headers: Record<string, string> = {}) =>
  new Request(url, { headers });

const env = (overrides: Partial<AuthEnv> = {}): AuthEnv => ({
  CF_ACCESS_TEAM_DOMAIN: "cow31-test.cloudflareaccess.com",
  CF_ACCESS_AUD: "cow31-test-aud",
  ADMIN_EMAILS: "admin@example.com",
  TENANT_ID: "urban-cowboy",
  ...overrides,
});

test("all three gates are required", () => {
  const on = env({ LOCAL_DEV_PREVIEW: "1" });
  assert.equal(isLocalDevPreview(request(undefined, previewHeader), on), true);
  assert.equal(isLocalDevPreview(request(undefined, previewHeader), env()), false, "binding required");
  assert.equal(isLocalDevPreview(request(), on), false, "marker header required");
  assert.equal(
    isLocalDevPreview(request(undefined, { [LOCAL_PREVIEW_HEADER]: "true" }), on),
    false,
    "only the explicit marker value 1 opts in",
  );
  assert.equal(
    isLocalDevPreview(request("https://urban-cowboy-booking-engine.revrebel.workers.dev/api/d1/rooms", previewHeader), on),
    false,
    "deployed host is rejected",
  );
  assert.equal(isLocalDevPreview(request("http://127.0.0.1:8787/api/d1/rooms", previewHeader), on), true);
  assert.equal(isLocalDevPreview(request("http://[::1]:8787/api/d1/rooms", previewHeader), on), true);
});

test("a deployed host rejects the marker header even when the binding is set", async () => {
  const deployed = request(
    "https://urban-cowboy-booking-engine.revrebel.workers.dev/api/recovery",
    previewHeader,
  );
  assert.equal((await requireAdmin(deployed, env({ LOCAL_DEV_PREVIEW: "1" })))?.status, 401);
});

test("the local Worker still requires a real JWT without the marker header", async () => {
  assert.equal((await requireViewer(request(), env({ LOCAL_DEV_PREVIEW: "1" })))?.status, 401);
  assert.equal(
    (await requireViewer(request(undefined, { "cf-access-jwt-assertion": "not-a-jwt" }), env({ LOCAL_DEV_PREVIEW: "1" })))?.status,
    401,
    "verification still runs when the gate is off",
  );
});

test("local preview returns a scoped admin principal with no credential material", async () => {
  const local = env({ LOCAL_DEV_PREVIEW: "1" });
  assert.equal(await requireAdmin(request(undefined, previewHeader), local), null);
  const principal = await authorizeScopedRequest(request(undefined, previewHeader), local, "admin");
  assert.ok(!(principal instanceof Response));
  assert.equal(principal.email, PREVIEW_EMAIL);
  assert.deepEqual(principal.roles, ["viewer", "admin"]);
  assert.equal(principal.tenantId, "urban-cowboy");
  assert.equal(JSON.stringify(principal).includes("jwt"), false);
  assert.equal(JSON.stringify(principal).includes("assertion"), false);
});

test("an unrendered tenant placeholder cannot leak into the preview scope", async () => {
  const principal = await authorizeScopedRequest(
    request(undefined, previewHeader),
    env({ LOCAL_DEV_PREVIEW: "1", TENANT_ID: "__ENV_TENANT_ID__" }),
    "admin",
  );
  assert.ok(!(principal instanceof Response));
  assert.equal(principal.tenantId, "urban-cowboy");
});

test("a mismatched ?tenant is still rejected in local preview", async () => {
  const denied = await authorizeScopedRequest(
    request("http://localhost:8787/api/d1/rooms?tenant=other", previewHeader),
    env({ LOCAL_DEV_PREVIEW: "1" }),
    "admin",
  );
  assert.equal(denied instanceof Response && denied.status, 403);
});
