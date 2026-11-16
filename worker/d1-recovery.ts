import type { Env } from "./mews/_lib";
import { getDb } from "./d1";
import { requireRole } from "./auth";

type Ctx = { request: Request; env: Env };

export async function recoveryList(ctx: Ctx): Promise<Response> {
  const denied = requireRole(ctx.request, ["admin", "editor"], ctx.env);
  if (denied) return denied;
  const db = getDb(ctx.env);
  if (!db) {
    return new Response(JSON.stringify({ error: "D1 not configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }
  const url = new URL(ctx.request.url);
  const tenantId = url.searchParams.get("tenant") ?? "urban-cowboy";
  const result = await db
    .prepare("SELECT ca.* FROM cart_abandonments ca JOIN guest_sessions gs ON gs.id = ca.session_id WHERE gs.tenant_id = ?1 ORDER BY ca.created_at DESC LIMIT 100")
    .bind(tenantId)
    .all();
  return new Response(JSON.stringify({ items: result.results ?? [] }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}