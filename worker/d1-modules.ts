import type { Env } from "./mews/_lib";
import { getDb } from "./d1";

type Ctx = { request: Request; env: Env };

const TABLES: Record<string, string> = {
  events: "events",
  "add-ons": "add_ons",
  offers: "offers",
  upgrades: "upgrades",
};

function makeList(table: string) {
  return async (ctx: Ctx): Promise<Response> => {
    const db = getDb(ctx.env);
    if (!db) {
      return new Response(JSON.stringify({ error: "D1 not configured" }), {
        status: 503,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      });
    }
    const url = new URL(ctx.request.url);
    const tenantId = url.searchParams.get("tenant") ?? "urban-cowboy";
    const where =
      table === "events"
        ? "tenant_id = ?1 AND display_flag = 1"
        : "tenant_id = ?1 AND status = 'published'";
    const stmt = db
      .prepare(`SELECT * FROM ${table} WHERE ${where} ORDER BY created_at DESC`)
      .bind(tenantId);
    const result = await stmt.all();
    const items = (result.results ?? []).map((r: any) => {
      const out: any = {};
      for (const [k, v] of Object.entries(r)) {
        const camel = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
        out[camel] = v;
      }
      return out;
    });
    return new Response(JSON.stringify({ items }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  };
}

export const eventsList = makeList("events");
export const addOnsList = makeList("add_ons");
export const offersList = makeList("offers");
export const upgradesList = makeList("upgrades");

export async function onRequestGetFactory(
  _ctx: Ctx,
): Promise<Response> {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}