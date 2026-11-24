"use client";

import { useState } from "react";
import { DateSearchDropdown } from "../../src/components/booking/search/DateSearchDropdown";
import { InlineDateRangePicker, type DailyRate } from "../../src/components/booking/search/InlineDateRangePicker";
import { defineStory } from "../lib/story";

const DEMO_RATES: Record<string, DailyRate> = {
  "2026-10-14": { amount: 299, currency: "USD", available: true, minNights: 2 },
  "2026-10-15": { amount: 319, currency: "USD", available: true, minNights: 2 },
  "2026-10-16": { amount: 349, currency: "USD", available: true, minNights: 2 },
  "2026-10-17": { amount: 299, currency: "USD", available: true },
  "2026-10-18": { amount: 279, currency: "USD", available: false, minNights: 3 },
  "2026-10-19": { amount: 279, currency: "USD", available: true, minNights: 3 },
  "2026-11-05": { amount: 249, currency: "USD", available: true, minNights: 2 },
  "2026-11-06": { amount: 259, currency: "USD", available: true, minNights: 2 },
  "2026-11-07": { amount: 269, currency: "USD", available: true, minNights: 2 },
  "2026-11-08": { amount: 249, currency: "USD", available: true },
};

function DateSearchDropdownDemo({ variant = "confirm" }: { variant: "confirm" | "external-actions" }) {
  const [range, setRange] = useState({ checkIn: "2026-11-05", checkOut: "2026-11-08" });
  const [closed, setClosed] = useState(false);
  return (
    <div className="w-full max-w-3xl space-y-4 py-4">
      {closed ? (
        <button
          className="rounded border p-3 w-full"
          onClick={() => setClosed(false)}
        >
          Reopen date picker
        </button>
      ) : (
        <DateSearchDropdown
          variant={variant}
          checkIn={range.checkIn}
          checkOut={range.checkOut}
          dailyRates={DEMO_RATES}
          onChange={(checkIn, checkOut) => setRange({ checkIn, checkOut })}
          onClose={() => setClosed(true)}
          onVisibleRangeChange={() => {}}
        />
      )}
      <p className="text-sm text-muted-foreground" role="status">
        Selected: {range.checkIn || "—"} → {range.checkOut || "—"} {closed ? " (dialog closed)" : ""}
      </p>
    </div>
  );
}

function InlineDateRangePickerDemo() {
  const [range, setRange] = useState({ checkIn: "2026-10-14", checkOut: "2026-10-17" });
  return (
    <div className="w-full max-w-4xl space-y-2 py-4">
      <InlineDateRangePicker
        checkIn={range.checkIn}
        checkOut={range.checkOut}
        dailyRates={DEMO_RATES}
        minDate="2026-10-01"
        onChange={(checkIn, checkOut) => setRange({ checkIn, checkOut })}
        onVisibleRangeChange={() => {}}
      />
      <p className="text-sm text-muted-foreground" role="status">
        Selected: {range.checkIn || "—"} → {range.checkOut || "—"}
      </p>
    </div>
  );
}

export const dateSearchDropdownStory = defineStory({
  Component: DateSearchDropdownDemo,
  args: { initial: { variant: "confirm" } },
});

export const dateSearchDropdownExternalActionsStory = defineStory({
  Component: DateSearchDropdownDemo,
  args: { initial: { variant: "external-actions" } },
});

export const inlineDateRangePickerStory = defineStory({
  Component: InlineDateRangePickerDemo,
  args: { initial: {} },
});