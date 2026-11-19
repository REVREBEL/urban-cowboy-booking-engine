"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_TRAVEL_PARTY_OPTIONS,
  FindYourStayTravelPartyButton,
} from "../../src/components/booking/discovery/FindYourStayTravelPartyButton";
import { defineStory } from "../lib/story";

interface DemoProps { selectedId: string }

/** Docs-only selection harness using the component's own option set. */
function TravelPartyDemo({ selectedId }: DemoProps) {
  const [selected, setSelected] = useState(selectedId);
  useEffect(() => setSelected(selectedId), [selectedId]);
  return (
    <div className="grid w-full gap-3 sm:grid-cols-2">
      {DEFAULT_TRAVEL_PARTY_OPTIONS.map((option) => (
        <FindYourStayTravelPartyButton
          key={option.id}
          {...option}
          isSelected={selected === option.id}
          onSelect={(id) => setSelected(id)}
        />
      ))}
    </div>
  );
}

export const travelPartyStory = defineStory({
  Component: TravelPartyDemo,
  args: {
    initial: { selectedId: "partner" },
  },
});
