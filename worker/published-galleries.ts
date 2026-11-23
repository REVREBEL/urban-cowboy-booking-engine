/**
 * COW-106 guest overlay: published D1 room galleries keyed by stable media IDs.
 *
 * Data comes from the immutable published `roomGallery` snapshot, never from
 * live placement/version tables, so an unpublished edit cannot reach a guest.
 * A room is eligible only when its own `room_gallery` document is published.
 * The D1 view is merged per room: unmigrated rooms keep their Webflow gallery.
 *
 * The media asset ID is the identity; the delivery URL is a mutable field on the
 * master record. A URL-only change or provider switch therefore preserves room
 * links, amenity links and hotspot IDs/geometry. Webflow remains the default;
 * CONTENT_SOURCE_ROOM_GALLERIES=d1 opts into the D1 view, and any missing,
 * empty or unreadable data preserves the Webflow payload.
 */
import type { Env } from "./mews/_lib.ts";
import type { CachedReviewPayload } from "./webflow/room-type-reviews.ts";
import type { RoomTypeCmsGalleryMap } from "../src/types/room-type-cms.ts";
import { listPublishedRoomGallerySlugs } from "./d1.ts";
import { getSnapshot } from "./published-snapshots.ts";

interface SnapshotGalleryItem {
  mediaAssetId?: unknown;
  sourceUrl?: unknown;
}

interface SnapshotRecord {
  id?: unknown;
  payload?: {
    mewsRoomCategoryId?: unknown;
    items?: SnapshotGalleryItem[];
  };
}

/** Ordered public URLs per stable Mews room category, from published data only. */
export async function loadPublishedGalleries(
  db: D1Database,
  tenantId: string,
): Promise<RoomTypeCmsGalleryMap> {
  const [snapshot, publishedRooms] = await Promise.all([
    getSnapshot(db, { tenantId }, "roomGallery"),
    listPublishedRoomGallerySlugs(db, tenantId),
  ]);
  if (!snapshot || !publishedRooms.size) return {};

  let payload: { items?: SnapshotRecord[] };
  try {
    payload = JSON.parse(snapshot.payloadJson) as { items?: SnapshotRecord[] };
  } catch {
    return {};
  }

  const galleries: RoomTypeCmsGalleryMap = {};
  for (const record of payload.items ?? []) {
    const roomId = typeof record.id === "string" ? record.id : "";
    // A room whose gallery document is still draft must never be served.
    if (!publishedRooms.has(roomId)) continue;
    const mewsId = record.payload?.mewsRoomCategoryId;
    if (typeof mewsId !== "string" || !mewsId.trim()) continue;
    const images = (record.payload?.items ?? [])
      .map((item) => item.sourceUrl)
      .filter((url): url is string => typeof url === "string" && url.length > 0);
    if (!images.length) continue;
    galleries[mewsId] = { roomTypeId: mewsId, images };
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
    const d1Galleries = await loadPublishedGalleries(env.DB, tenantId);
    if (!Object.keys(d1Galleries).length) return payload;
    // Per-room merge: D1 wins only for rooms with a published gallery document.
    // Every other room keeps its existing Webflow gallery.
    const galleries: RoomTypeCmsGalleryMap = { ...payload.galleries };
    for (const [roomId, gallery] of Object.entries(d1Galleries)) galleries[roomId] = gallery;
    return { ...payload, galleries };
  } catch (error) {
    console.warn("[publishedGalleries] published snapshot read failed; serving Webflow galleries", error);
    return payload;
  }
}
