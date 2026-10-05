import type { RateCardConfig } from "../types/rate-card.ts";
import type { ShapedRate } from "../types/mews.ts";

export interface RateCardPricePresentation {
  amount: number;
  taxLabel: string;
  basis: "net" | "gross";
}

export function rateCardPricePresentation(rate: ShapedRate): RateCardPricePresentation {
  const net = rate.perNightNet ?? rate.totalNet;
  if (typeof net === "number" && Number.isFinite(net)) {
    return {
      amount: net,
      taxLabel: "Excluding Taxes + Fees",
      basis: "net",
    };
  }

  const gross = rate.perNightGross ?? rate.totalGross ?? 0;
  return {
    amount: gross,
    taxLabel: "Including Taxes + Fees",
    basis: "gross",
  };
}

function parseCheckIn(checkIn: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(checkIn);
  if (!match) return null;

  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 15, 0, 0));
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatCutoff(date: Date, includeTime: boolean): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(includeTime
      ? {
          hour: "numeric",
          minute: "2-digit",
          timeZone: "UTC",
        }
      : { timeZone: "UTC" }),
  }).format(date);
}

export function cancellationConfirmation(
  rate: ShapedRate,
  config: RateCardConfig,
  checkIn: string,
): string {
  if (rate.knownRateGroup === "NON_REFUNDABLE") {
    return "Full Prepay · Non-Refundable";
  }

  const window = config.cancellationPenaltyWindow;
  const period = config.cancellationPenaltyWindowPeriod;
  const checkInDate = parseCheckIn(checkIn);

  if (
    typeof window === "number" &&
    Number.isFinite(window) &&
    window > 0 &&
    period
  ) {
    if (period === "hours" && window % 24 !== 0) {
      return `Free Cancellation until ${window} hours before arrival`;
    }

    if (checkInDate) {
      const cutoff = new Date(checkInDate);
      const days = period === "days" ? window : window / 24;
      cutoff.setUTCDate(cutoff.getUTCDate() - days);
      return `Free Cancellation until ${formatCutoff(cutoff, false)}`;
    }
  }

  return "See rate details for cancellation terms";
}
