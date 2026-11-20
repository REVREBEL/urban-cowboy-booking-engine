// COW-72 read-only D1 room gallery endpoints for the React admin.
// Tenant scope comes from the verified Access principal (the bound TENANT_ID),
// never from a query parameter, and a missing scope fails closed.
import { json, type Env } from "./mews/_lib.ts";
import { authorizeScopedRequest, type Principal } from "./auth.ts";
import { getDb, listRoomGallery as queryRoomGallery, listScopedRoomTypes } from "./d1.ts";
import { ROOM_GALLERY_KIND } from "../src/types/editor-contracts.ts";

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

function failClosedTenant(authorization: Principal | Response): string | Response {
  if (authorization instanceof Response) return authorization;
  const tenant = authorization.tenantId?.trim();
  if (!tenant) return json({ error: "tenant_scope_not_configured" }, 503, "no-store");
  return tenant;
}

/** Tenant image catalog for linking photos from the React admin. */
export async function listAdminMedia(
  ctx: RoomMediaCtx,
  authorize: RoomMediaAuthorize = authorizeScopedRequest,
): Promise<Response> {
  const authorization = await authorize(ctx.request, ctx.env, "viewer");
  const scope = failClosedTenant(authorization);
  if (scope instanceof Response) return scope;
  const db = getDb(ctx.env);
  if (!db) return json({ error: "D1 not configured" }, 503, "no-store");
  const result = await db.prepare(
    `SELECT a.id, a.original_filename, a.squarespace_asset_id, a.squarespace_url, a.alt_text,
            COALESCE(v.width, a.width) AS width, COALESCE(v.height, a.height) AS height
       FROM media_assets a
       LEFT JOIN media_asset_metadata md
         ON md.media_asset_id = a.id AND md.tenant_id = a.tenant_id
       LEFT JOIN media_versions v ON v.id = md.current_version_id
      WHERE a.tenant_id = ?1 AND a.kind = 'image'
      ORDER BY a.id`,
  ).bind(scope).all();
  const items = (result.results ?? []).map((row: any) => ({
    id: row.id as string,
    filename: row.original_filename ?? null,
    sourceAssetId: row.squarespace_asset_id ?? null,
    sourceUrl: row.squarespace_url ?? null,
    width: row.width ?? null,
    height: row.height ?? null,
    altText: row.alt_text ?? null,
  }));
  return json({ items }, 200, "no-store");
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

  const rows = await queryRoomGallery(db, scope, roomId);
  const item = await db.prepare(
    `SELECT id, status, current_revision_id FROM content_items
      WHERE tenant_id = ?1 AND kind = ?2 AND slug = ?3 AND location_id IS NULL`,
  ).bind(scope, ROOM_GALLERY_KIND, roomId).first() as
    | { id: string; status: string; current_revision_id: string | null } | null;
  let itemId: string | null = null;
  let status: string | null = null;
  let workingRevisionId: string | null = null;
  let hasUnpublishedDraft = false;
  let revisions: { id: string; revision: number; publishedAt: string | null; createdAt: string }[] = [];
  let draft: unknown = null;
  if (item) {
    itemId = item.id;
    status = item.status;
    const pointer = await db.prepare(
      "SELECT working_revision_id FROM content_item_pointers WHERE tenant_id = ?1 AND content_item_id = ?2",
    ).bind(scope, item.id).first() as { working_revision_id: string | null } | null;
    workingRevisionId = pointer?.working_revision_id ?? item.current_revision_id ?? null;
    hasUnpublishedDraft = workingRevisionId !== item.current_revision_id;
    const revisionRows = await db.prepare(
      `SELECT id, revision, published_at, created_at, payload_json FROM content_revisions
        WHERE content_item_id = ?1 ORDER BY revision`,
    ).bind(item.id).all();
    const parsed = (revisionRows.results ?? []) as any[];
    revisions = parsed.map((revision) => ({
      id: revision.id, revision: revision.revision,
      publishedAt: revision.published_at, createdAt: revision.created_at,
    }));
    const working = parsed.find((revision) => revision.id === workingRevisionId);
    if (working) {
      try { draft = JSON.parse(working.payload_json); } catch { /* malformed drafts are ignored */ }
    }
  }
  return json({
    roomId, items: rows, itemId, status, workingRevisionId, hasUnpublishedDraft, revisions, draft,
  }, 200, "no-store");
}
