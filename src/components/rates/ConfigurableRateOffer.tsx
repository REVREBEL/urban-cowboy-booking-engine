import React from "react";
import type { RateCardConfig, RateCardLiveContent } from "@/types/rate-card";
import { ConfigurableRateCard } from "./ConfigurableRateCard";
import { PolicyDisplay, type MilestoneDate } from "./policy_display";
import {
  RateOfferSidePanel,
  type OfferCardTheme,
} from "./RateOfferSidePanel";

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
  variant?: "default" | "compact";
  layout?: "vertical" | "horizontal";
  isExpanded: boolean;
  onToggleExpand: () => void;
  onConfirmBooking: () => void;
  pricing: ConfigurableRateOfferPricing;
  depositNote: string;
  remainingNote: string;
  fullPolicyText: string;
  checkIn?: string;
  disabled?: boolean;
}

export const ConfigurableRateOffer: React.FC<ConfigurableRateOfferProps> = ({
  config,
  live,
  theme,
  variant = "default",
  layout = "vertical",
  isExpanded,
  onToggleExpand,
  onConfirmBooking,
  pricing,
  depositNote,
  remainingNote,
  fullPolicyText,
  checkIn,
  disabled = false,
}) => {
  const isCompact = variant === "compact";
  const sideWidth = isCompact ? 557 : 528;
  const panelHeight = isCompact ? 675 : 900;
  const milestone = (amount: number | null | undefined, unit: "days" | "hours" | null | undefined): MilestoneDate | undefined => {
    if (!checkIn || amount == null || !unit || amount < 0) return undefined;
    const days = unit === "days" ? amount : amount / 24;
    if (!Number.isInteger(days)) return undefined;
    const parts = checkIn.split("-").map(Number);
    if (parts.length !== 3 || parts.some((n) => !Number.isInteger(n))) return undefined;
    const [year, month, day] = parts;
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return undefined;
    date.setUTCDate(date.getUTCDate() - days);
    return { daysPrior: days, day: date.getUTCDate(), month: date.toLocaleString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase() };
  };
  const freeCancelDate = milestone(config.cancellationPenaltyWindow, config.cancellationPenaltyWindowPeriod);
  const nonRefundableDate = milestone(config.cancellationFullForfeitWindow, config.cancellationFullForfeitWindowPeriod);

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
            policyDisplay={isCompact && freeCancelDate && nonRefundableDate
              ? <PolicyDisplay orientation="vertical" size="compact"
                  initialAmount={String(pricing.dueToday)}
                  remainingAmount={String(pricing.remaining)}
                  freeCancelDate={freeCancelDate} nonRefundableDate={nonRefundableDate}
                  textColor="var(--cowboy-umber--normal, #4e332d)"
                  accentColor="var(--copper--normal, #9a5636)" />
              : <PolicyDisplay text={fullPolicyText} />}
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
