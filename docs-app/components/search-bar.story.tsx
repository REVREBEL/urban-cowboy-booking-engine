"use client";

import { useState } from "react";
import { type SearchButtonVariant } from "../../src/components/booking/search/SearchButton";
import {
  SearchBarExpanded,
  type SearchBarExpandedVariant,
} from "../../src/components/booking/search/SearchBarExpanded";
import { defineStory } from "../lib/story";

function ExpandedSearchDemo({ variant, buttonVariant, isLoading }: {
  variant: SearchBarExpandedVariant;
  buttonVariant: SearchButtonVariant;
  isLoading: boolean;
}) {
  const [last, setLast] = useState("none");
  return (
    <div className="w-full rounded-xl p-4 sm:p-6">
      <SearchBarExpanded
        variant={variant}
        buttonVariant={buttonVariant}
        isLoading={isLoading}
        initialValues={{
          property: "catskills",
          checkInDate: "2026-11-21",
          checkOutDate: "2026-11-24",
          guests: 2,
          promoCode: "",
        }}
        onSectionClick={(section) => setLast(`section ${section ?? "closed"}`)}
        onValuesChange={(values) => setLast(`guests ${values.guests}`)}
        onSearch={(values) => setLast(`search ${values.property}`)}
      />
      <p className="sr-only" role="status">{`Last action: ${last}`}</p>
    </div>
  );
}

export const expandedSearchStory = defineStory({
  Component: ExpandedSearchDemo,
  args: { initial: { variant: "circle", buttonVariant: "full-circle", isLoading: false } },
});
