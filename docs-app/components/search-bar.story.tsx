"use client";

import { useState } from "react";
import { SearchBar, type SearchBarVariant } from "../../src/components/booking/search/SearchBar";
import { type SearchButtonVariant } from "../../src/components/booking/search/SearchButton";
import { SearchBarExpanded } from "../../src/components/booking/search/SearchBarExpanded";
import { defineStory } from "../lib/story";

function SearchBarDemo({ variant, loading }: {
  variant: SearchBarVariant;
  loading: boolean;
}) {
  const [last, setLast] = useState("none");
  return (
    <div className="w-full rounded-xl p-4 sm:p-6">
      <SearchBar
        variant={variant}
        isLoading={loading}
        dateLabel="Dates"
        dateValue="21 – 24 Nov"
        guestLabel="Guests"
        guestValue="2 adults"
        promoLabel="Offer"
        promoValue="Add a code"
        onDateClick={() => setLast("dates")}
        onGuestClick={() => setLast("guests")}
        onPromoClick={() => setLast("offer")}
        onSearch={() => setLast("search")}
      />
      <p className="sr-only" role="status">{`Last action: ${last}`}</p>
    </div>
  );
}

export const searchBarStory = defineStory({
  Component: SearchBarDemo,
  args: { initial: { variant: "circle", loading: false } },
});

function ExpandedSearchDemo({ variant, buttonVariant }: {
  variant: "circle" | "square";
  buttonVariant: SearchButtonVariant;
}) {
  const [last, setLast] = useState("none");
  return (
    <div className="w-full rounded-xl p-4 sm:p-6">
      <SearchBarExpanded
        variant={variant}
        buttonVariant={buttonVariant}
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
  args: { initial: { variant: "circle", buttonVariant: "full-circle" } },
});
