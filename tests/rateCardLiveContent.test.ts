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
  horizontalArtworkUrl: null,
  desktopOverlayPosition: "normal",
  mobileOverlayPosition: "normal",
  buttonStyle: "filled",
  buttonColor: "cowboy-umber",
  textColor: "cowboy-umber",
  borderStyle: "none",
  fontPair: "brothers-bianco",
  ctaLabel: "Book Now",
  cancellationPenaltyWindow: 14,
  cancellationPenaltyWindowPeriod: "days",
  cancellationFullForfeitWindow: 5,
  cancellationFullForfeitWindowPeriod: "days",
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
    cancellationConfirmation(
      baseRate,
      baseConfig,
      "2027-06-14",
      new Date("2027-05-20T16:00:00Z"),
    ),
    "Free Cancellation until May 31, 2027",
  );
});

test("non-refundable Mews rate group overrides the CMS cancellation-window fallback", () => {
  const rate: ShapedRate = {
    ...baseRate,
    knownRateGroup: "NON_REFUNDABLE",
  };

  assert.equal(
    cancellationConfirmation(
      rate,
      baseConfig,
      "2027-06-14",
      new Date("2027-05-20T16:00:00Z"),
    ),
    "Full Prepay Non Refundable",
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
        cancellationFullForfeitWindow: null,
        cancellationFullForfeitWindowPeriod: null,
      },
      "2027-06-14",
    ),
    "See rate details for cancellation terms",
  );
});


test("odd-hour cancellation windows do not invent an arrival clock time", () => {
  assert.equal(
    cancellationConfirmation(
      baseRate,
      {
        ...baseConfig,
        cancellationPenaltyWindow: 18,
        cancellationPenaltyWindowPeriod: "hours",
        cancellationFullForfeitWindow: null,
        cancellationFullForfeitWindowPeriod: null,
      },
      "2027-06-14",
    ),
    "Free Cancellation until 18 hours before arrival",
  );
});


test("divides a total-only amount by stay nights before labeling it nightly", () => {
  const rate: ShapedRate = {
    ...baseRate,
    perNightNet: null,
    perNightGross: null,
    totalNet: 600,
    totalGross: 660,
  };

  assert.deepEqual(rateCardPricePresentation(rate, 2), {
    amount: 300,
    taxLabel: "Excluding Taxes + Fees",
    basis: "net",
  });
});


test("moves to partially refundable inside the free-cancellation window", () => {
  assert.equal(
    cancellationConfirmation(
      baseRate,
      baseConfig,
      "2027-06-14",
      new Date("2027-06-05T16:00:00Z"),
    ),
    "Partially Refundable until Jun 09, 2027",
  );
});

test("moves to fully non-refundable inside the full-forfeit window", () => {
  assert.equal(
    cancellationConfirmation(
      baseRate,
      baseConfig,
      "2027-06-14",
      new Date("2027-06-10T16:00:00Z"),
    ),
    "Full Prepay Non Refundable",
  );
});

test("the free-cancellation cutoff day itself is already partially refundable", () => {
  assert.equal(
    cancellationConfirmation(
      baseRate,
      baseConfig,
      "2027-06-14",
      new Date("2027-05-31T16:00:00Z"),
    ),
    "Partially Refundable until Jun 09, 2027",
  );
});

// Both cutoffs are property-local calendar dates, not UTC dates or arrival times.
for (const { label, cutoff, midnight, clocks } of [
  {
    label: "spring forward",
    cutoff: "2027-03-14",
    midnight: "2027-03-14T05:00:00Z",
    clocks: ["2027-03-14T06:59:59Z", "2027-03-14T07:00:00Z"],
  },
  {
    label: "fall back",
    cutoff: "2027-11-07",
    midnight: "2027-11-07T04:00:00Z",
    clocks: ["2027-11-07T05:30:00Z", "2027-11-07T06:30:00Z"],
  },
]) {
  for (const period of ["days", "hours"] as const) {
    test(`${label}: ${period} cancellation cutoffs change at New York midnight`, () => {
      const config = {
        ...baseConfig,
        cancellationPenaltyWindow: period === "days" ? 14 : 14 * 24,
        cancellationPenaltyWindowPeriod: period,
        cancellationFullForfeitWindow: period === "days" ? 5 : 5 * 24,
        cancellationFullForfeitWindowPeriod: period,
      };
      const arrival = new Date(`${cutoff}T12:00:00Z`);
      arrival.setUTCDate(arrival.getUTCDate() + 14);
      const checkIn = arrival.toISOString().slice(0, 10);
      const freeText = label === "spring forward"
        ? "Free Cancellation until Mar 14, 2027"
        : "Free Cancellation until Nov 07, 2027";
      const partialText = label === "spring forward"
        ? "Partially Refundable until Mar 23, 2027"
        : "Partially Refundable until Nov 16, 2027";
      assert.equal(cancellationConfirmation(baseRate, config, checkIn,
        new Date(Date.parse(midnight) - 1)), freeText);
      for (const instant of [midnight, ...clocks]) {
        assert.equal(cancellationConfirmation(baseRate, config, checkIn,
          new Date(instant)), partialText, instant);
      }

      // Put the full-forfeit cutoff on the transition day as well.
      arrival.setUTCDate(arrival.getUTCDate() - 9);
      const forfeitCheckIn = arrival.toISOString().slice(0, 10);
      assert.equal(cancellationConfirmation(baseRate, config, forfeitCheckIn,
        new Date(Date.parse(midnight) - 1)), label === "spring forward"
          ? "Partially Refundable until Mar 14, 2027"
          : "Partially Refundable until Nov 07, 2027");
      for (const instant of [midnight, ...clocks]) {
        assert.equal(cancellationConfirmation(baseRate, config, forfeitCheckIn,
          new Date(instant)), "Full Prepay Non Refundable", instant);
      }
    });
  }
}
