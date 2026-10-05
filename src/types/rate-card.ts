export type RateCardArtworkMode = "auto" | "desktop" | "mobile";

export type RateCardOverlayPosition = "high" | "normal" | "low";

export type RateCardButtonStyle = "filled" | "outline";

export type RateCardTheme =
  | "light"
  | "lake-forest"
  | "copper";

export type RateCardFontPair =
  | "brothers-bianco"
  | "brothers-uchen"
  | "desert-bianco";

export interface RateCardConfig {
  /** Stable CMS/item identifier. */
  id: string;
  /** Internal label for editors and diagnostics. */
  name: string;

  /**
   * Optional durable Mews Rate.Id binding. Blank means this configuration is
   * not tied to one specific Mews rate.
   */
  mewsRateId: string | null;

  /** Published fallback used when no Mews-specific card exists. */
  isDefault: boolean;
  active: boolean;
  sortOrder: number;

  /** Editorial artwork supplied by the CMS editor. */
  desktopArtworkUrl: string | null;
  mobileArtworkUrl: string | null;

  /** Independent placement presets for each artwork composition. */
  desktopOverlayPosition: RateCardOverlayPosition;
  mobileOverlayPosition: RateCardOverlayPosition;

  /** Preset presentation controls. No arbitrary CSS comes from the CMS. */
  buttonStyle: RateCardButtonStyle;
  theme: RateCardTheme;
  fontPair: RateCardFontPair;

  /**
   * Machine-readable equivalents of important words baked into the artwork.
   * The artwork remains decorative; these values are rendered as semantic HTML.
   */
  eyebrow?: string | null;
  headline: string;
  description: string;
  supportingText?: string | null;
}

export interface RateCardLiveContent {
  /** Already formatted live rate amount, e.g. "$325". */
  price: string;
  priceUnit?: string;
  taxLabel: string;
  cancellationText: string;
  ctaLabel?: string;
}

export interface ResolvedRateCardConfig extends RateCardConfig {
  matchedBy: "mews-rate-id" | "default";
}
