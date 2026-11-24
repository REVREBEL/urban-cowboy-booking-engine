// COW-91: admin session, role matrix, unauthorized states and mutation CSRF.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  CAPABILITY_ROLES,
  can,
  isSameOriginMutation,
  publicSession,
  sessionFromClaims,
  type AdminAuthEnv,
} from "../admin-app/lib/auth.ts";
import { sessionResponse } from "../admin-app/app/api/auth/session-response.ts";
import { logoutRedirect } from "../admin-app/app/api/auth/logout/route.ts";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");

const env: AdminAuthEnv = {
  CF_ACCESS_TEAM_DOMAIN: "example.cloudflareaccess.com",
  CF_ACCESS_AUD: "admin-aud",
  ADMIN_EMAILS: "admin@example.com",
  ADMIN_GROUPS: "group-admin",
  TENANT_ID: "urban-cowboy",
};
const claims = {
  sub: "user-1",
  email: "viewer@example.com",
  groups: [] as string[],
  iss: "https://example.cloudflareaccess.com",
  aud: "admin-aud",
  exp: Math.floor(Date.now() / 1000) + 600,
};

test("viewer role is read-only; admin role is granted by email or group", () => {
  const viewer = sessionFromClaims(claims, env);
  assert.deepEqual(viewer.roles, ["viewer"]);
  assert.equal(can(viewer, "read"), true);
  for (const capability of ["edit", "publish", "settings", "destructiveMedia"] as const) {
    assert.equal(can(viewer, capability), false, `viewer must not ${capability}`);
  }

  const byEmail = sessionFromClaims({ ...claims, email: "ADMIN@example.com" }, env);
  assert.deepEqual(byEmail.roles, ["viewer", "admin"]);
  const byGroup = sessionFromClaims({ ...claims, groups: ["group-admin"] }, env);
  assert.deepEqual(byGroup.roles, ["viewer", "admin"]);
  for (const capability of Object.keys(CAPABILITY_ROLES) as (keyof typeof CAPABILITY_ROLES)[]) {
    assert.equal(can(byEmail, capability), true, `admin must be able to ${capability}`);
  }
});

test("unauthenticated sessions hold no capability and expose no identity", () => {
  assert.equal(can(null, "read"), false);
  assert.equal(publicSession(null), null);
  const session = sessionFromClaims({ ...claims, email: "admin@example.com" }, env);
  const publicData = publicSession(session);
  assert.ok(publicData);
  assert.deepEqual(Object.keys(publicData).sort(), ["email", "expiresAt", "roles", "tenantId"]);
});

test("expiry and tenant scope come from the verified claims and server binding", () => {
  const session = sessionFromClaims(claims, env);
  assert.equal(session.tenantId, "urban-cowboy");
  assert.equal(session.expiresAt, claims.exp);
  const withoutExpiry = sessionFromClaims({ ...claims, exp: undefined }, env);
  assert.equal(withoutExpiry.expiresAt, null);
});

test("session endpoint answers 401 when unauthenticated and never returns token material", async () => {
  const anonymous = sessionResponse(null);
  assert.equal(anonymous.status, 401);
  assert.match(anonymous.headers.get("cache-control") ?? "", /no-store/);
  assert.deepEqual(JSON.parse(await anonymous.text()), { authenticated: false });

  const session = sessionFromClaims({ ...claims, email: "admin@example.com" }, env);
  const authed = sessionResponse(session);
  assert.equal(authed.status, 200);
  const text = await authed.text();
  const body = JSON.parse(text);
  assert.equal(body.authenticated, true);
  assert.equal(body.session.email, "admin@example.com");
  assert.doesNotMatch(text, /jwt|assertion|token/i);
});

test("mutations require an explicit same-origin Origin header", () => {
  const url = "https://admin.example.com/api/auth/logout";
  assert.equal(isSameOriginMutation(new Request(url, { method: "GET" })), true);
  assert.equal(isSameOriginMutation(new Request(url, { method: "POST" })), false);
  assert.equal(
    isSameOriginMutation(new Request(url, { method: "POST", headers: { Origin: "https://evil.example" } })),
    false,
  );
  assert.equal(
    isSameOriginMutation(new Request(url, { method: "POST", headers: { Origin: "https://admin.example.com" } })),
    true,
  );
  assert.equal(
    isSameOriginMutation(new Request(url, { method: "POST", headers: { Origin: "not-a-url" } })),
    false,
  );
});

test("anonymous page redirects keep the no-store policy", () => {
  const source = read("admin-app/proxy.ts");
  assert.match(source, /const redirectResponse = NextResponse\.redirect\(login\)/);
  assert.match(source, /redirectResponse\.headers\.set\("Cache-Control", "no-store, private"\)/);
});

test("logout defers to Cloudflare Access and fails closed without a team domain", () => {
  const request = new Request("https://admin.example.com/api/auth/logout", {
    method: "POST",
    headers: { Origin: "https://admin.example.com" },
  });
  const ok = logoutRedirect(request, "example.cloudflareaccess.com");
  assert.equal(ok.status, 303);
  const location = new URL(ok.headers.get("location") ?? "");
  assert.equal(location.origin, "https://example.cloudflareaccess.com");
  assert.equal(location.pathname, "/cdn-cgi/access/logout");
  assert.equal(location.searchParams.get("redirect_uri"), "https://admin.example.com/login");

  for (const missing of [undefined, "", "https://team.example.com/path", "team.example.com?x=1"]) {
    const denied = logoutRedirect(request, missing);
    assert.equal(denied.status, 503);
    assert.equal(denied.headers.get("location"), null);
  }
});

test("admin app reuses the Worker verifier and keeps Studio out of auth", () => {
  const requestBinding = read("admin-app/lib/session.ts");
  assert.match(requestBinding, /verifyAccessJwt/);
  assert.match(requestBinding, /\.\.\/\.\.\/worker\/access\.ts/);
  assert.match(requestBinding, /getAdminSession/);
  const pure = read("admin-app/lib/auth.ts");
  assert.match(pure, /principalFromClaims/);
  assert.doesNotMatch(pure, /crypto\.subtle\.verify/);
  assert.doesNotMatch(pure, /studio/i);
  const layout = read("admin-app/app/(admin)/layout.tsx");
  assert.match(layout, /getAdminSession/);
  assert.match(layout, /redirect\("\/login/);
});
