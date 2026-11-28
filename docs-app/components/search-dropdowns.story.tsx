"use client";

import { useState } from "react";
import { SearchBarGuestDropdown } from "../../src/components/booking/search/SearchBarGuestsDropdown";
import { SearchBarLocationDropdown } from "../../src/components/booking/search/SearchBarLocationDropdown";
import { SearchBarPromoDropdown } from "../../src/components/booking/search/SearchBarPromoDropdown";
import { defineStory } from "../lib/story";

type Which = "guests" | "location" | "promo";

function SearchDropdownDemo({ which }: { which: Which }) {
  const [last, setLast] = useState("none");
  return (
    <div className="w-full min-h-64 rounded-xl p-4 sm:p-6">
      {which === "guests" && (
        <SearchBarGuestDropdown
          initialCounts={{ adults: 2, children: 0 }}
          onChange={(counts) => setLast(JSON.stringify(counts))}
          onClose={() => setLast("guests closed")}
        />
      )}
      {which === "location" && (
        <SearchBarLocationDropdown
          initialValue="catskills"
          onChange={(value) => setLast(value)}
          onClose={() => setLast("location closed")}
        />
      )}
      {which === "promo" && (
        <SearchBarPromoDropdown
          initialValue=""
          onChange={(value) => setLast(value || "promo cleared")}
          onApply={(value) => setLast(`applied ${value}`)}
          onClose={() => setLast("promo closed")}
          closeOnApply={false}
        />
      )}
      <p className="sr-only" role="status">{`Last action: ${last}`}</p>
    </div>
  );
}

export const searchGuestsDropdownStory = defineStory({
  Component: SearchDropdownDemo,
  args: { initial: { which: "guests" } },
});

export const searchLocationDropdownStory = defineStory({
  Component: SearchDropdownDemo,
  args: { initial: { which: "location" } },
});

export const searchPromoDropdownStory = defineStory({
  Component: SearchDropdownDemo,
  args: { initial: { which: "promo" } },
});
