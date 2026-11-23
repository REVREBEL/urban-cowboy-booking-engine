/**
 * Adapter that lets the existing React dashboard panels run inside the admin
 * app. No panel is reimplemented: only URL resolution changes.
 */
import { createDashboardApi, type DashboardApi } from "../../src/dashboard/api.ts";

/** All dashboard API calls use absolute /api paths, so this join is unambiguous. */
export function resolveApiUrl(path: string, apiBaseUrl: string): string {
  if (!path.startsWith("/api/")) throw new Error("Dashboard API paths must start with /api/");
  const base = apiBaseUrl.trim().replace(/\/+$/, "");
  return base ? `${base}${path}` : path;
}

/**
 * `API_BASE_URL` empty → same-origin (local/dev). When the shared booking Worker
 * is on another origin, credentials must be included; W3 owns the CORS/cookie
 * configuration for that arrangement.
 */
export function createAdminDashboardApi(apiBaseUrl: string): DashboardApi {
  const crossOrigin = resolveApiUrl("/api/health", apiBaseUrl).startsWith("http");
  return createDashboardApi({
    fetchImpl: (input, init) => {
      const path = typeof input === "string" ? input : input instanceof URL ? input.pathname : input.url;
      const url = resolveApiUrl(path, apiBaseUrl);
      return fetch(url, crossOrigin ? { ...init, credentials: "include" } : init);
    },
  });
}
