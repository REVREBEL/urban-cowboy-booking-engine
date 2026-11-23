/**
 * COW-106 guest overlay: published D1 room galleries keyed by stable media IDs.
 *
 * The gallery URL is a mutable field on the media master (current version), so
 * a URL-only change or provider switch does not alter media_asset_id, the room
 * placement, amenity links or hotspot IDs/geometry. Webflow remains the default
 * source; CONTENT_SOURCE_ROOM_GALLERIES=d1 opts a guest request into the D1 view.
 * Any missing, empty or unreadable D1 data preserves the Webflow payload.
 */
import type { Env } from "./mews/_lib.ts";
import type { CachedReviewPayload } from "./webflow/room-type-reviews.ts";
import type { RoomTypeCmsGalleryMap } from "../src/types/room-type-cms.ts";
import { listPublishedGalleryRows } from "./d1.ts";

/** Parked import/editor rows are not guest-facing. */
const PARK_OFFSET = 1_000_000;

/** Ordered public URLs per stable Mews room category ID. */
export async function loadPublishedGalleries(
  db: D1Database,
  tenantId: string,
): Promise<RoomTypeCmsGalleryMap> {
  const rows = await listPublishedGalleryRows(db, tenantId);
  const galleries: RoomTypeCmsGalleryMap = {};
  for (const row of rows) {
    if (row.excluded || row.displayOrder >= PARK_OFFSET || !row.sourceUrl) continue;
    const roomId = row.mewsRoomCategoryId;
    const gallery = (galleries[roomId] ??= { roomTypeId: roomId, images: [] });
    gallery.images.push(row.sourceUrl);
  }
  return galleries;
}

/** Overlay published D1 galleries when the per-route flag is enabled. */
export async function applyPublishedGalleries(
  env: Env,
  tenantId: string | undefined,
  payload: CachedReviewPayload,
): Promise<CachedReviewPayload> {
  if (env.CONTENT_SOURCE_ROOM_GALLERIES !== "d1") return payload;
  if (!env.DB || !tenantId?.trim()) return payload;
  try {
    const galleries = await loadPublishedGalleries(env.DB, tenantId);
    // An empty D1 view is not evidence that Webflow should be blanked.
    if (!Object.keys(galleries).length) return payload;
    return { ...payload, galleries };
  } catch (error) {
    console.warn("[publishedGalleries] D1 snapshot read failed; serving Webflow galleries", error);
    return payload;
  }
}
