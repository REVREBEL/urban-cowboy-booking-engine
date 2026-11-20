"use client";

import { SearchButton, type SearchButtonVariant } from "../../src/components/booking/search/SearchButton";
import { defineStory } from "../lib/story";

const variants: SearchButtonVariant[] = ["full-circle", "icon-circle", "full-square", "icon-square"];

function SearchButtonVariants() {
  return (
    <div className="flex w-full flex-wrap items-center gap-4 rounded-xl bg-smoke p-4">
      {variants.map((variant) => (
        <div key={variant} className="flex flex-col items-center gap-2 text-paper">
          <SearchButton variant={variant} aria-label={`Search (${variant})`} />
          <span className="text-xs">{variant}</span>
        </div>
      ))}
      <div className="flex flex-col items-center gap-2 text-paper">
        <SearchButton variant="full-circle" isLoading aria-label="Search (loading)" />
        <span className="text-xs">loading</span>
      </div>
    </div>
  );
}

export const searchButtonStory = defineStory({
  Component: SearchButton,
  args: {
    initial: { variant: "full-circle", isLoading: false, "aria-label": "Search" },
  },
});

export const searchButtonVariantsStory = defineStory({
  Component: SearchButtonVariants,
  args: { initial: {} },
});
