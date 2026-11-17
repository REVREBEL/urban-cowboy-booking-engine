import type { Env } from "./mews/_lib";
import { getDb, listContentItems } from "./d1";

type Ctx = { request: Request; env: Env };

export async function onRequestGet(ctx: Ctx): Promise<Response> {
  const db = getDb(ctx.env);
  if (!db) {
    return new Response(JSON.stringify({ error: "D1 not configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }
  const url = new URL(ctx.request.url);
  const tenantId = url.searchParams.get("tenant") ?? "urban-cowboy";
  const kind = url.searchParams.get("kind") ?? undefined;
  const locationId = url.searchParams.get("location") ?? undefined;
  const rows = await listContentItems(db, { tenantId, locationId }, kind, true);
  const items = rows.map((r: any) => ({
    id: r.id,
    tenantId: r.tenant_id,
    locationId: r.location_id,
    kind: r.kind,
    slug: r.slug,
    status: r.status,
    currentRevisionId: r.current_revision_id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
  return new Response(JSON.stringify({ items }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}