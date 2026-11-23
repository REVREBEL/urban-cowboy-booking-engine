"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DASHBOARD_NAV,
  DASHBOARD_NAV_GROUPS,
  type DashboardRouteId,
} from "../../src/dashboard/navigation.ts";
import { routePath } from "../lib/routes.ts";

export function AdminNav() {
  const pathname = usePathname();
  const active: DashboardRouteId | null =
    (pathname?.replace(/^\//, "") as DashboardRouteId | undefined) ?? null;

  return (
    <nav aria-label="Admin sections" className="border-b border-border">
      <ul className="mx-auto flex max-w-5xl flex-wrap gap-1 px-4 py-2">
        {DASHBOARD_NAV.filter((item) =>
          ["content", "commercial", "operations", "admin"].includes(item.group),
        ).map((item) => (
          <li key={item.id}>
            <Link
              href={routePath(item.id)}
              aria-current={active === item.id ? "page" : undefined}
              aria-label={`${item.label}: ${item.description}`}
              className={`block rounded-md px-3 py-2 text-sm ${
                active === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <span className="sr-only">{DASHBOARD_NAV_GROUPS.map((g) => g.label).join(", ")}</span>
    </nav>
  );
}
