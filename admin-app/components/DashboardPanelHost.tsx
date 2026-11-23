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
import { createAdminDashboardApi } from "../lib/dashboard-api.ts";

/** Reuse the delivered panels verbatim; only the API origin is adapted. */
const REUSED_PANELS: Partial<Record<DashboardRouteId, (props: { api: ReturnType<typeof createAdminDashboardApi> }) => React.JSX.Element>> = {
  rooms: RoomPhotosPanel,
  hotspots: RoomHotspotsPanel,
  amenities: RoomAmenitiesPanel,
  events: EventsCalendarPanel,
  settings: SiteSettingsPanel,
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
