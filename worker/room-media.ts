// COW-72 read-only D1 room gallery endpoints for the React admin.
// Tenant scope comes from the verified Access principal (the bound TENANT_ID),
// never from a query parameter, and a missing scope fails closed.
import { json, type Env } from "./mews/_lib.ts";
import { authorizeScopedRequest, type Principal } from "./auth.ts";
import { getDb, listScopedRoomTypes } from "./d1.ts";
import { roomGalleryRowSchema, type RoomGalleryRow } from "../src/types/d1-contracts.ts";

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
  const items: RoomGalleryRow[] = (result.results ?? []).map((row) => roomGalleryRowSchema.parse(row));
  return json({ roomId, items }, 200, "no-store");
}
