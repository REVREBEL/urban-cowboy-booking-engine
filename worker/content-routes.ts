/** COW-32 HTTP handlers: snapshots, refresh/rollback, shadow parity. */

import type { Env } from "./mews/_lib.ts";
import {
  authorizeScopedRequest,
  requireAdmin,
  requireViewer,
} from "./auth.ts";
import {
  CONTENT_COLLECTIONS,
  buildSnapshot,
  dbForContent,
  isContentCollection,
  loadPublishedCollection,
  sha256Hex,
  type ContentCollection,
  type PublishedRecord,
} from "./content-provider.ts";
import {
  getSnapshot,
  getSnapshotPointer,
  rollbackSnapshot,
  saveSnapshot,
} from "./published-snapshots.ts";
import { shadowCompareCollection, webflowParityItems, type WebflowLoader } from "./shadow-read.ts";
import { contentSource, jsonResponse, NO_STORE_HEADERS, snapshotHeaders } from "./content-source.ts";
import type { TenantScope } from "./d1.ts";

export type ContentCtx = {
  request: Request;
  env: Env;
  waitUntil: (promise: Promise<unknown>) => void;
};

function scopeFor(request: Request, env: Env): TenantScope {
  return {
    tenantId: env.TENANT_ID?.trim() || "urban-cowboy",
    locationId: new URL(request.url).searchParams.get("location") || undefined,
  };
}

function error(status: number, code: string): Response {
  return jsonResponse({ error: code }, status, NO_STORE_HEADERS);
}

async function loadAll(
  db: D1Database,
  env: Env,
  scope: TenantScope,
  collections: readonly ContentCollection[],
): Promise<Record<string, PublishedRecord[]>> {
  const out: Record<string, PublishedRecord[]> = {};
  for (const collection of collections) {
    out[collection] = await loadPublishedCollection(db, scope, collection);
  }
  return out;
}

/** GET a pinned or current snapshot. Public only in d1 mode; otherwise admin. */
export async function snapshotGet(
  ctx: ContentCtx,
  collectionName: string,
  fallbackLoader: WebflowLoader = webflowParityItems,
): Promise<Response> {
  if (!isContentCollection(collectionName)) return error(404, "unknown_collection");
  const source = contentSource(ctx.env);
  if (source !== "d1") {
    const denied = await requireViewer(ctx.request, ctx.env);
    if (denied) return denied;
  }
  const scope = scopeFor(ctx.request, ctx.env);
  const pinned = new URL(ctx.request.url).searchParams.get("version");

  try {
    const db = dbForContent(ctx.env);
    const snapshot = await getSnapshot(db, scope, collectionName, pinned);
    if (!snapshot) {
      return pinned ? error(404, "version_not_found") : error(404, "snapshot_not_published");
    }
    return jsonResponse(JSON.parse(snapshot.payloadJson), 200, {
      ...snapshotHeaders(snapshot.version, source),
      ...(pinned ? { "X-Snapshot-Pinned": "true" } : {}),
    });
  } catch (err) {
    // Error fallback: never break the guest flow on a snapshot read failure,
    // but keep the underlying error visible for diagnosis.
    console.error("[snapshotGet] D1 read failed, falling back to Webflow", err);
    const webflow = await fallbackLoader(ctx.env, collectionName);
    if (!webflow) return error(503, "snapshot_unavailable");
    const records: PublishedRecord[] = webflow.map((item) => ({
      id: item.id,
      collection: collectionName,
      payload: { slug: item.slug, name: item.name, published: item.published },
    }));
    const built = await buildSnapshot(collectionName, records);
    return jsonResponse(JSON.parse(built.payloadJson), 200, {
      ...snapshotHeaders(built.version, source),
      "X-Content-Fallback": "webflow",
    });
  }
}

/** POST refresh: rebuild snapshots from current published D1 rows and repoint. */
export async function snapshotsRefresh(ctx: ContentCtx): Promise<Response> {
  const denied = await requireAdmin(ctx.request, ctx.env);
  if (denied) return denied;
  const principal = await authorizeScopedRequest(ctx.request, ctx.env, "admin");
  if (principal instanceof Response) return principal;

  let requested: string | undefined;
  try {
    const body = await ctx.request.json() as { collection?: string };
    requested = body.collection;
  } catch { /* optional body */ }
  const collections = requested
    ? isContentCollection(requested) ? [requested] : []
    : CONTENT_COLLECTIONS;
  if (!collections.length) return error(400, "unknown_collection");

  const db = dbForContent(ctx.env);
  const scope = scopeFor(ctx.request, ctx.env);
  const records = await loadAll(db, ctx.env, scope, collections);
  const versions: Record<string, string> = {};
  for (const collection of collections) {
    const built = await buildSnapshot(collection, records[collection]);
    await saveSnapshot(db, scope, collection, built);
    versions[collection] = built.version;
  }
  if (contentSource(ctx.env) === "shadow") {
    ctx.waitUntil(
      (async () => {
        for (const collection of collections) {
          await shadowCompareCollection(db, ctx.env, scope, collection, records[collection]);
        }
      })(),
    );
  }
  return jsonResponse({ source: contentSource(ctx.env), versions }, 200, NO_STORE_HEADERS);
}

/** POST rollback: repoint every requested collection to its previous version. */
export async function snapshotsRollback(ctx: ContentCtx): Promise<Response> {
  const denied = await requireAdmin(ctx.request, ctx.env);
  if (denied) return denied;
  const principal = await authorizeScopedRequest(ctx.request, ctx.env, "admin");
  if (principal instanceof Response) return principal;

  let requested: string | undefined;
  try {
    const body = await ctx.request.json() as { collection?: string };
    requested = body.collection;
  } catch { /* optional body */ }
  const collections = requested
    ? isContentCollection(requested) ? [requested] : []
    : CONTENT_COLLECTIONS;
  if (!collections.length) return error(400, "unknown_collection");

  const db = dbForContent(ctx.env);
  const scope = scopeFor(ctx.request, ctx.env);
  const pointers: Record<string, string> = {};
  const skipped: string[] = [];
  for (const collection of collections) {
    const after = await rollbackSnapshot(db, scope, collection);
    if (after) pointers[collection] = after.currentVersion;
    else skipped.push(collection);
  }
  return jsonResponse({ pointers, skipped }, 200, NO_STORE_HEADERS);
}

/** GET shadow parity: Webflow ↔ D1 differences per collection (admin/no-store). */
export async function parityGet(ctx: ContentCtx): Promise<Response> {
  const denied = await requireAdmin(ctx.request, ctx.env);
  if (denied) return denied;
  const principal = await authorizeScopedRequest(ctx.request, ctx.env, "admin");
  if (principal instanceof Response) return principal;

  const db = dbForContent(ctx.env);
  const scope = scopeFor(ctx.request, ctx.env);
  const requested = new URL(ctx.request.url).searchParams.get("collection");
  const collections: readonly ContentCollection[] = requested
    ? isContentCollection(requested) ? [requested] : []
    : CONTENT_COLLECTIONS;
  if (!collections.length) return error(400, "unknown_collection");

  const reports = [];
  for (const collection of collections) {
    const records = await loadPublishedCollection(db, scope, collection);
    const summary = await shadowCompareCollection(db, ctx.env, scope, collection, records);
    if (summary) reports.push(summary);
  }
  const pointerStatus: Record<string, string | null> = {};
  for (const report of reports) {
    const pointer = await getSnapshotPointer(db, scope, report.collection as ContentCollection);
    pointerStatus[report.collection] = pointer?.currentVersion ?? null;
  }
  return jsonResponse({ source: contentSource(ctx.env), reports, pointers: pointerStatus }, 200, NO_STORE_HEADERS);
}

/** Helper for pinning proof in tests and admin diagnostics. */
export async function sha256For(value: string): Promise<string> {
  return sha256Hex(value);
}
