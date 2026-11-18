import type { Env } from "./mews/_lib.ts";
import { authorizeScopedRequest } from "./auth.ts";

type Ctx = { request: Request; env: Env };

export async function analyticsSummary(ctx: Ctx): Promise<Response> {
  // Aggregated metrics: any verified Access principal may read within its scope.
  const principal = await authorizeScopedRequest(ctx.request, ctx.env, "viewer");
  if (principal instanceof Response) return principal;
  const db = ctx.env.DB ?? null;
  if (!db) {
    return new Response(JSON.stringify({ error: "D1 not configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }
  const result = await db
    .prepare("SELECT tenant_id, day, metric, SUM(value) as value FROM analytics_daily WHERE tenant_id = ?1 GROUP BY tenant_id, day, metric ORDER BY day DESC LIMIT 200")
    .bind(principal.tenantId)
    .all();
  return new Response(JSON.stringify({ items: result.results ?? [] }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}