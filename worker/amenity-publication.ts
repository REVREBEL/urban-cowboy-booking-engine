/**
 * COW-73: publish-time write-through from the COW-38 revision documents to the
 * canonical amenity tables, plus published snapshot refreshes.
 *
 * Editing always lands in content_revisions first. Only publish/rollback moves
 * values into `amenities`, `amenity_editorial` and `room_type_amenities`, so the
 * guest never observes a draft. These helpers are called from content-editor.ts
 * with prepared statements added to the same atomic D1 batch as the pointer
 * update; the snapshot refresh is best-effort and mirrors the existing editor.
 */
import type { Env } from "./mews/_lib.ts";
import {
  AMENITY_CONTENT_KIND,
  ROOM_AMENITIES_KIND,
  amenityContentPayloadSchema,
  roomAmenitiesPayloadSchema,
} from "../src/types/editor-contracts.ts";
import {
  buildSnapshot,
  loadPublishedCollection,
  type ContentCollection,
} from "./content-provider.ts";
import { saveSnapshot } from "./published-snapshots.ts";

export type WriteThroughResult =
  | { statements: D1PreparedStatement[] }
  | { error: string; status: number };

const fail = (error: string, status = 400): WriteThroughResult => ({ error, status });

function parsePayload(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Validates the draft payload and builds the canonical writes for one published
 * document. A malformed payload or a foreign id fails before any statement is
 * produced, so publish never partially applies an amenity edit.
 */
export async function amenityWriteThrough(
  db: D1Database,
  tenantId: string,
  kind: string,
  slug: string,
  payloadJson: string,
): Promise<WriteThroughResult> {
  const payload = parsePayload(payloadJson);
  if (kind === AMENITY_CONTENT_KIND) {
    const parsed = amenityContentPayloadSchema.safeParse(payload);
    if (!parsed.success) return fail("invalid_amenity_content");
    const amenity = await db.prepare(
      "SELECT id FROM amenities WHERE id = ?1 AND tenant_id = ?2",
    ).bind(slug, tenantId).first();
    if (!amenity) return fail("amenity_not_found", 404);
    const value = parsed.data;
    return {
      statements: [
        db.prepare(
          `INSERT INTO amenity_editorial
             (amenity_id, tenant_id, short_name, short_description, long_description, active, updated_at)
           VALUES (?1, ?2, ?3, ?4, ?5, ?6, datetime('now'))
           ON CONFLICT (amenity_id) DO UPDATE SET
             short_name = excluded.short_name,
             short_description = excluded.short_description,
             long_description = excluded.long_description,
             active = excluded.active,
             updated_at = datetime('now')`,
        ).bind(slug, tenantId, value.shortName, value.shortDescription, value.longDescription, value.active ? 1 : 0),
        db.prepare(
          "UPDATE amenities SET name = COALESCE(?1, name), image_name = ?2, image_path = ?3 WHERE id = ?4 AND tenant_id = ?5",
        ).bind(value.name ?? null, value.imageName ?? null, value.imagePath ?? null, slug, tenantId),
      ],
    };
  }

  if (kind === ROOM_AMENITIES_KIND) {
    const parsed = roomAmenitiesPayloadSchema.safeParse(payload);
    if (!parsed.success) return fail("invalid_room_amenities");
    const room = await db.prepare(
      "SELECT id FROM room_types WHERE id = ?1 AND tenant_id = ?2",
    ).bind(slug, tenantId).first();
    if (!room) return fail("room_not_found", 404);

    const ids = parsed.data.items.map((item) => item.amenityId);
    if (ids.length) {
      const placeholders = ids.map((_, index) => `?${index + 2}`).join(", ");
      const found = await db.prepare(
        `SELECT id FROM amenities WHERE tenant_id = ?1 AND id IN (${placeholders})`,
      ).bind(tenantId, ...ids).all();
      const foundIds = new Set((found.results ?? []).map((row: any) => row.id as string));
      if (foundIds.size !== ids.length) return fail("amenity_not_in_tenant");
    }

    const statements: D1PreparedStatement[] = [
      db.prepare("DELETE FROM room_type_amenities WHERE room_type_id = ?1").bind(slug),
    ];
    for (const item of parsed.data.items) {
      statements.push(db.prepare(
        `INSERT INTO room_type_amenities (room_type_id, amenity_id, display_order, excluded)
         VALUES (?1, ?2, ?3, ?4)`,
      ).bind(slug, item.amenityId, item.displayOrder, item.excluded ? 1 : 0));
    }
    return { statements };
  }

  // Other editor kinds (policy, site settings, events...) keep their existing
  // publish path: no canonical amenity writes and no extra statements.
  return { statements: [] };
}

/** Collections whose published snapshot changes when an amenity document publishes. */
export function amenitySnapshotCollections(kind: string): ContentCollection[] {
  if (kind === AMENITY_CONTENT_KIND) return ["amenities", "roomAmenities"];
  if (kind === ROOM_AMENITIES_KIND) return ["roomAmenities"];
  return [];
}

/** Best-effort refresh; a failed refresh never rolls back a committed publish. */
export async function refreshAmenitySnapshots(
  db: D1Database,
  tenantId: string,
  collections: ContentCollection[],
): Promise<boolean> {
  if (!collections.length) return true;
  try {
    const scope = { tenantId };
    for (const collection of collections) {
      const records = await loadPublishedCollection(db, scope, collection);
      await saveSnapshot(db, scope, collection, await buildSnapshot(collection, records));
    }
    return true;
  } catch (err) {
    console.error("[amenityPublication] published snapshot refresh failed", err);
    return false;
  }
}
