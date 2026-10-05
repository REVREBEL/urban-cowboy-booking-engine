import assert from "node:assert/strict";
import test from "node:test";
import { resolveRateCardConfig } from "../src/lib/rateCardConfig.ts";
import type { RateCardConfig } from "../src/types/rate-card.ts";

const base: Omit<RateCardConfig, "id" | "name"> = {
  mewsRateId: null,
  isDefault: false,
  active: true,
  sortOrder: 0,
  desktopArtworkUrl: null,
  mobileArtworkUrl: null,
  desktopOverlayPosition: "normal",
  mobileOverlayPosition: "low",
  buttonStyle: "filled",
  buttonColor: "cowboy-umber",
  textColor: "cowboy-umber",
  fontPair: "brothers-bianco",
  ctaLabel: "Book Now",
  cancellationPenaltyWindow: null,
  cancellationPenaltyWindowPeriod: null,
  headline: "Rate",
  description: "Rate description",
};

function config(
  id: string,
  overrides: Partial<RateCardConfig> = {},
): RateCardConfig {
  return {
    ...base,
    id,
    name: id,
    ...overrides,
  };
}

test("specific Mews Rate ID configuration wins over the default card", () => {
  const configs = [
    config("default", { isDefault: true }),
    config("specific", { mewsRateId: "mews-rate-123" }),
  ];

  const resolved = resolveRateCardConfig(configs, "mews-rate-123");

  assert.equal(resolved?.id, "specific");
  assert.equal(resolved?.matchedBy, "mews-rate-id");
});

test("falls back to the active default when no specific Mews Rate ID matches", () => {
  const configs = [
    config("default", { isDefault: true }),
    config("specific", { mewsRateId: "different-rate" }),
  ];

  const resolved = resolveRateCardConfig(configs, "unknown-rate");

  assert.equal(resolved?.id, "default");
  assert.equal(resolved?.matchedBy, "default");
});

test("inactive specific and default configurations are ignored", () => {
  const configs = [
    config("inactive-specific", {
      mewsRateId: "mews-rate-123",
      active: false,
    }),
    config("inactive-default", {
      isDefault: true,
      active: false,
    }),
  ];

  assert.equal(resolveRateCardConfig(configs, "mews-rate-123"), null);
});

test("sort order determines the winning active default deterministically", () => {
  const configs = [
    config("later", { isDefault: true, sortOrder: 20 }),
    config("earlier", { isDefault: true, sortOrder: 10 }),
  ];

  const resolved = resolveRateCardConfig(configs, null);

  assert.equal(resolved?.id, "earlier");
});


test("incomplete specific CMS card is skipped in favor of an accessible default", () => {
  const configs = [
    config("default", { isDefault: true }),
    config("incomplete", {
      mewsRateId: "mews-rate-123",
      headline: "",
      description: "",
      desktopArtworkUrl: "https://cdn.example.com/rate.webp",
    }),
  ];

  const resolved = resolveRateCardConfig(configs, "mews-rate-123");

  assert.equal(resolved?.id, "default");
  assert.equal(resolved?.matchedBy, "default");
});
