import assert from "node:assert/strict";
import test from "node:test";
import {
  cancellationConfirmation,
  rateCardPricePresentation,
} from "../src/lib/rateCardLiveContent.ts";
import type { ShapedRate } from "../src/types/mews.ts";
import type { RateCardConfig } from "../src/types/rate-card.ts";

const baseRate: ShapedRate = {
  rateId: "rate-1",
  rateGroupId: "group-1",
  knownRateGroup: "FLEXIBLE",
  name: "Ride Easy",
  description: "Flexible rate",
  isPrivate: false,
  currency: "USD",
  totalGross: 660,
  totalNet: 600,
  totalTax: 60,
  perNightGross: 330,
  perNightNet: 300,
  perNightTax: 30,
  maxGross: null,
  maxNet: null,
  maxTax: null,
  citySejour: null,
  settlement: {
    type: "Automatic",
    action: "ChargeCreditCard",
    isAutomatic: true,
    trigger: "Confirmation",
    offset: null,
    value: 0.5,
    flatValue: null,
    currencyCode: "USD",
    maximumTimeUnits: null,
  },
};

const baseConfig: RateCardConfig = {
  id: "cms-1",
  name: "Ride Easy",
  mewsRateId: "rate-1",
  isDefault: false,
  active: true,
  sortOrder: 0,
  memberOnly: false,
  desktopArtworkUrl: null,
  mobileArtworkUrl: null,
  desktopOverlayPosition: "normal",
  mobileOverlayPosition: "normal",
  buttonStyle: "filled",
  buttonColor: "cowboy-umber",
  textColor: "cowboy-umber",
  fontPair: "brothers-bianco",
  ctaLabel: "Book Now",
  cancellationPenaltyWindow: 14,
  cancellationPenaltyWindowPeriod: "days",
  eyebrow: "Keep Your Options Open",
  headline: "Ride Easy",
  description: "Flexible rate",
  supportingText: null,
};

test("uses net nightly pricing with an excluding-taxes disclosure when net is available", () => {
  assert.deepEqual(rateCardPricePresentation(baseRate), {
    amount: 300,
    taxLabel: "Excluding Taxes + Fees",
    basis: "net",
  });
});

test("falls back to gross pricing and changes the disclosure when net is unavailable", () => {
  const rate: ShapedRate = {
    ...baseRate,
    totalNet: null,
    perNightNet: null,
  };

  assert.deepEqual(rateCardPricePresentation(rate), {
    amount: 330,
    taxLabel: "Including Taxes + Fees",
    basis: "gross",
  });
});

test("formats a CMS 14-day cancellation window from the stay check-in date", () => {
  assert.equal(
    cancellationConfirmation(baseRate, baseConfig, "2027-06-14"),
    "Free Cancellation until May 31, 2027",
  );
});

test("non-refundable Mews rate group overrides the CMS cancellation-window fallback", () => {
  const rate: ShapedRate = {
    ...baseRate,
    knownRateGroup: "NON_REFUNDABLE",
  };

  assert.equal(
    cancellationConfirmation(rate, baseConfig, "2027-06-14"),
    "Full Prepay · Non-Refundable",
  );
});

test("does not invent a cancellation date when no structured policy data exists", () => {
  assert.equal(
    cancellationConfirmation(
      baseRate,
      {
        ...baseConfig,
        cancellationPenaltyWindow: null,
        cancellationPenaltyWindowPeriod: null,
      },
      "2027-06-14",
    ),
    "See rate details for cancellation terms",
  );
});
