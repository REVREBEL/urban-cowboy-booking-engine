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
  const items = await listContentItems(db, { tenantId, locationId }, kind);
  return new Response(JSON.stringify({ items }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}