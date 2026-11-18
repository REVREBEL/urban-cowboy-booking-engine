// COW-37 dashboard root: session gate, hash router and shared shell.
import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { createDashboardApi } from "./api";
import { ConfigNeeded, FunnelPanel, Login, Splash } from "./Dashboard";
import { D1ContentPanel } from "./D1ContentPanel";
import { DashboardShell } from "./DashboardShell";
import { navItemFor, routeFromHash, type DashboardRouteId } from "./navigation";
import { isConfigured, supabase } from "./supabase";
import { EmptyPanel } from "./states";

export function DashboardApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [route, setRoute] = useState<DashboardRouteId>(() => routeFromHash(window.location.hash));

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

  const api = useMemo(
    () => createDashboardApi({
      getToken: async () => (await supabase.auth.getSession()).data.session?.access_token ?? null,
    }),
    [],
  );

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
      {route === "analytics" && <FunnelPanel />}
      {route === "events" && <D1ContentPanel api={api} />}
      {route !== "analytics" && route !== "events" && (
        <EmptyPanel message={`${current.label} panel is not wired yet. Navigation and route protection are available now.`} />
      )}
    </DashboardShell>
  );
}
