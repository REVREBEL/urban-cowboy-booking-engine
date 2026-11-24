import {
  DASHBOARD_NAV,
  isDashboardRoute,
  type DashboardRouteId,
} from "../../src/dashboard/navigation.ts";
import type { AdminCapability } from "./auth.ts";

/** App Router paths mirror the delivered dashboard route ids at the root. */
export function routePath(id: DashboardRouteId): string {
  return `/${id}`;
}

export function routeIdFromSegment(segment: string): DashboardRouteId | null {
  return isDashboardRoute(segment) ? segment : null;
}

/**
 * Read routes stay viewer-accessible. Sections whose panels perform content
 * mutations require the admin role in the app as well as at the Worker API.
 */
export const ROUTE_CAPABILITY: Readonly<Record<DashboardRouteId, AdminCapability>> = {
  rooms: "edit",
  hotspots: "edit",
  amenities: "edit",
  media: "read",
  rates: "read",
  policies: "read",
  events: "read",
  "add-ons": "read",
  upgrades: "read",
  recovery: "recovery",
  analytics: "read",
  settings: "settings",
};

export const ADMIN_ROUTE_IDS: readonly DashboardRouteId[] = DASHBOARD_NAV.map((item) => item.id);
