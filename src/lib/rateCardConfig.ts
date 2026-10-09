import type {
  RateCardConfig,
  ResolvedRateCardConfig,
} from "../types/rate-card.ts";

export function hasRequiredRateCardContent(config: RateCardConfig): boolean {
  return Boolean(
    config.id.trim() &&
    config.name.trim() &&
    config.headline.trim() &&
    config.description.trim(),
  );
}

export function resolveRateCardConfig(
  configs: readonly RateCardConfig[],
  mewsRateId: string | null | undefined,
): ResolvedRateCardConfig | null {
  const active = configs
    .filter((config) => config.active && hasRequiredRateCardContent(config))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (mewsRateId) {
    const specific = active.find((config) => config.mewsRateId === mewsRateId);
    if (specific) return { ...specific, matchedBy: "mews-rate-id" };
  }

  const fallback = active.find((config) => config.isDefault);
  return fallback ? { ...fallback, matchedBy: "default" } : null;
}
