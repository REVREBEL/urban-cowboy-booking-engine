// COW-84: admin surface for durable photo hotspots. All mutations are
// admin-authorized and tenant scoped through the verified principal, and every
// geometry change writes a COW-34 revision snapshot. Guest reads are unchanged.
import { json, type Env } from "./mews/_lib.ts";
import { authorizeScopedRequest, type Principal } from "./auth.ts";
import { getDb } from "./d1.ts";
import {
  photoHotspotMappingRowSchema,
  photoHotspotMappingSnapshotSchema,
  type PhotoHotspotMappingRow,
} from "../src/types/d1-contracts.ts";
import {
  applyReplacement,
  planReplacement,
  rollbackMappings,
  type Fingerprint,
} from "./hotspot-mappings.ts";
import { hammingDistance, type CropRect } from "../src/lib/hotspotGeometry.ts";
import { z } from "zod";

export interface HotspotAdminCtx {
  request: Request;
  env: Env;
  waitUntil: (promise: Promise<unknown>) => void;
}

export type HotspotAdminAuthorize = (
  request: Request,
  env: Env,
  role: "viewer" | "admin",
) => Promise<Principal | Response>;

const createSchema = z.object({
  mediaAssetId: z.string().min(1),
  placementId: z.string().min(1),
  amenityId: z.string().min(1),
  sourceX: z.number().min(0).max(1),
  sourceY: z.number().min(0).max(1),
  sourceVersionId: z.string().min(1),
  sourceWidth: z.number().int().nullable().optional(),
  sourceHeight: z.number().int().nullable().optional(),
  exifOrientation: z.number().int().min(1).max(8).optional(),
  displayOrder: z.number().int().min(0).optional(),
  reviewState: z.enum(["none", "pending"]).optional(),
  reviewReason: z.string().max(500).nullable().optional(),
}).strict();

const updateSchema = z.object({
  sourceX: z.number().min(0).max(1).optional(),
  sourceY: z.number().min(0).max(1).optional(),
  amenityId: z.string().min(1).optional(),
  displayOrder: z.number().int().min(0).optional(),
  reviewState: z.enum(["none", "pending", "approved"]).optional(),
  reviewReason: z.string().max(500).nullable().optional(),
}).strict();

const publishSchema = z.object({
  mediaAssetId: z.string().min(1),
  placementId: z.string().min(1),
}).strict();

const rollbackSchema = z.object({
  mediaAssetId: z.string().min(1),
  placementId: z.string().min(1),
  toVersionId: z.string().min(1),
}).strict();

const cropSchema = z.object({
  left: z.number().min(0).max(1),
  top: z.number().min(0).max(1),
  width: z.number().min(0).max(1),
  height: z.number().min(0).max(1),
}).strict();

// Fingerprint and duplicate facts are NEVER accepted from the caller: they
// decide auto-publish eligibility and must come from tenant-scoped D1 rows.
const replacementSchema = z.object({
  mediaAssetId: z.string().min(1),
  placementId: z.string().min(1),
  fromVersionId: z.string().min(1),
  toVersionId: z.string().min(1),
  urlOnly: z.boolean().optional(),
  cropBefore: cropSchema.nullable().optional(),
  cropAfter: cropSchema.nullable().optional(),
  approveReview: z.boolean().optional(),
}).strict();

async function principalFor(
  ctx: HotspotAdminCtx,
  authorize: HotspotAdminAuthorize,
  role: "viewer" | "admin",
): Promise<Principal | Response> {
  const principal = await authorize(ctx.request, ctx.env, role);
  if (principal instanceof Response) return principal;
  const tenant = principal.tenantId?.trim();
  if (!tenant) return json({ error: "tenant_scope_not_configured" }, 503, "no-store");
  if (role === "admin" && !principal.roles.includes("admin")) {
    return json({ error: "forbidden" }, 403, "no-store");
  }
  return principal;
}

async function readJson<T extends z.ZodTypeAny>(request: Request, schema: T): Promise<z.output<T> | Response> {
  let body: unknown;
  try { body = await request.json(); }
  catch { return json({ error: "invalid_json" }, 400); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return json({ error: "invalid_input" }, 400);
  return parsed.data;
}

async function ownedRoom(db: D1Database, tenant: string, roomId: string): Promise<boolean> {
  return Boolean(await db.prepare(
    "SELECT id FROM room_types WHERE id = ?1 AND tenant_id = ?2",
  ).bind(roomId, tenant).first());
}

/** A shared media asset must be bound to this room's placement for the operation. */
async function placementInRoom(
  db: D1Database,
  tenant: string,
  roomId: string,
  placementId: string,
  mediaAssetId: string,
): Promise<boolean> {
  return Boolean(await db.prepare(
    `SELECT p.id FROM media_placements p
       JOIN media_assets a ON a.id = p.media_asset_id AND a.tenant_id = p.tenant_id
       JOIN room_types rt ON rt.id = p.target_id AND rt.tenant_id = p.tenant_id
      WHERE p.id = ?1 AND p.tenant_id = ?2 AND p.target_table = 'room_types'
        AND p.target_id = ?3 AND p.media_asset_id = ?4`,
  ).bind(placementId, tenant, roomId, mediaAssetId).first());
}

function parseRows(results: unknown[]): PhotoHotspotMappingRow[] {
  return results.flatMap((row) => {
    const parsed = photoHotspotMappingRowSchema.safeParse(row);
    return parsed.success ? [parsed.data] : [];
  });
}

/** Unpublished edits to published pins are stored as snapshots, never on the guest row. */
async function loadDrafts(
  db: D1Database,
  tenant: string,
  mediaAssetId: string,
): Promise<Map<string, PhotoHotspotMappingRow>> {
  const result = await db.prepare(
    "SELECT snapshot_json FROM photo_hotspot_drafts WHERE tenant_id = ?1 AND media_asset_id = ?2",
  ).bind(tenant, mediaAssetId).all();
  const drafts = new Map<string, PhotoHotspotMappingRow>();
  for (const row of result.results ?? []) {
    try {
      const parsed = photoHotspotMappingSnapshotSchema.parse(JSON.parse((row as any).snapshot_json));
      drafts.set(parsed.id, parsed as PhotoHotspotMappingRow);
    } catch { /* an unreadable draft is ignored, never applied */ }
  }
  return drafts;
}

async function loadDeletions(
  db: D1Database,
  tenant: string,
  mediaAssetId: string,
): Promise<Map<string, PhotoHotspotMappingRow>> {
  const result = await db.prepare(
    "SELECT snapshot_json FROM photo_hotspot_deletions WHERE tenant_id = ?1 AND media_asset_id = ?2",
  ).bind(tenant, mediaAssetId).all();
  const deletions = new Map<string, PhotoHotspotMappingRow>();
  for (const row of result.results ?? []) {
    try {
      const parsed = photoHotspotMappingSnapshotSchema.parse(JSON.parse((row as any).snapshot_json));
      deletions.set(parsed.id, parsed as PhotoHotspotMappingRow);
    } catch { /* an unreadable pending deletion is ignored, never applied */ }
  }
  return deletions;
}

/** The admin sees the draft geometry; the published row keeps serving guests. */
function mergeDrafts(
  rows: PhotoHotspotMappingRow[],
  drafts: Map<string, PhotoHotspotMappingRow>,
  deletions: Map<string, PhotoHotspotMappingRow> = new Map(),
): Array<PhotoHotspotMappingRow & { hasDraft: boolean; pendingDelete: boolean }> {
  return rows.map((row) => {
    const draft = drafts.get(row.id);
    return {
      ...(draft ? { ...draft, status: row.status } : row),
      hasDraft: Boolean(draft),
      pendingDelete: deletions.has(row.id),
    };
  });
}

const MAPPING_COLUMNS = `id, tenant_id, media_asset_id, placement_id, target_table, target_id,
  amenity_id, source_x, source_y, source_version_id, source_width, source_height,
  exif_orientation, crop_left, crop_top, crop_width, crop_height, display_order,
  status, review_state, review_reason, derived_from, duplicate_of, created_at, updated_at`;

function insertMapping(db: D1Database, mapping: PhotoHotspotMappingRow): D1PreparedStatement {
  return db.prepare(
    `INSERT INTO photo_hotspot_mappings (${MAPPING_COLUMNS}) VALUES
     (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19,?20,?21,?22,?23,?24,?25)
     ON CONFLICT(id) DO UPDATE SET
       source_x=excluded.source_x, source_y=excluded.source_y,
       amenity_id=excluded.amenity_id, source_version_id=excluded.source_version_id,
       source_width=excluded.source_width, source_height=excluded.source_height,
       exif_orientation=excluded.exif_orientation, display_order=excluded.display_order,
       status=excluded.status, review_state=excluded.review_state,
       review_reason=excluded.review_reason, updated_at=excluded.updated_at`,
  ).bind(
    mapping.id, mapping.tenantId, mapping.mediaAssetId, mapping.placementId,
    mapping.targetTable, mapping.targetId, mapping.amenityId,
    mapping.sourceX, mapping.sourceY, mapping.sourceVersionId,
    mapping.sourceWidth, mapping.sourceHeight, mapping.exifOrientation,
    mapping.cropLeft, mapping.cropTop, mapping.cropWidth, mapping.cropHeight,
    mapping.displayOrder, mapping.status, mapping.reviewState, mapping.reviewReason,
    mapping.derivedFrom, mapping.duplicateOf, mapping.createdAt, mapping.updatedAt,
  );
}

function revision(
  db: D1Database,
  mapping: PhotoHotspotMappingRow,
  action: "create" | "review",
  actor: string,
  before: PhotoHotspotMappingRow | null,
): D1PreparedStatement {
  return db.prepare(
    `INSERT INTO photo_hotspot_mapping_revisions
      (id, tenant_id, mapping_id, media_asset_id, from_version_id, to_version_id,
       action, snapshot_json, actor, note, created_at)
     VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,datetime('now'))`,
  ).bind(
    crypto.randomUUID(), mapping.tenantId, mapping.id, mapping.mediaAssetId,
    before?.sourceVersionId ?? null, mapping.sourceVersionId, action,
    // Store the resulting state: rollback must restore geometry that was in
    // force, not the superseded pending state captured before an approval.
    JSON.stringify(mapping), actor, action,
  );
}

interface BatchChange { meta: { changes: number } }

/**
 * Guard that re-asserts, at write time, that no pin in the placement has
 * pending review. Every statement in the publish batch carries it so a
 * concurrent create/edit cannot slip a pending pin between preflight and
 * mutation (TOCTOU). D1 batches are transactional; the test D1 adapter
 * evaluates each guarded statement against current state too.
 */
function pendingGuard(tenant: string, mediaAssetId: string, placementId: string) {
  return {
    sql: `NOT EXISTS (SELECT 1 FROM photo_hotspot_mappings pg
            WHERE pg.tenant_id = ? AND pg.media_asset_id = ? AND pg.placement_id = ?
              AND (pg.review_reason IS NULL OR pg.review_reason != 'deleted')
              AND pg.review_state = 'pending')
          AND NOT EXISTS (SELECT 1 FROM photo_hotspot_drafts pd
            WHERE pd.tenant_id = ? AND pd.media_asset_id = ?
              AND json_extract(pd.snapshot_json, '$.placementId') = ?
              AND json_extract(pd.snapshot_json, '$.reviewState') = 'pending')`,
    params: [tenant, mediaAssetId, placementId, tenant, mediaAssetId, placementId],
  };
}

/** Revision insert guarded by the same publish preconditions. */
function guardedRevision(
  db: D1Database,
  mapping: PhotoHotspotMappingRow,
  actor: string,
  guard: { sql: string; params: unknown[] },
): D1PreparedStatement {
  return db.prepare(
    `INSERT INTO photo_hotspot_mapping_revisions
      (id, tenant_id, mapping_id, media_asset_id, from_version_id, to_version_id,
       action, snapshot_json, actor, note, created_at)
     SELECT ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, datetime('now')
      WHERE ${guard.sql}`,
  ).bind(
    crypto.randomUUID(), mapping.tenantId, mapping.id, mapping.mediaAssetId,
    mapping.sourceVersionId, mapping.sourceVersionId, "publish",
    JSON.stringify(mapping), actor, "publish", ...guard.params,
  );
}

export async function listRoomHotspots(
  ctx: HotspotAdminCtx,
  roomId: string,
  authorize: HotspotAdminAuthorize = authorizeScopedRequest,
): Promise<Response> {
  const principal = await principalFor(ctx, authorize, "viewer");
  if (principal instanceof Response) return principal;
  const tenant = principal.tenantId;
  const db = getDb(ctx.env);
  if (!db) return json({ error: "D1 not configured" }, 503, "no-store");
  if (!await ownedRoom(db, tenant, roomId)) return json({ error: "room_not_found" }, 404, "no-store");

  const [mappings, amenities] = await Promise.all([
    db.prepare(
      `SELECT ${MAPPING_COLUMNS} FROM photo_hotspot_mappings
        WHERE tenant_id = ?1 AND target_table = 'room_types' AND target_id = ?2
        ORDER BY media_asset_id, display_order, id`,
    ).bind(tenant, roomId).all(),
    db.prepare(
      `SELECT a.id, a.name FROM amenities a
        JOIN room_type_amenities rta ON rta.amenity_id = a.id
        JOIN room_types rt ON rt.id = rta.room_type_id AND rt.tenant_id = ?2
       WHERE rta.room_type_id = ?1 AND a.tenant_id = ?2 AND rta.excluded = 0
       ORDER BY rta.display_order, a.name`,
    ).bind(roomId, tenant).all(),
  ]);
  const rows = parseRows(mappings.results ?? []);
  const drafts = new Map<string, PhotoHotspotMappingRow>();
  const deletions = new Map<string, PhotoHotspotMappingRow>();
  for (const mediaAssetId of new Set(rows.map((row) => row.mediaAssetId))) {
    for (const [id, draft] of await loadDrafts(db, tenant, mediaAssetId)) drafts.set(id, draft);
    for (const [id, snapshot] of await loadDeletions(db, tenant, mediaAssetId)) deletions.set(id, snapshot);
  }
  return json({
    roomId,
    items: mergeDrafts(rows, drafts, deletions).filter((item) => item.reviewReason !== "deleted"),
    amenities: amenities.results ?? [],
  }, 200, "no-store");
}

export async function createRoomHotspot(
  ctx: HotspotAdminCtx,
  roomId: string,
  authorize: HotspotAdminAuthorize = authorizeScopedRequest,
): Promise<Response> {
  const principal = await principalFor(ctx, authorize, "admin");
  if (principal instanceof Response) return principal;
  const tenant = principal.tenantId;
  const input = await readJson(ctx.request, createSchema);
  if (input instanceof Response) return input;
  const db = getDb(ctx.env);
  if (!db) return json({ error: "D1 not configured" }, 503, "no-store");
  if (!await ownedRoom(db, tenant, roomId)) return json({ error: "room_not_found" }, 404, "no-store");

  // The placement, its media asset, the version and the room must all belong
  // to the same tenant and to each other; unrelated/cross-tenant ids are rejected.
  const placement = await db.prepare(
    `SELECT p.id FROM media_placements p
       JOIN media_assets a ON a.id = p.media_asset_id AND a.tenant_id = p.tenant_id AND a.kind = 'image'
       JOIN room_types rt ON rt.id = p.target_id AND rt.tenant_id = p.tenant_id
      WHERE p.id = ?1 AND p.tenant_id = ?2 AND p.target_table = 'room_types'
        AND p.target_id = ?3 AND p.media_asset_id = ?4`,
  ).bind(input.placementId, tenant, roomId, input.mediaAssetId).first();
  if (!placement) return json({ error: "placement_asset_mismatch" }, 400, "no-store");
  const version = await db.prepare(
    `SELECT v.id, v.width, v.height FROM media_versions v
       JOIN media_assets a ON a.id = v.media_asset_id AND a.tenant_id = ?3 AND a.kind = 'image'
      WHERE v.id = ?1 AND v.media_asset_id = ?2`,
  ).bind(input.sourceVersionId, input.mediaAssetId, tenant).first() as { id: string; width: number | null; height: number | null } | null;
  if (!version) return json({ error: "version_not_found" }, 404, "no-store");
  const eligible = await db.prepare(
    `SELECT 1 FROM room_type_amenities rta
       JOIN amenities a ON a.id = rta.amenity_id AND a.tenant_id = ?3
       JOIN room_types rt ON rt.id = rta.room_type_id AND rt.tenant_id = ?3
      WHERE rta.room_type_id = ?1 AND rta.amenity_id = ?2 AND rta.excluded = 0`,
  ).bind(roomId, input.amenityId, tenant).first();
  if (!eligible) return json({ error: "amenity_not_eligible" }, 400, "no-store");

  const now = new Date().toISOString();
  const mapping: PhotoHotspotMappingRow = {
    id: crypto.randomUUID(),
    tenantId: tenant,
    mediaAssetId: input.mediaAssetId,
    placementId: input.placementId,
    targetTable: "room_types",
    targetId: roomId,
    amenityId: input.amenityId,
    sourceX: input.sourceX,
    sourceY: input.sourceY,
    sourceVersionId: input.sourceVersionId,
    sourceWidth: input.sourceWidth ?? version.width,
    sourceHeight: input.sourceHeight ?? version.height,
    exifOrientation: input.exifOrientation ?? 1,
    cropLeft: null, cropTop: null, cropWidth: null, cropHeight: null,
    displayOrder: input.displayOrder ?? 0,
    status: "draft",
    reviewState: input.reviewState ?? "none",
    reviewReason: input.reviewReason ?? null,
    derivedFrom: null, duplicateOf: null,
    createdAt: now, updatedAt: now,
  };
  const actor = principal.email || principal.sub || "unknown";
  await db.batch([
    insertMapping(db, mapping),
    revision(db, mapping, "create", actor, null),
  ]);
  return json({ ok: true, roomId, mapping }, 201, "no-store");
}

export async function updateRoomHotspot(
  ctx: HotspotAdminCtx,
  roomId: string,
  mappingId: string,
  authorize: HotspotAdminAuthorize = authorizeScopedRequest,
): Promise<Response> {
  const principal = await principalFor(ctx, authorize, "admin");
  if (principal instanceof Response) return principal;
  const tenant = principal.tenantId;
  const input = await readJson(ctx.request, updateSchema);
  if (input instanceof Response) return input;
  const db = getDb(ctx.env);
  if (!db) return json({ error: "D1 not configured" }, 503, "no-store");

  const row = await db.prepare(
    `SELECT ${MAPPING_COLUMNS} FROM photo_hotspot_mappings
      WHERE id = ?1 AND tenant_id = ?2 AND target_table = 'room_types' AND target_id = ?3`,
  ).bind(mappingId, tenant, roomId).first();
  const beforeList = parseRows(row ? [row] : []);
  const before = beforeList[0];
  if (!before) return json({ error: "mapping_not_found" }, 404, "no-store");

  if (input.amenityId && input.amenityId !== before.amenityId) {
    const eligible = await db.prepare(
      `SELECT 1 FROM room_type_amenities rta
         JOIN amenities a ON a.id = rta.amenity_id AND a.tenant_id = ?3
         JOIN room_types rt ON rt.id = rta.room_type_id AND rt.tenant_id = ?3
        WHERE rta.room_type_id = ?1 AND rta.amenity_id = ?2 AND rta.excluded = 0`,
    ).bind(roomId, input.amenityId, tenant).first();
    if (!eligible) return json({ error: "amenity_not_eligible" }, 400, "no-store");
  }

  // When a published pin has a pending edit, subsequent updates (for example
  // approving its review) must build on the draft, not reset it to the
  // published geometry.
  const existingDraft = before.status === "published"
    ? (await loadDrafts(db, tenant, before.mediaAssetId)).get(mappingId) ?? null
    : null;
  const base = existingDraft ?? before;
  const updated: PhotoHotspotMappingRow = {
    ...base,
    sourceX: input.sourceX ?? base.sourceX,
    sourceY: input.sourceY ?? base.sourceY,
    amenityId: input.amenityId ?? base.amenityId,
    displayOrder: input.displayOrder ?? base.displayOrder,
    reviewState: input.reviewState ?? base.reviewState,
    reviewReason: input.reviewReason !== undefined ? input.reviewReason : base.reviewReason,
    updatedAt: new Date().toISOString(),
  };
  const actor = principal.email || principal.sub || "unknown";
  if (before.status === "published") {
    // Guest reads use the published row. Park the edit in a draft snapshot so
    // it cannot change a published pin until an explicit publish.
    await db.batch([
      db.prepare(
        `INSERT INTO photo_hotspot_drafts (mapping_id, tenant_id, media_asset_id, snapshot_json, updated_at)
         VALUES (?1, ?2, ?3, ?4, datetime('now'))
         ON CONFLICT(mapping_id) DO UPDATE SET snapshot_json = excluded.snapshot_json,
           updated_at = datetime('now')`,
      ).bind(mappingId, tenant, updated.mediaAssetId, JSON.stringify(updated)),
      revision(db, updated, "review", actor, before),
    ]);
    return json({ ok: true, roomId, mapping: updated, draftOnly: true }, 200, "no-store");
  }

  const sets = [
    "source_x = ?1", "source_y = ?2", "amenity_id = ?3", "display_order = ?4",
    "review_state = ?5", "review_reason = ?6", "updated_at = ?7",
  ];
  await db.batch([
    db.prepare(
      `UPDATE photo_hotspot_mappings SET ${sets.join(", ")}
        WHERE id = ?8 AND tenant_id = ?9 AND target_table = 'room_types' AND target_id = ?10`,
    ).bind(
      updated.sourceX, updated.sourceY, updated.amenityId, updated.displayOrder,
      updated.reviewState, updated.reviewReason, updated.updatedAt,
      mappingId, tenant, roomId,
    ),
    db.prepare("DELETE FROM photo_hotspot_drafts WHERE mapping_id = ?1 AND tenant_id = ?2").bind(mappingId, tenant),
    revision(db, updated, "review", actor, before),
  ]);
  return json({ ok: true, roomId, mapping: updated }, 200, "no-store");
}

export async function publishRoomHotspots(
  ctx: HotspotAdminCtx,
  roomId: string,
  authorize: HotspotAdminAuthorize = authorizeScopedRequest,
): Promise<Response> {
  const principal = await principalFor(ctx, authorize, "admin");
  if (principal instanceof Response) return principal;
  const tenant = principal.tenantId;
  const input = await readJson(ctx.request, publishSchema);
  if (input instanceof Response) return input;
  const db = getDb(ctx.env);
  if (!db) return json({ error: "D1 not configured" }, 503, "no-store");
  if (!await ownedRoom(db, tenant, roomId)) return json({ error: "room_not_found" }, 404, "no-store");
  if (!await placementInRoom(db, tenant, roomId, input.placementId, input.mediaAssetId)) {
    return json({ error: "placement_asset_mismatch" }, 400, "no-store");
  }
  const actor = principal.email || principal.sub || "unknown";
  const { mediaAssetId, placementId } = input;
  const guard = pendingGuard(tenant, mediaAssetId, placementId);

  const [drafts, deletions, baseRows] = await Promise.all([
    loadDrafts(db, tenant, mediaAssetId),
    loadDeletions(db, tenant, mediaAssetId),
    db.prepare(
      `SELECT ${MAPPING_COLUMNS} FROM photo_hotspot_mappings
        WHERE tenant_id = ?1 AND media_asset_id = ?2 AND placement_id = ?3
        ORDER BY display_order, id`,
    ).bind(tenant, mediaAssetId, placementId).all()
      .then((r) => parseRows(r.results ?? [])),
  ]);
  const scoped = [...drafts.values()].filter((draft) => draft.placementId === placementId);
  const removed = [...deletions.values()].filter((snapshot) => snapshot.placementId === placementId);
  const removedIds = new Set(removed.map((snapshot) => snapshot.id));

  // Early response for clarity. The authoritative check is the guarded batch
  // below, which protects against a concurrent pending pin added after this.
  const pendingBase = baseRows.filter((row) =>
    row.reviewReason !== "deleted" && row.reviewState === "pending").length;
  const pendingDraft = scoped.filter((draft) => draft.reviewState === "pending").length;
  if (pendingBase || pendingDraft) {
    return json({ ok: false, error: "review_pending", pending: pendingBase + pendingDraft }, 409, "no-store");
  }

  const now = new Date().toISOString();
  const statements: D1PreparedStatement[] = [];
  // Sentinel: proves the no-pending precondition still holds when the batch
  // actually runs. A zero-change sentinel means a concurrent pending pin won
  // the race, and the whole transactional batch applies nothing.
  statements.push(db.prepare(
    `UPDATE room_types SET name = name WHERE id = ?1 AND tenant_id = ?2 AND ${guard.sql}`,
  ).bind(roomId, tenant, ...guard.params));

  for (const draft of scoped) {
    if (removedIds.has(draft.id)) continue;
    statements.push(db.prepare(
      `UPDATE photo_hotspot_mappings
          SET source_x = ?1, source_y = ?2, amenity_id = ?3, display_order = ?4,
              source_version_id = ?5, review_state = 'approved', review_reason = NULL,
              status = 'published', updated_at = ?6
        WHERE id = ?7 AND tenant_id = ?8 AND ${guard.sql}`,
    ).bind(
      draft.sourceX, draft.sourceY, draft.amenityId, draft.displayOrder,
      draft.sourceVersionId, now, draft.id, tenant, ...guard.params,
    ));
    statements.push(db.prepare(
      `DELETE FROM photo_hotspot_drafts WHERE mapping_id = ?1 AND tenant_id = ?2 AND ${guard.sql}`,
    ).bind(draft.id, tenant, ...guard.params));
    const publishedDraft: PhotoHotspotMappingRow = {
      ...draft, status: "published", reviewState: "approved", reviewReason: null, updatedAt: now,
    };
    statements.push(guardedRevision(db, publishedDraft, actor, guard));
  }

  for (const snapshot of removed) {
    statements.push(db.prepare(
      `UPDATE photo_hotspot_mappings
          SET status = 'draft', review_reason = 'deleted', updated_at = ?1
        WHERE id = ?2 AND tenant_id = ?3 AND ${guard.sql}`,
    ).bind(now, snapshot.id, tenant, ...guard.params));
    statements.push(db.prepare(
      `DELETE FROM photo_hotspot_deletions WHERE mapping_id = ?1 AND tenant_id = ?2 AND ${guard.sql}`,
    ).bind(snapshot.id, tenant, ...guard.params));
  }

  // Publish remaining active base rows (the shared publisher's behavior),
  // inlined here so there is no second read/check after the mutations.
  for (const row of baseRows) {
    if (removedIds.has(row.id) || scoped.some((draft) => draft.id === row.id)) continue;
    if (row.reviewReason === "deleted") continue;
    if (row.status === "published" && row.reviewState === "approved") continue;
    const published: PhotoHotspotMappingRow = {
      ...row, status: "published", reviewState: "approved", updatedAt: now,
    };
    statements.push(db.prepare(
      `UPDATE photo_hotspot_mappings
          SET status = 'published', review_state = 'approved', updated_at = ?1
        WHERE id = ?2 AND tenant_id = ?3 AND ${guard.sql}`,
    ).bind(now, row.id, tenant, ...guard.params));
    statements.push(guardedRevision(db, published, actor, guard));
  }

  const results = await db.batch(statements);
  if ((results[0] as BatchChange).meta.changes !== 1) {
    return json({ ok: false, error: "review_pending" }, 409, "no-store");
  }
  const published = baseRows.filter((row) =>
    !removedIds.has(row.id) && row.reviewReason !== "deleted").length + scoped.filter(
    (draft) => !removedIds.has(draft.id)).length;
  return json({
    ok: true,
    published,
    deletionsApplied: removed.length,
  }, 200, "no-store");
}

export async function rollbackRoomHotspots(
  ctx: HotspotAdminCtx,
  roomId: string,
  authorize: HotspotAdminAuthorize = authorizeScopedRequest,
): Promise<Response> {
  const principal = await principalFor(ctx, authorize, "admin");
  if (principal instanceof Response) return principal;
  const tenant = principal.tenantId;
  const input = await readJson(ctx.request, rollbackSchema);
  if (input instanceof Response) return input;
  const db = getDb(ctx.env);
  if (!db) return json({ error: "D1 not configured" }, 503, "no-store");
  if (!await ownedRoom(db, tenant, roomId)) return json({ error: "room_not_found" }, 404, "no-store");
  if (!await placementInRoom(db, tenant, roomId, input.placementId, input.mediaAssetId)) {
    return json({ error: "placement_asset_mismatch" }, 400, "no-store");
  }
  const actor = principal.email || principal.sub || "unknown";
  const result = await rollbackMappings(
    db, tenant, input.mediaAssetId, input.toVersionId, actor, input.placementId,
  );
  if (result.ok) {
    const drafts = await loadDrafts(db, tenant, input.mediaAssetId);
    const deletions = await loadDeletions(db, tenant, input.mediaAssetId);
    const statements: D1PreparedStatement[] = [
      ...[...drafts.values()]
        .filter((draft) => draft.placementId === input.placementId)
        .map((draft) => db.prepare(
          "DELETE FROM photo_hotspot_drafts WHERE mapping_id = ?1 AND tenant_id = ?2",
        ).bind(draft.id, tenant)),
      // A rollback cancels pending removals on this placement.
      ...[...deletions.values()]
        .filter((snapshot) => snapshot.placementId === input.placementId)
        .map((snapshot) => db.prepare(
          "DELETE FROM photo_hotspot_deletions WHERE mapping_id = ?1 AND tenant_id = ?2",
        ).bind(snapshot.id, tenant)),
    ];
    if (statements.length) await db.batch(statements);
  }
  return json(result, result.ok ? 200 : 409, "no-store");
}

interface DuplicateFacts {
  sameHashOnOtherMedia: boolean;
  duplicateOfMediaId: string | null;
  phashDistance: number | null;
}

/** Authoritative per-version facts from the tenant-scoped media registry. */
async function loadVersionFacts(
  db: D1Database, tenant: string, mediaAssetId: string, versionId: string,
): Promise<Fingerprint | null> {
  const row = await db.prepare(
    `SELECT sha256, phash, width, height, exif_orientation
       FROM media_version_fingerprints
      WHERE tenant_id = ?1 AND media_asset_id = ?2 AND version_id = ?3`,
  ).bind(tenant, mediaAssetId, versionId).first() as {
    sha256: string | null; phash: string | null; width: number | null;
    height: number | null; exif_orientation: number;
  } | null;
  if (!row) return null;
  return {
    sha256: row.sha256, phash: row.phash, width: row.width, height: row.height,
    exifOrientation: row.exif_orientation as Fingerprint["exifOrientation"],
  };
}

/** Duplicate classification is derived from stored fingerprints, never the request. */
async function deriveDuplicateFacts(
  db: D1Database, tenant: string, mediaAssetId: string, to: Fingerprint | null,
): Promise<DuplicateFacts> {
  const none: DuplicateFacts = { sameHashOnOtherMedia: false, duplicateOfMediaId: null, phashDistance: null };
  if (!to) return none;
  if (to.sha256) {
    const exact = await db.prepare(
      `SELECT media_asset_id FROM media_version_fingerprints
        WHERE tenant_id = ?1 AND sha256 = ?2 AND media_asset_id != ?3 LIMIT 1`,
    ).bind(tenant, to.sha256, mediaAssetId).first() as { media_asset_id: string } | null;
    if (exact) {
      return { sameHashOnOtherMedia: true, duplicateOfMediaId: exact.media_asset_id, phashDistance: null };
    }
  }
  if (to.phash) {
    const rows = await db.prepare(
      `SELECT media_asset_id, phash FROM media_version_fingerprints
        WHERE tenant_id = ?1 AND media_asset_id != ?2 AND phash IS NOT NULL`,
    ).bind(tenant, mediaAssetId).all();
    let best: number | null = null;
    let bestId: string | null = null;
    for (const row of (rows.results ?? []) as Array<{ media_asset_id: string; phash: string }>) {
      const distance = hammingDistance(to.phash, row.phash);
      if (distance != null && (best === null || distance < best)) {
        best = distance;
        bestId = row.media_asset_id;
      }
    }
    if (best !== null) return { sameHashOnOtherMedia: false, duplicateOfMediaId: bestId, phashDistance: best };
  }
  return none;
}

/** Every pin in a placement must be authored on the selected source version. */
async function sourceVersionMatches(
  db: D1Database, tenant: string, mediaAssetId: string, placementId: string, fromVersionId: string,
): Promise<boolean> {
  const rows = await db.prepare(
    `SELECT DISTINCT source_version_id FROM photo_hotspot_mappings
      WHERE tenant_id = ?1 AND media_asset_id = ?2 AND placement_id = ?3
        AND (review_reason IS NULL OR review_reason != 'deleted')`,
  ).bind(tenant, mediaAssetId, placementId).all();
  return (rows.results ?? []).every((row: any) => row.source_version_id === fromVersionId);
}

/** Admin crop entry is normalized 0..1; COW-34 geometry works in source pixels. */
function toPixelCrop(
  crop: { left: number; top: number; width: number; height: number } | null | undefined,
  size: { width: number; height: number } | null,
): CropRect | null {
  if (!crop || !size) return null;
  return {
    left: crop.left * size.width,
    top: crop.top * size.height,
    width: crop.width * size.width,
    height: crop.height * size.height,
  };
}

async function versionBelongsToAsset(
  db: D1Database, tenant: string, mediaAssetId: string, versionId: string,
): Promise<boolean> {
  return Boolean(await db.prepare(
    `SELECT v.id FROM media_versions v
       JOIN media_assets a ON a.id = v.media_asset_id AND a.tenant_id = ?3 AND a.kind = 'image'
      WHERE v.id = ?1 AND v.media_asset_id = ?2`,
  ).bind(versionId, mediaAssetId, tenant).first());
}

/** Plan is computed server-side on every call; callers never submit mapping rows. */
async function runReplacement(
  ctx: HotspotAdminCtx,
  roomId: string,
  authorize: HotspotAdminAuthorize,
  commit: boolean,
): Promise<Response> {
  const principal = await principalFor(ctx, authorize, "admin");
  if (principal instanceof Response) return principal;
  const tenant = principal.tenantId;
  const input = await readJson(ctx.request, replacementSchema);
  if (input instanceof Response) return input;
  const db = getDb(ctx.env);
  if (!db) return json({ error: "D1 not configured" }, 503, "no-store");
  if (!await ownedRoom(db, tenant, roomId)) return json({ error: "room_not_found" }, 404, "no-store");
  if (!await placementInRoom(db, tenant, roomId, input.placementId, input.mediaAssetId)) {
    return json({ error: "placement_asset_mismatch" }, 400, "no-store");
  }
  // A replacement changes versions of the same canonical asset, never the
  // asset identity itself.
  if (!await versionBelongsToAsset(db, tenant, input.mediaAssetId, input.fromVersionId)
    || !await versionBelongsToAsset(db, tenant, input.mediaAssetId, input.toVersionId)) {
    return json({ error: "version_asset_mismatch" }, 400, "no-store");
  }

  const versionRow = await db.prepare(
    "SELECT width, height FROM media_versions WHERE id = ?1 AND media_asset_id = ?2",
  ).bind(input.toVersionId, input.mediaAssetId).first() as { width: number | null; height: number | null } | null;
  const cropSize = versionRow?.width && versionRow?.height
    ? { width: versionRow.width, height: versionRow.height }
    : null;

  // A plan applies one source coordinate system to every pin in the placement.
  // Reject a stale or mixed source version instead of remapping bad geometry.
  if (!await sourceVersionMatches(
    db, tenant, input.mediaAssetId, input.placementId, input.fromVersionId,
  )) {
    return json({ error: "source_version_mismatch" }, 409, "no-store");
  }

  const [fromFacts, toFacts] = await Promise.all([
    loadVersionFacts(db, tenant, input.mediaAssetId, input.fromVersionId),
    loadVersionFacts(db, tenant, input.mediaAssetId, input.toVersionId),
  ]);
  const duplicates = await deriveDuplicateFacts(db, tenant, input.mediaAssetId, toFacts);

  const planInput = {
    tenantId: tenant,
    mediaAssetId: input.mediaAssetId,
    placementId: input.placementId,
    fromVersionId: input.fromVersionId,
    toVersionId: input.toVersionId,
    urlOnly: input.urlOnly,
    cropBefore: toPixelCrop(input.cropBefore, cropSize),
    cropAfter: toPixelCrop(input.cropAfter, cropSize),
    fromFingerprint: fromFacts,
    toFingerprint: toFacts,
    sameHashOnOtherMedia: duplicates.sameHashOnOtherMedia,
    duplicateOfMediaId: duplicates.duplicateOfMediaId,
    phashDistance: duplicates.phashDistance,
    approveReview: input.approveReview,
  };
  const plan = await planReplacement(db, planInput);
  // A single pin can be flagged pending even when the overall decision is
  // auto-publishable (for example a pin outside a new crop rectangle).
  const reviewRequired = plan.reviewRequired
    || plan.mappings.some((mapping) => mapping.reviewState === "pending");

  // URL-only changes never alter geometry: stay a strict no-op.
  if (plan.decision === "url_only") {
    return json({ written: 0, stagedPublished: 0, decision: plan.decision, reviewRequired }, 200, "no-store");
  }

  if (!commit) return json({ ...plan, reviewRequired }, 200, "no-store");

  const previousRows = await db.prepare(
    `SELECT ${MAPPING_COLUMNS} FROM photo_hotspot_mappings
      WHERE tenant_id = ?1 AND media_asset_id = ?2 AND placement_id = ?3
      ORDER BY display_order, id`,
  ).bind(tenant, input.mediaAssetId, input.placementId).all();
  const previous = parseRows(previousRows.results ?? []);
  const byId = new Map(previous.map((row) => [row.id, row]));
  const actor = principal.email || principal.sub || "unknown";

  // Published pins keep serving guests until an explicit publish. Their
  // proposed replacement is staged in the draft overlay exactly like an edit.
  const stageStatements: D1PreparedStatement[] = [];
  const draftMappings = plan.mappings.filter((mapping) => byId.get(mapping.id)?.status !== "published");
  for (const mapping of plan.mappings) {
    if (byId.get(mapping.id)?.status !== "published") {
      stageStatements.push(db.prepare(
        "DELETE FROM photo_hotspot_drafts WHERE mapping_id = ?1 AND tenant_id = ?2",
      ).bind(mapping.id, tenant));
      continue;
    }
    stageStatements.push(db.prepare(
      `INSERT INTO photo_hotspot_drafts (mapping_id, tenant_id, media_asset_id, snapshot_json, updated_at)
       VALUES (?1, ?2, ?3, ?4, datetime('now'))
       ON CONFLICT(mapping_id) DO UPDATE SET snapshot_json = excluded.snapshot_json,
         updated_at = datetime('now')`,
    ).bind(mapping.id, tenant, input.mediaAssetId, JSON.stringify(mapping)));
    stageStatements.push(revision(db, mapping, "review", actor, byId.get(mapping.id) ?? null));
  }
  if (stageStatements.length) await db.batch(stageStatements);

  let written = plan.mappings.length;
  if (draftMappings.length) {
    const result = await applyReplacement(
      db,
      { ...plan, mappings: draftMappings },
      previous.filter((row) => draftMappings.some((mapping) => mapping.id === row.id)),
      { fromVersionId: input.fromVersionId, actor },
    );
    written = result.written + (plan.mappings.length - draftMappings.length);
  }
  return json({
    written,
    decision: plan.decision,
    reviewRequired,
    stagedPublished: plan.mappings.length - draftMappings.length,
  }, 200, "no-store");
}

export function planHotspotReplacement(
  ctx: HotspotAdminCtx,
  roomId: string,
  authorize: HotspotAdminAuthorize = authorizeScopedRequest,
): Promise<Response> {
  return runReplacement(ctx, roomId, authorize, false);
}

export function applyHotspotReplacement(
  ctx: HotspotAdminCtx,
  roomId: string,
  authorize: HotspotAdminAuthorize = authorizeScopedRequest,
): Promise<Response> {
  return runReplacement(ctx, roomId, authorize, true);
}

/** Removal is staged and revisioned; the mapping row stays for audit/FK integrity. */
export async function deleteRoomHotspot(
  ctx: HotspotAdminCtx,
  roomId: string,
  mappingId: string,
  authorize: HotspotAdminAuthorize = authorizeScopedRequest,
): Promise<Response> {
  const principal = await principalFor(ctx, authorize, "admin");
  if (principal instanceof Response) return principal;
  const tenant = principal.tenantId;
  const db = getDb(ctx.env);
  if (!db) return json({ error: "D1 not configured" }, 503, "no-store");
  if (!await ownedRoom(db, tenant, roomId)) return json({ error: "room_not_found" }, 404, "no-store");
  const row = await db.prepare(
    `SELECT ${MAPPING_COLUMNS} FROM photo_hotspot_mappings
      WHERE id = ?1 AND tenant_id = ?2 AND target_table = 'room_types' AND target_id = ?3`,
  ).bind(mappingId, tenant, roomId).first();
  const mapping = parseRows(row ? [row] : [])[0];
  if (!mapping) return json({ error: "mapping_not_found" }, 404, "no-store");
  const actor = principal.email || principal.sub || "unknown";

  await db.batch([
    db.prepare(
      `INSERT INTO photo_hotspot_deletions (mapping_id, tenant_id, media_asset_id, snapshot_json, note)
       VALUES (?1, ?2, ?3, ?4, 'editor removal')
       ON CONFLICT(mapping_id) DO UPDATE SET snapshot_json = excluded.snapshot_json,
         note = excluded.note, created_at = datetime('now')`,
    ).bind(mappingId, tenant, mapping.mediaAssetId, JSON.stringify(mapping)),
    db.prepare("DELETE FROM photo_hotspot_drafts WHERE mapping_id = ?1 AND tenant_id = ?2").bind(mappingId, tenant),
    revision(db, mapping, "review", actor, mapping),
  ]);
  return json({ ok: true, roomId, mappingId, pendingDelete: true }, 200, "no-store");
}
