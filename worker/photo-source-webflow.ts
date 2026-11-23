/**
 * Temporary Webflow image-URL source adapter (COW-99).
 *
 * Only this module knows Webflow shapes and identifiers. It emits the neutral
 * `PhotoSourceSnapshot` consumed by worker/photo-source-import.ts, so a later
 * Squarespace adapter can replace it without changing master media IDs,
 * placements, hotspots or guest rendering.
 */
import { cmsPhotoKeys } from "../src/lib/cmsPhotoHotspots.ts";
import type {
  CanonicalRoomType,
  PhotoSourceAdapter,
  PhotoSourceAdapterInput,
  PhotoSourceSnapshot,
  ProviderAlias,
  SourceIssue,
  SourcePhoto,
} from "./photo-source-adapter.ts";

interface WebflowItem {
  id?: unknown;
  isArchived?: unknown;
  isDraft?: unknown;
  fieldData?: Record<string, unknown>;
}

interface WebflowImage {
  fileId?: unknown;
  url?: unknown;
  alt?: unknown;
  width?: unknown;
  height?: unknown;
}

const text = (value: unknown): string => typeof value === "string" ? value.trim() : "";
const numberOrNull = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;
const published = (item: WebflowItem): boolean =>
  item.isDraft !== true && item.isArchived !== true && item.fieldData?.active !== false;

function itemsFrom(payload: unknown): WebflowItem[] {
  if (Array.isArray(payload)) return payload as WebflowItem[];
  if (payload && typeof payload === "object" && "items" in payload && Array.isArray(payload.items)) {
    return payload.items as WebflowItem[];
  }
  return [];
}

function imagesFrom(value: unknown): WebflowImage[] {
  if (Array.isArray(value)) return value.filter((item): item is WebflowImage => Boolean(item) && typeof item === "object");
  if (value && typeof value === "object") return [value as WebflowImage];
  return [];
}

function roomRef(
  item: WebflowItem,
  roomTypes: readonly CanonicalRoomType[],
): { id: string; matchedBy: string } | null {
  const fields = item.fieldData ?? {};
  // The Webflow item ID is the stable legacy ID imported into room_types.id.
  const webflowId = text(item.id);
  if (webflowId && roomTypes.some((room) => room.id === webflowId)) {
    return { id: webflowId, matchedBy: "webflow-item-id" };
  }
  // Otherwise use the explicit Mews binding, never a gallery name or filename.
  const mewsId = text(fields["mews-room-type-id"]);
  if (mewsId) {
    const matches = roomTypes.filter((room) => room.mewsRoomCategoryId === mewsId);
    if (matches.length === 1) return { id: matches[0].id, matchedBy: "mews-room-type-id" };
  }
  return null;
}

function aliasesFor(image: WebflowImage): ProviderAlias[] {
  const keys = [
    ...new Set([
      ...cmsPhotoKeys(text(image.fileId)),
      ...cmsPhotoKeys(text(image.url)),
    ]),
  ];
  return keys.map((key) => key.startsWith("file:")
    ? { aliasType: "webflow_file_id", aliasValue: key.slice(5) }
    : { aliasType: "webflow_cdn_url", aliasValue: key.slice(4) });
}

export const webflowPhotoSourceAdapter: PhotoSourceAdapter = {
  provider: "webflow",

  parse(input: PhotoSourceAdapterInput): PhotoSourceSnapshot {
    const issues: SourceIssue[] = [];
    const photos: SourcePhoto[] = [];
    const roomTypeRefs: string[] = [];
    const seen = new Set<string>();

    for (const item of itemsFrom(input.payload)) {
      if (!published(item)) continue;
      const room = roomRef(item, input.roomTypes);
      if (!room) {
        issues.push({
          kind: "unmatched-room",
          detail: `Webflow item ${text(item.id) || "(no id)"} did not resolve to exactly one room type`,
        });
        continue;
      }
      if (!roomTypeRefs.includes(room.id)) roomTypeRefs.push(room.id);
      const images = imagesFrom((item.fieldData ?? {}).images);
      if (images.length === 0) {
        issues.push({ kind: "unresolved-reference", detail: `${room.id}: no gallery images in Webflow item` });
      }
      images.forEach((image, index) => {
        const url = text(image.url);
        if (!/^https:\/\//i.test(url)) {
          issues.push({ kind: "invalid-url", detail: `${room.id}: gallery image ${index + 1} has no https URL` });
          return;
        }
        const aliases = aliasesFor(image);
        if (aliases.length === 0) {
          issues.push({ kind: "invalid-url", detail: `${room.id}: gallery image ${index + 1} has no stable Webflow file ID` });
          return;
        }
        const sourceAssetId = `${aliases[0].aliasType}:${aliases[0].aliasValue}`;
        if (seen.has(sourceAssetId)) {
          issues.push({ kind: "duplicate-source-id", detail: `${room.id}: duplicate source asset ${sourceAssetId}` });
          return;
        }
        seen.add(sourceAssetId);
        photos.push({
          sourceAssetId,
          url,
          roomTypeRef: room.id,
          position: index + 1,
          altText: text(image.alt) || null,
          width: numberOrNull(image.width),
          height: numberOrNull(image.height),
          aliases,
          logicalKey: `${room.id}|${sourceAssetId}`,
        });
      });
    }

    return {
      provider: "webflow",
      sourceUrl: input.sourceUrl ?? "webflow-cms:captured",
      fetchedAt: input.fetchedAt ?? "",
      digest: input.digest ?? "",
      photos,
      roomTypeRefs,
      issues,
    };
  },
};

/**
 * Live fetch for the temporary Webflow source. Credentials stay in the Worker
 * environment; the returned items go through the same adapter as a captured
 * fixture so the import path is identical in both modes.
 */
export interface WebflowFetchOptions {
  siteId: string;
  collectionId: string;
  token: string;
  fetchFn?: typeof fetch;
  limit?: number;
}

export async function fetchWebflowRoomTypeItems(options: WebflowFetchOptions): Promise<WebflowItem[]> {
  if (!options.siteId || !options.collectionId || !options.token) {
    throw new Error("WEBFLOW_SITE_ID, WEBFLOW_ROOM_TYPE_COLLECTION_ID and WEBFLOW_CMS_API_TOKEN are required");
  }
  const fetchFn = options.fetchFn ?? fetch;
  const limit = options.limit ?? 100;
  const items: WebflowItem[] = [];
  let offset = 0;
  for (;;) {
    const url = `https://api.webflow.com/v2/sites/${encodeURIComponent(options.siteId)}/collections/${encodeURIComponent(options.collectionId)}/items?limit=${limit}&offset=${offset}`;
    const response = await fetchFn(url, {
      headers: {
        authorization: `Bearer ${options.token}`,
        accept: "application/json",
        "user-agent": "urban-cowboy-webflow-photo-importer/1.0",
      },
    });
    if (!response.ok) throw new Error(`Webflow items fetch failed: ${response.status}`);
    const body = await response.json() as { items?: WebflowItem[] };
    const page = Array.isArray(body.items) ? body.items : [];
    items.push(...page);
    if (page.length < limit) break;
    offset += limit;
  }
  return items;
}
