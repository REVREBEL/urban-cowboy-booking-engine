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

async function audit(
  db: D1Database,
  tenantId: string,
  actor: string,
  action: string,
  targetId: string,
  metadata: Record<string, unknown>,
): Promise<void> {
  await db.prepare(
    "INSERT INTO audit_log (id, tenant_id, actor, action, target_type, target_id, metadata_json) VALUES (?1, ?2, ?3, ?4, 'content_item', ?5, ?6)",
  ).bind(crypto.randomUUID(), tenantId, actor, action, targetId, JSON.stringify(metadata)).run();
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
    "SELECT id, tenant_id, location_id, kind, slug, status, current_revision_id, created_at, updated_at FROM content_items WHERE tenant_id = ?1 ORDER BY updated_at DESC, id",
  ).bind(principal.tenantId).all();
  return json({ items: result.results ?? [] });
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
  const requested = new URL(ctx.request.url).searchParams.get("revisionId");
  const revision = requested
    ? (revisions.results ?? []).find((r: any) => r.id === requested)
    : (revisions.results ?? []).find((r: any) => r.id === item.current_revision_id);
  return json({
    item,
    revisions: (revisions.results ?? []).map((r: any) => ({
      id: r.id, revision: r.revision, publishedAt: r.published_at,
      createdBy: r.created_by, createdAt: r.created_at,
    })),
    // Preview: an explicit revision's payload, never implicitly published.
    preview: revision ? JSON.parse((revision as any).payload_json) : null,
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

  const id = crypto.randomUUID();
  const revisionId = `${id}-r1`;
  const actor = principal.email || principal.sub || "unknown";
  await db.prepare(
    "INSERT INTO content_items (id, tenant_id, location_id, kind, slug, status, current_revision_id) VALUES (?1, ?2, ?3, ?4, ?5, 'draft', ?6)",
  ).bind(id, principal.tenantId, input.locationId ?? null, input.kind, input.slug, revisionId).run();
  await db.prepare(
    "INSERT INTO content_revisions (id, content_item_id, revision, payload_json, created_by) VALUES (?1, ?2, 1, ?3, ?4)",
  ).bind(revisionId, id, JSON.stringify(input.payload), actor).run();
  await audit(db, principal.tenantId, actor, "draft_created", id, { kind: input.kind, slug: input.slug, revisionId });
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
  if (item.current_revision_id !== input.expectedRevisionId) {
    return json({ error: "edit_conflict", currentRevisionId: item.current_revision_id }, 409);
  }

  const last = await db.prepare(
    "SELECT MAX(revision) AS n FROM content_revisions WHERE content_item_id = ?1",
  ).bind(id).first() as { n: number | null } | null;
  const next = (last?.n ?? 0) + 1;
  const revisionId = `${id}-r${next}`;
  const actor = principal.email || principal.sub || "unknown";
  await db.prepare(
    "INSERT INTO content_revisions (id, content_item_id, revision, payload_json, created_by) VALUES (?1, ?2, ?3, ?4, ?5)",
  ).bind(revisionId, id, next, JSON.stringify(input.payload), actor).run();
  await db.prepare(
    "UPDATE content_items SET current_revision_id = ?1, updated_at = datetime('now') WHERE id = ?2 AND tenant_id = ?3",
  ).bind(revisionId, id, principal.tenantId).run();
  await audit(db, principal.tenantId, actor, "draft_saved", id, { revisionId, basedOn: input.expectedRevisionId });
  // Deliberately no status change and no snapshot refresh: the public view is untouched.
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
  const revisionId = input.revisionId ?? item.current_revision_id;
  const revision = await db.prepare(
    "SELECT id FROM content_revisions WHERE id = ?1 AND content_item_id = ?2",
  ).bind(revisionId, id).first();
  if (!revision) return json({ error: "revision_not_found" }, 404);

  const actor = principal.email || principal.sub || "unknown";
  await db.prepare("UPDATE content_revisions SET published_at = datetime('now') WHERE id = ?1").bind(revisionId).run();
  await db.prepare(
    "UPDATE content_items SET status = 'published', current_revision_id = ?1, updated_at = datetime('now') WHERE id = ?2 AND tenant_id = ?3",
  ).bind(revisionId, id, principal.tenantId).run();
  await audit(db, principal.tenantId, actor, "content_published", id, { revisionId });
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
  await db.prepare("UPDATE content_revisions SET published_at = datetime('now') WHERE id = ?1").bind(input.revisionId).run();
  await db.prepare(
    "UPDATE content_items SET status = 'published', current_revision_id = ?1, updated_at = datetime('now') WHERE id = ?2 AND tenant_id = ?3",
  ).bind(input.revisionId, id, principal.tenantId).run();
  await audit(db, principal.tenantId, actor, "content_rolled_back", id, {
    fromRevisionId: item.current_revision_id, toRevisionId: input.revisionId,
  });
  const refreshed = await refreshPublishedSnapshot(db, ctx.env, principal.tenantId, item.location_id);
  return json({ id, revisionId: input.revisionId, status: "published", snapshotRefreshed: refreshed });
}
