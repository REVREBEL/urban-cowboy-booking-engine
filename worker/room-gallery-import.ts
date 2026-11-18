// COW-67: idempotent room-gallery import against the COW-33 media registry.
//
// Writes only URL references and associations. Image binaries are not downloaded
// or rehosted, and no Cloudinary migration is implied.
//
// Safety properties, in order of importance:
//   1. A room that does not resolve to exactly one room type writes nothing.
//   2. A failed fetch, an empty response or a missing gallery never deletes.
//   3. Re-running the same plan is a no-op: media assets, versions and
//      placements are upserted on stable keys.
//   4. Removals are reported, never applied.

import type { ImportPlan, PlannedImage, PlannedRoom } from "./room-gallery.ts";

export type RoomGalleryMode = "dry-run" | "staging" | "production";

export interface RoomGallerySourceMeta {
  sourcePageUrl: string;
  feedDigest: string;
  fetchedAt: string;
}

export interface RoomGalleryInput {
  tenantId: string;
  locationId: string | null;
  plan: ImportPlan;
  source: RoomGallerySourceMeta;
}

export type ImageChange =
  | { kind: "new"; position: number; assetId: string; url: string }
  | { kind: "unchanged"; position: number; mediaAssetId: string }
  | { kind: "reordered"; mediaAssetId: string; from: number; to: number }
  | { kind: "url-changed"; mediaAssetId: string; from: string; to: string }
  | { kind: "removed"; mediaAssetId: string; position: number; url: string }
  | { kind: "failed"; reason: string };

export interface RoomReconciliation {
  heading: string;
  sectionId: string;
  roomTypeId: string | null;
  roomTypeName: string | null;
  matchedBy: string | null;
  unresolvedReason: string | null;
  planned: number;
  new: ImageChange[];
  unchanged: ImageChange[];
  reordered: ImageChange[];
  urlChanged: ImageChange[];
  removed: ImageChange[];
  failed: ImageChange[];
}

export interface ReconciliationResult {
  mode: RoomGalleryMode;
  tenantId: string;
  sourcePageUrl: string;
  feedDigest: string;
  fetchedAt: string;
  rooms: RoomReconciliation[];
}

export interface SqlStatement {
  sql: string;
  params: unknown[];
}

/** Deterministic media id for a Squarespace asset. */
export function mediaIdForAsset(assetId: string): string {
  return `sqsp-${assetId}`;
}

interface ExistingPlacement {
  media_asset_id: string;
  display_order: number;
  squarespace_url: string | null;
}

export interface D1Like {
  prepare(sql: string): {
    bind(...values: unknown[]): { all<T>(): Promise<{ results: T[] }> };
  };
}

/** Minimal write executor so tests can run the same statements on node:sqlite. */
export interface SqlExecutor {
  exec(statements: readonly SqlStatement[]): Promise<void>;
}

async function existingPlacements(
  db: D1Like,
  tenantId: string,
  roomTypeId: string,
): Promise<ExistingPlacement[]> {
  const { results } = await db
    .prepare(
      `SELECT p.media_asset_id AS media_asset_id,
              p.display_order  AS display_order,
              a.squarespace_url AS squarespace_url
         FROM media_placements p
         JOIN media_assets a ON a.id = p.media_asset_id
        WHERE p.tenant_id = ?1
          AND p.target_table = 'room_types'
          AND p.target_id = ?2
          AND p.placement_type = 'room_gallery'
        ORDER BY p.display_order ASC`,
    )
    .bind(tenantId, roomTypeId)
    .all<ExistingPlacement>();
  return results;
}

function compare(
  planned: PlannedImage[],
  existing: readonly ExistingPlacement[],
): Pick<RoomReconciliation, "new" | "unchanged" | "reordered" | "urlChanged" | "removed"> {
  const newImages: ImageChange[] = [];
  const unchanged: ImageChange[] = [];
  const reordered: ImageChange[] = [];
  const urlChanged: ImageChange[] = [];
  const removed: ImageChange[] = [];

  const byAsset = new Map(existing.map((row) => [row.media_asset_id, row]));
  const plannedAssets = new Set<string>();

  for (const image of planned) {
    const mediaAssetId = mediaIdForAsset(image.assetId);
    plannedAssets.add(mediaAssetId);
    const current = byAsset.get(mediaAssetId);

    if (!current) {
      newImages.push({ kind: "new", position: image.position, assetId: image.assetId, url: image.url });
      continue;
    }

    if ((current.squarespace_url ?? "") !== image.url) {
      urlChanged.push({
        kind: "url-changed",
        mediaAssetId,
        from: current.squarespace_url ?? "",
        to: image.url,
      });
    } else {
      unchanged.push({ kind: "unchanged", position: image.position, mediaAssetId });
    }

    if (current.display_order !== image.position) {
      reordered.push({
        kind: "reordered",
        mediaAssetId,
        from: current.display_order,
        to: image.position,
      });
    }
  }

  for (const row of existing) {
    if (!plannedAssets.has(row.media_asset_id)) {
      removed.push({
        kind: "removed",
        mediaAssetId: row.media_asset_id,
        position: row.display_order,
        url: row.squarespace_url ?? "",
      });
    }
  }

  return { new: newImages, unchanged, reordered, urlChanged, removed };
}

/** Read-only diff between the feed and what D1 already holds. */
export async function reconcileRoomGallery(
  db: D1Like,
  input: RoomGalleryInput,
  mode: RoomGalleryMode = "dry-run",
): Promise<ReconciliationResult> {
  const rooms: RoomReconciliation[] = [];

  for (const room of input.plan.rooms) {
    if (!room.roomTypeId) {
      rooms.push({
        heading: room.heading,
        sectionId: room.sectionId,
        roomTypeId: null,
        roomTypeName: null,
        matchedBy: null,
        unresolvedReason: room.unresolvedReason,
        planned: room.images.length,
        new: [],
        unchanged: [],
        reordered: [],
        urlChanged: [],
        removed: [],
        failed: room.images.length === 0
          ? [{ kind: "failed", reason: "no images in gallery" }]
          : [],
      });
      continue;
    }

    const existing = await existingPlacements(db, input.tenantId, room.roomTypeId);
    const diff = compare(room.images, existing);

    rooms.push({
      heading: room.heading,
      sectionId: room.sectionId,
      roomTypeId: room.roomTypeId,
      roomTypeName: room.roomTypeName,
      matchedBy: room.matchedBy,
      unresolvedReason: null,
      planned: room.images.length,
      ...diff,
      failed: room.images.length === 0 ? [{ kind: "failed", reason: "no images in gallery" }] : [],
    });
  }

  return {
    mode,
    tenantId: input.tenantId,
    sourcePageUrl: input.source.sourcePageUrl,
    feedDigest: input.source.feedDigest,
    fetchedAt: input.source.fetchedAt,
    rooms,
  };
}

function assetStatements(input: RoomGalleryInput, image: PlannedImage): SqlStatement[] {
  const mediaAssetId = mediaIdForAsset(image.assetId);
  return [
    {
      sql: `INSERT INTO media_assets
              (id, tenant_id, location_id, kind, original_filename, squarespace_asset_id, squarespace_url, width, height, alt_text)
            VALUES (?1, ?2, ?3, 'image', ?4, ?5, ?6, ?7, ?8, ?9)
            ON CONFLICT(id) DO UPDATE SET
              squarespace_url = excluded.squarespace_url,
              original_filename = excluded.original_filename,
              width = excluded.width,
              height = excluded.height,
              alt_text = COALESCE(media_assets.alt_text, excluded.alt_text),
              updated_at = datetime('now')`,
      params: [
        mediaAssetId,
        input.tenantId,
        input.locationId,
        image.filename,
        image.assetId,
        image.url,
        image.width,
        image.height,
        image.alt,
      ],
    },
    {
      sql: `INSERT INTO media_versions
              (id, media_asset_id, version, squarespace_asset_id, squarespace_url, width, height)
            VALUES (?1, ?2, 1, ?3, ?4, ?5, ?6)
            ON CONFLICT(media_asset_id, version) DO UPDATE SET
              squarespace_url = excluded.squarespace_url,
              width = excluded.width,
              height = excluded.height`,
      params: [`${mediaAssetId}:v1`, mediaAssetId, image.assetId, image.url, image.width, image.height],
    },
    {
      sql: `INSERT INTO media_asset_metadata (media_asset_id, tenant_id, current_version_id)
            VALUES (?1, ?2, ?3)
            ON CONFLICT(media_asset_id) DO UPDATE SET
              current_version_id = excluded.current_version_id,
              updated_at = datetime('now')`,
      params: [mediaAssetId, input.tenantId, `${mediaAssetId}:v1`],
    },
  ];
}

function placementStatement(
  input: RoomGalleryInput,
  room: PlannedRoom,
  image: PlannedImage,
): SqlStatement {
  return {
    sql: `INSERT INTO media_placements
            (id, tenant_id, media_asset_id, target_table, target_id, placement_type, display_order)
          VALUES (?1, ?2, ?3, 'room_types', ?4, 'room_gallery', ?5)
          ON CONFLICT(id) DO UPDATE SET
            display_order = excluded.display_order,
            media_asset_id = excluded.media_asset_id,
            updated_at = datetime('now')`,
    params: [
      `pl-${room.roomTypeId}-${image.assetId}`,
      input.tenantId,
      mediaIdForAsset(image.assetId),
      room.roomTypeId,
      image.position,
    ],
  };
}

export interface ImportStatements {
  statements: SqlStatement[];
  skippedRooms: string[];
  imageCount: number;
}

/**
 * Placements that disappear from the feed are parked above this offset rather
 * than deleted. They stay linked to their media asset so a later controlled
 * policy can retire them deliberately.
 */
export const PARK_OFFSET = 1_000_000;

function parkStatement(tenantId: string, roomTypeId: string): SqlStatement {
  return {
    sql: `UPDATE media_placements
             SET display_order = display_order + ?3,
                 updated_at = datetime('now')
           WHERE tenant_id = ?1
             AND target_table = 'room_types'
             AND target_id = ?2
             AND placement_type = 'room_gallery'`,
    params: [tenantId, roomTypeId, PARK_OFFSET],
  };
}

/**
 * Builds the import statements without touching the database. Rooms that did not
 * resolve to exactly one room type contribute nothing.
 */
export function buildImportStatements(input: RoomGalleryInput): ImportStatements {
  const statements: SqlStatement[] = [];
  const skippedRooms: string[] = [];
  let imageCount = 0;

  for (const room of input.plan.rooms) {
    if (!room.roomTypeId) {
      skippedRooms.push(room.heading);
      continue;
    }
    // Move existing placements out of the 1..N range first, so the upserts below
    // cannot collide on (room, display_order) while positions are being rewritten.
    if (room.images.length > 0) {
      statements.push(parkStatement(input.tenantId, room.roomTypeId));
    }
    for (const image of room.images) {
      statements.push(...assetStatements(input, image));
      statements.push(placementStatement(input, room, image));
      imageCount += 1;
    }
  }

  return { statements, skippedRooms, imageCount };
}

/**
 * Applies a plan through a D1-shaped handle. Idempotent: assets and versions are
 * upserted on stable keys and placements on (target, position). Removals are
 * never applied.
 */
export async function applyRoomGallery(
  executor: SqlExecutor,
  input: RoomGalleryInput,
): Promise<{ applied: number; skippedRooms: string[] }> {
  const { statements, skippedRooms, imageCount } = buildImportStatements(input);
  if (statements.length > 0) await executor.exec(statements);
  return { applied: imageCount, skippedRooms };
}

export function summarise(result: ReconciliationResult) {
  const totals = { new: 0, unchanged: 0, reordered: 0, urlChanged: 0, removed: 0, failed: 0 };
  const rooms = result.rooms.map((room) => {
    totals.new += room.new.length;
    totals.unchanged += room.unchanged.length;
    totals.reordered += room.reordered.length;
    totals.urlChanged += room.urlChanged.length;
    totals.removed += room.removed.length;
    totals.failed += room.failed.length;
    return {
      heading: room.heading,
      roomType: room.roomTypeName,
      matchedBy: room.matchedBy,
      unresolved: room.unresolvedReason,
      planned: room.planned,
      added: room.new.length,
      kept: room.unchanged.length,
      reordered: room.reordered.length,
      urlChanged: room.urlChanged.length,
      reportedRemoved: room.removed.length,
    };
  });
  return { totals, rooms };
}

function literal(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";
  if (typeof value === "boolean") return value ? "1" : "0";
  return `'${String(value).replace(/'/g, "''")}'`;
}

/** Renders statements as a reviewable SQL script with bound values inlined. */
export function renderSql(statements: readonly SqlStatement[]): string {
  const lines = [
    "-- COW-67 room-gallery import",
    "-- Review before applying. Removals are intentionally absent.",
    "BEGIN;",
  ];
  for (const statement of statements) {
    let index = 0;
    const sql = statement.sql.replace(/\?(\d+)/g, (_match, position: string) => {
      const value = statement.params[Number(position) - 1];
      index += 1;
      return literal(value);
    });
    lines.push(sql.trim() + ";");
  }
  lines.push("COMMIT;");
  return lines.join("\n") + "\n";
}