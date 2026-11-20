"use client";

import { useState } from "react";
import {
  Stars,
  HotBadge,
  FavoriteBadge,
  ViewersNudge,
  SavingsLine,
  HoldTimer,
} from "../../src/components/booking/conversion";
import { defineStory } from "../lib/story";

function ConversionBadgesDemo({ compact = false }: { compact?: boolean }) {
  const [visible, setVisible] = useState(true);
  return (
    <div className="w-full rounded-xl bg-paper p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          className="rounded-md border border-border px-3 py-2 text-sm"
        >
          Toggle badges
        </button>
        <Stars />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <HotBadge visible={visible} />
        <FavoriteBadge visible={visible} />
        <SavingsLine amount={45} currency="USD" />
        <HoldTimer secondsLeft={compact ? 90 : 600} />
      </div>
      <div className="mt-4">
        <ViewersNudge viewers={compact ? null : 12} booked={compact ? null : 4} />
      </div>
      <p className="sr-only" role="status">{`Badges ${visible ? "visible" : "hidden"}`}</p>
    </div>
  );
}

export const conversionBadgesStory = defineStory({
  Component: ConversionBadgesDemo,
  args: { initial: {} },
});

export const conversionBadgesCompactStory = defineStory({
  Component: ConversionBadgesDemo,
  args: { initial: { compact: true } },
});
