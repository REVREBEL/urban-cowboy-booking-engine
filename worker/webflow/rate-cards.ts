import type {
  RateCardButtonStyle,
  RateCardConfig,
  RateCardFontPair,
  RateCardOverlayPosition,
  RateCardTheme,
} from "../../src/types/rate-card";
import type { Env } from "../mews/_lib.ts";
import { json } from "../mews/_lib.ts";

interface WebflowImage {
  url?: unknown;
}

export interface WebflowCollectionItem {
  id?: unknown;
  isArchived?: unknown;
  isDraft?: unknown;
  fieldData?: Record<string, unknown>;
}

interface WebflowOption {
  id?: unknown;
  name?: unknown;
}

interface WebflowCollectionField {
  slug?: unknown;
  validations?: { options?: WebflowOption[] };
}

interface WebflowCollectionResponse {
  fields?: WebflowCollectionField[];
}

interface WebflowItemsResponse {
  items?: WebflowCollectionItem[];
}

type OptionNames = ReadonlyMap<string, ReadonlyMap<string, string>>;

const WEBFLOW_API = "https://api.webflow.com/v2";
const CACHE_CONTROL = "public, max-age=60, s-maxage=300, stale-while-revalidate=600";

const text = (value: unknown): string => typeof value === "string" ? value.trim() : "";

const bool = (value: unknown): boolean => value === true;

const number = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const imageUrl = (value: unknown): string | null => {
  if (typeof value === "string") return text(value) || null;
  if (!value || typeof value !== "object") return null;
  return text((value as WebflowImage).url) || null;
};

const optionName = (slug: string, value: unknown, options: OptionNames): string => {
  const raw = text(value);
  return options.get(slug)?.get(raw) ?? raw;
};

const enumValue = <T extends string>(value: string, allowed: readonly T[], fallback: T): T => {
  const normalized = value.toLowerCase().replace(/\s+/g, "-");
  return allowed.includes(normalized as T) ? normalized as T : fallback;
};

export function webflowOptionNames(collection: WebflowCollectionResponse): OptionNames {
  return new Map(
    (collection.fields ?? []).flatMap((field) => {
      const slug = text(field.slug);
      if (!slug) return [];
      const options = new Map(
        (field.validations?.options ?? []).flatMap((option) => {
          const id = text(option.id);
          const name = text(option.name);
          return id && name ? [[id, name] as const] : [];
        }),
      );
      return [[slug, options] as const];
    }),
  );
}

export function normalizeWebflowRateCard(
  item: WebflowCollectionItem,
  options: OptionNames = new Map(),
  index = 0,
): RateCardConfig | null {
  const fields = item.fieldData ?? {};
  const id = text(item.id);
  const name = text(fields.name);
  if (!id || !name) return null;

  const desktopPosition = optionName("desktop-overlay-position", fields["desktop-overlay-position"], options);
  const mobilePosition = optionName("mobile-overlay-position", fields["mobile-overlay-position"], options);
  const buttonStyle = optionName("button-style", fields["button-style"], options)
    || optionName("card-fill", fields["card-fill"], options);
  const theme = optionName("theme", fields.theme, options);
  const fontPair = optionName("font-pair", fields["font-pair"], options);

  return {
    id,
    name,
    mewsRateId: text(fields["mews-rate-id"]) || null,
    isDefault: bool(fields["default-card"]),
    active: !bool(item.isArchived) && !bool(item.isDraft) && bool(fields.active),
    sortOrder: number(fields["sort-order"], index),
    desktopArtworkUrl: imageUrl(fields["full-card"] ?? fields["desktop-artwork"]),
    mobileArtworkUrl: imageUrl(fields["compact-card"] ?? fields["mobile-artwork"]),
    desktopOverlayPosition: enumValue<RateCardOverlayPosition>(
      desktopPosition,
      ["high", "normal", "low"],
      "normal",
    ),
    mobileOverlayPosition: enumValue<RateCardOverlayPosition>(
      mobilePosition,
      ["high", "normal", "low"],
      "normal",
    ),
    buttonStyle: enumValue<RateCardButtonStyle>(buttonStyle, ["filled", "outline"], "filled"),
    theme: enumValue<RateCardTheme>(theme, ["white", "blue", "green"], "white"),
    fontPair: enumValue<RateCardFontPair>(
      fontPair,
      ["brothers-bianco", "brothers-uchen", "desert-bianco"],
      "brothers-bianco",
    ),
    eyebrow: text(fields.eyebrow) || null,
    headline: text(fields.headline),
    description: text(fields.description),
    supportingText: text(fields["supporting-text"]) || null,
  };
}

export function normalizeWebflowRateCards(
  items: readonly WebflowCollectionItem[],
  options: OptionNames = new Map(),
): RateCardConfig[] {
  return items
    .map((item, index) => normalizeWebflowRateCard(item, options, index))
    .filter((card): card is RateCardConfig => card !== null);
}

async function webflowGet<T>(env: Env, path: string): Promise<T> {
  const response = await fetch(`${WEBFLOW_API}${path}`, {
    headers: {
      Authorization: `Bearer ${env.WEBFLOW_CMS_API_TOKEN}`,
      Accept: "application/json",
    },
  });
  if (!response.ok) throw new Error(`webflow_${response.status}`);
  return response.json<T>();
}

export async function onRequestGet({ env }: { env: Env }): Promise<Response> {
  if (!env.WEBFLOW_CMS_API_TOKEN || !env.WEBFLOW_RATE_CARD_COLLECTION_ID) {
    return json({ cards: [] }, 200, "no-store");
  }

  try {
    const collectionId = encodeURIComponent(env.WEBFLOW_RATE_CARD_COLLECTION_ID);
    const [collection, items] = await Promise.all([
      webflowGet<WebflowCollectionResponse>(env, `/collections/${collectionId}`),
      webflowGet<WebflowItemsResponse>(env, `/collections/${collectionId}/items?limit=100`),
    ]);
    const cards = normalizeWebflowRateCards(items.items ?? [], webflowOptionNames(collection));
    return json({ cards }, 200, CACHE_CONTROL);
  } catch {
    return json({ cards: [] }, 200, "no-store");
  }
}
