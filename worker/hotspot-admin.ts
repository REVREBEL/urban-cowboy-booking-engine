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
import { publishMappings, rollbackMappings } from "./hotspot-mappings.ts";
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

/** The admin sees the draft geometry; the published row keeps serving guests. */
function mergeDrafts(
  rows: PhotoHotspotMappingRow[],
  drafts: Map<string, PhotoHotspotMappingRow>,
): Array<PhotoHotspotMappingRow & { hasDraft: boolean }> {
  return rows.map((row) => {
    const draft = drafts.get(row.id);
    return {
      ...(draft ? { ...draft, status: row.status } : row),
      hasDraft: Boolean(draft),
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
  for (const mediaAssetId of new Set(rows.map((row) => row.mediaAssetId))) {
    for (const [id, draft] of await loadDrafts(db, tenant, mediaAssetId)) drafts.set(id, draft);
  }
  return json({
    roomId,
    items: mergeDrafts(rows, drafts),
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
  const drafts = await loadDrafts(db, tenant, input.mediaAssetId);
  const scoped = [...drafts.values()].filter((draft) => draft.placementId === input.placementId);
  if (scoped.some((draft) => draft.reviewState === "pending")) {
    return json({ ok: false, error: "review_pending", pending: scoped.length }, 409, "no-store");
  }
  if (scoped.length) {
    const statements: D1PreparedStatement[] = [];
    for (const draft of scoped) {
      statements.push(insertMapping(db, { ...draft, status: "published", updatedAt: new Date().toISOString() }));
      statements.push(
        db.prepare("DELETE FROM photo_hotspot_drafts WHERE mapping_id = ?1 AND tenant_id = ?2")
          .bind(draft.id, tenant),
      );
    }
    await db.batch(statements);
  }
  const result = await publishMappings(db, tenant, input.mediaAssetId, input.placementId, actor);
  return json(result, result.ok ? 200 : 409, "no-store");
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
    const statements = [...drafts.values()]
      .filter((draft) => draft.placementId === input.placementId)
      .map((draft) => db.prepare(
        "DELETE FROM photo_hotspot_drafts WHERE mapping_id = ?1 AND tenant_id = ?2",
      ).bind(draft.id, tenant));
    if (statements.length) await db.batch(statements);
  }
  return json(result, result.ok ? 200 : 409, "no-store");
}
