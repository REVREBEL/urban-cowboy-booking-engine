/** COW-104 same-shaped D1 guest adapter for add-ons (/api/content/add-ons). */

import type { AddOnCmsItem } from "../src/types/add-on-cms.ts";
import type { Env } from "./mews/_lib.ts";
import { dbForContent } from "./content-provider.ts";
import { listScopedAddOns, type TenantScope } from "./d1.ts";
import { routeContentSource } from "./content-source.ts";
import { diffParity } from "./shadow-read.ts";
import { latestParityReport, recordParityReport } from "./published-snapshots.ts";
import { onRequestGet as webflowAddOns } from "./webflow/add-ons.ts";

type Ctx = { request: Request; env: Env; waitUntil: (promise: Promise<unknown>) => void };

const PARITY_COLLECTION = "addOns";
const CACHE_HEADERS = "public, max-age=60, s-maxage=300";

function scopeFor(request: Request, env: Env): TenantScope {
  return {
    tenantId: env.TENANT_ID?.trim() || "urban-cowboy",
    locationId: new URL(request.url).searchParams.get("location") || undefined,
  };
}

function withHeaders(response: Response, headers: Record<string, string>): Response {
  const next = new Response(response.body, response);
  for (const [key, value] of Object.entries(headers)) next.headers.set(key, value);
  return next;
}

/**
 * Maps published, tenant/location-scoped D1 add_ons rows to the existing
 * AddOnCmsItem contract. D1 has no separate item-name or image-URL column:
 * itemName reuses name and imageUrl is null (icon media URL resolution is a
 * separate W3.4 wiring step). A single unnameable published row invalidates the
 * whole collection so guests never receive a partial extras list.
 */
export async function loadAddOnsFromD1(
  db: D1Database,
  scope: TenantScope,
): Promise<AddOnCmsItem[] | null> {
  const rows = await listScopedAddOns(db, scope); // published only, scoped
  if (!rows.length) return null;
  const items: AddOnCmsItem[] = [];
  for (const row of rows) {
    const name = row.name?.trim();
    if (!name) return null;
    const description = row.description?.trim() || null;
    items.push({
      id: row.id,
      name,
      itemName: name,
      shortDescription: description,
      longDescription: description,
      mewsProductId: row.mewsProductId?.trim() || null,
      imageUrl: null,
    });
  }
  return items;
}

export function addOnsParity(webflow: AddOnCmsItem[], d1: AddOnCmsItem[]) {
  const items = (list: AddOnCmsItem[]) => list.map((item) => ({
    id: item.id,
    slug: item.mewsProductId,
    name: item.name,
    published: true,
  }));
  return diffParity(PARITY_COLLECTION, items(webflow), items(d1));
}

/** Guest-facing add-ons route with per-route flag, shadow parity and fallback. */
export async function addOnsRead(ctx: Ctx): Promise<Response> {
  const source = routeContentSource(ctx.env, "addOns");

  if (source === "webflow") return webflowAddOns({ env: ctx.env });

  if (source === "shadow") {
    const webflowResponse = await webflowAddOns({ env: ctx.env });
    const webflow = (await webflowResponse.clone().json().catch(() => ({}))) as {
      addOns?: AddOnCmsItem[];
    };
    ctx.waitUntil((async () => {
      try {
        const db = dbForContent(ctx.env);
        const scope = scopeFor(ctx.request, ctx.env);
        const d1 = await loadAddOnsFromD1(db, scope);
        const summary = addOnsParity(webflow.addOns ?? [], d1 ?? []);
        // Shadow runs on guest requests: persist only changed summaries.
        const latest = await latestParityReport(db, scope, PARITY_COLLECTION);
        if (!latest || JSON.stringify(latest.summary) !== JSON.stringify(summary)) {
          await recordParityReport(db, scope, PARITY_COLLECTION, null, summary);
          console.info("[content-migration] addOns parity", JSON.stringify(summary));
        }
      } catch (error) {
        console.warn("[content-migration] addOns shadow read failed", error instanceof Error ? error.message : "unknown");
      }
    })());
    return withHeaders(webflowResponse, { "X-Content-Source": "shadow-webflow" });
  }

  try {
    const items = await loadAddOnsFromD1(dbForContent(ctx.env), scopeFor(ctx.request, ctx.env));
    if (items) {
      return new Response(JSON.stringify({ addOns: items }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": CACHE_HEADERS,
          "X-Content-Source": "d1",
        },
      });
    }
  } catch (error) {
    console.warn("[content-migration] D1 add-ons read failed", error instanceof Error ? error.message : "unknown");
  }
  const fallback = await webflowAddOns({ env: ctx.env });
  return withHeaders(fallback, { "X-Content-Source": "webflow-fallback", "Cache-Control": "no-store" });
}
