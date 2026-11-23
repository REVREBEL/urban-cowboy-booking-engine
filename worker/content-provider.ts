/**
 * Typed D1 content provider for published snapshots (COW-32).
 *
 * Reads are tenant-scoped and return contract-validated rows. Snapshots are
 * versioned by a deterministic hash of their canonical payload, so a refresh
 * that changes nothing keeps the same version and a pinned version always
 * resolves to the same bytes. Mews remains the transactional authority: none
 * of these collections carries price, availability or reservation state.
 */
import {
  getDb,
  listPublishedRoomAmenitySlugs,
  listRoomAmenityAssignmentsForTenant,
  listRoomGallery,
  listScopedAddOns,
  listScopedAmenities,
  listScopedAmenityEditorial,
  listScopedBuildings,
  listScopedContentItems,
  listScopedEvents,
  listScopedLocations,
  listScopedRoomTypes,
  publishedLocationIds,
  publishedRoomTypeIds,
  type TenantScope,
} from "./d1.ts";
import type { Env } from "./mews/_lib.ts";
import { isPublishedSource } from "./publication-gate.ts";

export const CONTENT_COLLECTIONS = [
  "locations",
  "buildings",
  "roomTypes",
  "amenities",
  "roomAmenities",
  "roomGallery",
  "addOns",
  "events",
  "contentItems",
  "policyLanguage",
] as const;
export type ContentCollection = (typeof CONTENT_COLLECTIONS)[number];

export interface PublishedRecord {
  id: string;
  collection: ContentCollection;
  payload: Record<string, unknown>;
}

/** Comparable projection used for Webflow ↔ D1 parity. */
export interface ParityItem {
  id: string;
  slug: string | null;
  name: string | null;
  published: boolean;
}

export function isContentCollection(value: string): value is ContentCollection {
  return (CONTENT_COLLECTIONS as readonly string[]).includes(value);
}

export async function loadPublishedCollection(
  db: D1Database,
  scope: TenantScope,
  collection: ContentCollection,
): Promise<PublishedRecord[]> {
  const records = await loadAllRows(db, scope, collection);
  // COW-97: publication state for room types and locations now comes from the
  // extension tables, not a hardcoded source-ID deny-list. The deny-list stays
  // as the fallback for collections without a publication contract.
  const publishedIds =
    collection === "roomTypes" || collection === "roomAmenities"
      ? await publishedRoomTypeIds(db, scope)
      : collection === "locations"
        ? await publishedLocationIds(db, scope)
        : null;
  return records.filter((record) =>
    publishedIds ? publishedIds.has(record.id) : isPublishedSource(collection, record.id),
  );
}

async function loadAllRows(
  db: D1Database,
  scope: TenantScope,
  collection: ContentCollection,
): Promise<PublishedRecord[]> {
  switch (collection) {
    case "locations":
      return (await listScopedLocations(db, scope)).map((row) => ({
        id: row.id, collection, payload: {
          slug: row.slug, name: row.name, timeZone: row.timeZone,
          mewsHotelId: row.mewsHotelId, createdAt: row.createdAt,
        },
      }));
    case "buildings":
      return (await listScopedBuildings(db, scope)).map((row) => ({
        id: row.id, collection, payload: {
          locationId: row.locationId, name: row.name, slug: row.slug,
          sortOrder: row.sortOrder, createdAt: row.createdAt,
        },
      }));
    case "roomTypes":
      return (await listScopedRoomTypes(db, scope)).map((row) => ({
        id: row.id, collection, payload: {
          locationId: row.locationId, mewsRoomCategoryId: row.mewsRoomCategoryId,
          name: row.name, slug: row.slug, sortOrder: row.sortOrder,
        },
      }));
    case "amenities": {
      const amenities = await listScopedAmenities(db, scope);
      const editorial = await listScopedAmenityEditorial(db, scope);
      const editorialById = new Map(editorial.map((row) => [row.amenityId, row]));
      return amenities.map((row) => {
        const content = editorialById.get(row.id);
        return {
          id: row.id, collection, payload: {
            name: row.name, imageName: row.imageName, imagePath: row.imagePath,
            sortOrder: row.sortOrder,
            shortName: content?.shortName ?? row.name,
            shortDescription: content?.shortDescription ?? null,
            longDescription: content?.longDescription ?? null,
            active: content?.active ?? true,
          },
        };
      });
    }
    case "roomAmenities": {
      // One document per room type, keyed by the canonical Webflow id. A room
      // only becomes guest-facing here after its OWN room_amenities document is
      // published; otherwise the guest keeps Webflow. This also keeps imported
      // draft rooms (which D1 cannot flag) out of the published view.
      const [rooms, migratedSlugs, allAssignments] = await Promise.all([
        listScopedRoomTypes(db, scope),
        listPublishedRoomAmenitySlugs(db, scope.tenantId),
        listRoomAmenityAssignmentsForTenant(db, scope.tenantId, true),
      ]);
      const byRoom = new Map<string, typeof allAssignments>();
      for (const assignment of allAssignments) {
        const list = byRoom.get(assignment.roomTypeId) ?? [];
        list.push(assignment);
        byRoom.set(assignment.roomTypeId, list);
      }
      return rooms
        .map((room) => ({
          id: room.id, collection, payload: {
            mewsRoomCategoryId: room.mewsRoomCategoryId,
            migrated: migratedSlugs.has(room.id),
            amenities: (byRoom.get(room.id) ?? []).map((amenity) => ({
              amenityId: amenity.amenityId,
              name: amenity.name,
              shortName: amenity.shortName,
              shortDescription: amenity.shortDescription,
              longDescription: amenity.longDescription,
              imagePath: amenity.imagePath,
              imageName: amenity.imageName,
              displayOrder: amenity.displayOrder,
              excluded: amenity.excluded,
            })),
          },
        }));
    }
    case "roomGallery": {
      // Published room galleries for guest Photo Journey. Excluded photos and
      // COW-67-parked rows stay out of the guest view.
      const rooms = await listScopedRoomTypes(db, scope);
      return Promise.all(rooms.map(async (room) => {
        const items = await listRoomGallery(db, scope.tenantId, room.id);
        return {
          id: room.id, collection, payload: {
            mewsRoomCategoryId: room.mewsRoomCategoryId,
            items: items
              .filter((item) => !item.excluded && item.displayOrder < 1_000_000)
              .map((item) => ({
                mediaAssetId: item.mediaAssetId,
                sourceUrl: item.sourceUrl,
                altText: item.altText,
                caption: item.caption,
                description: item.description,
                displayOrder: item.displayOrder,
              })),
          },
        };
      }));
    }
    case "addOns":
      return (await listScopedAddOns(db, scope)).map((row) => ({
        id: row.id, collection, payload: {
          locationId: row.locationId, name: row.name, description: row.description,
          mewsProductId: row.mewsProductId, quantityCap: row.quantityCap,
          sortOrder: row.sortOrder, status: row.status,
        },
      }));
    case "events":
      return (await listScopedEvents(db, scope)).map((row) => ({
        id: row.id, collection, payload: {
          locationId: row.locationId, title: row.title, description: row.description,
          venue: row.venue, timeZone: row.timeZone, startsAt: row.startsAt,
          endsAt: row.endsAt, recurrenceRule: row.recurrenceRule,
          displayFlag: row.displayFlag, mediaAssetId: row.mediaAssetId,
        },
      }));
    case "contentItems":
      return (await listScopedContentItems(db, scope)).map((row) => ({
        id: row.id, collection, payload: {
          locationId: row.locationId, kind: row.kind, slug: row.slug,
          status: row.status, currentRevisionId: row.currentRevisionId,
        },
      }));
    case "policyLanguage":
      return (await listScopedContentItems(db, scope, "policy"))
        .filter((row) => row.slug === "policy-language")
        .map((row) => ({
          id: row.id, collection, payload: { slug: row.slug, status: row.status },
        }));
  }
}

/** Deterministic JSON: object keys sorted recursively, arrays preserved. */
export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, v]) => `${JSON.stringify(key)}:${canonicalJson(v)}`);
    return `{${entries.join(",")}}`;
  }
  return JSON.stringify(value ?? null);
}

export async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export interface BuiltSnapshot {
  version: string;
  checksum: string;
  itemCount: number;
  payloadJson: string;
}

/** Builds an immutable snapshot; identical inputs always yield the same version. */
export async function buildSnapshot(
  collection: ContentCollection,
  records: PublishedRecord[],
): Promise<BuiltSnapshot> {
  const ordered = [...records].sort((a, b) => a.id.localeCompare(b.id));
  const canonical = canonicalJson(ordered);
  const checksum = await sha256Hex(canonical);
  return {
    version: checksum,
    checksum,
    itemCount: ordered.length,
    payloadJson: JSON.stringify({
      collection,
      version: checksum,
      itemCount: ordered.length,
      items: ordered,
    }),
  };
}

/** Collections whose D1 table has no publication column; presence is publication. */
const IMPLICITLY_PUBLISHED = new Set<ContentCollection>([
  "locations", "buildings", "roomTypes", "amenities", "roomAmenities", "roomGallery",
]);

/** Small, comparable projection for structured parity reporting. */
export function toParityItems(records: PublishedRecord[]): ParityItem[] {
  return records.map((record) => {
    const p = record.payload;
    const published = IMPLICITLY_PUBLISHED.has(record.collection) ||
      p.status === "published" || p.displayFlag === true;
    return {
      id: record.id,
      slug: typeof p.slug === "string" ? p.slug : null,
      name: typeof p.name === "string" ? p.name : null,
      published,
    };
  }).sort((a, b) => a.id.localeCompare(b.id));
}

export function dbForContent(env: Env): D1Database {
  const db = getDb(env);
  if (!db) throw new Error("D1 not configured");
  return db;
}
