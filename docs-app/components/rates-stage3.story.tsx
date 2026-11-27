"use client";

import { useState } from "react";
import { buildCancellationTimeline } from "@/lib/cancellationTimeline";
import {
  FigmaRateCard,
  FigmaRateDetailPopup,
  FigmaPolicyTimeline,
} from "@/components/rates/FigmaRateComponents";
import { PillarFeatures } from "@/components/rates/PillarFeatures";
import { defineStory } from "../lib/story";

// Shared mock data
const SAMPLE_DATE = "2027-01-13";
const timeline = buildCancellationTimeline("2026-11-20", SAMPLE_DATE, 285.60, {
  freeCancelDays: 14,
  balanceDueDays: 5,
  depositShare: 0.5,
});

// Figma Rate Components
// Timeline free cancellation: 14 days before 2027-01-13 = 2026-12-30
const FREE_CANCEL_DATE = "December 30";

function FigmaRateCardDemo({ variant }: { variant: "default" | "member" | "package" }) {
  return (
    <div className="w-full max-w-[523px] mx-auto rounded-xl bg-smoke p-4 sm:p-6">
      <FigmaRateCard
        eyebrow={variant === "member" ? "Member Exclusive" : "Keep Your Options Open"}
        name={variant === "member" ? "Member Rate" : variant === "package" ? "Cowboy Package" : "Ride Easy"}
        description="Our standard rate for guests who want a little more freedom around their plans."
        policy={`Free Cancellation Until ${FREE_CANCEL_DATE}`}
        roomSummary="Alpine Bathing Suite, 1 night for 2 Adults"
        total={285.60}
        currency="USD"
        variant={variant}
        perks={variant === "package" ? ["Upgrade on Arrival", "Breakfast for Two (2)", "S'mores Kits"] : undefined}
        confirmLabel={variant === "member" || variant === "package" ? "Unlock This Rate" : "Book This Rate"}
        onDetails={() => undefined}
        onConfirm={() => undefined}
      />
    </div>
  );
}

export const figmaRateCardStandardStory = defineStory({
  Component: FigmaRateCardDemo,
  args: { initial: { variant: "default" } },
});

export const figmaRateCardMemberStory = defineStory({
  Component: FigmaRateCardDemo,
  args: { initial: { variant: "member" } },
});

export const figmaRateCardPackageStory = defineStory({
  Component: FigmaRateCardDemo,
  args: { initial: { variant: "package" } },
});

function FigmaRateDetailPopupDemo() {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="w-full max-w-[1314px] mx-auto">
      <button onClick={() => setIsOpen(!isOpen)} className="mb-4 px-4 py-2 rounded bg-primary text-primary-foreground">
        {isOpen ? "Close Popup" : "Open Popup"}
      </button>
      {isOpen && (
        <FigmaRateDetailPopup
          name="Ride Easy"
          eyebrow="Keep Your Options Open"
          description="Our standard rate for guests who want a little more freedom around their plans."
          nightly={285.6}
          currency="USD"
          nights={1}
          subtotal={255}
          taxes={30.6}
          total={285.6}
          dueToday={142.8}
          policyText="Cancellation: Free Cancellation until Dec 30, 2026"
          timeline={timeline}
          arrivalDate={SAMPLE_DATE}
          onClose={() => setIsOpen(false)}
          onConfirm={() => undefined}
        />
      )}
    </div>
  );
}

export const figmaRateDetailPopupStory = defineStory({
  Component: FigmaRateDetailPopupDemo,
  args: { initial: {} },
});

function FigmaPolicyTimelineDemo() {
  return (
    <div className="w-full max-w-[523px] mx-auto rounded-xl bg-smoke p-4 sm:p-6">
      <FigmaPolicyTimeline
        timeline={timeline}
        arrivalDate={SAMPLE_DATE}
        currency="USD"
      />
    </div>
  );
}

export const figmaPolicyTimelineStory = defineStory({
  Component: FigmaPolicyTimelineDemo,
  args: { initial: {} },
});

// PillarFeatures (no props)
function PillarFeaturesDemo() {
  return (
    <div className="w-full max-w-2xl mx-auto rounded-xl bg-smoke p-4 sm:p-6">
      <PillarFeatures />
    </div>
  );
}

export const pillarFeaturesStory = defineStory({
  Component: PillarFeaturesDemo,
  args: { initial: {} },
});