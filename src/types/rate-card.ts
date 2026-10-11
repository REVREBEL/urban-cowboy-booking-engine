export type RateCardArtworkMode = "auto" | "desktop" | "mobile";\n\nexport type RateCardLayout = "vertical" | "horizontal";

export type RateCardOverlayPosition = "high" | "normal" | "low";

export type RateCardButtonStyle = "filled" | "outline";

export type RateCardBorderStyle = "none" | "single" | "double";

export type RateCardColor =
  | "paper"
  | "ash"
  | "alpine-linen"
  | "nude-ember"
  | "lodge-yellow"
  | "oxidized-teal"
  | "lake-forest"
  | "oxblood"
  | "whiskey-sour"
  | "bandana-red"
  | "copper"
  | "cowboy-umber"
  | "smoke";

export type RateCardFontPair =
  | "brothers-bianco"
  | "brothers-uchen"
  | "desert-bianco"
  | "quattrocento-bianco"
  | "rundeck-noto-serif-tibetan"
  | "league-spartan-arvo"
  | "league-gothic-dm-sans"
  | "noto-serif-tibetan-lato"
  | "motter-corpus-coustard"
  | "filicudi-special-elite";

export type CancellationPenaltyWindowPeriod = "hours" | "days";

export interface RateCardConfig {
  /** Stable CMS/item identifier. */
  id: string;
  /** Internal label for editors and diagnostics. */
  name: string;

  /** Durable binding to Mews Rate.Id. */
  mewsRateId: string | null;

  /** Optional published fallback used when no Mews-specific card exists. */
  isDefault: boolean;
  active: boolean;
  sortOrder: number;
  memberOnly?: boolean;

  /** Editorial artwork supplied by the CMS editor. */
  desktopArtworkUrl: string | null;
  mobileArtworkUrl: string | null;
  horizontalArtworkUrl: string | null;

  /** Independent placement presets for each artwork composition. */
  desktopOverlayPosition: RateCardOverlayPosition;
  mobileOverlayPosition: RateCardOverlayPosition;

  /** CMS-controlled live-overlay presentation. */
  buttonStyle: RateCardButtonStyle;
  buttonColor: RateCardColor;
  textColor: RateCardColor;
  accentColor: RateCardColor;
  borderStyle: RateCardBorderStyle;
  fontPair: RateCardFontPair;
  ctaLabel?: string | null;

  /**
   * Optional CMS policy-display fallback. Mews remains authoritative whenever
   * structured cancellation data is available from the booking API.
   */
  cancellationPenaltyWindow?: number | null;
  cancellationPenaltyWindowPeriod?: CancellationPenaltyWindowPeriod | null;
  cancellationFullForfeitWindow?: number | null;
  cancellationFullForfeitWindowPeriod?: CancellationPenaltyWindowPeriod | null;

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
