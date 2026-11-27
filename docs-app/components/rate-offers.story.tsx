"use client";

import { useState } from "react";
import { RateOfferCard } from "../../src/components/rates/RateOfferCard";
import { RateOfferSidePanel } from "../../src/components/rates/RateOfferSidePanel";
import PolicyDisplay from "../../src/components/rates/PolicyDisplay";
import { ConfigurableRateOffer } from "../../src/components/rates/ConfigurableRateOffer";
import type { RateCardConfig, RateCardLiveContent } from "../../src/types/rate-card";
import { defineStory } from "../lib/story";

const config: RateCardConfig = {
  id: "plan-ahead", name: "Plan Ahead", mewsRateId: "rate-plan-ahead",
  isDefault: false, active: true, sortOrder: 1,
  desktopArtworkUrl: null, mobileArtworkUrl: null, horizontalArtworkUrl: null,
  desktopOverlayPosition: "normal", mobileOverlayPosition: "normal",
  buttonStyle: "filled", buttonColor: "copper", textColor: "cowboy-umber",
  borderStyle: "none", fontPair: "brothers-bianco", ctaLabel: "Book Rate",
  eyebrow: "EARLY BIRD SAVINGS", headline: "PLAN AHEAD",
  description: "Book 30+ days early and save 15%.", supportingText: null,
  cancellationPenaltyWindow: 14, cancellationPenaltyWindowPeriod: "days",
  cancellationFullForfeitWindow: 5, cancellationFullForfeitWindowPeriod: "days",
};

const live: RateCardLiveContent = {
  price: "$360", priceUnit: "nightly", taxLabel: "Excl. taxes & fees",
  cancellationText: "Flexible cancellation up to 14 days prior",
};

const pricing = {
  nightly: "$360.00", subtotal: "$1,080.00", taxesAndFees: "$92.40",
  // 50% of the full $1,172.40 total, matching the booking engine's split.
  total: "$1,172.40", dueToday: "$586.20", remaining: "$586.20",
};

const cardPricing = {
  nightly: 145, subtotal: 435, taxesAndFees: 38.06,
  total: 473.06, dueToday: 236.53, remaining: 236.53,
};

function RateCardDemo() {
  const [expanded, setExpanded] = useState(false);
  const [last, setLast] = useState("none");
  return (
    <div className="w-full rounded-xl p-4 sm:p-6">
      <div className="w-full overflow-x-auto">
        <RateOfferCard
          theme="ride-easy" headline="Ride Easy" eyebrow="FLEXIBLE"
          description="Free cancellation up to 14 days before arrival."
          price="$145" priceUnit="NIGHTLY" taxDisclaimer="Excluding taxes & fees"
          isExpanded={expanded}
          pricingDetails={cardPricing}
          onToggleExpand={() => { setExpanded((value) => !value); setLast("toggled details"); }}
          onBook={() => setLast("book clicked")}
        />
      </div>
      <p className="sr-only" role="status">{last}</p>
    </div>
  );
}

function ConfigurableOfferDemo() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="w-full rounded-xl p-4 sm:p-6">
      <ConfigurableRateOffer
        config={config}
        live={live}
        theme="plan-ahead"
        variant="default"
        isExpanded={expanded}
        onToggleExpand={() => setExpanded((value) => !value)}
        onConfirmBooking={() => setExpanded(false)}
        pricing={pricing}
        depositNote="50% deposit of the total stay ($586.20) charged once the reservation is confirmed."
        remainingNote="Remaining balance ($586.20) charged 5 days before arrival."
        fullPolicyText="Free cancellation through 14 days before arrival."
        checkIn="2027-06-20"
      />
      <p className="sr-only" role="status">{expanded ? "Offer expanded" : "Offer collapsed"}</p>
    </div>
  );
}

function SidePanelDemo() {
  const [open, setOpen] = useState(true);
  return (
    <div className="w-full rounded-xl p-4 sm:p-6">
      {open ? (
        <RateOfferSidePanel
          variant="default" theme="plan-ahead" rateTitle="Plan Ahead"
          onClose={() => setOpen(false)}
          nightlyRate="$360" stayTotal="$1,080" taxesAndFees="$92.40"
          totalStay="$1,172.40" dueAtBooking="$586.20" remaining="$586.20"
          depositNote="50% deposit of the total stay ($586.20) charged on confirmation."
          remainingNote="Remaining balance ($586.20) charged before arrival."
          policyText="Free cancellation through 14 days before arrival."
        />
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-md border border-border px-3 py-2 text-sm"
        >
          Reopen side panel
        </button>
      )}
      <p className="sr-only" role="status">{open ? "Panel open" : "Panel closed"}</p>
    </div>
  );
}

function PolicyDemo() {
  return (
    <div className="w-full rounded-xl p-4 sm:p-6">
      <PolicyDisplay
        title="Payment schedule" orientation="horizontal"
        initialAmount="$586" remainingAmount="$586"
        text="Free cancellation until 14 days before arrival."
        showTooltips
      />
    </div>
  );
}

export const rateOfferCardStory = defineStory({
  Component: RateCardDemo,
  args: { initial: {} },
});

export const configurableRateOfferStory = defineStory({
  Component: ConfigurableOfferDemo,
  args: { initial: {} },
});

export const rateOfferSidePanelStory = defineStory({
  Component: SidePanelDemo,
  args: { initial: {} },
});

export const policyDisplayStory = defineStory({
  Component: PolicyDemo,
  args: { initial: {} },
});
