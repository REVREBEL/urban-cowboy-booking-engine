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
import { buildSnapshot, type PublishedRecord } from "./content-provider.ts";
import { getSnapshot, saveSnapshot } from "./published-snapshots.ts";

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

/**
 * Publication-safety refresh after an importer changes a delivery URL.
 *
 * The published `roomGallery` snapshot is immutable and is what guests read, so
 * a URL-only registry update would otherwise leave old URLs in the guest view.
 * This rebuilds a new content-addressed version from the snapshot's own records,
 * changing only `sourceUrl` for the affected media IDs. Working revisions and
 * unpublished editor drafts are never read or modified; the previous snapshot
 * version stays available for rollback.
 */
export async function refreshPublishedGalleryUrls(
  db: D1Database,
  tenantId: string,
  changedMediaIds: ReadonlySet<string>,
): Promise<{ refreshed: boolean; version: string | null }> {
  if (!changedMediaIds.size) return { refreshed: false, version: null };
  const snapshot = await getSnapshot(db, { tenantId }, "roomGallery");
  if (!snapshot) return { refreshed: false, version: null };

  let payload: { items?: PublishedRecord[] };
  try {
    payload = JSON.parse(snapshot.payloadJson) as { items?: PublishedRecord[] };
  } catch {
    return { refreshed: false, version: snapshot.version };
  }
  const records = Array.isArray(payload.items) ? payload.items : [];

  const { results } = await db.prepare(
    `SELECT a.id AS id, COALESCE(v.squarespace_url, a.squarespace_url) AS source_url
       FROM media_assets a
       LEFT JOIN media_asset_metadata md
         ON md.media_asset_id = a.id AND md.tenant_id = a.tenant_id
       LEFT JOIN media_versions v ON v.id = md.current_version_id
      WHERE a.tenant_id = ?1`,
  ).bind(tenantId).all<{ id: string; source_url: string | null }>();
  const currentUrls = new Map(results.map((row) => [row.id, row.source_url]));

  let changed = false;
  for (const record of records) {
    const items = record.payload?.items;
    if (!Array.isArray(items)) continue;
    for (const item of items) {
      if (typeof item.mediaAssetId !== "string" || !changedMediaIds.has(item.mediaAssetId)) continue;
      const next = currentUrls.get(item.mediaAssetId);
      if (typeof next === "string" && next.length > 0 && next !== item.sourceUrl) {
        item.sourceUrl = next;
        changed = true;
      }
    }
  }
  if (!changed) return { refreshed: false, version: snapshot.version };

  const built = await buildSnapshot("roomGallery", records);
  await saveSnapshot(db, { tenantId }, "roomGallery", built);
  return { refreshed: true, version: built.version };
}

/**
 * Overlay published D1 galleries when the per-route flag is enabled. Read
 * failures preserve the fallback and report through the optional callback so
 * callers can keep a partial response uncached.
 */
export async function applyPublishedGalleries(
  env: Env,
  tenantId: string | undefined,
  payload: CachedReviewPayload,
  onReadError?: (error: unknown) => void,
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
    onReadError?.(error);
    return payload;
  }
}
