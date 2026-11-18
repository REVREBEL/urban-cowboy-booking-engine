/**
 * Editorial draft/publish API (COW-38).
 *
 * Saving a draft only writes a new content revision. Guest-facing published
 * snapshots change exclusively on publish/rollback, never on edit. Every
 * endpoint checks Cloudflare Access admin role and the configured tenant on
 * the server; the UI is not part of the authorization boundary.
 */
import type { Env } from "./mews/_lib.ts";
import { authorizeScopedRequest, type Principal } from "./auth.ts";
import { buildSnapshot, loadPublishedCollection } from "./content-provider.ts";
import { saveSnapshot } from "./published-snapshots.ts";
import {
  createDraftSchema,
  publishSchema,
  rollbackSchema,
  saveDraftSchema,
} from "../src/types/editor-contracts.ts";

export type EditorCtx = { request: Request; env: Env; waitUntil: (promise: Promise<unknown>) => void };

/** D1's batch result type omits `changes`; this is the shape the runtime returns. */
type BatchChange = { success: boolean; changes?: number };
export type Authorize = (request: Request, env: Env, role: "admin" | "viewer") => Promise<Principal | Response>;

const NO_STORE: Record<string, string> = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store, private",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: NO_STORE });
}

const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

/** Zod strips __proto__ from record output, so check the raw JSON before parsing. */
function hasForbiddenKeys(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(hasForbiddenKeys);
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).some(
      ([key, child]) => FORBIDDEN_KEYS.has(key) || hasForbiddenKeys(child),
    );
  }
  return false;
}

async function readBody<T>(request: Request, schema: { parse(value: unknown): T }): Promise<T | Response> {
  try {
    const raw = await request.json();
    if (hasForbiddenKeys(raw)) return json({ error: "invalid_input", detail: "forbidden payload key" }, 400);
    return schema.parse(raw);
  } catch (err) {
    return json({ error: "invalid_input", detail: err instanceof Error ? err.message : "invalid body" }, 400);
  }
}

async function admin(ctx: EditorCtx, authorize: Authorize): Promise<Principal | Response> {
  return authorize(ctx.request, ctx.env, "admin");
}

/** D1 rows stay snake_case internally; the editor API speaks camelCase. */
function toEditorItemSummary(row: any, workingRevisionId?: string | null) {
  return {
    id: row.id,
    kind: row.kind,
    slug: row.slug,
    status: row.status,
    currentRevisionId: row.current_revision_id ?? null,
    workingRevisionId: workingRevisionId ?? null,
    updatedAt: row.updated_at,
  };
}

/** Working pointer for an item; legacy rows fall back to the published pointer. */
async function workingRevisionId(
  db: D1Database,
  tenantId: string,
  item: any,
): Promise<string | null> {
  const row = await db.prepare(
    "SELECT working_revision_id FROM content_item_pointers WHERE tenant_id = ?1 AND content_item_id = ?2",
  ).bind(tenantId, item.id).first() as { working_revision_id: string | null } | null;
  return row?.working_revision_id ?? item.current_revision_id ?? null;
}

async function ownedItem(db: D1Database, id: string, tenantId: string): Promise<any | null> {
  return await db.prepare(
    "SELECT id, tenant_id, location_id, kind, slug, status, current_revision_id, created_at, updated_at FROM content_items WHERE id = ?1 AND tenant_id = ?2",
  ).bind(id, tenantId).first() ?? null;
}

async function refreshPublishedSnapshot(
  db: D1Database,
  env: Env,
  tenantId: string,
  locationId: string | null,
): Promise<boolean> {
  try {
    const scopes = locationId
      ? [{ tenantId }, { tenantId, locationId }]
      : [{ tenantId }];
    for (const scope of scopes) {
      const records = await loadPublishedCollection(db, scope, "contentItems");
      await saveSnapshot(db, scope, "contentItems", await buildSnapshot("contentItems", records));
    }
    return true;
  } catch (err) {
    console.error("[contentEditor] published snapshot refresh failed", err);
    return false;
  }
}

export async function listEditorItems(
  ctx: EditorCtx,
  authorize: Authorize = authorizeScopedRequest,
): Promise<Response> {
  const principal = await admin(ctx, authorize);
  if (principal instanceof Response) return principal;
  const db = ctx.env.DB;
  if (!db) return json({ error: "D1 not configured" }, 503);
  const result = await db.prepare(
    "SELECT ci.id, ci.kind, ci.slug, ci.status, ci.current_revision_id, ci.updated_at, p.working_revision_id FROM content_items ci LEFT JOIN content_item_pointers p ON p.tenant_id = ci.tenant_id AND p.content_item_id = ci.id WHERE ci.tenant_id = ?1 ORDER BY ci.updated_at DESC, ci.id",
  ).bind(principal.tenantId).all();
  return json({ items: (result.results ?? []).map((row: any) => toEditorItemSummary(row, row.working_revision_id)) });
}

export async function getEditorItem(
  ctx: EditorCtx,
  id: string,
  authorize: Authorize = authorizeScopedRequest,
): Promise<Response> {
  const principal = await admin(ctx, authorize);
  if (principal instanceof Response) return principal;
  const db = ctx.env.DB;
  if (!db) return json({ error: "D1 not configured" }, 503);
  const item = await ownedItem(db, id, principal.tenantId);
  if (!item) return json({ error: "not_found" }, 404);

  const revisions = await db.prepare(
    "SELECT id, revision, payload_json, published_at, created_by, created_at FROM content_revisions WHERE content_item_id = ?1 ORDER BY revision",
  ).bind(id).all();
  const working = await workingRevisionId(db, principal.tenantId, item);
  const revisionsList = (revisions.results ?? []) as any[];
  const requested = new URL(ctx.request.url).searchParams.get("revisionId");
  let revision: any;
  if (requested) {
    revision = revisionsList.find((r) => r.id === requested);
    if (!revision) return json({ error: "revision_not_found" }, 404);
  } else {
    revision = revisionsList.find((r) => r.id === working);
  }
  return json({
    item: toEditorItemSummary(item, working),
    revisions: revisionsList.map((r) => ({
      id: r.id, revision: r.revision, publishedAt: r.published_at,
      createdBy: r.created_by, createdAt: r.created_at,
    })),
    // Preview: an explicit revision's payload, never implicitly published.
    preview: revision ? JSON.parse(revision.payload_json) : null,
  });
}

export async function createEditorDraft(
  ctx: EditorCtx,
  authorize: Authorize = authorizeScopedRequest,
): Promise<Response> {
  const principal = await admin(ctx, authorize);
  if (principal instanceof Response) return principal;
  const input = await readBody(ctx.request, createDraftSchema);
  if (input instanceof Response) return input;
  const db = ctx.env.DB;
  if (!db) return json({ error: "D1 not configured" }, 503);

  // A caller-supplied location must belong to the authorized tenant: the FK
  // alone only proves the row exists somewhere.
  if (input.locationId) {
    const location = await db.prepare(
      "SELECT id FROM locations WHERE id = ?1 AND tenant_id = ?2",
    ).bind(input.locationId, principal.tenantId).first();
    if (!location) return json({ error: "invalid_location" }, 400);
  }

  // Pre-check for a readable conflict; the UNIQUE constraint remains the
  // final authority if two creates race.
  const duplicate = await db.prepare(
    "SELECT id FROM content_items WHERE tenant_id = ?1 AND kind = ?2 AND slug = ?3 AND location_id IS ?4",
  ).bind(principal.tenantId, input.kind, input.slug, input.locationId ?? null).first();
  if (duplicate) return json({ error: "slug_conflict" }, 409);

  const id = crypto.randomUUID();
  const revisionId = `${id}-r1`;
  const actor = principal.email || principal.sub || "unknown";
  try {
  await db.batch([
    db.prepare(
      "INSERT INTO content_items (id, tenant_id, location_id, kind, slug, status, current_revision_id) VALUES (?1, ?2, ?3, ?4, ?5, 'draft', NULL)",
    ).bind(id, principal.tenantId, input.locationId ?? null, input.kind, input.slug),
    db.prepare(
      "INSERT INTO content_revisions (id, content_item_id, revision, payload_json, created_by) VALUES (?1, ?2, 1, ?3, ?4)",
    ).bind(revisionId, id, JSON.stringify(input.payload), actor),
    db.prepare(
      "INSERT INTO content_item_pointers (tenant_id, content_item_id, working_revision_id) VALUES (?1, ?2, ?3)",
    ).bind(principal.tenantId, id, revisionId),
    db.prepare(
      "INSERT INTO audit_log (id, tenant_id, actor, action, target_type, target_id, metadata_json) VALUES (?1, ?2, ?3, 'draft_created', 'content_item', ?4, ?5)",
    ).bind(crypto.randomUUID(), principal.tenantId, actor, id, JSON.stringify({ kind: input.kind, slug: input.slug, revisionId })),
  ]);
  } catch (err) {
    if (/UNIQUE constraint failed/i.test(String(err))) return json({ error: "slug_conflict" }, 409);
    throw err;
  }
  return json({ id, revisionId, status: "draft" }, 201);
}

export async function saveEditorDraft(
  ctx: EditorCtx,
  id: string,
  authorize: Authorize = authorizeScopedRequest,
): Promise<Response> {
  const principal = await admin(ctx, authorize);
  if (principal instanceof Response) return principal;
  const input = await readBody(ctx.request, saveDraftSchema);
  if (input instanceof Response) return input;
  const db = ctx.env.DB;
  if (!db) return json({ error: "D1 not configured" }, 503);
  const item = await ownedItem(db, id, principal.tenantId);
  if (!item) return json({ error: "not_found" }, 404);
  const working = await workingRevisionId(db, principal.tenantId, item);
  if (working !== input.expectedRevisionId) {
    return json({ error: "edit_conflict", workingRevisionId: working }, 409);
  }

  const last = await db.prepare(
    "SELECT MAX(revision) AS n FROM content_revisions WHERE content_item_id = ?1",
  ).bind(id).first() as { n: number | null } | null;
  const next = (last?.n ?? 0) + 1;
  const revisionId = `${id}-r${next}`;
  const actor = principal.email || principal.sub || "unknown";

  // One atomic batch: every write is guarded by the same working-pointer
  // predicate. Two stale saves cannot both win; the loser's writes are no-ops
  // and it receives a deterministic 409 rather than a unique-key 500.
  const guard =
    "SELECT 1 FROM content_item_pointers WHERE tenant_id = ?6 AND content_item_id = ?2 AND working_revision_id = ?7";
  const results = await db.batch([
    db.prepare(
      `INSERT INTO content_revisions (id, content_item_id, revision, payload_json, created_by) SELECT ?1, ?2, ?3, ?4, ?5 WHERE EXISTS (${guard})`,
    ).bind(revisionId, id, next, JSON.stringify(input.payload), actor, principal.tenantId, input.expectedRevisionId),
    // Audit must run before the pointer moves: its guard checks the old pointer.
    db.prepare(
      "INSERT INTO audit_log (id, tenant_id, actor, action, target_type, target_id, metadata_json) SELECT ?1, ?2, ?3, 'draft_saved', 'content_item', ?4, ?5 WHERE EXISTS (SELECT 1 FROM content_item_pointers WHERE tenant_id = ?6 AND content_item_id = ?4 AND working_revision_id = ?7)",
    ).bind(crypto.randomUUID(), principal.tenantId, actor, id, JSON.stringify({ revisionId, basedOn: input.expectedRevisionId }), principal.tenantId, input.expectedRevisionId),
    db.prepare(
      "UPDATE content_item_pointers SET working_revision_id = ?1, updated_at = datetime('now') WHERE tenant_id = ?2 AND content_item_id = ?3 AND working_revision_id = ?4",
    ).bind(revisionId, principal.tenantId, id, input.expectedRevisionId),
  ]);
  if (((results[2] as BatchChange).changes ?? 0) !== 1) {
    return json({ error: "edit_conflict", workingRevisionId: working }, 409);
  }
  // Deliberately no status change and no snapshot refresh: the public view,
  // including content_items.current_revision_id, is untouched.
  return json({ id, revisionId, status: item.status, snapshotRefreshed: false });
}

export async function publishEditorItem(
  ctx: EditorCtx,
  id: string,
  authorize: Authorize = authorizeScopedRequest,
): Promise<Response> {
  const principal = await admin(ctx, authorize);
  if (principal instanceof Response) return principal;
  const input = await readBody(ctx.request, publishSchema);
  if (input instanceof Response) return input;
  const db = ctx.env.DB;
  if (!db) return json({ error: "D1 not configured" }, 503);
  const item = await ownedItem(db, id, principal.tenantId);
  if (!item) return json({ error: "not_found" }, 404);
  // With no explicit revision, publish the current draft (working pointer),
  // not the already-published pointer. An item with neither has nothing to publish.
  let revisionId: string;
  if (input.revisionId) {
    revisionId = input.revisionId;
  } else {
    const working = await workingRevisionId(db, principal.tenantId, item);
    if (!working) return json({ error: "no_revision_to_publish" }, 409);
    revisionId = working;
  }
  const revision = await db.prepare(
    "SELECT id FROM content_revisions WHERE id = ?1 AND content_item_id = ?2",
  ).bind(revisionId, id).first();
  if (!revision) return json({ error: "revision_not_found" }, 404);

  const actor = principal.email || principal.sub || "unknown";
  await db.batch([
    db.prepare("UPDATE content_revisions SET published_at = datetime('now') WHERE id = ?1").bind(revisionId),
    db.prepare(
      "UPDATE content_items SET status = 'published', current_revision_id = ?1, updated_at = datetime('now') WHERE id = ?2 AND tenant_id = ?3",
    ).bind(revisionId, id, principal.tenantId),
    db.prepare(
      "INSERT INTO content_item_pointers (tenant_id, content_item_id, working_revision_id) VALUES (?1, ?2, ?3) ON CONFLICT (tenant_id, content_item_id) DO UPDATE SET working_revision_id = excluded.working_revision_id, updated_at = datetime('now')",
    ).bind(principal.tenantId, id, revisionId),
    db.prepare(
      "INSERT INTO audit_log (id, tenant_id, actor, action, target_type, target_id, metadata_json) VALUES (?1, ?2, ?3, 'content_published', 'content_item', ?4, ?5)",
    ).bind(crypto.randomUUID(), principal.tenantId, actor, id, JSON.stringify({ revisionId })),
  ]);
  const refreshed = await refreshPublishedSnapshot(db, ctx.env, principal.tenantId, item.location_id);
  return json({ id, revisionId, status: "published", snapshotRefreshed: refreshed });
}

export async function rollbackEditorItem(
  ctx: EditorCtx,
  id: string,
  authorize: Authorize = authorizeScopedRequest,
): Promise<Response> {
  const principal = await admin(ctx, authorize);
  if (principal instanceof Response) return principal;
  const input = await readBody(ctx.request, rollbackSchema);
  if (input instanceof Response) return input;
  const db = ctx.env.DB;
  if (!db) return json({ error: "D1 not configured" }, 503);
  const item = await ownedItem(db, id, principal.tenantId);
  if (!item) return json({ error: "not_found" }, 404);
  const revision = await db.prepare(
    "SELECT id FROM content_revisions WHERE id = ?1 AND content_item_id = ?2",
  ).bind(input.revisionId, id).first();
  if (!revision) return json({ error: "revision_not_found" }, 404);

  const actor = principal.email || principal.sub || "unknown";
  await db.batch([
    db.prepare("UPDATE content_revisions SET published_at = datetime('now') WHERE id = ?1").bind(input.revisionId),
    db.prepare(
      "UPDATE content_items SET status = 'published', current_revision_id = ?1, updated_at = datetime('now') WHERE id = ?2 AND tenant_id = ?3",
    ).bind(input.revisionId, id, principal.tenantId),
    db.prepare(
      "INSERT INTO content_item_pointers (tenant_id, content_item_id, working_revision_id) VALUES (?1, ?2, ?3) ON CONFLICT (tenant_id, content_item_id) DO UPDATE SET working_revision_id = excluded.working_revision_id, updated_at = datetime('now')",
    ).bind(principal.tenantId, id, input.revisionId),
    db.prepare(
      "INSERT INTO audit_log (id, tenant_id, actor, action, target_type, target_id, metadata_json) VALUES (?1, ?2, ?3, 'content_rolled_back', 'content_item', ?4, ?5)",
    ).bind(crypto.randomUUID(), principal.tenantId, actor, id, JSON.stringify({
      fromRevisionId: item.current_revision_id, toRevisionId: input.revisionId,
    })),
  ]);
  const refreshed = await refreshPublishedSnapshot(db, ctx.env, principal.tenantId, item.location_id);
  return json({ id, revisionId: input.revisionId, status: "published", snapshotRefreshed: refreshed });
}
