import type {
  BookingLocationCms,
  BookingLocationCmsMap,
  BookingLocationFeatureCms,
} from "../../src/types/location-cms.ts";
import { json, propertiesForEnv, type Env } from "../mews/_lib.ts";

interface WebflowCollectionItem {
  id?: unknown;
  isArchived?: unknown;
  isDraft?: unknown;
  lastPublished?: unknown;
  lastUpdated?: unknown;
  cmsLocaleId?: unknown;
  fieldData?: Record<string, unknown>;
}

interface WebflowItemsResponse {
  items?: WebflowCollectionItem[];
}

interface CachedLocationPayload {
  fetchedAt: number;
  locations: BookingLocationCmsMap;
}

const WEBFLOW_CONTENT_API = "https://api-cdn.webflow.com/v2";
// Authorization checks must read the published record directly, not a CDN cache.
const WEBFLOW_DATA_API = "https://api.webflow.com/v2";
const WEBFLOW_TIMEOUT_MS = 8_000;

// Published location settings should propagate quickly, including layout choices.
const CACHE_FRESH_MS = 60 * 1000;
const CACHE_TTL_SECONDS = 24 * 60 * 60;
const CACHE_KEY_PREFIX = "webflow:booking-locations:v5";

const memoryCache = new Map<string, CachedLocationPayload>();

const text = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const safeUrl = (value: unknown): string | null => {
  const candidate = text(value);
  return /^https?:\/\//i.test(candidate) ? candidate : null;
};

const imageUrl = (value: unknown): string | null => {
  if (typeof value === "string") return safeUrl(value);
  if (!value || typeof value !== "object") return null;
  return safeUrl((value as { url?: unknown }).url);
};

const featureStory = (
  fields: Record<string, unknown>,
  index: 1 | 2 | 3,
): BookingLocationFeatureCms | null => {
  const headline = text(fields[`feature-headline-${index}`]);
  const paragraph = text(fields[`feature-paragraph-${index}`]);
  const iconUrl = imageUrl(fields[`feature-icon-${index}`]);
  if (!headline && !paragraph && !iconUrl) return null;
  return { iconUrl, headline, paragraph };
};

const cacheKey = (
  collectionId: string,
  bindings: readonly { key: string; locationCmsItemId: string | null }[],
) => {
  const signature = bindings
    .map((binding) => `${binding.key}:${binding.locationCmsItemId ?? ""}`)
    .sort()
    .join("|");
  return `${CACHE_KEY_PREFIX}:${collectionId}:${signature}`;
};

async function webflowGet<T>(env: Env, path: string, baseUrl = WEBFLOW_CONTENT_API): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), WEBFLOW_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: {
        Authorization: `Bearer ${env.WEBFLOW_CMS_API_TOKEN}`,
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    if (!response.ok) throw new Error(`webflow_${response.status}`);
    return response.json<T>();
  } finally {
    clearTimeout(timeout);
  }
}

const LOCATION_SETTING_FIELDS = [
  "enable-demo-engine",
  "production-layout",
  "demo-layout",
] as const;

/**
 * A live item can omit newer CMS schema fields even after the item was published.
 * Only fill missing live fields from staged data when the *same publication*
 * can be verified and no unpublished edit exists.
 */
export function mergeVerifiedPublishedFields(
  live: WebflowCollectionItem,
  staged: WebflowCollectionItem,
): WebflowCollectionItem {
  const livePublished = text(live.lastPublished);
  const stagedPublished = text(staged.lastPublished);
  const stagedUpdated = text(staged.lastUpdated);
  const publishedAt = Date.parse(livePublished);
  const updatedAt = Date.parse(stagedUpdated);
  const sameLocale = !text(live.cmsLocaleId) || !text(staged.cmsLocaleId) ||
    live.cmsLocaleId === staged.cmsLocaleId;
  if (
    !text(live.id) ||
    live.id !== staged.id ||
    live.isDraft === true ||
    live.isArchived === true ||
    staged.isDraft === true ||
    staged.isArchived === true ||
    !sameLocale ||
    !livePublished ||
    livePublished !== stagedPublished ||
    !Number.isFinite(publishedAt) ||
    !Number.isFinite(updatedAt) ||
    updatedAt > publishedAt
  ) return live;

  const fields = { ...live.fieldData };
  for (const key of LOCATION_SETTING_FIELDS) {
    if (fields[key] === undefined && staged.fieldData?.[key] !== undefined) {
      fields[key] = staged.fieldData[key];
    }
  }
  return { ...live, fieldData: fields };
}

async function fetchPublishedLocationItem(
  env: Env,
  collection: string,
  itemId: string,
): Promise<WebflowCollectionItem> {
  const basePath = `/collections/${encodeURIComponent(collection)}/items/${encodeURIComponent(itemId)}`;
  const live = await webflowGet<WebflowCollectionItem>(env, `${basePath}/live`, WEBFLOW_DATA_API);
  if (
    live.id !== itemId ||
    live.isDraft === true ||
    live.isArchived === true ||
    !LOCATION_SETTING_FIELDS.some(key => live.fieldData?.[key] === undefined)
  ) return live;
  try {
    const staged = await webflowGet<WebflowCollectionItem>(env, basePath, WEBFLOW_DATA_API);
    return mergeVerifiedPublishedFields(live, staged);
  } catch {
    // Missing staged data never overrides or enables the live setting.
    return live;
  }
}

export function normalizeLocationItem(
  item: WebflowCollectionItem,
): BookingLocationCms | null {
  if (item.isArchived === true || item.isDraft === true) return null;

  const id = text(item.id);
  const fields = item.fieldData ?? {};
  const fullLocationName = text(fields["full-location-name"]);

  if (!id || !fullLocationName) return null;

  const features = ([1, 2, 3] as const)
    .map((index) => featureStory(fields, index))
    .filter((feature): feature is BookingLocationFeatureCms => feature !== null);

  return {
    id,
    fullLocationName,
    productionLayout: fields["production-layout"] === "f4859a16a8556038b0f026679aaa6a02" ? "photo" : "card",
    demoLayout: fields["demo-layout"] === "2142905a00c88401810632b026107cf2" ? "photo" : "card",
    enableDemoEngine: fields["enable-demo-engine"] === true,
    featureSectionEnabled: fields["enable-feature-section"] === true,
    features,
    city: text(fields.city) || null,
    state: text(fields.state) || null,
    privacyPolicyUrl: safeUrl(fields["privacy-policy"]),
    termsConditionsUrl: safeUrl(fields["terms-conditions"]),
    accessibilityUrl: safeUrl(fields.accessibility),
  };
}

export function normalizeConfiguredLocations(
  items: readonly WebflowCollectionItem[],
  bindings: readonly { key: string; locationCmsItemId: string | null }[],
): BookingLocationCmsMap {
  const byItemId = new Map(
    items
      .map(normalizeLocationItem)
      .filter((location): location is BookingLocationCms => location !== null)
      .map((location) => [location.id, location] as const),
  );

  const locations: BookingLocationCmsMap = {};
  for (const binding of bindings) {
    if (!binding.locationCmsItemId) continue;
    const location = byItemId.get(binding.locationCmsItemId);
    if (location) locations[binding.key] = location;
  }

  return locations;
}

async function fetchPublishedLocations(
  env: Env,
  collectionId: string,
  bindings: readonly { key: string; locationCmsItemId: string | null }[],
): Promise<CachedLocationPayload> {
  const encoded = encodeURIComponent(collectionId);
  const items = await webflowGet<WebflowItemsResponse>(
    env,
    `/collections/${encoded}/items/live?limit=100`,
  );

  const resolvedItems = await Promise.all((items.items ?? []).map(async (item) => {
    const itemId = text(item.id);
    if (
      !itemId ||
      !bindings.some(binding => binding.locationCmsItemId === itemId) ||
      !LOCATION_SETTING_FIELDS.some(key => item.fieldData?.[key] === undefined)
    ) return item;
    try {
      const verified = await fetchPublishedLocationItem(env, collectionId, itemId);
      const fields = { ...item.fieldData };
      for (const key of LOCATION_SETTING_FIELDS) {
        if (fields[key] === undefined && verified.fieldData?.[key] !== undefined) {
          fields[key] = verified.fieldData[key];
        }
      }
      return { ...item, fieldData: fields };
    } catch {
      return item;
    }
  }));

  return {
    fetchedAt: Date.now(),
    locations: normalizeConfiguredLocations(resolvedItems, bindings),
  };
}

async function readCachedLocations(
  env: Env,
  key: string,
): Promise<CachedLocationPayload | null> {
  if (env.WEBFLOW_CONTENT_CACHE) {
    try {
      const stored = await env.WEBFLOW_CONTENT_CACHE.get<CachedLocationPayload>(
        key,
        "json",
      );
      if (stored) {
        memoryCache.set(key, stored);
        return stored;
      }
    } catch (error) {
      const reason =
        error instanceof Error ? error.message : "webflow_kv_read_unknown";
      console.warn("[webflow locations] KV read failed", reason);
    }
  }

  const memory = memoryCache.get(key);
  if (!memory) return null;

  if (memory.fetchedAt + CACHE_TTL_SECONDS * 1000 <= Date.now()) {
    memoryCache.delete(key);
    return null;
  }

  return memory;
}

async function writeCachedLocations(
  env: Env,
  key: string,
  payload: CachedLocationPayload,
): Promise<void> {
  memoryCache.set(key, payload);

  if (!env.WEBFLOW_CONTENT_CACHE) return;

  try {
    await env.WEBFLOW_CONTENT_CACHE.put(key, JSON.stringify(payload), {
      expirationTtl: CACHE_TTL_SECONDS,
    });
  } catch (error) {
    const reason =
      error instanceof Error ? error.message : "webflow_kv_write_unknown";
    console.warn("[webflow locations] KV write failed", reason);
  }
}

async function refreshLocations(
  env: Env,
  collectionId: string,
  bindings: readonly { key: string; locationCmsItemId: string | null }[],
  key: string,
): Promise<CachedLocationPayload> {
  const payload = await fetchPublishedLocations(env, collectionId, bindings);
  await writeCachedLocations(env, key, payload);
  return payload;
}

function response(payload: CachedLocationPayload, stale: boolean): Response {
  return json(
    {
      locations: payload.locations,
      generatedAt: new Date(payload.fetchedAt).toISOString(),
      stale,
    },
    200,
    "public, max-age=60",
  );
}

export async function onRequestGet({
  env,
  waitUntil,
}: {
  env: Env;
  waitUntil?: (promise: Promise<unknown>) => void;
}): Promise<Response> {
  const collectionId = env.WEBFLOW_LOCATION_COLLECTION_ID;
  const bindings = propertiesForEnv(env).map((property) => ({
    key: property.key,
    locationCmsItemId: property.locationCmsItemId,
  }));

  if (!env.WEBFLOW_CMS_API_TOKEN || !collectionId) {
    return json({ locations: {}, generatedAt: null, stale: false }, 200, "no-store");
  }

  const key = cacheKey(collectionId, bindings);
  const cached = await readCachedLocations(env, key);

  if (cached) {
    const stale = cached.fetchedAt + CACHE_FRESH_MS <= Date.now();

    if (stale && waitUntil) {
      waitUntil(
        refreshLocations(env, collectionId, bindings, key).catch((error) => {
          const reason =
            error instanceof Error ? error.message : "webflow_unknown";
          console.warn("[webflow locations] background refresh failed", reason);
        }),
      );
    }

    if (!stale || waitUntil) return response(cached, stale);
  }

  try {
    return response(
      await refreshLocations(env, collectionId, bindings, key),
      false,
    );
  } catch (error) {
    const reason = error instanceof Error ? error.message : "webflow_unknown";
    console.warn("[webflow locations] content fetch failed", reason);

    if (cached) return response(cached, true);

    return json(
      { locations: {}, generatedAt: null, stale: false },
      200,
      "no-store",
    );
  }
}

/** Live, fail-closed CMS check for property-scoped Studio access.
 * Deliberately bypasses the long-lived public Locations cache.
 */
export async function onRequestStudioConfig({ env, request }: { env: Env; request: Request }): Promise<Response> {
  const url = new URL(request.url);
  const key = url.searchParams.get("property") || "hotel";
  const binding = propertiesForEnv(env).find((property) => property.key === key);
  // Local-only debugging, never expose authorization internals on deployed hosts.
  const localDiagnostics = url.hostname === "127.0.0.1" || url.hostname === "localhost";
  const denied = (reason: string) => {
    // Log only the failure category. Do not print Webflow tokens or CMS data.
    console.warn("[booking studio] access check denied", { property: key, reason });
    return json({
      enabled: false,
      property: key,
      demoLayout: "card",
      ...(localDiagnostics ? { diagnostic: reason } : {}),
    }, 200, "no-store");
  };
  if (!binding?.locationCmsItemId) return denied("location_binding_missing");
  if (!env.WEBFLOW_LOCATION_COLLECTION_ID) return denied("collection_id_missing");
  if (!env.WEBFLOW_CMS_API_TOKEN) return denied("cms_token_missing");
  try {
    const collection = encodeURIComponent(env.WEBFLOW_LOCATION_COLLECTION_ID);
    const itemId = encodeURIComponent(binding.locationCmsItemId);
    const item = await fetchPublishedLocationItem(
      env,
      env.WEBFLOW_LOCATION_COLLECTION_ID,
      binding.locationCmsItemId,
    );
    if (
      item.id !== binding.locationCmsItemId ||
      item.isArchived === true ||
      item.isDraft === true
    ) return denied("published_location_not_found");
    if (item.fieldData?.["enable-demo-engine"] !== true) {
      if (localDiagnostics) {
        // Compare staged and published switch values without exposing unrelated
        // CMS fields, IDs, access tokens, or guest information.
        const state = (value: unknown) =>
          value === true ? "true" : value === false ? "false" :
          value === undefined ? "missing" : typeof value;
        let stagedSwitch: string = "unavailable";
        try {
          const staged = await webflowGet<WebflowCollectionItem>(
            env,
            `/collections/${collection}/items/${itemId}`,
            WEBFLOW_DATA_API,
          );
          stagedSwitch = state(staged.fieldData?.["enable-demo-engine"]);
        } catch { /* Do not bypass live authorization if stage read fails. */ }
        console.warn("[booking studio] switch comparison", {
          property: key,
          publishedSwitch: state(item.fieldData?.["enable-demo-engine"]),
          stagedSwitch,
        });
        return json({
          enabled: false,
          property: key,
          demoLayout: "card",
          diagnostic: "cms_switch_off",
          publishedSwitch: state(item.fieldData?.["enable-demo-engine"]),
          stagedSwitch,
        }, 200, "no-store");
      }
      return denied("cms_switch_off");
    }
    return json({
      enabled: true,
      property: key,
      demoLayout: item?.fieldData?.["demo-layout"] === "2142905a00c88401810632b026107cf2" ? "photo" : "card",
    }, 200, "no-store");
  } catch (error) {
    // Separate CMS outages / authentication failures from a disabled switch.
    const reason = error instanceof Error ? error.message : "cms_fetch_failed";
    return denied(reason.startsWith("webflow_") ? reason : "cms_fetch_failed");
  }
}
