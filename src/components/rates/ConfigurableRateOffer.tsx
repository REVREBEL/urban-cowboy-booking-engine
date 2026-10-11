import React from "react";
import type { RateCardConfig, RateCardLiveContent } from "@/types/rate-card";
import { ConfigurableRateCard } from "./ConfigurableRateCard";
import { PolicyDisplay } from "./policy_display";
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
  disabled = false,
}) => {
  const isCompact = variant === "compact";
  const sideWidth = isCompact ? 557 : 528;
  const panelHeight = isCompact ? 675 : 900;

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
            policyDisplay={<PolicyDisplay text={fullPolicyText} />}
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
