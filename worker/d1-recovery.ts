import type { Env } from "./mews/_lib";
import { getDb } from "./d1";
import { requireRole } from "./auth";

type Ctx = { request: Request; env: Env };

export async function recoveryList(ctx: Ctx): Promise<Response> {
  const denied = requireRole(ctx.request, ["admin", "editor"]);
  if (denied) return denied;
  const db = getDb(ctx.env);
  if (!db) {
    return new Response(JSON.stringify({ error: "D1 not configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }
  const result = await db
    .prepare("SELECT * FROM cart_abandonments ORDER BY created_at DESC LIMIT 100")
    .all();
  return new Response(JSON.stringify({ items: result.results ?? [] }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}