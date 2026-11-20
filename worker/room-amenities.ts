// COW-73 tenant-scoped read endpoints for the React amenity editor.
//
// Tenant scope comes from the verified Access principal's bound TENANT_ID,
// never from a query parameter. Reads are viewer-authorized; every write goes
// through the admin-only COW-38 content editor in worker/content-editor.ts.
import { json, type Env } from "./mews/_lib.ts";
import { authorizeScopedRequest, type Principal } from "./auth.ts";
import {
  getDb,
  listRoomAmenityAssignments,
  listScopedAmenities,
  listScopedAmenityEditorial,
} from "./d1.ts";
import { AMENITY_CONTENT_KIND, ROOM_AMENITIES_KIND } from "../src/types/editor-contracts.ts";

export type RoomAmenitiesCtx = {
  request: Request;
  env: Env;
  waitUntil: (promise: Promise<unknown>) => void;
};

/** Injectable so tests can exercise denial without signing an Access JWT. */
export type RoomAmenitiesAuthorize = (
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

interface DraftLookup {
  itemId: string | null;
  status: string | null;
  currentRevisionId: string | null;
  workingRevisionId: string | null;
  revisions: { id: string; revision: number; publishedAt: string | null; createdAt: string }[];
  payload: Record<string, unknown> | null;
}

/** Working revision of a content item identified by kind + slug, never a published-only read. */
async function draftFor(
  db: D1Database,
  tenantId: string,
  kind: string,
  slug: string,
): Promise<DraftLookup> {
  // Amenity documents are tenant-level by contract. Prefer a tenant-wide row
  // if a location-scoped variant is ever introduced rather than silently
  // missing the document.
  const item = await db.prepare(
    `SELECT id, status, current_revision_id FROM content_items
      WHERE tenant_id = ?1 AND kind = ?2 AND slug = ?3
      ORDER BY (location_id IS NULL) DESC, id`,
  ).bind(tenantId, kind, slug).first() as
    | { id: string; status: string; current_revision_id: string | null }
    | null;
  if (!item) {
    return { itemId: null, status: null, currentRevisionId: null, workingRevisionId: null, revisions: [], payload: null };
  }
  const pointer = await db.prepare(
    "SELECT working_revision_id FROM content_item_pointers WHERE tenant_id = ?1 AND content_item_id = ?2",
  ).bind(tenantId, item.id).first() as { working_revision_id: string | null } | null;
  const workingRevisionId = pointer?.working_revision_id ?? item.current_revision_id ?? null;
  const revisionRows = await db.prepare(
    `SELECT id, revision, published_at, created_at, payload_json FROM content_revisions
      WHERE content_item_id = ?1 ORDER BY revision`,
  ).bind(item.id).all();
  const revisions = (revisionRows.results ?? []) as any[];
  const working = revisions.find((revision) => revision.id === workingRevisionId);
  let payload: Record<string, unknown> | null = null;
  if (working) {
    try {
      const parsed: unknown = JSON.parse(working.payload_json);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        payload = parsed as Record<string, unknown>;
      }
    } catch { /* a malformed draft is shown as absent, never published */ }
  }
  return {
    itemId: item.id,
    status: item.status,
    currentRevisionId: item.current_revision_id,
    workingRevisionId,
    revisions: revisions.map((revision) => ({
      id: revision.id,
      revision: revision.revision,
      publishedAt: revision.published_at,
      createdAt: revision.created_at,
    })),
    payload,
  };
}

/** Catalog of every tenant amenity, with its published values and optional working draft. */
export async function listAdminAmenities(
  ctx: RoomAmenitiesCtx,
  authorize: RoomAmenitiesAuthorize = authorizeScopedRequest,
): Promise<Response> {
  const authorization = await authorize(ctx.request, ctx.env, "viewer");
  const scope = failClosedTenant(authorization);
  if (scope instanceof Response) return scope;
  const db = getDb(ctx.env);
  if (!db) return json({ error: "D1 not configured" }, 503, "no-store");

  const [amenities, editorial, drafts] = await Promise.all([
    listScopedAmenities(db, { tenantId: scope }),
    listScopedAmenityEditorial(db, { tenantId: scope }),
    (async () => {
      const result = await db.prepare(
        `SELECT ci.slug AS amenity_id, ci.id AS item_id, ci.status,
                ci.current_revision_id, p.working_revision_id, r.payload_json
           FROM content_items ci
           LEFT JOIN content_item_pointers p
             ON p.tenant_id = ci.tenant_id AND p.content_item_id = ci.id
           LEFT JOIN content_revisions r
             ON r.id = COALESCE(p.working_revision_id, ci.current_revision_id)
            AND r.content_item_id = ci.id
          WHERE ci.tenant_id = ?1 AND ci.kind = ?2
          ORDER BY (ci.location_id IS NULL) DESC, ci.id`,
      ).bind(scope, AMENITY_CONTENT_KIND).all();
      // Tenant-wide rows win over any future location-scoped variant.
      const byId = new Map<string, any>();
      for (const row of result.results ?? []) {
        const amenityId = (row as any).amenity_id as string;
        if (!byId.has(amenityId)) byId.set(amenityId, row as any);
      }
      return byId;
    })(),
  ]);
  const editorialById = new Map(editorial.map((row) => [row.amenityId, row]));

  // One query for every amenity's revision history instead of one per amenity.
  const itemIds = [...new Set([...drafts.values()]
    .map((row: any) => row.item_id as string | undefined).filter(Boolean))] as string[];
  const revisionsByItem = new Map<string, { id: string; revision: number; publishedAt: string | null; createdAt: string }[]>();
  if (itemIds.length) {
    const placeholders = itemIds.map((_, index) => `?${index + 1}`).join(", ");
    const rows = await db.prepare(
      `SELECT id, content_item_id, revision, published_at, created_at FROM content_revisions
        WHERE content_item_id IN (${placeholders}) ORDER BY content_item_id, revision`,
    ).bind(...itemIds).all();
    for (const row of rows.results ?? []) {
      const entry = row as any;
      const list = revisionsByItem.get(entry.content_item_id) ?? [];
      list.push({
        id: entry.id, revision: entry.revision,
        publishedAt: entry.published_at, createdAt: entry.created_at,
      });
      revisionsByItem.set(entry.content_item_id, list);
    }
  }

  const items = amenities.map((amenity) => {
    const content = editorialById.get(amenity.id);
    const draftRow = drafts.get(amenity.id);
    let draft: Record<string, unknown> | null = null;
    if (draftRow?.payload_json) {
      try {
        const parsed: unknown = JSON.parse(draftRow.payload_json);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          draft = parsed as Record<string, unknown>;
        }
      } catch { /* ignore malformed drafts */ }
    }
    const revisions = draftRow?.item_id ? (revisionsByItem.get(draftRow.item_id) ?? []) : [];
    return {
      id: amenity.id,
      name: amenity.name,
      sortOrder: amenity.sortOrder,
      imageName: amenity.imageName,
      imagePath: amenity.imagePath,
      shortName: content?.shortName ?? amenity.name,
      shortDescription: content?.shortDescription ?? null,
      longDescription: content?.longDescription ?? null,
      active: content?.active ?? true,
      itemId: draftRow?.item_id ?? null,
      status: draftRow?.status ?? null,
      hasUnpublishedDraft: draftRow
        ? draftRow.working_revision_id !== draftRow.current_revision_id
        : false,
      workingRevisionId: draftRow?.working_revision_id ?? null,
      revisions,
      draft,
    };
  });
  return json({ items }, 200, "no-store");
}

/** Ordered assignments for one room plus its working revision and history. */
export async function getRoomAmenities(
  ctx: RoomAmenitiesCtx,
  roomId: string,
  authorize: RoomAmenitiesAuthorize = authorizeScopedRequest,
): Promise<Response> {
  const authorization = await authorize(ctx.request, ctx.env, "viewer");
  const scope = failClosedTenant(authorization);
  if (scope instanceof Response) return scope;
  const db = getDb(ctx.env);
  if (!db) return json({ error: "D1 not configured" }, 503, "no-store");
  const room = await db.prepare(
    "SELECT id, name FROM room_types WHERE id = ?1 AND tenant_id = ?2",
  ).bind(roomId, scope).first() as { id: string; name: string } | null;
  if (!room) return json({ error: "room_not_found" }, 404, "no-store");

  const [items, draft] = await Promise.all([
    listRoomAmenityAssignments(db, scope, roomId),
    draftFor(db, scope, ROOM_AMENITIES_KIND, roomId),
  ]);
  return json({
    roomId,
    roomName: room.name,
    items,
    itemId: draft.itemId,
    status: draft.status,
    hasUnpublishedDraft: draft.workingRevisionId !== draft.currentRevisionId,
    workingRevisionId: draft.workingRevisionId,
    revisions: draft.revisions,
    draft: draft.payload,
  }, 200, "no-store");
}
