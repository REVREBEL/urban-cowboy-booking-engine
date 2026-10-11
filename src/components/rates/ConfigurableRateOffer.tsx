import * as React from "react";
import type {
  RateCardConfig,
  RateCardLayout,
  RateCardLiveContent,
} from "@/types/rate-card";
import { RATE_CARD_COLORS } from "@/lib/rateCardPresentation";
import { ConfigurableRateCard } from "./ConfigurableRateCard";
import {
  RateOfferSidePanel,
  type OfferCardTheme,
} from "./RateOfferSidePanel";
import type { MilestoneDate } from "./policy_display";

export interface ConfigurableRateOfferPricing {
  nightly: number | string;
  subtotal: number | string;
  taxesAndFees: number | string;
  total: number | string;
  dueToday: number | string;
  remaining: number | string;
}

export interface ConfigurableRateOfferProps {
  config: RateCardConfig;
  live: RateCardLiveContent;
  theme: OfferCardTheme;
  layout?: RateCardLayout;
  variant?: "default" | "compact";
  checkIn: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onConfirmBooking: () => void;
  pricing: ConfigurableRateOfferPricing;
  depositNote: string;
  remainingNote: string;
  fullPolicyText: string;
  disabled?: boolean;
}

function formatAmount(value: number | string) {
  if (typeof value === "number") {
    return `$${value.toFixed(2)}`;
  }

  const text = String(value);
  return text.startsWith("$") ? text : `$${text}`;
}

function milestoneDate(
  checkIn: string,
  window: number | null | undefined,
  period: "hours" | "days" | null | undefined,
): MilestoneDate | undefined {
  if (!window || !period) return undefined;
  if (period === "hours" && window % 24 !== 0) return undefined;

  const [year, month, day] = checkIn.split("-").map(Number);
  if (!year || !month || !day) return undefined;

  const daysPrior = period === "days" ? window : window / 24;
  const cutoff = new Date(Date.UTC(year, month - 1, day, 12));
  cutoff.setUTCDate(cutoff.getUTCDate() - daysPrior);

  return {
    daysPrior: daysPrior < 10 ? String(daysPrior).padStart(2, "0") : daysPrior,
    day: String(cutoff.getUTCDate()).padStart(2, "0"),
    month: new Intl.DateTimeFormat("en-US", {
      month: "short",
      timeZone: "UTC",
    })
      .format(cutoff)
      .toUpperCase(),
  };
}

export const ConfigurableRateOffer: React.FC<ConfigurableRateOfferProps> = ({
  config,
  live,
  theme,
  layout = "vertical",
  variant = "default",
  checkIn,
  isExpanded,
  onToggleExpand,
  onConfirmBooking,
  pricing,
  depositNote,
  remainingNote,
  fullPolicyText,
  disabled = false,
}) => {
  const isCompact = variant === "compact";
  const sideWidth = isCompact ? 557 : 528;
  const panelHeight = isCompact ? 675 : 900;

  const policyDisplay = {
    initialAmount: formatAmount(pricing.dueToday),
    remainingAmount: formatAmount(pricing.remaining),
    freeCancelDate: milestoneDate(
      checkIn,
      config.cancellationPenaltyWindow,
      config.cancellationPenaltyWindowPeriod,
    ),
    nonRefundableDate: milestoneDate(
      checkIn,
      config.cancellationFullForfeitWindow,
      config.cancellationFullForfeitWindowPeriod,
    ),
    textColor: RATE_CARD_COLORS[config.textColor].hex,
    accentColor: RATE_CARD_COLORS[config.accentColor].hex,
    initialDepositTooltip: {
      title: "INITIAL DEPOSIT",
      description: depositNote,
    },
    remainingBalanceTooltip: {
      title: "REMAINING BALANCE",
      description: remainingNote,
    },
  };

  return (
    <div className={`flex flex-row ${isCompact ? "items-stretch" : "items-center"}`}>
      <div className="relative z-20 shrink-0">
        <ConfigurableRateCard
          config={config}
          live={live}
          layout={layout}
          artworkMode={isCompact ? "mobile" : "desktop"}
          isExpanded={isExpanded}
          onExpand={onToggleExpand}
          onBook={onConfirmBooking}
          disabled={disabled}
        />
      </div>

      <div
        className={[
          "relative z-10 shrink-0 overflow-hidden transition-all duration-500 ease-out -ml-12",
          isExpanded
            ? "opacity-100 translate-x-0 pointer-events-auto"
            : "w-0 max-w-0 opacity-0 -translate-x-6 pointer-events-none",
        ].join(" ")}
        style={{
          width: isExpanded ? `${sideWidth}px` : "0px",
          minWidth: isExpanded ? `${sideWidth}px` : "0px",
        }}
        aria-hidden={!isExpanded}
      >
        <div className={isCompact ? "h-full pl-8" : "h-full"}>
          <RateOfferSidePanel
            variant={variant}
            theme={theme}
            cancellationHeader={live.cancellationText}
            depositNote={depositNote}
            remainingNote={remainingNote}
            nightlyRate={pricing.nightly}
            stayTotal={pricing.subtotal}
            taxesAndFees={pricing.taxesAndFees}
            totalStay={pricing.total}
            dueAtBooking={pricing.dueToday}
            remaining={pricing.remaining}
            policyText={fullPolicyText}
            policyDisplay={policyDisplay}
            onClose={onToggleExpand}
            onConfirm={onConfirmBooking}
            height={panelHeight}
          />
        </div>
      </div>
    </div>
  );
};

export default ConfigurableRateOffer;
