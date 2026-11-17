import type { Env } from "./mews/_lib.ts";
import { getDb } from "./d1.ts";
import { authorizeScopedRequest } from "./auth.ts";

type Ctx = { request: Request; env: Env };

export async function recoveryList(ctx: Ctx): Promise<Response> {
  // Guest recovery rows contain PII: require an allowlisted admin in scope.
  const principal = await authorizeScopedRequest(ctx.request, ctx.env, "admin");
  if (principal instanceof Response) return principal;
  const db = getDb(ctx.env);
  if (!db) {
    return new Response(JSON.stringify({ error: "D1 not configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }
  const result = await db
    .prepare("SELECT ca.* FROM cart_abandonments ca JOIN guest_sessions gs ON gs.id = ca.session_id WHERE gs.tenant_id = ?1 ORDER BY ca.created_at DESC LIMIT 100")
    .bind(principal.tenantId)
    .all();
  return new Response(JSON.stringify({ items: result.results ?? [] }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}