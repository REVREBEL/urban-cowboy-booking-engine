// COW-37 dashboard navigation.
//
// Routes are hash based so the static dashboard.html entry point needs no
// server-side rewrite. Every route is protected by the shell's session gate;
// no client-supplied hash can bypass that gate.

export type DashboardRouteId =
  | "rooms"
  | "hotspots"
  | "amenities"
  | "media"
  | "rates"
  | "policies"
  | "events"
  | "add-ons"
  | "upgrades"
  | "recovery"
  | "analytics"
  | "settings";

export type DashboardNavGroup = "content" | "commercial" | "operations" | "admin";

export interface DashboardNavItem {
  id: DashboardRouteId;
  label: string;
  description: string;
  group: DashboardNavGroup;
}

export const DASHBOARD_NAV: readonly DashboardNavItem[] = [
  { id: "rooms", label: "Rooms", description: "Room types and gallery order", group: "content" },
  { id: "hotspots", label: "Hotspots", description: "Room photo pins, review and publishing", group: "content" },
  { id: "amenities", label: "Amenities", description: "Room amenity assignments, content and order", group: "content" },
  { id: "media", label: "Media", description: "Media registry, aliases and versions", group: "content" },
  { id: "rates", label: "Rates", description: "Rate merchandising and snapshots", group: "commercial" },
  { id: "policies", label: "Policies", description: "Policy language and publication", group: "content" },
  { id: "events", label: "Events", description: "Editorial events from D1", group: "content" },
  { id: "add-ons", label: "Add-ons", description: "Bookable extras and merchandising", group: "commercial" },
  { id: "upgrades", label: "Upgrades", description: "Upgrade rules and eligibility", group: "commercial" },
  { id: "recovery", label: "Recovery", description: "Abandoned booking recovery", group: "operations" },
  { id: "analytics", label: "Analytics", description: "Funnel performance and conversions", group: "operations" },
  { id: "settings", label: "Settings", description: "Sources, flags and access", group: "admin" },
] as const;

export const DEFAULT_ROUTE: DashboardRouteId = "analytics";

export const DASHBOARD_NAV_GROUPS: readonly { id: DashboardNavGroup; label: string }[] = [
  { id: "content", label: "Content" },
  { id: "commercial", label: "Commercial" },
  { id: "operations", label: "Operations" },
  { id: "admin", label: "Admin" },
] as const;

export function isDashboardRoute(value: string): value is DashboardRouteId {
  return DASHBOARD_NAV.some((item) => item.id === value);
}

export function routeFromHash(hash: string): DashboardRouteId {
  const match = /^#\/([a-z-]+)\/?$/.exec(hash);
  return match && isDashboardRoute(match[1]) ? match[1] : DEFAULT_ROUTE;
}

export function hashForRoute(id: DashboardRouteId): string {
  return `#/${id}`;
}

export function navItemFor(id: DashboardRouteId): DashboardNavItem {
  const item = DASHBOARD_NAV.find((entry) => entry.id === id);
  if (!item) throw new Error(`Unknown dashboard route: ${id}`);
  return item;
}
