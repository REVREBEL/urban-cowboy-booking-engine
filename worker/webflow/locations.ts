import type {
  BookingLocationCms,
  BookingLocationCmsMap,
} from "../../src/types/location-cms.ts";
import { json, propertiesForEnv, type Env } from "../mews/_lib.ts";

interface WebflowCollectionItem {
  id?: unknown;
  isArchived?: unknown;
  isDraft?: unknown;
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
const WEBFLOW_TIMEOUT_MS = 8_000;

const CACHE_FRESH_MS = 6 * 60 * 60 * 1000;
const CACHE_TTL_SECONDS = 24 * 60 * 60;
const CACHE_KEY_PREFIX = "webflow:booking-locations:v1";

const memoryCache = new Map<string, CachedLocationPayload>();

const text = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const safeUrl = (value: unknown): string | null => {
  const candidate = text(value);
  return /^https?:\/\//i.test(candidate) ? candidate : null;
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

async function webflowGet<T>(env: Env, path: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), WEBFLOW_TIMEOUT_MS);

  try {
    const response = await fetch(`${WEBFLOW_CONTENT_API}${path}`, {
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

export function normalizeLocationItem(
  item: WebflowCollectionItem,
): BookingLocationCms | null {
  if (item.isArchived === true || item.isDraft === true) return null;

  const id = text(item.id);
  const fields = item.fieldData ?? {};
  const fullLocationName = text(fields["full-location-name"]);

  if (!id || !fullLocationName) return null;

  return {
    id,
    fullLocationName,
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

  return {
    fetchedAt: Date.now(),
    locations: normalizeConfiguredLocations(items.items ?? [], bindings),
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
    "public, max-age=300",
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
