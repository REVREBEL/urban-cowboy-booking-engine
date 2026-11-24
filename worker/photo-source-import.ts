/**
 * COW-99: apply a provider-neutral photo snapshot to the COW-33 media registry.
 *
 * A master media ID is resolved from stable aliases (or derived deterministically
 * the first time) and never from a URL. Re-imports update the URL on that same
 * ID. Missing source data never produces a DELETE: removals are reported only.
 */
import type { PhotoSourceSnapshot, ProviderAlias, SourcePhoto } from "./photo-source-adapter.ts";

export interface SqlStatement {
  sql: string;
  params: unknown[];
}

export interface SqlExecutor {
  exec(statements: readonly SqlStatement[]): Promise<void>;
}

export interface D1Like {
  prepare(sql: string): {
    bind(...values: unknown[]): { all<T>(): Promise<{ results: T[] }> };
  };
}

export interface PhotoImportInput {
  tenantId: string;
  locationId: string | null;
  snapshot: PhotoSourceSnapshot;
  /** Fixed timestamp keeps dry-run SQL deterministic in tests. */
  now?: string;
}

export type PhotoDecision =
  | { kind: "create"; mediaId: string; photo: SourcePhoto }
  | { kind: "update"; mediaId: string; photo: SourcePhoto; urlChanged: boolean; matchedAlias: ProviderAlias | null }
  | { kind: "duplicate"; mediaId: string; photo: SourcePhoto; detail: string }
  | { kind: "invalid"; photo: SourcePhoto; detail: string }
  | { kind: "unresolved-room"; photo: SourcePhoto; detail: string };

export interface RemovedPlacement {
  roomTypeId: string;
  mediaAssetId: string;
  displayOrder: number;
}

export interface PhotoImportPlan {
  decisions: PhotoDecision[];
  removed: RemovedPlacement[];
  statements: SqlStatement[];
  summary: {
    create: number;
    update: number;
    duplicate: number;
    invalid: number;
    unresolvedRoom: number;
    removed: number;
    placements: number;
  };
}

export const PHOTO_PARK_OFFSET = 1_000_000;

/**
 * Deterministic, dependency-free 24-hex digest. This is an identity helper,
 * not a security primitive, so a worker-safe FNV-1a variant is sufficient and
 * avoids a Node-only import in code that runs on Cloudflare Workers.
 */
function fnv1a(value: string, seed: number): number {
  let result = seed >>> 0;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 0x01000193) >>> 0;
  }
  return result >>> 0;
}

const hash = (value: string): string =>
  [0x811c9dc5, 0x9e3779b9, 0x85ebca6b]
    .map((seed) => fnv1a(value, seed).toString(16).padStart(8, "0"))
    .join("");

function aliasId(tenantId: string, alias: ProviderAlias): string {
  return `alias-${hash(`${tenantId}|${alias.aliasType}|${alias.aliasValue}`)}`;
}

export function mediaIdFor(tenantId: string, logicalKey: string): string {
  return `mm-${hash(`${tenantId}|${logicalKey}`)}`;
}

function filenameFrom(url: string): string | null {
  try {
    const name = decodeURIComponent(new URL(url).pathname.split("/").pop() ?? "");
    return name || null;
  } catch {
    return null;
  }
}

function literal(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
}

async function loadState(db: D1Like, tenantId: string) {
  const aliasRows = await db.prepare(
    `SELECT a.alias_type AS alias_type, a.alias_value AS alias_value, a.media_asset_id AS media_asset_id
       FROM media_aliases a
       JOIN media_assets m ON m.id = a.media_asset_id AND m.tenant_id = a.tenant_id
      WHERE a.tenant_id = ?1`,
  ).bind(tenantId).all<{ alias_type: string; alias_value: string; media_asset_id: string }>();
  const assetRows = await db.prepare(
    "SELECT id, squarespace_url AS url FROM media_assets WHERE tenant_id = ?1",
  ).bind(tenantId).all<{ id: string; url: string | null }>();
  const versionRows = await db.prepare(
    "SELECT media_asset_id, current_version_id FROM media_asset_metadata WHERE tenant_id = ?1",
  ).bind(tenantId).all<{ media_asset_id: string; current_version_id: string | null }>();
  const roomRows = await db.prepare(
    "SELECT id FROM room_types WHERE tenant_id = ?1",
  ).bind(tenantId).all<{ id: string }>();
  return {
    aliases: new Map(aliasRows.results.map((row) => [
      `${row.alias_type}|${row.alias_value}`, row.media_asset_id,
    ])),
    assets: new Map(assetRows.results.map((row) => [row.id, row.url ?? ""])),
    currentVersions: new Map(versionRows.results.map((row) => [
      row.media_asset_id, row.current_version_id,
    ])),
    roomTypes: new Set(roomRows.results.map((row) => row.id)),
  };
}

async function existingPlacements(
  db: D1Like,
  tenantId: string,
  roomTypeId: string,
): Promise<Array<{ id: string; media_asset_id: string; display_order: number }>> {
  const { results } = await db.prepare(
    `SELECT id, media_asset_id, display_order
       FROM media_placements
      WHERE tenant_id = ?1 AND target_table = 'room_types'
        AND target_id = ?2 AND placement_type = 'room_gallery'
      ORDER BY display_order ASC`,
  ).bind(tenantId, roomTypeId).all<{ id: string; media_asset_id: string; display_order: number }>();
  return results;
}

function assetStatements(
  input: PhotoImportInput,
  photo: SourcePhoto,
  mediaId: string,
  isNew: boolean,
  urlChanged: boolean,
  currentVersionId: string | null,
): SqlStatement[] {
  const now = input.now ?? "";
  const sourceAssetId = `${photo.aliases[0].aliasType}:${photo.aliases[0].aliasValue}`;
  const filename = filenameFrom(photo.url);
  const statements: SqlStatement[] = [
    {
      sql: `INSERT INTO media_assets
              (id, tenant_id, location_id, kind, original_filename, squarespace_asset_id,
               squarespace_url, width, height, alt_text, created_at, updated_at)
            VALUES (?1, ?2, ?3, 'image', ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?10)
            ON CONFLICT(id) DO UPDATE SET
              squarespace_url = excluded.squarespace_url,
              width = excluded.width,
              height = excluded.height,
              alt_text = COALESCE(media_assets.alt_text, excluded.alt_text),
              updated_at = excluded.updated_at`,
      params: [mediaId, input.tenantId, input.locationId, filename, sourceAssetId, photo.url,
        photo.width, photo.height, photo.altText, now],
    },
  ];
  // An existing registry asset may have an arbitrary v1 primary key and a
  // newer current version (a replacement/hotspot revision). Never invent a
  // version row or rewind current_version_id. For an importer-managed asset
  // whose current version is still the original `:v1`, update that version's
  // mutable URL/dimensions in place so the published gallery read (which
  // resolves COALESCE(version.url, asset.url)) sees the new delivery URL.
  if (!isNew && urlChanged && currentVersionId === `${mediaId}:v1`) {
    statements.push({
      sql: `UPDATE media_versions
               SET squarespace_url = ?1, width = ?2, height = ?3
             WHERE id = ?4 AND media_asset_id = ?5`,
      params: [photo.url, photo.width, photo.height, currentVersionId, mediaId],
    });
  }
  if (isNew) {
    statements.push({
      sql: `INSERT INTO media_versions
              (id, media_asset_id, version, squarespace_asset_id, squarespace_url,
               width, height, created_at)
            VALUES (?1, ?2, 1, ?3, ?4, ?5, ?6, ?7)`,
      params: [`${mediaId}:v1`, mediaId, sourceAssetId, photo.url, photo.width, photo.height, now],
    });
    statements.push({
      sql: `INSERT INTO media_asset_metadata
              (media_asset_id, tenant_id, current_version_id, created_at, updated_at)
            VALUES (?1, ?2, ?3, ?4, ?4)`,
      params: [mediaId, input.tenantId, `${mediaId}:v1`, now],
    });
  }
  for (const alias of photo.aliases) {
    statements.push({
      sql: `INSERT INTO media_aliases (id, tenant_id, media_asset_id, alias_type, alias_value, created_at)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6) ON CONFLICT DO NOTHING`,
      params: [aliasId(input.tenantId, alias), input.tenantId, mediaId,
        alias.aliasType, alias.aliasValue, now],
    });
  }
  return statements;
}

function placementId(roomTypeId: string, mediaId: string): string {
  return `pl-${roomTypeId}-${mediaId}`;
}

export async function planPhotoImport(
  db: D1Like,
  input: PhotoImportInput,
): Promise<PhotoImportPlan> {
  const state = await loadState(db, input.tenantId);
  const decisions: PhotoDecision[] = [];
  const statements: SqlStatement[] = [];
  const removed: RemovedPlacement[] = [];
  // One master asset may be placed in many rooms; the claim is per (asset, room).
  const claimed = new Set<string>();
  const plannedByRoom = new Map<string, Set<string>>();
  // The first room to import a shared image creates its version rows; later
  // rooms in the same plan must not try to create them again.
  const createdInPlan = new Set<string>();
  const parked = new Set<string>();

  for (const photo of input.snapshot.photos) {
    if (!/^https:\/\//i.test(photo.url) || photo.aliases.length === 0) {
      decisions.push({ kind: "invalid", photo, detail: "missing https URL or stable source alias" });
      continue;
    }
    if (!state.roomTypes.has(photo.roomTypeRef)) {
      decisions.push({ kind: "unresolved-room", photo, detail: `room type ${photo.roomTypeRef} is not in D1` });
      continue;
    }

    let mediaId = "";
    let matchedAlias: ProviderAlias | null = null;
    for (const alias of [...(photo.sameAs ? [photo.sameAs] : []), ...photo.aliases]) {
      const found = state.aliases.get(`${alias.aliasType}|${alias.aliasValue}`);
      if (found) {
        mediaId = found;
        matchedAlias = alias;
        break;
      }
    }
    if (!mediaId) mediaId = mediaIdFor(input.tenantId, photo.logicalKey);

    const claimKey = `${mediaId}|${photo.roomTypeRef}`;
    if (claimed.has(claimKey)) {
      decisions.push({
        kind: "duplicate", mediaId, photo,
        detail: `master media ${mediaId} is already placed in room ${photo.roomTypeRef} in this import`,
      });
      continue;
    }
    claimed.add(claimKey);
    const roomAssets = plannedByRoom.get(photo.roomTypeRef) ?? new Set<string>();
    roomAssets.add(mediaId);
    plannedByRoom.set(photo.roomTypeRef, roomAssets);

    const exists = state.assets.has(mediaId) || createdInPlan.has(mediaId);
    const urlChanged = exists && state.assets.get(mediaId) !== photo.url;
    if (exists) {
      decisions.push({ kind: "update", mediaId, photo, urlChanged, matchedAlias });
    } else {
      decisions.push({ kind: "create", mediaId, photo });
      createdInPlan.add(mediaId);
    }
    statements.push(...assetStatements(
      input, photo, mediaId, !exists, urlChanged, state.currentVersions.get(mediaId) ?? null,
    ));

    const existing = await existingPlacements(db, input.tenantId, photo.roomTypeRef);
    const targetId = placementId(photo.roomTypeRef, mediaId);
    const wantsOrder = photo.position;
    // Free an occupied target position before rewriting it. Only emitted when
    // a different asset actually holds that position, and only once per
    // placement, so a re-import with unchanged order produces no park update.
    for (const placement of existing) {
      if (placement.display_order === wantsOrder &&
          placement.media_asset_id !== mediaId &&
          !parked.has(placement.id) &&
          placement.display_order < PHOTO_PARK_OFFSET) {
        statements.push({
          sql: `UPDATE media_placements
                   SET display_order = ?4, updated_at = ?5
                 WHERE tenant_id = ?1 AND target_table = 'room_types'
                   AND target_id = ?2 AND placement_type = 'room_gallery'
                   AND id = ?3`,
          params: [input.tenantId, photo.roomTypeRef, placement.id,
            PHOTO_PARK_OFFSET + wantsOrder, input.now ?? ""],
        });
        parked.add(placement.id);
      }
    }
    statements.push({
      sql: `INSERT INTO media_placements
              (id, tenant_id, media_asset_id, target_table, target_id, placement_type,
               display_order, created_at, updated_at)
            VALUES (?1, ?2, ?3, 'room_types', ?4, 'room_gallery', ?5, ?6, ?6)
            ON CONFLICT(id) DO UPDATE SET
              display_order = excluded.display_order,
              media_asset_id = excluded.media_asset_id,
              updated_at = excluded.updated_at`,
      params: [targetId, input.tenantId, mediaId, photo.roomTypeRef, wantsOrder, input.now ?? ""],
    });
  }

  // Removed source images are reported, never deleted.
  for (const roomTypeId of input.snapshot.roomTypeRefs ?? []) {
    for (const placement of await existingPlacements(db, input.tenantId, roomTypeId)) {
      if (!plannedByRoom.get(roomTypeId)?.has(placement.media_asset_id)) {
        removed.push({
          roomTypeId,
          mediaAssetId: placement.media_asset_id,
          displayOrder: placement.display_order,
        });
      }
    }
  }

  const summary = {
    create: decisions.filter((d) => d.kind === "create").length,
    update: decisions.filter((d) => d.kind === "update").length,
    duplicate: decisions.filter((d) => d.kind === "duplicate").length,
    invalid: decisions.filter((d) => d.kind === "invalid").length,
    unresolvedRoom: decisions.filter((d) => d.kind === "unresolved-room").length,
    removed: removed.length,
    placements: decisions.filter((d) => d.kind === "create" || d.kind === "update").length,
  };
  return { decisions, removed, statements, summary };
}

export async function applyPhotoImport(
  executor: SqlExecutor,
  plan: PhotoImportPlan,
): Promise<number> {
  if (plan.statements.length) await executor.exec(plan.statements);
  return plan.statements.length;
}

/** Renders a reviewable SQL script with bound values inlined. */
export function renderPhotoImportSql(plan: PhotoImportPlan, provider: string): string {
  const lines = [
    `-- COW-99 ${provider} photo URL import`,
    "-- Review before applying. Removals are reported, never applied.",
    "BEGIN;",
  ];
  for (const statement of plan.statements) {
    let index = 0;
    const sql = statement.sql.replace(/\?(\d+)/g, (_match, position: string) => {
      index += 1;
      return literal(statement.params[Number(position) - 1]);
    });
    lines.push(sql.trim() + ";");
  }
  lines.push("COMMIT;");
  return lines.join("\n") + "\n";
}
