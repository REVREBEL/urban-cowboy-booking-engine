import type { RateCardConfig } from "../types/rate-card.ts";
import type { ShapedRate } from "../types/mews.ts";

export interface RateCardPricePresentation {
  amount: number;
  taxLabel: string;
  basis: "net" | "gross";
}

export function rateCardPricePresentation(
  rate: ShapedRate,
  nights = 1,
): RateCardPricePresentation {
  const stayNights = Number.isFinite(nights) && nights > 0 ? nights : 1;
  const net =
    rate.perNightNet ??
    (typeof rate.totalNet === "number" ? rate.totalNet / stayNights : null);

  if (typeof net === "number" && Number.isFinite(net)) {
    return {
      amount: net,
      taxLabel: "Excluding Taxes + Fees",
      basis: "net",
    };
  }

  const gross =
    rate.perNightGross ??
    (typeof rate.totalGross === "number" ? rate.totalGross / stayNights : 0);

  return {
    amount: gross,
    taxLabel: "Including Taxes + Fees",
    basis: "gross",
  };
}

const PROPERTY_TIME_ZONE = "America/New_York";

function parseDateOnly(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 12, 0, 0));
  return Number.isNaN(date.getTime()) ? null : date;
}

function dateOnlyInPropertyTimeZone(now: Date): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: PROPERTY_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return new Date(
    Date.UTC(Number(value.year), Number(value.month) - 1, Number(value.day), 12, 0, 0),
  );
}

function formatPolicyDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

function cutoffDate(
  checkIn: Date,
  window: number | null | undefined,
  period: "hours" | "days" | null | undefined,
): Date | null {
  if (
    typeof window !== "number" ||
    !Number.isFinite(window) ||
    window <= 0 ||
    !period
  ) {
    return null;
  }

  // Date-only booking criteria cannot support a trustworthy clock-time cutoff.
  // Whole-day hour windows are safe to convert; odd-hour windows stay relative.
  if (period === "hours" && window % 24 !== 0) return null;

  const days = period === "days" ? window : window / 24;
  const cutoff = new Date(checkIn);
  cutoff.setUTCDate(cutoff.getUTCDate() - days);
  return cutoff;
}

export function cancellationConfirmation(
  rate: ShapedRate,
  config: RateCardConfig,
  checkIn: string,
  now = new Date(),
): string {
  if (rate.knownRateGroup === "NON_REFUNDABLE") {
    return "Full Prepay Non Refundable";
  }

  const arrival = parseDateOnly(checkIn);
  if (!arrival) return "See rate details for cancellation terms";

  const today = dateOnlyInPropertyTimeZone(now);
  const freeCutoff = cutoffDate(
    arrival,
    config.cancellationPenaltyWindow,
    config.cancellationPenaltyWindowPeriod,
  );
  const fullForfeitCutoff = cutoffDate(
    arrival,
    config.cancellationFullForfeitWindow,
    config.cancellationFullForfeitWindowPeriod,
  );

  if (freeCutoff && today < freeCutoff) {
    return `Free Cancellation until ${formatPolicyDate(freeCutoff)}`;
  }

  if (fullForfeitCutoff && today < fullForfeitCutoff) {
    return `Partially Refundable until ${formatPolicyDate(fullForfeitCutoff)}`;
  }

  if (fullForfeitCutoff && today >= fullForfeitCutoff) {
    return "Full Prepay Non Refundable";
  }

  const oddHourFreeWindow =
    config.cancellationPenaltyWindowPeriod === "hours" &&
    typeof config.cancellationPenaltyWindow === "number" &&
    config.cancellationPenaltyWindow % 24 !== 0;

  if (oddHourFreeWindow) {
    return `Free Cancellation until ${config.cancellationPenaltyWindow} hours before arrival`;
  }

  return "See rate details for cancellation terms";
}
