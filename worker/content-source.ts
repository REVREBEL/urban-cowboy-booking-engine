/** Content-source feature flag and cache policy (COW-32). */

import type { Env } from "./mews/_lib.ts";

export type ContentSource = "webflow" | "shadow" | "d1";

function parseSource(value: string | undefined): ContentSource | null {
  const normalized = (value ?? "").trim().toLowerCase();
  return normalized === "shadow" || normalized === "d1" ? normalized : null;
}

/** Default is webflow: enabling this PR never switches guest-facing reads. */
export function contentSource(env: Env): ContentSource {
  return parseSource(env.CONTENT_SOURCE) ?? "webflow";
}

/** Routes with an independent flag, so one collection can roll back alone. */
export const ROUTE_SOURCE_ENV_KEYS = {
  policyLanguage: "CONTENT_SOURCE_POLICY_LANGUAGE",
  siteSettings: "CONTENT_SOURCE_SITE_SETTINGS",
} as const;
export type RoutedContentCollection = keyof typeof ROUTE_SOURCE_ENV_KEYS;

export function routeContentSource(env: Env, route: RoutedContentCollection): ContentSource {
  const override = (env[ROUTE_SOURCE_ENV_KEYS[route]] ?? "").trim().toLowerCase();
  // An explicit but unrecognised override is a misconfiguration. Fail safe to
  // Webflow instead of inheriting a global d1 flag for a route not verified here.
  if (override === "webflow") return "webflow";
  if (override && override !== "shadow" && override !== "d1") return "webflow";
  return parseSource(override) ?? contentSource(env);
}

export const NO_STORE_HEADERS: Readonly<Record<string, string>> = Object.freeze({
  "Content-Type": "application/json",
  "Cache-Control": "no-store, private",
});

/** Public snapshots are cacheable at the edge but pinned by their version ETag. */
export function snapshotHeaders(version: string, source: ContentSource): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=60",
    ETag: `"${version}"`,
    "X-Content-Source": source,
  };
}

export function jsonResponse(body: unknown, status: number, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(body), { status, headers });
}
