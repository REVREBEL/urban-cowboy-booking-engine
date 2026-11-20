/**
 * COW-84 publish-time write-through for room gallery documents.
 *
 * Editors only change a COW-38 revision. Publishing moves the ordered list into
 * COW-33 placements, placement metadata and per-photo flags. Source URLs and
 * asset identity are registry facts and are never written from the payload.
 *
 * Ordering is two-phase so a reorder cannot hit the (room, display_order)
 * UNIQUE constraint: active placements are temporarily parked above the editor
 * range, then rewritten at 1..N. Imported rows parked by COW-67 (above
 * PARK_OFFSET) are left untouched, so reconciliation does not overwrite
 * deliberate editor changes or resurrect removed images.
 */
import { ROOM_GALLERY_KIND, roomGalleryPayloadSchema } from "../src/types/editor-contracts.ts";
import { listRoomGallery } from "./d1.ts";
import type { ContentCollection } from "./content-provider.ts";

export type GalleryWriteResult =
  | { statements: D1PreparedStatement[] }
  | { error: string; status: number };

const fail = (error: string, status = 400): GalleryWriteResult => ({ error, status });
const PARK_OFFSET = 1_000_000;
const TEMP_OFFSET = 900_000_000;

export function gallerySnapshotCollections(kind: string): ContentCollection[] {
  return kind === ROOM_GALLERY_KIND ? ["roomGallery"] : [];
}

export async function galleryWriteThrough(
  db: D1Database,
  tenantId: string,
  roomTypeId: string,
  payloadJson: string,
): Promise<GalleryWriteResult> {
  let raw: unknown;
  try { raw = JSON.parse(payloadJson); }
  catch { return fail("invalid_room_gallery"); }
  const parsed = roomGalleryPayloadSchema.safeParse(raw);
  if (!parsed.success) return fail("invalid_room_gallery");

  const room = await db.prepare(
    "SELECT id FROM room_types WHERE id = ?1 AND tenant_id = ?2",
  ).bind(roomTypeId, tenantId).first();
  if (!room) return fail("room_not_found", 404);

  const ids = parsed.data.items.map((item) => item.mediaAssetId);
  if (ids.length) {
    const placeholders = ids.map((_, index) => `?${index + 2}`).join(", ");
    const found = await db.prepare(
      `SELECT id FROM media_assets WHERE tenant_id = ?1 AND kind = 'image' AND id IN (${placeholders})`,
    ).bind(tenantId, ...ids).all();
    const foundIds = new Set((found.results ?? []).map((row: any) => row.id as string));
    if (foundIds.size !== ids.length) return fail("media_not_in_tenant");
  }

  const current = await listRoomGallery(db, tenantId, roomTypeId);
  const active = current.filter((row) => row.displayOrder < PARK_OFFSET);
  const wanted = new Set(ids);
  const removed = active.filter((row) => !wanted.has(row.mediaAssetId)).map((row) => row.placementId);

  const statements: D1PreparedStatement[] = [];
  if (removed.length) {
    const placeholders = removed.map((_, index) => `?${index + 3}`).join(", ");
    statements.push(db.prepare(
      `DELETE FROM media_placement_flags
        WHERE tenant_id = ?1 AND placement_id IN (${placeholders})`,
    ).bind(tenantId, ...removed));
    statements.push(db.prepare(
      `DELETE FROM media_placements
        WHERE tenant_id = ?1 AND target_table = 'room_types' AND target_id = ?2
          AND placement_type IN ('room_gallery','gallery') AND id IN (${placeholders})`,
    ).bind(tenantId, roomTypeId, ...removed));
  }
  statements.push(db.prepare(
    `UPDATE media_placements
        SET display_order = ${TEMP_OFFSET} + rowid, updated_at = datetime('now')
      WHERE tenant_id = ?1 AND target_table = 'room_types' AND target_id = ?2
        AND placement_type IN ('room_gallery','gallery') AND display_order < ?3`,
  ).bind(tenantId, roomTypeId, PARK_OFFSET));

  for (const item of parsed.data.items) {
    const existing = await db.prepare(
      `SELECT id FROM media_placements
        WHERE tenant_id = ?1 AND target_table = 'room_types' AND target_id = ?2
          AND placement_type IN ('room_gallery','gallery') AND media_asset_id = ?3
        ORDER BY CASE WHEN placement_type = 'room_gallery' THEN 0 ELSE 1 END LIMIT 1`,
    ).bind(tenantId, roomTypeId, item.mediaAssetId).first() as { id: string } | null;
    const placementId = existing?.id ?? crypto.randomUUID();
    // Update an existing row in place so a legacy 'gallery' placement keeps its
    // type. Re-inserting it as 'room_gallery' would collide on the primary key.
    statements.push(existing
      ? db.prepare(
        `UPDATE media_placements
            SET alt_text_override = ?1, caption_override = ?2, description_override = ?3,
                display_order = ?4, updated_at = datetime('now')
          WHERE id = ?5 AND tenant_id = ?6`,
      ).bind(
        item.altText ?? null, item.caption ?? null, item.description ?? null,
        item.displayOrder, placementId, tenantId,
      )
      : db.prepare(
        `INSERT INTO media_placements
          (id, tenant_id, media_asset_id, target_table, target_id, placement_type,
           alt_text_override, caption_override, description_override, display_order)
         VALUES (?1,?2,?3,'room_types',?4,'room_gallery',?5,?6,?7,?8)`,
      ).bind(
        placementId, tenantId, item.mediaAssetId, roomTypeId,
        item.altText ?? null, item.caption ?? null, item.description ?? null, item.displayOrder,
      ));
    statements.push(db.prepare(
      `INSERT INTO media_placement_flags (placement_id, tenant_id, excluded, updated_at)
       VALUES (?1, ?2, ?3, datetime('now'))
       ON CONFLICT (placement_id) DO UPDATE SET
         excluded = excluded.excluded, updated_at = datetime('now')`,
    ).bind(placementId, tenantId, item.excluded ? 1 : 0));
  }
  return { statements };
}
