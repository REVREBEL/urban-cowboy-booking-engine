import type {
  BuildingCms,
  BuildingCmsMap,
  BuildingPolicyCms,
} from "../../src/types/building-cms.ts";
import type { RoomTypeGroupKey } from "../../src/types/accommodations.ts";
import { json, type Env } from "../mews/_lib.ts";

interface WebflowCollectionItem {
  id?: unknown;
  isArchived?: unknown;
  isDraft?: unknown;
  fieldData?: Record<string, unknown>;
}

interface WebflowItemsResponse {
  items?: WebflowCollectionItem[];
}

interface CachedBuildingPayload {
  fetchedAt: number;
  buildings: BuildingCmsMap;
}

const WEBFLOW_CONTENT_API = "https://api-cdn.webflow.com/v2";
const WEBFLOW_TIMEOUT_MS = 8_000;
const CACHE_FRESH_MS = 6 * 60 * 60 * 1000;
const CACHE_TTL_SECONDS = 24 * 60 * 60;
const CACHE_KEY_PREFIX = "webflow:booking-buildings:v1";

const memoryCache = new Map<string, CachedBuildingPayload>();

const GROUP_BY_SLUG: Readonly<Record<string, RoomTypeGroupKey>> = {
  "alpine-haus": "alpine",
  "walden-haus": "walden",
  "the-lodge": "lodge",
  "forest-house": "forest-house",
  "the-cabin": "cabin",
  chalet: "chalet",
  "opas-cabin": "opas",
  "slide-mountain-haus": "slide-mountain",
  "mountain-view-haus": "mountain-view",
};

const text = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const referenceIds = (value: unknown): string[] =>
  Array.isArray(value) ? value.map(text).filter(Boolean) : [];

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

export function normalizePolicyItems(
  items: readonly WebflowCollectionItem[],
): Map<string, BuildingPolicyCms> {
  return new Map(
    items.flatMap((item) => {
      if (item.isArchived === true || item.isDraft === true) return [];
      const id = text(item.id);
      const fields = item.fieldData ?? {};
      const name = text(fields.name);
      if (!id || !name) return [];
      return [[id, { id, name, slug: text(fields.slug) || null }] as const];
    }),
  );
}

export function normalizeBuildingItem(
  item: WebflowCollectionItem,
  policiesById: ReadonlyMap<string, BuildingPolicyCms>,
): BuildingCms | null {
  if (item.isArchived === true || item.isDraft === true) return null;

  const id = text(item.id);
  const fields = item.fieldData ?? {};
  const name = text(fields.name);
  const slug = text(fields.slug);
  const groupKey = GROUP_BY_SLUG[slug];
  if (!id || !name || !slug || !groupKey) return null;

  const shortDescription = text(fields["short-description"]);
  const longDescription = text(fields["long-description"]);
  const featureBenefits = text(fields["feature-benefits"]);
  const fallbackDescription = featureBenefits && longDescription.endsWith(featureBenefits)
    ? longDescription.slice(0, -featureBenefits.length).trim()
    : longDescription;

  return {
    id,
    groupKey,
    name,
    slug,
    subheading: text(fields.subheadline) || null,
    shortDescription: shortDescription || fallbackDescription || null,
    featureBenefits: featureBenefits || null,
    policy: referenceIds(fields["policy-2"])
      .map((policyId) => policiesById.get(policyId))
      .filter((policy): policy is BuildingPolicyCms => Boolean(policy)),
  };
}

export function normalizeBuildings(
  buildingItems: readonly WebflowCollectionItem[],
  policyItems: readonly WebflowCollectionItem[],
): BuildingCmsMap {
  const policiesById = normalizePolicyItems(policyItems);
  const buildings: BuildingCmsMap = {};

  for (const item of buildingItems) {
    const building = normalizeBuildingItem(item, policiesById);
    if (building) buildings[building.groupKey] = building;
  }
  return buildings;
}

async function fetchPublishedBuildings(
  env: Env,
  buildingCollectionId: string,
  amenityCollectionId: string,
): Promise<CachedBuildingPayload> {
  const [buildingResponse, policyResponse] = await Promise.all([
    webflowGet<WebflowItemsResponse>(
      env,
      `/collections/${encodeURIComponent(buildingCollectionId)}/items/live?limit=100`,
    ),
    webflowGet<WebflowItemsResponse>(
      env,
      `/collections/${encodeURIComponent(amenityCollectionId)}/items/live?limit=100`,
    ),
  ]);

  return {
    fetchedAt: Date.now(),
    buildings: normalizeBuildings(
      buildingResponse.items ?? [],
      policyResponse.items ?? [],
    ),
  };
}

const cacheKey = (buildingCollectionId: string, amenityCollectionId: string) =>
  `${CACHE_KEY_PREFIX}:${buildingCollectionId}:${amenityCollectionId}`;

async function readCache(env: Env, key: string): Promise<CachedBuildingPayload | null> {
  if (env.WEBFLOW_CONTENT_CACHE) {
    try {
      const stored = await env.WEBFLOW_CONTENT_CACHE.get<CachedBuildingPayload>(key, "json");
      if (stored) {
        memoryCache.set(key, stored);
        return stored;
      }
    } catch (error) {
      console.warn("[webflow buildings] KV read failed", error instanceof Error ? error.message : "unknown");
    }
  }

  const stored = memoryCache.get(key);
  if (!stored) return null;
  if (stored.fetchedAt + CACHE_TTL_SECONDS * 1000 <= Date.now()) {
    memoryCache.delete(key);
    return null;
  }
  return stored;
}

async function writeCache(env: Env, key: string, payload: CachedBuildingPayload): Promise<void> {
  memoryCache.set(key, payload);
  if (!env.WEBFLOW_CONTENT_CACHE) return;
  try {
    await env.WEBFLOW_CONTENT_CACHE.put(key, JSON.stringify(payload), {
      expirationTtl: CACHE_TTL_SECONDS,
    });
  } catch (error) {
    console.warn("[webflow buildings] KV write failed", error instanceof Error ? error.message : "unknown");
  }
}

async function refresh(
  env: Env,
  buildingCollectionId: string,
  amenityCollectionId: string,
  key: string,
): Promise<CachedBuildingPayload> {
  const payload = await fetchPublishedBuildings(env, buildingCollectionId, amenityCollectionId);
  await writeCache(env, key, payload);
  return payload;
}

function response(payload: CachedBuildingPayload, stale: boolean): Response {
  return json(
    {
      buildings: payload.buildings,
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
  const buildingCollectionId = env.WEBFLOW_BUILDING_COLLECTION_ID;
  const amenityCollectionId = env.WEBFLOW_AMENITY_COLLECTION_ID;

  if (!env.WEBFLOW_CMS_API_TOKEN || !buildingCollectionId || !amenityCollectionId) {
    return json({ buildings: {}, generatedAt: null, stale: false }, 200, "no-store");
  }

  const key = cacheKey(buildingCollectionId, amenityCollectionId);
  const cached = await readCache(env, key);
  if (cached) {
    const stale = cached.fetchedAt + CACHE_FRESH_MS <= Date.now();
    if (stale && waitUntil) {
      waitUntil(refresh(env, buildingCollectionId, amenityCollectionId, key).catch((error) => {
        console.warn("[webflow buildings] background refresh failed", error instanceof Error ? error.message : "unknown");
      }));
    }
    if (!stale || waitUntil) return response(cached, stale);
  }

  try {
    return response(await refresh(env, buildingCollectionId, amenityCollectionId, key), false);
  } catch (error) {
    console.warn("[webflow buildings] content fetch failed", error instanceof Error ? error.message : "unknown");
    if (cached) return response(cached, true);
    return json({ buildings: {}, generatedAt: null, stale: false }, 200, "no-store");
  }
}
