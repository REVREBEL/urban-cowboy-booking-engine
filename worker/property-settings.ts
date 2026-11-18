/** Property-scoped site settings: flagged D1 reads, parity and admin view (COW-68). */

import type { Env } from "./mews/_lib.ts";
import { authorizeScopedRequest } from "./auth.ts";
import { dbForContent } from "./content-provider.ts";
import { listScopedContentItems, publishedRevisionPayload, type TenantScope } from "./d1.ts";
import { routeContentSource } from "./content-source.ts";
import { diffParity } from "./shadow-read.ts";
import { latestParityReport, recordParityReport } from "./published-snapshots.ts";
import { loadPublishedSiteSettings } from "./webflow/locations.ts";
import {
  DEFAULT_SITE_SETTINGS,
  SITE_SETTINGS_SLUG,
  parseSiteSettings,
  type SiteSettings,
} from "../src/types/site-settings.ts";

export type SettingsCtx = { request: Request; env: Env; waitUntil: (promise: Promise<unknown>) => void };
export interface PublishedSiteSettings { settings: SiteSettings; itemId: string }

const withSource = (body: unknown, source: string, cacheable: boolean): Response => new Response(
  JSON.stringify(body),
  {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": cacheable ? "public, max-age=0, s-maxage=300" : "no-store, private",
      "X-Content-Source": source,
    },
  },
);

function scopeFor(request: Request, env: Env): TenantScope {
  return {
    tenantId: env.TENANT_ID?.trim() || "urban-cowboy",
    locationId: new URL(request.url).searchParams.get("location") || undefined,
  };
}

/** Only a single published, complete site-settings row is a valid D1 source. */
export async function loadSiteSettingsFromD1(
  db: D1Database,
  scope: TenantScope,
): Promise<PublishedSiteSettings | null> {
  const items = await listScopedContentItems(db, scope, "site_settings");
  const matches = items.filter((row) => row.slug === SITE_SETTINGS_SLUG);
  if (matches.length !== 1) return null;
  const payload = await publishedRevisionPayload(db, scope, matches[0].id);
  if (!payload) return null;
  try {
    const settings = parseSiteSettings(JSON.parse(payload));
    return settings ? { settings, itemId: matches[0].id } : null;
  } catch {
    return null;
  }
}

const SETTING_FIELDS: ReadonlyArray<keyof SiteSettings> = [
  "productionLayout", "demoLayout", "enableDemoEngine",
  "enableEventDatesQuickSelection", "enableFeatureSection",
];

export function siteSettingsParity(webflow: SiteSettings, d1: SiteSettings) {
  const items = (settings: SiteSettings) => SETTING_FIELDS.map((field) => ({
    id: field,
    slug: String(settings[field]),
    name: String(settings[field]),
    published: true,
  }));
  return diffParity("siteSettings", items(webflow), items(d1));
}

/** Guest-facing settings with default-webflow flag, shadow parity and safe fallback. */
export async function siteSettingsRead(ctx: SettingsCtx): Promise<Response> {
  const source = routeContentSource(ctx.env, "siteSettings");
  const webflow = await loadPublishedSiteSettings(ctx.env);
  const webflowSettings = webflow ?? DEFAULT_SITE_SETTINGS;

  if (source === "webflow") return withSource({ settings: webflowSettings, source: "webflow" }, "webflow", false);

  if (source === "shadow") {
    ctx.waitUntil((async () => {
      try {
        const db = dbForContent(ctx.env);
        const scope = scopeFor(ctx.request, ctx.env);
        const d1 = await loadSiteSettingsFromD1(db, scope);
        const summary = siteSettingsParity(webflowSettings, d1?.settings ?? DEFAULT_SITE_SETTINGS);
        const latest = await latestParityReport(db, scope, "siteSettings");
        if (!latest || JSON.stringify(latest.summary) !== JSON.stringify(summary)) {
          await recordParityReport(db, scope, "siteSettings", null, summary);
        }
      } catch (error) {
        console.warn("[content-migration] siteSettings shadow read failed", error instanceof Error ? error.message : "unknown");
      }
    })());
    return withSource({ settings: webflowSettings, source: "shadow-webflow" }, "shadow-webflow", false);
  }

  try {
    const published = await loadSiteSettingsFromD1(dbForContent(ctx.env), scopeFor(ctx.request, ctx.env));
    // Small settings document: no shared cache until publish/rollback can
    // purge it or the response is keyed by revision.
    if (published) return withSource({ settings: published.settings, source: "d1", itemId: published.itemId }, "d1", false);
  } catch (error) {
    console.warn("[content-migration] D1 site settings read failed", error instanceof Error ? error.message : "unknown");
  }
  return withSource({ settings: webflowSettings, source: "webflow-fallback" }, "webflow-fallback", false);
}

/** Admin view: published and working values plus revision history. */
export async function adminSiteSettingsRead(
  ctx: SettingsCtx,
  authorize: (request: Request, env: Env, role: "admin") => Promise<any> = authorizeScopedRequest,
): Promise<Response> {
  const principal = await authorize(ctx.request, ctx.env, "admin");
  if (principal instanceof Response) return principal;
  const db = ctx.env.DB;
  if (!db) return new Response(JSON.stringify({ error: "D1 not configured" }), {
    status: 503, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

  const scope = scopeFor(ctx.request, ctx.env);
  const item = await db.prepare(
    "SELECT id, status, current_revision_id FROM content_items WHERE tenant_id = ?1 AND kind = 'site_settings' AND slug = ?2 AND (?3 IS NULL OR location_id = ?3) ORDER BY location_id DESC, id DESC LIMIT 2",
  ).bind(scope.tenantId, SITE_SETTINGS_SLUG, scope.locationId ?? null).all();
  if ((item.results ?? []).length !== 1) {
    return new Response(JSON.stringify({ error: "settings_item_missing_or_ambiguous" }), {
      status: 404, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }
  const row = (item.results ?? [])[0] as any;
  const revisionsResult = await db.prepare(
    "SELECT id, revision, payload_json, published_at, created_by, created_at FROM content_revisions WHERE content_item_id = ?1 ORDER BY revision",
  ).bind(row.id).all();
  const revisions = (revisionsResult.results ?? []) as any[];
  const pointer = await db.prepare(
    "SELECT working_revision_id FROM content_item_pointers WHERE tenant_id = ?1 AND content_item_id = ?2",
  ).bind(scope.tenantId, row.id).first() as { working_revision_id: string } | null;
  const workingId = pointer?.working_revision_id ?? row.current_revision_id;
  const working = revisions.find((revision) => revision.id === workingId);
  const published = await loadSiteSettingsFromD1(db, scope);

  return new Response(JSON.stringify({
    itemId: row.id,
    source: routeContentSource(ctx.env, "siteSettings"),
    published: published?.settings ?? null,
    working: working ? parseSiteSettings(JSON.parse(working.payload_json)) : null,
    workingRevisionId: workingId,
    revisions: revisions.map((revision) => ({
      id: revision.id, revision: revision.revision, publishedAt: revision.published_at,
      createdBy: revision.created_by, createdAt: revision.created_at,
    })),
  }), { status: 200, headers: { "Content-Type": "application/json", "Cache-Control": "no-store, private" } });
}
