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
    checkInDate &&
    typeof window === "number" &&
    Number.isFinite(window) &&
    window > 0 &&
    period
  ) {
    const cutoff = new Date(checkInDate);
    const milliseconds =
      period === "days"
        ? window * 24 * 60 * 60 * 1000
        : window * 60 * 60 * 1000;
    cutoff.setTime(cutoff.getTime() - milliseconds);

    const includeTime = period === "hours" && window % 24 !== 0;
    return `Free Cancellation until ${formatCutoff(cutoff, includeTime)}`;
  }

  return "See rate details for cancellation terms";
}
