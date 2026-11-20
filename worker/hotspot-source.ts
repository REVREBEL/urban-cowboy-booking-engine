/**
 * COW-34 production guard. Hotspot mappings may be authored and reviewed in D1,
 * but guest rendering stays on Webflow until a per-route flag is explicitly
 * enabled and verified. An invalid value fails safe to Webflow.
 */
import type { Env } from "./mews/_lib.ts";

export type HotspotSource = "webflow" | "d1";

export function hotspotSource(
  env: Env & { PHOTO_HOTSPOT_SOURCE?: string },
): HotspotSource {
  const value = (env.PHOTO_HOTSPOT_SOURCE ?? "").trim().toLowerCase();
  return value === "d1" ? "d1" : "webflow";
}
