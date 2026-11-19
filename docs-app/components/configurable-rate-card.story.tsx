"use client";

import { useState } from "react";
import {
  ConfigurableRateCard,
  type ConfigurableRateCardProps,
} from "../../src/components/rates/ConfigurableRateCard";
import type {
  RateCardConfig,
  RateCardLiveContent,
  RateCardLayout,
} from "../../src/types/rate-card";
import { defineStory } from "../lib/story";

/** Deterministic CMS config; no live Mews data or network calls. */
const config: RateCardConfig = {
  id: "stay-awhile",
  name: "Stay Awhile",
  mewsRateId: "rate-stay-awhile",
  isDefault: false,
  active: true,
  sortOrder: 1,
  desktopArtworkUrl: null,
  mobileArtworkUrl: null,
  horizontalArtworkUrl: null,
  eyebrow: "20% OFF 3+ NIGHTS",
  headline: "STAY AWHILE",
  description: "Unpack once. Deepen into the mountain rhythm.",
  supportingText: null,
  buttonStyle: "filled",
  buttonColor: "copper",
  borderStyle: "none",
  textColor: "cowboy-umber",
  fontPair: "brothers-bianco",
  ctaLabel: "Book Rate",
  desktopOverlayPosition: "normal",
  mobileOverlayPosition: "normal",
  cancellationPenaltyWindow: null,
  cancellationPenaltyWindowPeriod: null,
  cancellationFullForfeitWindow: null,
  cancellationFullForfeitWindowPeriod: null,
};

const live: RateCardLiveContent = {
  price: "$340",
  priceUnit: "avg / night",
  taxLabel: "+ $28 taxes & fees",
  cancellationText: "Flexible cancellation up to 14 days prior",
};

interface DemoProps {
  layout: RateCardLayout;
  disabled: boolean;
}

/** Docs-only controlled harness; booking is a local state change, never a reservation. */
function RateCardDemo({ layout, disabled }: DemoProps) {
  const [expanded, setExpanded] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const props: ConfigurableRateCardProps = {
    config: { ...config },
    live: { ...live },
    layout,
    disabled,
    isExpanded: expanded,
    onExpand: () => setExpanded(true),
    onBook: () => setConfirmed(true),
    confirmLabel: "Agree & Confirm",
  };
  return (
    <div className="w-full max-w-md space-y-2">
      <ConfigurableRateCard {...props} />
      <p className="text-sm text-muted-foreground" role="status">
        Docs-only state: {confirmed ? "booking confirmed" : expanded ? "awaiting confirmation" : "rate preview"}
      </p>
    </div>
  );
}

export const configurableRateCardStory = defineStory({
  Component: RateCardDemo,
  args: { initial: { layout: "vertical", disabled: false } },
});

/** Deterministic variant grid migrated from the former Storybook states. */
function RateCardVariants() {
  return (
    <div className="w-full space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <ConfigurableRateCard
          config={{ ...config }}
          live={{ ...live }}
          layout="vertical"
          onBook={() => {}}
        />
        <ConfigurableRateCard
          config={{ ...config }}
          live={{ ...live }}
          layout="horizontal"
          onBook={() => {}}
        />
      </div>
      <div className="grid gap-6 sm:grid-cols-3">
        <ConfigurableRateCard
          config={{ ...config, borderStyle: "single" }}
          live={{ ...live }}
          onBook={() => {}}
        />
        <ConfigurableRateCard
          config={{ ...config, borderStyle: "double", buttonStyle: "outline" }}
          live={{ ...live }}
          onBook={() => {}}
        />
        <ConfigurableRateCard
          config={{ ...config }}
          live={{ ...live }}
          disabled
          onBook={() => {}}
        />
      </div>
      <ConfigurableRateCard
        config={{ ...config }}
        live={{ ...live }}
        isExpanded
        confirmLabel="Agree & Confirm"
        onBook={() => {}}
      />
    </div>
  );
}

export const configurableRateCardVariantsStory = defineStory({
  Component: RateCardVariants,
  args: { initial: {} },
});
