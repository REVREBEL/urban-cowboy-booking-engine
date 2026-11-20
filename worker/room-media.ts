// COW-72 read-only D1 room gallery endpoints for the React admin.
// Tenant scope comes from the verified Access principal (the bound TENANT_ID),
// never from a query parameter, and a missing scope fails closed.
import { json, type Env } from "./mews/_lib.ts";
import { authorizeScopedRequest, type Principal } from "./auth.ts";
import { getDb, listScopedRoomTypes } from "./d1.ts";
import { roomGalleryRowSchema, type RoomGalleryRow } from "../src/types/d1-contracts.ts";
import { z } from "zod";

export type RoomMediaCtx = {
  request: Request;
  env: Env;
  waitUntil: (promise: Promise<unknown>) => void;
};

/** Injectable so tests can exercise denial without signing an Access JWT. */
export type RoomMediaAuthorize = (
  request: Request,
  env: Env,
  role: "viewer" | "admin",
) => Promise<Principal | Response>;

// COW-67's importer writes 'room_gallery'; editorial placements use 'gallery'.
// Both describe the same ordered room gallery to the admin.
const GALLERY_SQL = `
  SELECT p.id AS placement_id, p.media_asset_id, p.display_order,
         a.original_filename,
         COALESCE(v.width, a.width) AS width,
         COALESCE(v.height, a.height) AS height,
         COALESCE(p.alt_text_override, a.alt_text) AS alt_text,
         COALESCE(p.caption_override, md.caption) AS caption,
         COALESCE(p.description_override, md.description) AS description,
         COALESCE(v.squarespace_url, a.squarespace_url) AS source_url,
         COALESCE(ge.is_excluded, 0) AS is_excluded,
         md.tags, md.current_version_id,
         vf.cloudinary_public_id, vf.cloudinary_version, vf.sha256
    FROM media_placements p
    JOIN room_types rt ON rt.id = p.target_id AND rt.tenant_id = p.tenant_id
    JOIN media_assets a ON a.id = p.media_asset_id AND a.tenant_id = p.tenant_id AND a.kind = 'image'
    LEFT JOIN media_asset_metadata md
      ON md.media_asset_id = a.id AND md.tenant_id = a.tenant_id
    LEFT JOIN media_versions v ON v.id = md.current_version_id
    LEFT JOIN media_version_files vf
      ON vf.version_id = v.id AND vf.tenant_id = a.tenant_id
    LEFT JOIN gallery_editorial ge
      ON ge.placement_id = p.id AND ge.tenant_id = p.tenant_id
   WHERE p.tenant_id = ?1 AND p.target_table = 'room_types'
     AND p.target_id = ?2 AND p.placement_type IN ('room_gallery', 'gallery')
   ORDER BY p.display_order, p.id`;

function failClosedTenant(authorization: Principal | Response): string | Response {
  if (authorization instanceof Response) return authorization;
  const tenant = authorization.tenantId?.trim();
  if (!tenant) return json({ error: "tenant_scope_not_configured" }, 503, "no-store");
  return tenant;
}

export async function listRooms(
  ctx: RoomMediaCtx,
  authorize: RoomMediaAuthorize = authorizeScopedRequest,
): Promise<Response> {
  const authorization = await authorize(ctx.request, ctx.env, "viewer");
  const scope = failClosedTenant(authorization);
  if (scope instanceof Response) return scope;
  const db = getDb(ctx.env);
  if (!db) return json({ error: "D1 not configured" }, 503, "no-store");
  const rows = await listScopedRoomTypes(db, { tenantId: scope });
  return json({
    items: rows.map((room) => ({ id: room.id, name: room.name, slug: room.slug })),
  }, 200, "no-store");
}

export async function listRoomGallery(
  ctx: RoomMediaCtx,
  roomId: string,
  authorize: RoomMediaAuthorize = authorizeScopedRequest,
): Promise<Response> {
  const authorization = await authorize(ctx.request, ctx.env, "viewer");
  const scope = failClosedTenant(authorization);
  if (scope instanceof Response) return scope;
  const db = getDb(ctx.env);
  if (!db) return json({ error: "D1 not configured" }, 503, "no-store");
  const room = await db.prepare(
    "SELECT id FROM room_types WHERE id = ?1 AND tenant_id = ?2",
  ).bind(roomId, scope).first();
  if (!room) return json({ error: "room_not_found" }, 404, "no-store");

  const result = await db.prepare(GALLERY_SQL).bind(scope, roomId).all();
  const items: RoomGalleryRow[] = [];
  for (const row of result.results ?? []) {
    const parsed = roomGalleryRowSchema.safeParse(row);
    // One malformed registry row must not hide the rest of the room's gallery.
    if (parsed.success) items.push(parsed.data);
  }
  return json({ roomId, items }, 200, "no-store");
}

// COW-84: authoring writes. Every mutation is admin-authorized, tenant scoped
// through the verified principal (never a query parameter), and audited in
// media_revisions. The guest read path is untouched by these writes.
const galleryUpdateSchema = z.object({
  displayOrder: z.number().int().min(0).max(10000).optional(),
  altText: z.string().max(500).nullable().optional(),
  caption: z.string().max(1000).nullable().optional(),
  description: z.string().max(4000).nullable().optional(),
  excluded: z.boolean().optional(),
  note: z.string().max(500).nullable().optional(),
}).strict();

const galleryLinkSchema = z.object({
  mediaAssetId: z.string().min(1).optional(),
  placementId: z.string().min(1).optional(),
  displayOrder: z.number().int().min(0).max(10000).optional(),
  restorePlacementId: z.string().min(1).optional(),
}).strict();

async function adminPrincipal(
  ctx: RoomMediaCtx,
  authorize: RoomMediaAuthorize,
): Promise<Principal | Response> {
  const principal = await authorize(ctx.request, ctx.env, "admin");
  if (principal instanceof Response) return principal;
  if (!principal.roles.includes("admin")) return json({ error: "forbidden" }, 403, "no-store");
  return principal;
}

async function readJson<T extends z.ZodTypeAny>(request: Request, schema: T): Promise<z.output<T> | Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return json({ error: "invalid_input" }, 400);
  return parsed.data;
}

async function ownedRoom(db: D1Database, tenant: string, roomId: string): Promise<boolean> {
  const room = await db.prepare(
    "SELECT id FROM room_types WHERE id = ?1 AND tenant_id = ?2",
  ).bind(roomId, tenant).first();
  return Boolean(room);
}

interface GalleryPlacement {
  id: string;
  media_asset_id: string;
  placement_type: string;
  display_order: number;
  alt_text_override: string | null;
  caption_override: string | null;
  description_override: string | null;
}

async function placementForRoom(
  db: D1Database, tenant: string, roomId: string, placementId: string,
): Promise<GalleryPlacement | null> {
  return await db.prepare(
    `SELECT id, media_asset_id, placement_type, display_order,
            alt_text_override, caption_override, description_override
       FROM media_placements
      WHERE id = ?1 AND tenant_id = ?2 AND target_table = 'room_types' AND target_id = ?3`,
  ).bind(placementId, tenant, roomId).first() as GalleryPlacement | null;
}

/** CASE flags let an explicit null clear a value while an omitted key leaves it alone. */
const setField = (flag: string, value: string, column: string) =>
  `${column} = CASE WHEN ${flag} THEN ${value} ELSE ${column} END`;

export async function updateRoomGalleryItem(
  ctx: RoomMediaCtx,
  roomId: string,
  placementId: string,
  authorize: RoomMediaAuthorize = authorizeScopedRequest,
): Promise<Response> {
  const authorization = await adminPrincipal(ctx, authorize);
  if (authorization instanceof Response) return authorization;
  const scope = failClosedTenant(authorization);
  if (scope instanceof Response) return scope;
  const actor = authorization.email || authorization.sub || "unknown";
  const input = await readJson(ctx.request, galleryUpdateSchema);
  if (input instanceof Response) return input;
  const db = getDb(ctx.env);
  if (!db) return json({ error: "D1 not configured" }, 503, "no-store");
  if (!await ownedRoom(db, scope, roomId)) return json({ error: "room_not_found" }, 404, "no-store");

  const current = await placementForRoom(db, scope, roomId, placementId);
  if (!current) return json({ error: "placement_not_found" }, 404, "no-store");

  const statements: any[] = [];
  // A direct update to an occupied display_order violates the placement-type
  // unique index. Shift the sibling ordering to temporary negatives first,
  // then write the final sequence in the same D1 batch.
  if (input.displayOrder !== undefined && input.displayOrder !== current.display_order) {
    const siblings = await db.prepare(
      `SELECT id, display_order FROM media_placements
        WHERE tenant_id = ?1 AND target_table = 'room_types' AND target_id = ?2
          AND placement_type = ?3
        ORDER BY display_order, id`,
    ).bind(scope, roomId, current.placement_type).all();
    const ordered = (siblings.results ?? []) as Array<{ id: string; display_order: number }>;
    const rest = ordered.filter((row) => row.id !== placementId);
    const index = Math.max(0, Math.min(input.displayOrder, rest.length));
    rest.splice(index, 0, { id: placementId, display_order: input.displayOrder });

    for (let i = 0; i < rest.length; i += 1) {
      statements.push(db.prepare(
        "UPDATE media_placements SET display_order = ?1 WHERE id = ?2 AND tenant_id = ?3",
      ).bind(-(i + 1), rest[i].id, scope));
    }
    for (let i = 0; i < rest.length; i += 1) {
      statements.push(db.prepare(
        "UPDATE media_placements SET display_order = ?1, updated_at = datetime('now') WHERE id = ?2 AND tenant_id = ?3",
      ).bind(i, rest[i].id, scope));
    }
  }

  const altProvided = input.altText !== undefined;
  const captionProvided = input.caption !== undefined;
  const descriptionProvided = input.description !== undefined;
  const noteProvided = input.note !== undefined;
  const excludedProvided = input.excluded !== undefined;

  statements.push(db.prepare(
    `UPDATE media_placements
        SET ${setField("?1", "?2", "alt_text_override")},
            ${setField("?3", "?4", "caption_override")},
            ${setField("?5", "?6", "description_override")},
            updated_at = datetime('now')
      WHERE id = ?7 AND tenant_id = ?8 AND target_table = 'room_types' AND target_id = ?9`,
  ).bind(
    altProvided ? 1 : 0, input.altText ?? null,
    captionProvided ? 1 : 0, input.caption ?? null,
    descriptionProvided ? 1 : 0, input.description ?? null,
    placementId, scope, roomId,
  ));

  statements.push(db.prepare(
    `INSERT INTO gallery_editorial (placement_id, tenant_id, is_excluded, note, updated_at)
     VALUES (?1, ?2, COALESCE(?3, 0), ?4, datetime('now'))
     ON CONFLICT(placement_id) DO UPDATE SET
       is_excluded = COALESCE(?3, gallery_editorial.is_excluded),
       note = CASE WHEN ?5 = 1 THEN ?4 ELSE gallery_editorial.note END,
       updated_at = datetime('now')`,
  ).bind(
    placementId, scope,
    excludedProvided ? Number(input.excluded) : null,
    input.note ?? null,
    noteProvided ? 1 : 0,
  ));

  statements.push(db.prepare(
    `INSERT INTO media_revisions
      (id, tenant_id, media_asset_id, action, target_table, target_id, actor, note, metadata_json)
     VALUES (?1, ?2, ?3, 'set_placement', 'room_types', ?4, ?5, ?6, ?7)`,
  ).bind(
    crypto.randomUUID(), scope, current.media_asset_id, roomId, actor,
    input.note || "gallery metadata updated", JSON.stringify({ placementId, input }),
  ));
  statements.push(db.prepare(
    `INSERT INTO audit_log (id, tenant_id, actor, action, target_type, target_id, metadata_json)
     VALUES (?1, ?2, ?3, 'gallery_updated', 'room_gallery', ?4, ?5)`,
  ).bind(crypto.randomUUID(), scope, actor, roomId, JSON.stringify({ placementId })));

  await db.batch(statements);
  return json({ ok: true, roomId, placementId }, 200, "no-store");
}

export async function unlinkGalleryItem(
  ctx: RoomMediaCtx,
  roomId: string,
  placementId: string,
  authorize: RoomMediaAuthorize = authorizeScopedRequest,
): Promise<Response> {
  const authorization = await adminPrincipal(ctx, authorize);
  if (authorization instanceof Response) return authorization;
  const scope = failClosedTenant(authorization);
  if (scope instanceof Response) return scope;
  const actor = authorization.email || authorization.sub || "unknown";
  const db = getDb(ctx.env);
  if (!db) return json({ error: "D1 not configured" }, 503, "no-store");
  if (!await ownedRoom(db, scope, roomId)) return json({ error: "room_not_found" }, 404, "no-store");

  const current = await placementForRoom(db, scope, roomId, placementId);
  if (!current) return json({ error: "placement_not_found" }, 404, "no-store");
  const editorial = await db.prepare(
    "SELECT is_excluded, note FROM gallery_editorial WHERE placement_id = ?1 AND tenant_id = ?2",
  ).bind(placementId, scope).first() as { is_excluded: number; note: string | null } | null;
  const snapshot = {
    placementId,
    mediaAssetId: current.media_asset_id,
    placementType: current.placement_type,
    displayOrder: current.display_order,
    altText: current.alt_text_override,
    caption: current.caption_override,
    description: current.description_override,
    excluded: Boolean(editorial?.is_excluded),
    note: editorial?.note ?? null,
  };

  await db.batch([
    db.prepare("DELETE FROM gallery_editorial WHERE placement_id = ?1 AND tenant_id = ?2").bind(placementId, scope),
    db.prepare(
      "DELETE FROM media_placements WHERE id = ?1 AND tenant_id = ?2 AND target_table = 'room_types' AND target_id = ?3",
    ).bind(placementId, scope, roomId),
    db.prepare(
      `INSERT INTO media_revisions
        (id, tenant_id, media_asset_id, action, target_table, target_id, actor, note, metadata_json)
       VALUES (?1, ?2, ?3, 'set_placement', 'room_types', ?4, ?5, 'gallery unlink', ?6)`,
    ).bind(crypto.randomUUID(), scope, current.media_asset_id, roomId, actor, JSON.stringify(snapshot)),
  ]);
  return json({ ok: true, roomId, placementId, snapshot }, 200, "no-store");
}

/** Unlinked placements are discoverable so the panel can offer a restore action. */
export async function listUnlinkedGallery(
  ctx: RoomMediaCtx,
  roomId: string,
  authorize: RoomMediaAuthorize = authorizeScopedRequest,
): Promise<Response> {
  const authorization = await authorize(ctx.request, ctx.env, "viewer");
  if (authorization instanceof Response) return authorization;
  const scope = failClosedTenant(authorization);
  if (scope instanceof Response) return scope;
  const db = getDb(ctx.env);
  if (!db) return json({ error: "D1 not configured" }, 503, "no-store");
  if (!await ownedRoom(db, scope, roomId)) return json({ error: "room_not_found" }, 404, "no-store");
  const rows = await db.prepare(
    `SELECT metadata_json FROM media_revisions
      WHERE tenant_id = ?1 AND target_table = 'room_types' AND target_id = ?2
        AND note = 'gallery unlink'
        AND json_extract(metadata_json, '$.placementId') NOT IN
          (SELECT id FROM media_placements WHERE tenant_id = ?1)
      ORDER BY created_at DESC`,
  ).bind(scope, roomId).all();
  const items = (rows.results ?? []).flatMap((row: any) => {
    try {
      const snapshot = JSON.parse(row.metadata_json);
      return [snapshot];
    } catch {
      return [];
    }
  });
  return json({ roomId, items }, 200, "no-store");
}

export async function linkGalleryAsset(
  ctx: RoomMediaCtx,
  roomId: string,
  authorize: RoomMediaAuthorize = authorizeScopedRequest,
): Promise<Response> {
  const authorization = await adminPrincipal(ctx, authorize);
  if (authorization instanceof Response) return authorization;
  const scope = failClosedTenant(authorization);
  if (scope instanceof Response) return scope;
  const actor = authorization.email || authorization.sub || "unknown";
  const input = await readJson(ctx.request, galleryLinkSchema);
  if (input instanceof Response) return input;
  if (!input.mediaAssetId && !input.restorePlacementId) {
    return json({ error: "invalid_input" }, 400);
  }
  const db = getDb(ctx.env);
  if (!db) return json({ error: "D1 not configured" }, 503, "no-store");
  if (!await ownedRoom(db, scope, roomId)) return json({ error: "room_not_found" }, 404, "no-store");

  let snapshot: any = null;
  if (input.restorePlacementId) {
    const row = await db.prepare(
      `SELECT metadata_json FROM media_revisions
        WHERE tenant_id = ?1 AND target_table = 'room_types' AND target_id = ?2
          AND note = 'gallery unlink'
          AND json_extract(metadata_json, '$.placementId') = ?3
        ORDER BY created_at DESC LIMIT 1`,
    ).bind(scope, roomId, input.restorePlacementId).first() as { metadata_json: string } | null;
    if (!row) return json({ error: "snapshot_not_found" }, 404, "no-store");
    try { snapshot = JSON.parse(row.metadata_json); }
    catch { return json({ error: "invalid_snapshot" }, 500, "no-store"); }
  }

  const mediaAssetId = snapshot?.mediaAssetId ?? input.mediaAssetId;
  const placementId = snapshot?.placementId ?? input.placementId ?? crypto.randomUUID();
  const asset = await db.prepare(
    "SELECT id FROM media_assets WHERE id = ?1 AND tenant_id = ?2 AND kind = 'image'",
  ).bind(mediaAssetId, scope).first();
  if (!asset) return json({ error: "asset_not_found" }, 404, "no-store");
  const existing = await db.prepare(
    "SELECT id FROM media_placements WHERE id = ?1 AND tenant_id = ?2",
  ).bind(placementId, scope).first();
  if (existing) return json({ error: "placement_exists" }, 409, "no-store");

  const targetOrder = snapshot?.displayOrder ?? input.displayOrder ?? 0;
  // Make room for the restored order under the placement-type unique index.
  const siblings = await db.prepare(
    `SELECT id, display_order FROM media_placements
      WHERE tenant_id = ?1 AND target_table = 'room_types' AND target_id = ?2
        AND placement_type = ?3 AND display_order >= ?4
      ORDER BY display_order, id`,
  ).bind(scope, roomId, snapshot?.placementType ?? "gallery", targetOrder).all();
  const statements: any[] = (siblings.results ?? []).map((row: any) => db.prepare(
    "UPDATE media_placements SET display_order = display_order + 1 WHERE id = ?1 AND tenant_id = ?2",
  ).bind(row.id, scope));

  statements.push(db.prepare(
    `INSERT INTO media_placements
      (id, tenant_id, media_asset_id, target_table, target_id, placement_type,
       alt_text_override, caption_override, description_override, display_order)
     VALUES (?1, ?2, ?3, 'room_types', ?4, ?5, ?6, ?7, ?8, ?9)`,
  ).bind(
    placementId, scope, mediaAssetId, roomId, snapshot?.placementType ?? "gallery",
    snapshot?.altText ?? null, snapshot?.caption ?? null, snapshot?.description ?? null, targetOrder,
  ));
  if (snapshot) {
    statements.push(db.prepare(
      `INSERT INTO gallery_editorial (placement_id, tenant_id, is_excluded, note, updated_at)
       VALUES (?1, ?2, ?3, ?4, datetime('now'))`,
    ).bind(placementId, scope, snapshot.excluded ? 1 : 0, snapshot.note ?? null));
  }
  statements.push(db.prepare(
    `INSERT INTO media_revisions
      (id, tenant_id, media_asset_id, action, target_table, target_id, actor, note, metadata_json)
     VALUES (?1, ?2, ?3, 'set_placement', 'room_types', ?4, ?5, ?6, ?7)`,
  ).bind(
    crypto.randomUUID(), scope, mediaAssetId, roomId, actor,
    snapshot ? "gallery restore" : "gallery link",
    JSON.stringify(snapshot ?? { placementId, displayOrder: targetOrder }),
  ));
  await db.batch(statements);
  return json({ ok: true, roomId, placementId, restored: Boolean(snapshot) }, 200, "no-store");
}
