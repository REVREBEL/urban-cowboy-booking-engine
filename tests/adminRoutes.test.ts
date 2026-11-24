// COW-92: App Router route parity and reuse of the delivered React panels.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { DASHBOARD_NAV } from "../src/dashboard/navigation.ts";
import {
  ADMIN_ROUTE_IDS,
  ROUTE_CAPABILITY,
  routeIdFromSegment,
  routePath,
} from "../admin-app/lib/routes.ts";
import { resolveApiUrl } from "../admin-app/lib/dashboard-api.ts";
import { can, sessionFromClaims, type AdminAuthEnv } from "../admin-app/lib/auth.ts";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");
const env: AdminAuthEnv = { ADMIN_EMAILS: "admin@example.com", TENANT_ID: "urban-cowboy" };
const claims = {
  sub: "u1",
  email: "viewer@example.com",
  groups: [] as string[],
  exp: Math.floor(Date.now() / 1000) + 600,
};
const viewer = sessionFromClaims(claims, env);
const admin = sessionFromClaims({ ...claims, email: "admin@example.com" }, env);

test("every dashboard navigation route maps to an App Router path", () => {
  assert.deepEqual([...ADMIN_ROUTE_IDS], DASHBOARD_NAV.map((item) => item.id));
  for (const id of DASHBOARD_NAV) {
    assert.equal(routePath(id.id), `/${id.id}`);
    assert.equal(routeIdFromSegment(id.id), id.id);
  }
  assert.equal(routeIdFromSegment("not-a-route"), null);
  assert.equal(routeIdFromSegment(""), null);
});

test("route capabilities cover all sections and gate mutations by role", () => {
  for (const id of ADMIN_ROUTE_IDS) {
    assert.ok(ROUTE_CAPABILITY[id], `${id} must declare a capability`);
    assert.equal(can(admin, ROUTE_CAPABILITY[id]), true, `admin must access ${id}`);
  }
  for (const id of ["rooms", "hotspots", "amenities", "settings", "recovery"] as const) {
    assert.notEqual(ROUTE_CAPABILITY[id], "read", `${id} is admin-only at the Worker API`);
    assert.equal(can(viewer, ROUTE_CAPABILITY[id]), false);
  }
  for (const id of ["media", "rates", "policies", "events", "add-ons", "upgrades", "analytics"] as const) {
    assert.equal(ROUTE_CAPABILITY[id], "read");
    assert.equal(can(viewer, ROUTE_CAPABILITY[id]), true, `viewer must read ${id}`);
  }
});

test("API URL adapter keeps /api paths and only changes the origin", () => {
  assert.equal(resolveApiUrl("/api/admin/rooms", ""), "/api/admin/rooms");
  assert.equal(
    resolveApiUrl("/api/admin/rooms", "https://worker.example.com///"),
    "https://worker.example.com/api/admin/rooms",
  );
  assert.throws(() => resolveApiUrl("/admin/rooms", "https://worker.example.com"), /\/api\//);
});

test("panels are reused, not reimplemented, and the legacy hotspot wiring defect is fixed", () => {
  const host = read("admin-app/components/DashboardPanelHost.tsx");
  for (const panel of [
    "RoomPhotosPanel",
    "RoomHotspotsPanel",
    "RoomAmenitiesPanel",
    "EventsCalendarPanel",
    "SiteSettingsPanel",
  ]) {
    assert.match(host, new RegExp(panel), `${panel} is reused`);
    assert.match(host, /\.\.\/\.\.\/src\/dashboard\//);
  }
  assert.doesNotMatch(host, /async function|fetch\(/);
  const legacy = read("src/dashboard/DashboardApp.tsx");
  assert.match(legacy, /route !== "hotspots"/);
});

test("remaining sections read shared D1 APIs and /admin deep links resolve", () => {
  const host = read("admin-app/components/DashboardPanelHost.tsx");
  const resources: Record<string, string> = {
    media: "/api/admin/media",
    rates: "/api/content/offers",
    policies: "/api/content/policy-language",
    "add-ons": "/api/d1/add-ons",
    upgrades: "/api/content/upgrades",
    recovery: "/api/recovery",
    analytics: "/api/analytics/summary",
  };
  for (const [route, path] of Object.entries(resources)) {
    assert.ok(host.includes(route), `${route} is mapped`);
    assert.ok(host.includes(path), `${route} uses ${path}`);
  }
  assert.match(host, /AdminResourcePanel/);
  const panel = read("admin-app/components/AdminResourcePanel.tsx");
  assert.match(panel, /useDashboardResource/);
  assert.match(panel, /LoadingPanel/);
  assert.match(panel, /ErrorPanel/);
  assert.match(panel, /EmptyPanel/);
  assert.match(read("admin-app/app/admin/page.tsx"), /redirect\("\/rooms"\)/);
  const deepLink = read("admin-app/app/admin/[section]/page.tsx");
  assert.match(deepLink, /routeIdFromSegment/);
  assert.match(deepLink, /redirect\(`\/\$\{route\}`\)/);
});

test("section route guards session, unknown segment and capability before rendering", () => {
  const page = read("admin-app/app/(admin)/[section]/page.tsx");
  assert.match(page, /routeIdFromSegment/);
  assert.match(page, /notFound\(\)/);
  assert.match(page, /getAdminSession/);
  assert.match(page, /can\(session, ROUTE_CAPABILITY\[route\]\)/);
  assert.match(page, /DashboardPanelHost/);
});
