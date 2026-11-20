// COW-37 dashboard root: session gate, hash router and shared shell.
import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { createDashboardApi } from "./api";
import { ConfigNeeded, FunnelPanel, Login, Splash } from "./Dashboard";
import { EventsCalendarPanel } from "./EventsCalendarPanel";
import { SiteSettingsPanel } from "./SiteSettingsPanel";
import { DashboardShell } from "./DashboardShell";
import { navItemFor, routeFromHash, type DashboardRouteId } from "./navigation";
import { PanelErrorBoundary } from "./PanelErrorBoundary";
import { RoomPhotosPanel } from "./RoomPhotosPanel";
import { RoomHotspotsPanel } from "./RoomHotspotsPanel";
import { RoomAmenitiesPanel } from "./RoomAmenitiesPanel";
import { isConfigured, supabase } from "./supabase";
import { EmptyPanel } from "./states";

export function DashboardApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [route, setRoute] = useState<DashboardRouteId>(() => routeFromHash(window.location.hash));

  // Worker APIs are authorized by Cloudflare Access at the edge, not by this
  // Supabase session. The session gates only the legacy Supabase funnel panel.
  const api = useMemo(() => createDashboardApi(), []);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setSession(data.session);
      setReady(true);
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, next) => {
      if (alive) setSession(next);
    });
    return () => {
      alive = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const onHashChange = () => setRoute(routeFromHash(window.location.hash));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  if (!isConfigured) return <ConfigNeeded />;
  if (!ready) return <Splash />;
  if (!session) return <Login />;

  const current = navItemFor(route);
  return (
    <DashboardShell
      email={session.user.email ?? ""}
      route={route}
      onSignOut={() => void supabase.auth.signOut()}
    >
      <PanelErrorBoundary resetKey={route}>
        {route === "analytics" && <FunnelPanel />}
        {route === "events" && <EventsCalendarPanel api={api} />}
        {route === "settings" && <SiteSettingsPanel api={api} />}
        {route === "rooms" && <RoomPhotosPanel api={api} />}
        {route === "hotspots" && <RoomHotspotsPanel api={api} />}
        {route === "amenities" && <RoomAmenitiesPanel api={api} />}
        {route !== "analytics" && route !== "events" && route !== "settings" && route !== "rooms" && route !== "amenities" && (
          <EmptyPanel message={`${current.label} panel is not wired yet. Navigation and route protection are available now.`} />
        )}
      </PanelErrorBoundary>
    </DashboardShell>
  );
}
