import React from "react";
import type { RateCardConfig, RateCardLiveContent } from "@/types/rate-card";
import { ConfigurableRateCard } from "./ConfigurableRateCard";
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
  isExpanded,
  onToggleExpand,
  onConfirmBooking,
  pricing,
  depositNote,
  remainingNote,
  fullPolicyText,
  disabled = false,
}) => {
  return (
    <div className="flex items-stretch">
      <div className="relative z-20 shrink-0">
        <ConfigurableRateCard
          config={config}
          live={live}
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
            ? "w-[480px] opacity-100 translate-x-0 pointer-events-auto"
            : "w-0 max-w-0 opacity-0 -translate-x-6 pointer-events-none",
        ].join(" ")}
        aria-hidden={!isExpanded}
      >
        <RateOfferSidePanel
          variant="default"
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
          onClose={onToggleExpand}
          onConfirm={onConfirmBooking}
        />
      </div>
    </div>
  );
};

export default ConfigurableRateOffer;
