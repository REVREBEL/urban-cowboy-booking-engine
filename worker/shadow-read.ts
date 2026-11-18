/**
 * Webflow shadow reads and structured parity reports (COW-32).
 *
 * Shadow reads never serve traffic. They compare the published Webflow view of
 * a collection with the D1 published snapshot and persist a deterministic,
 * per-collection difference summary. The Webflow loader can be injected so the
 * comparison is testable without network access.
 */
import type { Env } from "./mews/_lib.ts";
import { webflowGetAllItems } from "./webflow/room-type-reviews.ts";
import {
  loadPublishedCollection,
  toParityItems,
  type ContentCollection,
  type ParityItem,
  type PublishedRecord,
} from "./content-provider.ts";
import { recordParityReport, type ParitySummary } from "./published-snapshots.ts";
import type { TenantScope } from "./d1.ts";

const WEBFLOW_API = "https://api.webflow.com/v2";

const SHADOW_COLLECTION_IDS: Partial<Record<ContentCollection, keyof Env>> = {
  locations: "WEBFLOW_LOCATION_COLLECTION_ID",
  buildings: "WEBFLOW_BUILDING_COLLECTION_ID",
  roomTypes: "WEBFLOW_ROOM_TYPE_COLLECTION_ID",
  addOns: "WEBFLOW_ADD_ON_COLLECTION_ID",
  amenities: "WEBFLOW_AMENITY_COLLECTION_ID",
};

export type WebflowLoader = (
  env: Env,
  collection: ContentCollection,
) => Promise<ParityItem[] | null>;

const text = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value.trim() : null;

/** Returns null when the collection has no configured Webflow ID (not shadowned). */
export const webflowParityItems: WebflowLoader = async (env, collection) => {
  const key = SHADOW_COLLECTION_IDS[collection];
  const collectionId = key ? env[key] : undefined;
  if (!env.WEBFLOW_SITE_ID || !env.WEBFLOW_CMS_API_TOKEN || typeof collectionId !== "string" || !collectionId) {
    return null;
  }
  const response = await webflowGetAllItems(env, WEBFLOW_API, `/collections/${encodeURIComponent(collectionId)}/items/live`);
  return (response.items ?? [])
    .filter((item) => !item.isDraft && !item.isArchived)
    .flatMap((item) => {
      const id = text(item.id);
      if (!id) return [];
      const fields = (item.fieldData ?? {}) as Record<string, unknown>;
      return [{
        id,
        slug: text(fields.slug),
        name: text(fields.name) ?? text(fields["full-name"]) ?? text(fields["short-name"]),
        published: true,
      }];
    })
    .sort((a, b) => a.id.localeCompare(b.id));
};

/** Deterministic diff of identity, slug, name and publication state. */
export function diffParity(
  collection: string,
  source: ParityItem[],
  target: ParityItem[],
): ParitySummary {
  const sourceById = new Map(source.map((item) => [item.id, item]));
  const targetById = new Map(target.map((item) => [item.id, item]));
  const added = source.filter((item) => !targetById.has(item.id)).map((item) => item.id);
  const removed = target.filter((item) => !sourceById.has(item.id)).map((item) => item.id);
  const changed: ParitySummary["changed"] = [];
  let matched = 0;
  const fields: Array<keyof ParityItem> = ["slug", "name", "published"];

  for (const item of source) {
    const other = targetById.get(item.id);
    if (!other) continue;
    const differences = fields
      .filter((field) => item[field] !== other[field])
      .map((field) => ({ field: String(field), source: item[field], target: other[field] }));
    if (differences.length) changed.push({ id: item.id, fields: differences });
    else matched++;
  }

  return {
    collection,
    sourceCount: source.length,
    targetCount: target.length,
    matched,
    added,
    removed,
    changed,
  };
}

export async function shadowCompareCollection(
  db: D1Database,
  env: Env,
  scope: TenantScope,
  collection: ContentCollection,
  records: PublishedRecord[],
  loader: WebflowLoader = webflowParityItems,
): Promise<ParitySummary | null> {
  const source = await loader(env, collection);
  if (!source) return null;
  const summary = diffParity(collection, source, toParityItems(records));
  await recordParityReport(db, scope, collection, null, summary);
  return summary;
}
