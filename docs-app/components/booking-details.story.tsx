"use client";

import { useState } from "react";
import { BestRateGuaranteedLabel } from "../../src/components/booking/search/BestRateGuaranteedLabel";
import { PropertyLocationLabel } from "../../src/components/booking/search/PropertyLocationLabel";
import { PropertyPropertyLabel } from "../../src/components/booking/search/PropertyPropertyLabel";
import { LodgeSignboard } from "../../src/components/booking/discovery/RusticLodgeSignboard";
import { defineStory } from "../lib/story";

const imageBaseUrl = process.env.NEXT_PUBLIC_DOCS_BASE_PATH ?? "";

function LabelsDemo() {
  const [last, setLast] = useState("none");
  return (
    <div className="w-full space-y-5 rounded-xl bg-smoke p-4 sm:p-6">
      <BestRateGuaranteedLabel tooltipText="Applies to direct bookings." />
      <div className="flex flex-wrap gap-3">
        <PropertyLocationLabel location="catskills" interactive selected
          onClick={(value) => setLast(`location ${value}`)} />
        <PropertyPropertyLabel property="catskills" interactive
          onClick={(value) => setLast(`property ${value}`)} />
      </div>
      <p className="sr-only" role="status">{last}</p>
    </div>
  );
}

function SignboardDemo() {
  const [last, setLast] = useState("none");
  return (
    <div className="w-full rounded-xl bg-smoke p-4 sm:p-6">
      <LodgeSignboard
        backgroundImage={`${imageBaseUrl}/assets/decoration/backgrounds/background.png`}
        backboardImage={`${imageBaseUrl}/assets/decoration/backgrounds/backboard.png`}
        textSlot={<span className="text-paper">Find your stay</span>}
        buttonSlotTop={
          <button type="button" className="rounded-md border border-border px-3 py-2 text-sm"
            onClick={() => setLast("top")}>Catskills</button>
        }
        buttonSlotBottom={
          <button type="button" className="rounded-md border border-border px-3 py-2 text-sm"
            onClick={() => setLast("bottom")}>Explore</button>
        }
      />
      <p className="sr-only" role="status">{last}</p>
    </div>
  );
}

export const bookingLabelsStory = defineStory({
  Component: LabelsDemo,
  args: { initial: {} },
});

export const lodgeSignboardStory = defineStory({
  Component: SignboardDemo,
  args: { initial: {} },
});
