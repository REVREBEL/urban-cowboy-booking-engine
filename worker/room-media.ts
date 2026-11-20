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
  mediaAssetId: z.string().min(1),
  placementId: z.string().min(1).optional(),
  displayOrder: z.number().int().min(0).max(10000).optional(),
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

  const current = await db.prepare(
    "SELECT id, media_asset_id FROM media_placements WHERE id = ?1 AND tenant_id = ?2 AND target_table = 'room_types' AND target_id = ?3",
  ).bind(placementId, scope, roomId).first() as { id: string; media_asset_id: string } | null;
  if (!current) return json({ error: "placement_not_found" }, 404, "no-store");

  await db.batch([
    db.prepare(
      `UPDATE media_placements
          SET display_order = COALESCE(?1, display_order),
              alt_text_override = COALESCE(?2, alt_text_override),
              caption_override = COALESCE(?3, caption_override),
              description_override = COALESCE(?4, description_override),
              updated_at = datetime('now')
        WHERE id = ?5 AND tenant_id = ?6 AND target_table = 'room_types' AND target_id = ?7`,
    ).bind(
      input.displayOrder ?? null, input.altText ?? null, input.caption ?? null,
      input.description ?? null, placementId, scope, roomId,
    ),
    db.prepare(
      `INSERT INTO gallery_editorial (placement_id, tenant_id, is_excluded, note, updated_at)
       VALUES (?1, ?2, ?3, ?4, datetime('now'))
       ON CONFLICT(placement_id) DO UPDATE SET
         is_excluded = COALESCE(?3, gallery_editorial.is_excluded),
         note = COALESCE(?4, gallery_editorial.note),
         updated_at = datetime('now')`,
    ).bind(
      placementId, scope,
      input.excluded === undefined ? null : Number(input.excluded),
      input.note ?? null,
    ),
    db.prepare(
      `INSERT INTO media_revisions
        (id, tenant_id, media_asset_id, action, target_table, target_id, actor, note, metadata_json)
       VALUES (?1, ?2, ?3, 'set_placement', 'room_types', ?4, ?5, ?6, ?7)`,
    ).bind(
      crypto.randomUUID(), scope, current.media_asset_id, roomId, actor,
      input.note ?? "gallery metadata updated", JSON.stringify({ placementId, input }),
    ),
    db.prepare(
      `INSERT INTO audit_log (id, tenant_id, actor, action, target_type, target_id, metadata_json)
       VALUES (?1, ?2, ?3, 'gallery_updated', 'room_gallery', ?4, ?5)`,
    ).bind(crypto.randomUUID(), scope, actor, roomId, JSON.stringify({ placementId })),
  ]);
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

  const current = await db.prepare(
    "SELECT id, media_asset_id, display_order FROM media_placements WHERE id = ?1 AND tenant_id = ?2 AND target_table = 'room_types' AND target_id = ?3",
  ).bind(placementId, scope, roomId).first() as { id: string; media_asset_id: string; display_order: number } | null;
  if (!current) return json({ error: "placement_not_found" }, 404, "no-store");

  await db.batch([
    db.prepare("DELETE FROM gallery_editorial WHERE placement_id = ?1 AND tenant_id = ?2").bind(placementId, scope),
    db.prepare(
      "DELETE FROM media_placements WHERE id = ?1 AND tenant_id = ?2 AND target_table = 'room_types' AND target_id = ?3",
    ).bind(placementId, scope, roomId),
    db.prepare(
      `INSERT INTO media_revisions
        (id, tenant_id, media_asset_id, action, target_table, target_id, actor, note, metadata_json)
       VALUES (?1, ?2, ?3, 'set_placement', 'room_types', ?4, ?5, 'gallery unlink', ?6)`,
    ).bind(
      crypto.randomUUID(), scope, current.media_asset_id, roomId, actor,
      JSON.stringify({ placementId, displayOrder: current.display_order }),
    ),
  ]);
  return json({ ok: true, roomId, placementId }, 200, "no-store");
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
  const db = getDb(ctx.env);
  if (!db) return json({ error: "D1 not configured" }, 503, "no-store");
  if (!await ownedRoom(db, scope, roomId)) return json({ error: "room_not_found" }, 404, "no-store");

  const asset = await db.prepare(
    "SELECT id FROM media_assets WHERE id = ?1 AND tenant_id = ?2 AND kind = 'image'",
  ).bind(input.mediaAssetId, scope).first();
  if (!asset) return json({ error: "asset_not_found" }, 404, "no-store");

  const placementId = input.placementId ?? crypto.randomUUID();
  const existing = await db.prepare(
    "SELECT id FROM media_placements WHERE id = ?1 AND tenant_id = ?2",
  ).bind(placementId, scope).first();
  if (existing) return json({ error: "placement_exists" }, 409, "no-store");

  await db.batch([
    db.prepare(
      `INSERT INTO media_placements
        (id, tenant_id, media_asset_id, target_table, target_id, placement_type, display_order)
       VALUES (?1, ?2, ?3, 'room_types', ?4, 'gallery', ?5)`,
    ).bind(placementId, scope, input.mediaAssetId, roomId, input.displayOrder ?? 0),
    db.prepare(
      `INSERT INTO media_revisions
        (id, tenant_id, media_asset_id, action, target_table, target_id, actor, note, metadata_json)
       VALUES (?1, ?2, ?3, 'set_placement', 'room_types', ?4, ?5, 'gallery link', ?6)`,
    ).bind(crypto.randomUUID(), scope, input.mediaAssetId, roomId, actor, JSON.stringify({ placementId })),
  ]);
  return json({ ok: true, roomId, placementId }, 200, "no-store");
}
