export const RATE_CARD_CTA_MAX_CHARS = 24;
export const RATE_CARD_CTA_FALLBACK = "Book Now";

export function normalizeRateCardCtaLabel(value: unknown): string {
  if (typeof value !== "string") return RATE_CARD_CTA_FALLBACK;

  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) return RATE_CARD_CTA_FALLBACK;

  const length = Array.from(normalized).length;
  return length <= RATE_CARD_CTA_MAX_CHARS
    ? normalized
    : RATE_CARD_CTA_FALLBACK;
}
