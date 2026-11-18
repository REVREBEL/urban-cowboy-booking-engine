// COW-37 responsive admin shell. Every route is reachable only when the
// session gate in DashboardApp has already passed.
import { useRef } from "react";
import { Button } from "@/components/ui/Button";
import {
  DASHBOARD_NAV,
  DASHBOARD_NAV_GROUPS,
  hashForRoute,
  navItemFor,
  type DashboardRouteId,
} from "./navigation";

export interface DashboardShellProps {
  email: string;
  route: DashboardRouteId;
  onSignOut: () => void;
  children: React.ReactNode;
}

export function DashboardShell({ email, route, onSignOut, children }: DashboardShellProps) {
  const current = navItemFor(route);
  const mainRef = useRef<HTMLElement>(null);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <a
        href="#dashboard-main"
        onClick={(event) => {
          // The hash is the router key. Move focus without changing it.
          event.preventDefault();
          mainRef.current?.focus();
        }}
        className="sr-only rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50"
      >
        Skip to dashboard content
      </a>

      <header className="bg-sidebar text-sidebar-foreground">
        <div className="mx-auto flex max-w-[120rem] flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-sidebar-foreground/70">
              Urban Cowboy · Admin
            </p>
            <p className="font-heading text-lg">{current.label}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="max-w-[16rem] truncate text-xs text-sidebar-foreground/70" title={email}>
              {email}
            </span>
            <Button variant="outline" colorScheme="light" size="small" textCase="title" onClick={onSignOut}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[120rem] gap-0 lg:grid-cols-[16rem_1fr]">
        <nav aria-label="Dashboard sections" className="border-b border-border/15 bg-sidebar text-sidebar-foreground lg:min-h-[calc(100dvh-4.5rem)] lg:border-b-0 lg:border-r">
          <ul className="flex flex-nowrap gap-1 overflow-x-auto px-3 py-3 lg:block lg:space-y-5 lg:overflow-visible lg:px-4 lg:py-6">
            {DASHBOARD_NAV_GROUPS.map((group) => (
              <li key={group.id} className="shrink-0 lg:shrink">
                <p className="hidden px-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/60 lg:block">
                  {group.label}
                </p>
                <ul className="flex gap-1 lg:block lg:space-y-0.5">
                  {DASHBOARD_NAV.filter((item) => item.group === group.id).map((item) => (
                    <li key={item.id}>
                      <a
                        href={hashForRoute(item.id)}
                        aria-current={item.id === route ? "page" : undefined}
                        aria-label={`${item.label}: ${item.description}`}
                        className={`block whitespace-nowrap rounded-md px-3 py-2 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring ${
                          item.id === route
                            ? "bg-sidebar-primary text-sidebar-primary-foreground"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        }`}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </nav>

        <main id="dashboard-main" ref={mainRef} tabIndex={-1} className="min-w-0 px-4 py-6 lg:px-8">
          <div className="mb-5">
            <h1 className="font-heading text-2xl text-foreground">{current.label}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{current.description}</p>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
