/**
 * Server-only runtime configuration for the admin app.
 *
 * String bindings are exposed on process.env by Workers with nodejs_compat and
 * a compatibility date >= 2025-04-01 (see admin-app/cloudflare.config.ts).
 * Never import this module from a client component: values are read at runtime
 * on the edge, not inlined into the browser bundle.
 */
export interface AdminRuntimeConfig {
  /** Origin of the shared booking-engine Worker APIs; empty means same-origin. */
  apiBaseUrl: string;
  /** Deadline applied to admin API requests by the client in W1.4. */
  requestTimeoutMs: number;
}

const DEFAULT_TIMEOUT_MS = 8_000;

export function getAdminRuntimeConfig(): AdminRuntimeConfig {
  const rawBase = process.env.API_BASE_URL?.trim() ?? "";
  let apiBaseUrl = "";
  if (rawBase) {
    let parsed: URL;
    try {
      parsed = new URL(rawBase);
    } catch {
      throw new Error("API_BASE_URL must be an absolute http(s) origin or empty for same-origin requests");
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("API_BASE_URL must use http or https");
    }
    if (parsed.username || parsed.password) {
      throw new Error("API_BASE_URL must not contain credentials");
    }
    if (parsed.search || parsed.hash) {
      throw new Error("API_BASE_URL must not contain a query string or fragment");
    }
    if (!/^\/+$/.test(parsed.pathname)) {
      throw new Error("API_BASE_URL must be an origin without a path");
    }
    apiBaseUrl = parsed.origin;
  }

  const rawTimeout = process.env.API_REQUEST_TIMEOUT_MS?.trim();
  const requestTimeoutMs =
    rawTimeout === undefined || rawTimeout === ""
      ? DEFAULT_TIMEOUT_MS
      : Number(rawTimeout);
  if (
    !Number.isInteger(requestTimeoutMs) ||
    requestTimeoutMs < 1_000 ||
    requestTimeoutMs > 60_000
  ) {
    throw new Error("API_REQUEST_TIMEOUT_MS must be an integer between 1000 and 60000");
  }

  return { apiBaseUrl, requestTimeoutMs };
}
