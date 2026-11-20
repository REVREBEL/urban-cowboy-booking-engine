"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_TRAVEL_PARTY_OPTIONS,
  TravelPartyGroup,
} from "../../src/components/booking/discovery/FindYourStayTravelPartyButton";
import { defineStory } from "../lib/story";

interface DemoProps { selectedId: string }

/** Docs-only selection harness using the component's own option set. */
function TravelPartyDemo({ selectedId }: DemoProps) {
  const [selected, setSelected] = useState(selectedId);
  useEffect(() => setSelected(selectedId), [selectedId]);
  return (
    <TravelPartyGroup
      options={DEFAULT_TRAVEL_PARTY_OPTIONS}
      value={selected}
      onChange={(id) => setSelected(id)}
    />
  );
}

export const travelPartyStory = defineStory({
  Component: TravelPartyDemo,
  args: {
    initial: { selectedId: "partner" },
  },
});
