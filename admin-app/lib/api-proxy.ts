import { assertionFromHeaders, isSameOriginMutation } from "./auth.ts";
import { getAdminRuntimeConfig } from "./env.ts";

const ALLOWED_PREFIXES = ["/api/admin/", "/api/content/", "/api/d1/", "/api/analytics/"] as const;
const ALLOWED_EXACT_PATHS = new Set(["/api/recovery"]);
const ALLOWED_METHODS = new Set(["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"]);
const FORWARDED_REQUEST_HEADERS = ["accept", "content-type"] as const;
const FORWARDED_RESPONSE_HEADERS = ["content-type", "x-content-source", "retry-after"] as const;

export interface AdminProxyOptions {
  fetchImpl?: typeof fetch;
}

function jsonError(status: number, error: string, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, private",
      ...headers,
    },
  });
}

/** Keep the browser on the admin origin and restrict the server-side target. */
export function isAllowedDashboardApiPath(pathname: string): boolean {
  if (!pathname.startsWith("/api/") || pathname.includes("\\") || /%2f|%5c/i.test(pathname)) {
    return false;
  }
  let decoded: string;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return false;
  }
  if (decoded.includes("\\") || decoded.split("/").some((segment) => segment === "." || segment === "..")) {
    return false;
  }
  return ALLOWED_EXACT_PATHS.has(pathname) || ALLOWED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function upstreamUrl(requestUrl: string, apiBaseUrl: string): URL | null {
  const incoming = new URL(requestUrl);
  if (!isAllowedDashboardApiPath(incoming.pathname)) return null;
  const upstream = new URL(apiBaseUrl);
  upstream.pathname = incoming.pathname;
  upstream.search = incoming.search;
  return upstream;
}

function requestHeaders(source: Headers, assertion: string): Headers {
  const headers = new Headers();
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = source.get(name);
    if (value) headers.set(name, value);
  }
  headers.set("cf-access-jwt-assertion", assertion);
  return headers;
}

function upstreamResponse(response: Response): Response {
  if (response.status >= 300 && response.status < 400) {
    return jsonError(502, "upstream_redirect_rejected");
  }
  const headers = new Headers({
    "Cache-Control": "no-store, private",
    Vary: "Cookie, Authorization",
  });
  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = response.headers.get(name);
    if (value) headers.set(name, value);
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

/**
 * Forward a dashboard API request after the route has verified the admin
 * session. The Access assertion stays server-side; cookies, authorization and
 * client-supplied assertion headers are never copied from the browser.
 */
export async function proxyDashboardRequest(
  request: Request,
  assertion: string,
  options: AdminProxyOptions = {},
): Promise<Response> {
  if (!ALLOWED_METHODS.has(request.method)) {
    return jsonError(405, "method_not_allowed", { Allow: [...ALLOWED_METHODS].join(", ") });
  }
  if (!isSameOriginMutation(request)) return jsonError(403, "origin_not_allowed");
  if (!assertion.trim()) return jsonError(401, "unauthorized");

  let config;
  try {
    config = getAdminRuntimeConfig();
  } catch {
    return jsonError(503, "api_proxy_not_configured");
  }
  if (!config.apiBaseUrl) return jsonError(503, "api_proxy_not_configured");
  if (new URL(config.apiBaseUrl).origin === new URL(request.url).origin) {
    return jsonError(503, "api_proxy_not_configured");
  }

  const url = upstreamUrl(request.url, config.apiBaseUrl);
  if (!url) return jsonError(404, "not_found");

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  let body: ArrayBuffer | undefined;
  if (hasBody && request.body) {
    try {
      body = await request.arrayBuffer();
    } catch {
      return jsonError(400, "invalid_body");
    }
  }
  const doFetch = options.fetchImpl ?? fetch;
  let response: Response;
  try {
    response = await doFetch(url, {
      method: request.method,
      headers: requestHeaders(request.headers, assertion.trim()),
      body,
      redirect: "manual",
      signal: AbortSignal.timeout(config.requestTimeoutMs),
    });
  } catch {
    return jsonError(502, "upstream_unavailable");
  }
  return upstreamResponse(response);
}
