import type {
  RoomTypeCmsReview,
  RoomTypeCmsReviewMap,
} from "../../src/types/room-type-cms.ts";
import type { Env } from "../mews/_lib.ts";
import { json } from "../mews/_lib.ts";

interface WebflowOption {
  id?: unknown;
  name?: unknown;
}

interface WebflowCollectionField {
  slug?: unknown;
  validations?: {
    options?: WebflowOption[];
  };
}

interface WebflowCollectionResponse {
  fields?: WebflowCollectionField[];
}

interface WebflowCollectionItem {
  id?: unknown;
  isArchived?: unknown;
  isDraft?: unknown;
  fieldData?: Record<string, unknown>;
}

interface WebflowItemsResponse {
  items?: WebflowCollectionItem[];
}

interface CachedReviewPayload {
  fetchedAt: number;
  reviews: RoomTypeCmsReviewMap;
}

const WEBFLOW_API = "https://api.webflow.com/v2";
const WEBFLOW_CONTENT_API = "https://api-cdn.webflow.com/v2";
const WEBFLOW_TIMEOUT_MS = 8_000;

const CACHE_FRESH_MS = 6 * 60 * 60 * 1000;
const CACHE_TTL_SECONDS = 24 * 60 * 60;
const BROWSER_CACHE_CONTROL =
  "public, max-age=300, s-maxage=21600, stale-while-revalidate=64800";

const text = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const safeUrl = (value: unknown): string | null => {
  const candidate = text(value);
  return /^https?:\/\//i.test(candidate) ? candidate : null;
};

const cacheRequest = (collectionId: string) =>
  new Request(
    `https://webflow-content-cache.internal/room-type-reviews/${encodeURIComponent(collectionId)}`,
  );

async function webflowGet<T>(
  env: Env,
  baseUrl: string,
  path: string,
): Promise<T> {
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

function optionNames(
  collection: WebflowCollectionResponse,
  slug: string,
): ReadonlyMap<string, string> {
  const field = (collection.fields ?? []).find(
    (candidate) => text(candidate.slug) === slug,
  );

  return new Map(
    (field?.validations?.options ?? []).flatMap((option) => {
      const id = text(option.id);
      const name = text(option.name);
      return id && name ? [[id, name] as const] : [];
    }),
  );
}

export function normalizeRoomTypeReview(
  item: WebflowCollectionItem,
  reviewSourceNames: ReadonlyMap<string, string> = new Map(),
): RoomTypeCmsReview | null {
  if (item.isArchived === true || item.isDraft === true) return null;

  const fields = item.fieldData ?? {};
  const roomTypeId = text(fields["mews-room-type-id"]);
  const quote = text(fields.review);

  // Reviews are intentionally opt-in per Room Type. No review text means the
  // consumer UI hides the entire review section rather than inventing/falling
  // back to demo or building-level social proof.
  if (!roomTypeId || !quote) return null;

  const sourceId = text(fields["review-source"]);

  return {
    roomTypeId,
    quote,
    reviewer: text(fields["reviewer-name-or-handle"]) || null,
    source: reviewSourceNames.get(sourceId) ?? sourceId || null,
    sourceUrl: safeUrl(fields["review-url"]),
    reviewDate: text(fields["review-date"]) || null,
  };
}

export function normalizeRoomTypeReviews(
  items: readonly WebflowCollectionItem[],
  reviewSourceNames: ReadonlyMap<string, string> = new Map(),
): RoomTypeCmsReviewMap {
  const reviews: RoomTypeCmsReviewMap = {};

  for (const item of items) {
    const review = normalizeRoomTypeReview(item, reviewSourceNames);
    if (review) reviews[review.roomTypeId] = review;
  }

  return reviews;
}

async function fetchPublishedReviews(
  env: Env,
  collectionId: string,
): Promise<CachedReviewPayload> {
  const encoded = encodeURIComponent(collectionId);
  const [collection, items] = await Promise.all([
    // Option labels are schema metadata and do not currently have a CDN endpoint.
    webflowGet<WebflowCollectionResponse>(
      env,
      WEBFLOW_API,
      `/collections/${encoded}`,
    ),
    // Published room content uses Webflow's Content Delivery API/CDN.
    webflowGet<WebflowItemsResponse>(
      env,
      WEBFLOW_CONTENT_API,
      `/collections/${encoded}/items/live?limit=100`,
    ),
  ]);

  return {
    fetchedAt: Date.now(),
    reviews: normalizeRoomTypeReviews(
      items.items ?? [],
      optionNames(collection, "review-source"),
    ),
  };
}

async function readCachedReviews(
  collectionId: string,
): Promise<CachedReviewPayload | null> {
  const response = await caches.default.match(cacheRequest(collectionId));
  if (!response) return null;

  try {
    return (await response.json()) as CachedReviewPayload;
  } catch {
    return null;
  }
}

async function writeCachedReviews(
  collectionId: string,
  payload: CachedReviewPayload,
): Promise<void> {
  await caches.default.put(
    cacheRequest(collectionId),
    new Response(JSON.stringify(payload), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `public, max-age=${CACHE_TTL_SECONDS}`,
      },
    }),
  );
}

async function refreshReviews(
  env: Env,
  collectionId: string,
): Promise<CachedReviewPayload> {
  const payload = await fetchPublishedReviews(env, collectionId);
  await writeCachedReviews(collectionId, payload);
  return payload;
}

function response(payload: CachedReviewPayload, stale: boolean): Response {
  return json(
    {
      reviews: payload.reviews,
      generatedAt: new Date(payload.fetchedAt).toISOString(),
      stale,
    },
    200,
    BROWSER_CACHE_CONTROL,
  );
}

export async function onRequestGet({
  env,
  waitUntil,
}: {
  env: Env;
  waitUntil?: (promise: Promise<unknown>) => void;
}): Promise<Response> {
  const collectionId = env.WEBFLOW_ROOM_TYPE_COLLECTION_ID;

  if (!env.WEBFLOW_CMS_API_TOKEN || !collectionId) {
    return json({ reviews: {}, generatedAt: null, stale: false }, 200, "no-store");
  }

  const cached = await readCachedReviews(collectionId);

  if (cached) {
    const stale = cached.fetchedAt + CACHE_FRESH_MS <= Date.now();

    if (stale && waitUntil) {
      waitUntil(
        refreshReviews(env, collectionId).catch((error) => {
          const reason =
            error instanceof Error ? error.message : "webflow_unknown";
          console.warn("[webflow room-type reviews] background refresh failed", reason);
        }),
      );
    }

    // Stale content is safe editorial data, so serve it immediately while a
    // background refresh updates the shared Worker cache.
    if (!stale || waitUntil) return response(cached, stale);
  }

  try {
    return response(await refreshReviews(env, collectionId), false);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "webflow_unknown";
    console.warn("[webflow room-type reviews] content fetch failed", reason);

    if (cached) return response(cached, true);

    return json(
      { reviews: {}, generatedAt: null, stale: false },
      200,
      "no-store",
    );
  }
}
