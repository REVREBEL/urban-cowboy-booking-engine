import type { AddOnCmsItem } from "../../src/types/add-on-cms.ts";
import type { Env } from "../mews/_lib.ts";
import { json } from "../mews/_lib.ts";

interface WebflowImage {
  url?: unknown;
}

interface WebflowCollectionItem {
  id?: unknown;
  isArchived?: unknown;
  fieldData?: Record<string, unknown>;
}

interface WebflowItemsResponse {
  items?: WebflowCollectionItem[];
}

const WEBFLOW_API = "https://api.webflow.com/v2";
const WEBFLOW_TIMEOUT_MS = 8_000;
const CACHE_CONTROL = "public, max-age=60, s-maxage=300, stale-while-revalidate=600";

const text = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const imageUrl = (value: unknown): string | null => {
  if (typeof value === "string") return text(value) || null;
  if (!value || typeof value !== "object") return null;
  return text((value as WebflowImage).url) || null;
};

export function normalizeWebflowAddOn(
  item: WebflowCollectionItem,
): AddOnCmsItem | null {
  if (item.isArchived === true) return null;

  const fields = item.fieldData ?? {};
  const id = text(item.id);
  const name = text(fields.name);
  if (!id || !name) return null;

  return {
    id,
    name,
    itemName: text(fields["item-name"]) || null,
    shortDescription: text(fields["short-description"]) || null,
    longDescription: text(fields["long-description"]) || null,
    mewsProductId: text(fields["mews-product-id"]) || null,
    imageUrl: imageUrl(fields.image),
  };
}

export function normalizeWebflowAddOns(
  items: readonly WebflowCollectionItem[],
): AddOnCmsItem[] {
  return items
    .map(normalizeWebflowAddOn)
    .filter((item): item is AddOnCmsItem => item !== null);
}

async function webflowGet<T>(env: Env, path: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), WEBFLOW_TIMEOUT_MS);

  try {
    const response = await fetch(`${WEBFLOW_API}${path}`, {
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

export async function onRequestGet({ env }: { env: Env }): Promise<Response> {
  if (!env.WEBFLOW_CMS_API_TOKEN || !env.WEBFLOW_ADD_ON_COLLECTION_ID) {
    return json({ addOns: [] }, 200, "no-store");
  }

  try {
    const collectionId = encodeURIComponent(env.WEBFLOW_ADD_ON_COLLECTION_ID);
    const items = await webflowGet<WebflowItemsResponse>(
      env,
      `/collections/${collectionId}/items/live?limit=100`,
    );

    return json(
      { addOns: normalizeWebflowAddOns(items.items ?? []) },
      200,
      CACHE_CONTROL,
    );
  } catch (error) {
    const reason = error instanceof Error ? error.message : "webflow_unknown";
    console.warn("[webflow add-ons] content fetch failed", reason);
    return json({ addOns: [] }, 200, "no-store");
  }
}
