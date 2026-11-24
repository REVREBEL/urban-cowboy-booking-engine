"use client";

import { useMemo } from "react";
import {
  DASHBOARD_NAV,
  type DashboardRouteId,
} from "../../src/dashboard/navigation.ts";
import { EventsCalendarPanel } from "../../src/dashboard/EventsCalendarPanel.tsx";
import { RoomAmenitiesPanel } from "../../src/dashboard/RoomAmenitiesPanel.tsx";
import { RoomHotspotsPanel } from "../../src/dashboard/RoomHotspotsPanel.tsx";
import { RoomPhotosPanel } from "../../src/dashboard/RoomPhotosPanel.tsx";
import { SiteSettingsPanel } from "../../src/dashboard/SiteSettingsPanel.tsx";
import { AdminResourcePanel } from "./AdminResourcePanel.tsx";
import { createAdminDashboardApi } from "../lib/dashboard-api.ts";

type HostApi = ReturnType<typeof createAdminDashboardApi>;
type PanelComponent = (props: { api: HostApi }) => React.JSX.Element;

/** Reuse the delivered panels verbatim; only the API origin is adapted. */
const REUSED_PANELS: Partial<Record<DashboardRouteId, PanelComponent>> = {
  rooms: RoomPhotosPanel,
  hotspots: RoomHotspotsPanel,
  amenities: RoomAmenitiesPanel,
  events: EventsCalendarPanel,
  settings: SiteSettingsPanel,
};

/** Remaining parity sections read directly from the shared D1-backed APIs. */
export const RESOURCE_SECTIONS: Partial<Record<DashboardRouteId, { path: string; label: string }>> = {
  media: { path: "/api/admin/media", label: "media assets" },
  rates: { path: "/api/content/offers", label: "rate offers" },
  policies: { path: "/api/content/policy-language", label: "policy language" },
  "add-ons": { path: "/api/d1/add-ons", label: "add-ons" },
  upgrades: { path: "/api/content/upgrades", label: "upgrades" },
  recovery: { path: "/api/recovery", label: "recovery records" },
  analytics: { path: "/api/analytics/summary", label: "analytics" },
};

export function DashboardPanelHost({
  route,
  apiBaseUrl,
}: {
  route: DashboardRouteId;
  apiBaseUrl: string;
}) {
  const api = useMemo(() => createAdminDashboardApi(apiBaseUrl), [apiBaseUrl]);
  const Panel = REUSED_PANELS[route];
  if (Panel) return <Panel api={api} />;

  const resource = RESOURCE_SECTIONS[route];
  if (resource) {
    return <AdminResourcePanel api={api} path={resource.path} label={resource.label} />;
  }

  const item = DASHBOARD_NAV.find((entry) => entry.id === route);
  return (
    <section className="flex flex-col gap-2 rounded-md border border-border p-4">
      <h2 className="text-lg font-semibold">{item?.label ?? route}</h2>
      <p className="text-sm text-muted-foreground">
        {item?.description ?? "Admin section"}. This section is in the W1.1 parity matrix as a
        remaining port (W1.6); navigation and route protection are already active.
      </p>
    </section>
  );
}
