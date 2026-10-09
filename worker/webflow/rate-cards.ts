import type {
  CancellationPenaltyWindowPeriod,
  RateCardBorderStyle,
  RateCardButtonStyle,
  RateCardColor,
  RateCardConfig,
  RateCardFontPair,
  RateCardOverlayPosition,
} from "../../src/types/rate-card.ts";
import type { Env } from "../mews/_lib.ts";
import { normalizeRateCardCtaLabel } from "../../src/lib/rateCardCta.ts";
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
const WEBFLOW_TIMEOUT_MS = 8_000;
const CACHE_CONTROL = "public, max-age=60, s-maxage=300, stale-while-revalidate=600";

const text = (value: unknown): string => typeof value === "string" ? value.trim() : "";

const bool = (value: unknown): boolean => value === true;

const number = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const nullableNumber = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const imageUrl = (value: unknown): string | null => {
  if (typeof value === "string") return text(value) || null;
  if (!value || typeof value !== "object") return null;
  return text((value as WebflowImage).url) || null;
};

const optionName = (slug: string, value: unknown, options: OptionNames): string => {
  const raw = text(value);
  return options.get(slug)?.get(raw) ?? raw;
};

const slugify = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const enumValue = <T extends string>(value: string, allowed: readonly T[], fallback: T): T => {
  const normalized = slugify(value);
  return allowed.includes(normalized as T) ? normalized as T : fallback;
};

const RATE_CARD_COLORS: readonly RateCardColor[] = [
  "paper",
  "ash",
  "alpine-linen",
  "nude-ember",
  "lodge-yellow",
  "oxidized-teal",
  "lake-forest",
  "oxblood",
  "whiskey-sour",
  "bandana-red",
  "copper",
  "cowboy-umber",
  "smoke",
];

const FONT_PAIR_BY_WEBFLOW_NAME: Readonly<Record<string, RateCardFontPair>> = {
  "quattrocento-and-bianco-sans": "quattrocento-bianco",
  "rundeck-and-to-serif-tibetan": "rundeck-noto-serif-tibetan",
  "rundeck-and-noto-serif-tibetan": "rundeck-noto-serif-tibetan",
  "league-spartan-and-arvo": "league-spartan-arvo",
  "league-gothic-and-dm-sans": "league-gothic-dm-sans",
  "noto-serif-tibetan-and-lato": "noto-serif-tibetan-lato",
  "motter-corpus-std-and-coustard": "motter-corpus-coustard",
  "filicudi-and-special-elite": "filicudi-special-elite",
};

const rateFontPair = (value: string): RateCardFontPair =>
  FONT_PAIR_BY_WEBFLOW_NAME[slugify(value)] ?? "brothers-bianco";

const BORDER_STYLE_BY_WEBFLOW_NAME: Readonly<Record<string, RateCardBorderStyle>> = {
  "no-border": "none",
  "solid-line": "single",
  "double-solid-line": "double",
};

const rateCardBorderStyle = (value: string): RateCardBorderStyle =>
  BORDER_STYLE_BY_WEBFLOW_NAME[slugify(value)] ?? "none";


const penaltyPeriod = (value: string): CancellationPenaltyWindowPeriod | null => {
  const normalized = slugify(value);
  if (normalized === "hours") return "hours";
  if (normalized === "days") return "days";
  return null;
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
  const cardFill = optionName(
    fields["button-style"] ? "button-style" : "card-fill",
    fields["button-style"] ?? fields["card-fill"],
    options,
  );
  const buttonColorName = optionName("button-color", fields["button-color"], options);
  const textColorName = optionName("text-color", fields["text-color"], options);
  const borderStyleName = optionName("border-options", fields["border-options"], options);
  const rateFontName = optionName(
    fields["rate-font"] ? "rate-font" : "font-pair",
    fields["rate-font"] ?? fields["font-pair"],
    options,
  );
  const cancellationPeriodName = optionName(
    "cancellation-penalty-window-period",
    fields["cancellation-penalty-window-period"],
    options,
  );
  const fullForfeitPeriodName = optionName(
    "cancellation-full-forfeit-window-period",
    fields["cancellation-full-forfeit-window-period"],
    options,
  );

  return {
    id,
    name,
    mewsRateId: text(fields["mews-rate-id"]) || null,
    isDefault: bool(fields["default-card"]),
    active: !bool(item.isArchived) && bool(fields.active),
    sortOrder: number(fields["sort-order"], index),
    memberOnly: bool(fields["member-only"]),
    desktopArtworkUrl: imageUrl(fields["full-card"] ?? fields["desktop-artwork"]),
    mobileArtworkUrl: imageUrl(fields["compact-card"] ?? fields["mobile-artwork"]),
    horizontalArtworkUrl: imageUrl(fields["horizontal-card"]),
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
    buttonStyle: enumValue<RateCardButtonStyle>(cardFill, ["filled", "outline"], "filled"),
    buttonColor: enumValue<RateCardColor>(buttonColorName, RATE_CARD_COLORS, "cowboy-umber"),
    textColor: enumValue<RateCardColor>(textColorName, RATE_CARD_COLORS, "cowboy-umber"),
    borderStyle: rateCardBorderStyle(borderStyleName),
    fontPair: rateFontPair(rateFontName),
    ctaLabel: normalizeRateCardCtaLabel(fields["call-to-action"]),
    cancellationPenaltyWindow: nullableNumber(fields["cancellation-penalty-window"]),
    cancellationPenaltyWindowPeriod: penaltyPeriod(cancellationPeriodName),
    cancellationFullForfeitWindow: nullableNumber(fields["cancellation-full-forfeit-window"]),
    cancellationFullForfeitWindowPeriod: penaltyPeriod(fullForfeitPeriodName),
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
  if (!env.WEBFLOW_CMS_API_TOKEN || !env.WEBFLOW_RATE_CARD_COLLECTION_ID) {
    return json({ cards: [] }, 200, "no-store");
  }

  try {
    const collectionId = encodeURIComponent(env.WEBFLOW_RATE_CARD_COLLECTION_ID);
    const [collection, items] = await Promise.all([
      webflowGet<WebflowCollectionResponse>(env, `/collections/${collectionId}`),
      // Booking should consume the currently published CMS version, not staged
      // editor changes that have not been published to the live site.
      webflowGet<WebflowItemsResponse>(env, `/collections/${collectionId}/items/live?limit=100`),
    ]);
    const cards = normalizeWebflowRateCards(items.items ?? [], webflowOptionNames(collection));
    return json({ cards }, 200, CACHE_CONTROL);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "webflow_unknown";
    console.warn("[webflow rate-cards] content fetch failed", reason);
    return json({ cards: [] }, 200, "no-store");
  }
}
