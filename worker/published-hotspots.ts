/**
 * COW-82 guest cutover: published-only photo hotspots from D1.
 *
 * Webflow remains the default source. When PHOTO_HOTSPOT_SOURCE=d1, the guest
 * room-content response is overlaid with hotspots that are published, approved
 * and not deleted. Draft, pending-review and soft-deleted mappings can never
 * reach a guest. A D1 failure falls back to the existing Webflow payload; the
 * guest request never fetches Squarespace/Squarespace image-feed live.
 */
import type { Env } from "./mews/_lib.ts";
import type { CachedReviewPayload } from "./webflow/room-type-reviews.ts";
import type { CmsPhotoHotspotMap } from "../src/types/photo-hotspot-cms.ts";
import { cmsPhotoKeys } from "../src/lib/cmsPhotoHotspots.ts";
import { hotspotSource } from "./hotspot-source.ts";

interface PublishedHotspotRow {
  id: string;
  amenity_id: string;
  source_x: number;
  source_y: number;
  display_order: number;
  squarespace_asset_id: string | null;
  squarespace_url: string | null;
}

/** Photo keys that match cmsHighlightsForPhoto's lookup of the displayed image URL. */
function photoKeysForAsset(assetId: string | null, url: string | null): string[] {
  const keys = new Set<string>();
  if (assetId) for (const key of cmsPhotoKeys(assetId)) keys.add(key);
  if (url) for (const key of cmsPhotoKeys(url)) keys.add(key);
  return [...keys];
}

/**
 * Loads published hotspot mappings as a CmsPhotoHotspotMap keyed by canonical
 * photo identity. Only approved, published, non-deleted rows are eligible.
 */
export async function loadPublishedHotspots(
  db: D1Database,
  tenantId: string,
): Promise<CmsPhotoHotspotMap> {
  const result = await db.prepare(
    `SELECT m.id, m.amenity_id, m.source_x, m.source_y, m.display_order,
            a.squarespace_asset_id, a.squarespace_url
       FROM photo_hotspot_mappings m
       JOIN media_assets a ON a.id = m.media_asset_id AND a.tenant_id = m.tenant_id
      WHERE m.tenant_id = ?1
        AND m.status = 'published'
        AND m.review_state = 'approved'
        AND (m.review_reason IS NULL OR m.review_reason != 'deleted')
      ORDER BY a.id, m.display_order, m.id`,
  ).bind(tenantId).all();

  const map: CmsPhotoHotspotMap = {};
  for (const raw of (result.results ?? []) as unknown as PublishedHotspotRow[]) {
    const keys = photoKeysForAsset(raw.squarespace_asset_id, raw.squarespace_url);
    for (const key of keys) {
      (map[key] ??= []).push({
        id: raw.id,
        amenityId: raw.amenity_id,
        photoKey: key,
        x: raw.source_x * 100,
        y: raw.source_y * 100,
        order: raw.display_order,
      });
    }
  }
  return map;
}

/**
 * Overlay published D1 hotspots onto a guest payload. No-op unless the route
 * flag is enabled. On any D1 error the Webflow hotspots are preserved.
 */
export async function applyPublishedHotspots(
  env: Env,
  tenantId: string | undefined,
  payload: CachedReviewPayload,
): Promise<CachedReviewPayload> {
  if (hotspotSource(env) !== "d1") return payload;
  if (!env.DB || !tenantId?.trim()) return payload;
  try {
    const hotspots = await loadPublishedHotspots(env.DB, tenantId);
    return { ...payload, hotspots };
  } catch (error) {
    console.warn("[publishedHotspots] snapshot read failed; serving Webflow hotspots", error);
    return payload;
  }
}
