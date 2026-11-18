// COW-39 same-shaped D1 read adapters for guest-facing CMS routes.
//
// Webflow remains the source of truth and the default. Each route has its own
// flag so one adapter can roll back alone. Shadow mode never serves D1: it
// compares the two published views and keeps the Webflow response. D1 mode
// falls back to Webflow when the published row is missing or unreadable.

import type { Env } from "./mews/_lib.ts";
import type { PolicyLanguage } from "../src/types/policy-language.ts";
import { dbForContent } from "./content-provider.ts";
import { listScopedContentItems, publishedRevisionPayload, type TenantScope } from "./d1.ts";
import { routeContentSource } from "./content-source.ts";
import { diffParity } from "./shadow-read.ts";
import { normalizePolicyLanguage, POLICY_LANGUAGE_FIELDS, type PolicySourceItem } from "./policy-language.ts";
import { onRequestGet as webflowPolicyLanguage } from "./webflow/policy-language.ts";

type Ctx = { request: Request; env: Env; waitUntil: (promise: Promise<unknown>) => void };

const POLICY_ITEM_SLUG = "policy-language";
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

/** Returns null when no published, contract-shaped D1 row is available. */
export async function loadPolicyLanguageFromD1(
  db: D1Database,
  scope: TenantScope,
): Promise<{ language: Partial<PolicyLanguage> } | null> {
  const items = await listScopedContentItems(db, scope, "policy");
  const item = items.find((row) => row.slug === POLICY_ITEM_SLUG);
  if (!item) return null;
  const payload = await publishedRevisionPayload(db, scope, item.id);
  if (!payload) return null;
  let source: unknown;
  try {
    source = JSON.parse(payload);
  } catch {
    return null;
  }
  if (!source || typeof source !== "object" || Array.isArray(source)) return null;
  return { language: normalizePolicyLanguage(source as PolicySourceItem) };
}

function parityItems(language: Partial<PolicyLanguage>) {
  return POLICY_LANGUAGE_FIELDS.map((field) => {
    const value = language[field] ?? null;
    return { id: field, slug: value, name: value, published: Boolean(value) };
  });
}

export function policyLanguageParity(
  webflow: Partial<PolicyLanguage>,
  d1: Partial<PolicyLanguage>,
) {
  return diffParity("policyLanguage", parityItems(webflow), parityItems(d1));
}

/** Guest-facing policy route with per-route flag, shadow parity and safe fallback. */
export async function policyLanguageRead(ctx: Ctx): Promise<Response> {
  const source = routeContentSource(ctx.env, "policyLanguage");

  if (source === "webflow") return webflowPolicyLanguage({ env: ctx.env });

  if (source === "shadow") {
    const webflowResponse = await webflowPolicyLanguage({ env: ctx.env });
    const webflow = (await webflowResponse.clone().json().catch(() => ({}))) as {
      language?: Partial<PolicyLanguage>;
    };
    ctx.waitUntil((async () => {
      try {
        const d1 = await loadPolicyLanguageFromD1(dbForContent(ctx.env), scopeFor(ctx.request, ctx.env));
        const summary = policyLanguageParity(webflow.language ?? {}, d1?.language ?? {});
        console.info("[content-migration] policyLanguage parity", JSON.stringify(summary));
      } catch (error) {
        console.warn("[content-migration] policyLanguage shadow read failed", error instanceof Error ? error.message : "unknown");
      }
    })());
    return withHeaders(webflowResponse, { "X-Content-Source": "shadow-webflow" });
  }

  // d1 mode: published D1 data only, with Webflow as a safe fallback.
  try {
    const payload = await loadPolicyLanguageFromD1(dbForContent(ctx.env), scopeFor(ctx.request, ctx.env));
    if (payload) {
      return new Response(JSON.stringify({ language: payload.language }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": CACHE_HEADERS,
          "X-Content-Source": "d1",
        },
      });
    }
  } catch (error) {
    console.warn("[content-migration] D1 policy-language read failed", error instanceof Error ? error.message : "unknown");
  }
  const fallback = await webflowPolicyLanguage({ env: ctx.env });
  return withHeaders(fallback, { "X-Content-Source": "webflow-fallback", "Cache-Control": "no-store" });
}
