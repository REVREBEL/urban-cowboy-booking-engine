// COW-37 dashboard navigation contract.
import assert from "node:assert/strict";
import test from "node:test";
import {
  DASHBOARD_NAV,
  DASHBOARD_NAV_GROUPS,
  DEFAULT_ROUTE,
  hashForRoute,
  isDashboardRoute,
  navItemFor,
  routeFromHash,
} from "../src/dashboard/navigation.ts";

test("navigation covers every requested admin section exactly once", () => {
  const expected = [
    "Rooms", "Amenities", "Media", "Rates", "Policies", "Events",
    "Add-ons", "Upgrades", "Recovery", "Analytics", "Settings",
  ];
  assert.deepEqual(DASHBOARD_NAV.map((item) => item.label), expected);
  assert.equal(new Set(DASHBOARD_NAV.map((item) => item.id)).size, expected.length);
  for (const item of DASHBOARD_NAV) {
    assert.ok(item.description.length > 0, `${item.label} has a description`);
  }
});

test("every nav item belongs to a rendered group", () => {
  const groups = new Set(DASHBOARD_NAV_GROUPS.map((group) => group.id));
  for (const item of DASHBOARD_NAV) assert.ok(groups.has(item.group), `${item.id} has a group`);
  const grouped = DASHBOARD_NAV_GROUPS.flatMap((group) =>
    DASHBOARD_NAV.filter((item) => item.group === group.id).map((item) => item.id),
  );
  assert.deepEqual([...grouped].sort(), DASHBOARD_NAV.map((item) => item.id).sort());
});

test("hash routing recognises known routes and falls back safely", () => {
  assert.equal(routeFromHash("#/media"), "media");
  assert.equal(routeFromHash("#/add-ons/"), "add-ons");
  assert.equal(routeFromHash(""), DEFAULT_ROUTE);
  assert.equal(routeFromHash("#/unknown"), DEFAULT_ROUTE);
  assert.equal(routeFromHash("#/media?tenant=other"), DEFAULT_ROUTE);
  assert.equal(isDashboardRoute("settings"), true);
  assert.equal(isDashboardRoute("../../secrets"), false);
});

test("hashForRoute and navItemFor round-trip", () => {
  for (const item of DASHBOARD_NAV) {
    assert.equal(routeFromHash(hashForRoute(item.id)), item.id);
    assert.equal(navItemFor(item.id).label, item.label);
  }
  assert.throws(() => navItemFor("not-a-route" as never), /Unknown dashboard route/);
});
