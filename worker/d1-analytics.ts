import type { Env } from "./mews/_lib";
import { getDb } from "./d1";
import { requireRole } from "./auth";

type Ctx = { request: Request; env: Env };

export async function analyticsSummary(ctx: Ctx): Promise<Response> {
  const denied = requireRole(ctx.request, ["admin", "editor", "viewer"], ctx.env);
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
    .prepare("SELECT day, metric, SUM(value) as value FROM analytics_daily WHERE tenant_id = ?1 GROUP BY day, metric ORDER BY day DESC LIMIT 200")
    .bind(tenantId)
    .all();
  return new Response(JSON.stringify({ items: result.results ?? [] }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}