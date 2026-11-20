/**
 * COW-73 guest parity: overlay published D1 amenity content onto the room
 * content response. Webflow stays the fallback for rooms/content not yet
 * migrated, and its published-only + room-eligibility rules are unchanged.
 *
 * The D1 snapshot is immutable and only refreshed on publish/rollback, so a
 * draft edit can never reach a guest through this path.
 */
import type { Env } from "./mews/_lib.ts";
import type { CachedReviewPayload } from "./webflow/room-type-reviews.ts";
import type { CmsRoomAmenity, RoomTypeCmsAmenityMap } from "../src/types/photo-hotspot-cms.ts";
import { cmsIconUrl } from "../src/lib/cmsPhotoHotspots.ts";
import { getSnapshot } from "./published-snapshots.ts";

const ICON_NAME = /^[a-z0-9_-]+\.svg$/i;

function iconPath(imagePath: string | null, imageName: string | null): string | null {
  const explicit = cmsIconUrl(imagePath);
  if (explicit) return explicit;
  const name = imageName?.trim();
  return name && ICON_NAME.test(name)
    ? cmsIconUrl(`assets/icons/icons-simple/${name}`)
    : null;
}

interface SnapshotAmenity {
  amenityId: string;
  name: string;
  shortName: string | null;
  shortDescription: string | null;
  longDescription: string | null;
  imagePath: string | null;
  imageName: string | null;
  displayOrder: number;
  excluded: boolean;
}

/** Returns the payload unchanged when D1 has no published amenity snapshot. */
export async function applyPublishedAmenities(
  env: Env,
  tenantId: string | undefined,
  payload: CachedReviewPayload,
): Promise<CachedReviewPayload> {
  if (!env.DB || !tenantId?.trim()) return payload;
  let snapshot;
  try {
    snapshot = await getSnapshot(env.DB, { tenantId }, "roomAmenities");
  } catch (error) {
    // A D1 outage must never take down the existing Webflow room-content
    // response (reviews, galleries, hotspots and descriptions included).
    console.warn("[publishedAmenities] snapshot read failed; serving Webflow content", error);
    return payload;
  }
  if (!snapshot) return payload;

  let stored: unknown;
  try { stored = JSON.parse(snapshot.payloadJson); }
  catch { return payload; }
  const records = (stored as { items?: { id: string; payload: Record<string, unknown> }[] } | null)?.items;
  if (!Array.isArray(records) || records.length === 0) return payload;

  // Preserve the Webflow Image field URL, which D1's local SVG contract has no
  // equivalent for, so existing hero artwork keeps rendering.
  const webflowImageUrls = new Map<string, string | null>();
  for (const list of Object.values(payload.amenities)) {
    for (const amenity of list) webflowImageUrls.set(amenity.id, amenity.imageUrl ?? null);
  }

  const overlay: RoomTypeCmsAmenityMap = {};
  for (const record of records) {
    const roomId = String(record.payload?.mewsRoomCategoryId ?? "");
    // Only rooms an editor explicitly migrated (published their own assignment
    // document) may replace the Webflow list. An intentionally emptied migrated
    // room still overlays with []; an unmigrated room keeps its Webflow fallback.
    if (!roomId || record.payload?.migrated !== true) continue;
    const amenities = Array.isArray(record.payload?.amenities)
      ? record.payload.amenities as SnapshotAmenity[] : [];
    const mapped: CmsRoomAmenity[] = amenities
      .slice()
      .sort((a, b) => a.displayOrder - b.displayOrder || a.amenityId.localeCompare(b.amenityId))
      .map((amenity) => ({
        id: amenity.amenityId,
        name: amenity.name,
        shortName: amenity.shortName || amenity.name,
        shortDescription: amenity.shortDescription ?? null,
        longDescription: amenity.longDescription ?? null,
        iconPath: iconPath(amenity.imagePath, amenity.imageName),
        imageUrl: webflowImageUrls.get(amenity.amenityId) ?? null,
        restricted: amenity.excluded === true,
      }));
    overlay[roomId] = mapped;
  }

  return {
    ...payload,
    amenities: { ...payload.amenities, ...overlay },
  };
}
