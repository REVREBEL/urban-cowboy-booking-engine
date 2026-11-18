/**
 * Authoritative publication gate for source records whose D1 table has no
 * status column (COW-29 finding F-04). The 2026-11-15 Webflow export contains
 * one draft Room Type that the D1 `room_types` table cannot distinguish from
 * published rows. Until a status column and backfill exist, that ID is
 * excluded here rather than served by a published snapshot.
 */
import type { ContentCollection } from "./content-provider.ts";

export const UNPUBLISHED_SOURCE_IDS: Partial<Record<ContentCollection, readonly string[]>> = {
  roomTypes: ["6abd4a1debcab0ea7e461c9a"], // Walden Forest Bathing Suite with Den
};

export function isPublishedSource(collection: ContentCollection, id: string): boolean {
  return !(UNPUBLISHED_SOURCE_IDS[collection] ?? []).includes(id);
}

/** Number of source-state gaps still blocking a fully published-only collection. */
export function unresolvedPublicationCount(collection: ContentCollection): number {
  return (UNPUBLISHED_SOURCE_IDS[collection] ?? []).length;
}
