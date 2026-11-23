/**
 * COW-82 guest cutover: published-only, room-scoped photo hotspots from D1.
 *
 * Webflow remains the default source. When PHOTO_HOTSPOT_SOURCE=d1, the guest
 * room-content response is overlaid with hotspots that are published, approved
 * and not deleted, grouped by the room (placement target) they belong to. A
 * photo placed in two rooms keeps each room's pins separate.
 *
 * Stored geometry is normalized source-space coordinates. For display we apply
 * the mapping's crop remap and EXIF orientation so a cropped/rotated photo
 * shows pins in the right place. A D1 failure preserves the Webflow payload.
 */
import type { Env } from "./mews/_lib.ts";
import type { CachedReviewPayload } from "./webflow/room-type-reviews.ts";
import type { CmsPhotoHotspotMap, CmsPhotoHotspotMapByRoom } from "../src/types/photo-hotspot-cms.ts";
import {
  remapCrop,
  toDisplayPercent,
  transformOrientation,
  type ExifOrientation,
} from "../src/lib/hotspotGeometry.ts";
import { cmsPhotoKeys } from "../src/lib/cmsPhotoHotspots.ts";
import { hotspotSource } from "./hotspot-source.ts";

interface PublishedHotspotRow {
  id: string;
  room_id: string;
  amenity_id: string;
  source_x: number;
  source_y: number;
  display_order: number;
  source_width: number | null;
  source_height: number | null;
  exif_orientation: number;
  crop_left: number | null;
  crop_top: number | null;
  crop_width: number | null;
  crop_height: number | null;
  squarespace_asset_id: string | null;
  squarespace_url: string | null;
  current_orientation: number | null;
}

function photoKeysForAsset(assetId: string | null, url: string | null): string[] {
  const keys = new Set<string>();
  if (assetId) for (const key of cmsPhotoKeys(assetId)) keys.add(key);
  if (url) for (const key of cmsPhotoKeys(url)) keys.add(key);
  return [...keys];
}

/** Guest display point from stored source-space geometry. */
export function guestPoint(row: PublishedHotspotRow): { x: number; y: number } {
  const source = { width: row.source_width ?? 0, height: row.source_height ?? 0 };
  const crop = row.crop_left !== null && row.crop_top !== null &&
    row.crop_width !== null && row.crop_height !== null
    ? { left: row.crop_left, top: row.crop_top, width: row.crop_width, height: row.crop_height }
    : null;
  let point = { x: row.source_x, y: row.source_y };
  const remapped = remapCrop(point, source, crop);
  if (remapped) point = remapped;
  const from = (row.exif_orientation || 1) as ExifOrientation;
  const to = (row.current_orientation || from) as ExifOrientation;
  if (to !== from) point = transformOrientation(point, from, to);
  return toDisplayPercent(point);
}

/**
 * Loads published hotspot mappings grouped by room, then by canonical photo
 * identity. Only approved, published, non-deleted rows are eligible.
 */
export async function loadPublishedHotspots(
  db: D1Database,
  tenantId: string,
): Promise<CmsPhotoHotspotMapByRoom> {
  const result = await db.prepare(
    `SELECT m.id, p.target_id AS room_id, m.amenity_id, m.source_x, m.source_y,
            m.display_order, m.source_width, m.source_height, m.exif_orientation,
            m.crop_left, m.crop_top, m.crop_width, m.crop_height,
            a.squarespace_asset_id, a.squarespace_url,
            cf.exif_orientation AS current_orientation
       FROM photo_hotspot_mappings m
       JOIN media_placements p
         ON p.id = m.placement_id AND p.tenant_id = m.tenant_id AND p.target_table = 'room_types'
       JOIN media_assets a ON a.id = m.media_asset_id AND a.tenant_id = m.tenant_id
       LEFT JOIN media_asset_metadata md
         ON md.media_asset_id = a.id AND md.tenant_id = a.tenant_id
       LEFT JOIN media_version_fingerprints cf
         ON cf.version_id = md.current_version_id AND cf.tenant_id = a.tenant_id
      WHERE m.tenant_id = ?1
        AND m.status = 'published'
        AND m.review_state = 'approved'
        AND (m.review_reason IS NULL OR m.review_reason != 'deleted')
      ORDER BY p.target_id, a.id, m.display_order, m.id`,
  ).bind(tenantId).all();

  const byRoom: CmsPhotoHotspotMapByRoom = {};
  for (const raw of (result.results ?? []) as unknown as PublishedHotspotRow[]) {
    const point = guestPoint(raw);
    for (const key of photoKeysForAsset(raw.squarespace_asset_id, raw.squarespace_url)) {
      const roomMap = (byRoom[raw.room_id] ??= {} as CmsPhotoHotspotMap);
      (roomMap[key] ??= []).push({
        id: raw.id,
        amenityId: raw.amenity_id,
        photoKey: key,
        x: point.x,
        y: point.y,
        order: raw.display_order,
      });
    }
  }
  return byRoom;
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
    const hotspotsByRoom = await loadPublishedHotspots(env.DB, tenantId);
    // Legacy clients that only understand the flat map must not receive a
    // merged cross-room set; they get no D1 hotspots rather than wrong pins.
    return { ...payload, hotspotsByRoom, hotspots: {} };
  } catch (error) {
    console.warn("[publishedHotspots] snapshot read failed; serving Webflow hotspots", error);
    return payload;
  }
}
