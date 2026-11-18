/** Content-source feature flag and cache policy (COW-32). */

import type { Env } from "./mews/_lib.ts";

export type ContentSource = "webflow" | "shadow" | "d1";

/** Default is webflow: enabling this PR never switches guest-facing reads. */
export function contentSource(env: Env): ContentSource {
  const value = (env.CONTENT_SOURCE ?? "").trim().toLowerCase();
  return value === "shadow" || value === "d1" ? value : "webflow";
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
