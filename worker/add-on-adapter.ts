/** COW-104 same-shaped D1 guest adapter for add-ons (/api/content/add-ons). */

import type { AddOnCmsItem } from "../src/types/add-on-cms.ts";
import type { Env } from "./mews/_lib.ts";
import { dbForContent } from "./content-provider.ts";
import { listScopedContentItems, publishedRevisionPayload, type TenantScope } from "./d1.ts";
import { routeContentSource } from "./content-source.ts";
import { diffParity } from "./shadow-read.ts";
import { latestParityReport, recordParityReport } from "./published-snapshots.ts";
import { onRequestGet as webflowAddOns } from "./webflow/add-ons.ts";

type Ctx = { request: Request; env: Env; waitUntil: (promise: Promise<unknown>) => void };

const PARITY_COLLECTION = "addOns";
const ADD_ON_KIND = "add_on";
const SYNC_KIND = "add_on_sync";
const SYNC_SLUG = "complete";
const CACHE_HEADERS = "public, max-age=60, s-maxage=300";
const DISPLAY_FIELDS = [
  "id", "name", "itemName", "shortDescription", "longDescription", "mewsProductId", "imageUrl",
] as const;

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

/** A nullable CMS display field must be present, even when its value is null. */
function nullableString(value: unknown): string | null | undefined {
  if (value === null || typeof value === "string") return value;
  return undefined;
}

/**
 * Parses one published CMS-shaped payload. Unlike the flat add_ons table, a
 * published revision carries every display field separately, so itemName, short
 * and long descriptions and the image URL are preserved exactly as authored.
 */
function parseAddOn(raw: string): AddOnCmsItem | null {
  let source: unknown;
  try {
    source = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!source || typeof source !== "object" || Array.isArray(source)) return null;
  const payload = source as Record<string, unknown>;
  const id = typeof payload.id === "string" ? payload.id.trim() : "";
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  if (!id || !name) return null;

  const itemName = nullableString(payload.itemName);
  const shortDescription = nullableString(payload.shortDescription);
  const longDescription = nullableString(payload.longDescription);
  const mewsProductId = nullableString(payload.mewsProductId);
  const imageUrl = nullableString(payload.imageUrl);
  if ([itemName, shortDescription, longDescription, mewsProductId, imageUrl].some((v) => v === undefined)) {
    return null;
  }
  return { id, name, itemName: itemName!, shortDescription: shortDescription!, longDescription: longDescription!, mewsProductId: mewsProductId!, imageUrl: imageUrl! };
}

/**
 * Property-scoped cutover marker. The published `add_on_sync/complete` revision
 * declares how many add-ons are expected for this property. D1 is only eligible
 * when exactly one marker exists and its expected count matches the published
 * collection; a partial migration always keeps Webflow authoritative.
 */
async function expectedCount(db: D1Database, scope: TenantScope): Promise<number | null> {
  const markers = (await listScopedContentItems(db, scope, SYNC_KIND))
    .filter((item) => item.slug === SYNC_SLUG);
  if (markers.length !== 1) return null;
  const raw = await publishedRevisionPayload(db, scope, markers[0].id);
  if (!raw) return null;
  try {
    const payload = JSON.parse(raw) as Record<string, unknown>;
    const count = payload.expectedCount;
    return typeof count === "number" && Number.isInteger(count) && count > 0 ? count : null;
  } catch {
    return null;
  }
}

/** Published, complete, property-scoped CMS add-ons, or null to fall back. */
export async function loadAddOnsFromD1(
  db: D1Database,
  scope: TenantScope,
): Promise<AddOnCmsItem[] | null> {
  const count = await expectedCount(db, scope);
  if (count === null) return null;

  const items = await listScopedContentItems(db, scope, ADD_ON_KIND);
  if (items.length !== count) return null;

  const parsed = await Promise.all(items.map(async (item) => {
    const raw = await publishedRevisionPayload(db, scope, item.id);
    return raw ? parseAddOn(raw) : null;
  }));
  return parsed.some((item) => item === null) ? null : parsed as AddOnCmsItem[];
}

/** Per-field parity so missing descriptions or images are visible in shadow mode. */
export function addOnsParity(webflow: AddOnCmsItem[], d1: AddOnCmsItem[]) {
  const items = (list: AddOnCmsItem[]) => list.flatMap((item) =>
    DISPLAY_FIELDS.map((field) => {
      const value = String(item[field] ?? "");
      return { id: `${item.id}:${field}`, slug: value, name: value, published: true };
    }),
  );
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
