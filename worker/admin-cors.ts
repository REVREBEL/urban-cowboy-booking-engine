/**
 * COW-82: single-origin credentialed CORS boundary for the deployed React admin.
 * Kept in its own module so the behavior is testable without importing the
 * bundler-style Worker entrypoint.
 */

export const ADMIN_ORIGIN = "https://urban-cowboy-admin.revrebel.workers.dev";

export function isAdminOrigin(request: Request): boolean {
  return request.headers.get("origin") === ADMIN_ORIGIN;
}

export function isCorsPreflight(request: Request): boolean {
  return request.method === "OPTIONS" &&
    request.headers.has("access-control-request-method");
}

export function preflightResponse(request: Request): Response | null {
  if (!isAdminOrigin(request) || !isCorsPreflight(request)) return null;
  return new Response(null, { status: 204, headers: corsHeaders(ADMIN_ORIGIN) });
}

function corsHeaders(origin: string): HeadersInit {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, authorization, cf-access-token",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

/** Adds credentialed CORS headers only for the approved origin, preserving upstream Vary. */
export function withAdminCors(request: Request, response: Response): Response {
  if (!isAdminOrigin(request)) return response;
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders(ADMIN_ORIGIN))) {
    if (key.toLowerCase() !== "vary") headers.set(key, value);
  }
  const vary = headers.get("vary");
  const values = vary ? vary.split(",").map((part) => part.trim().toLowerCase()) : [];
  if (!values.includes("origin")) headers.set("vary", vary ? `${vary}, Origin` : "Origin");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
