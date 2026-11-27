"use client";

import { useState } from "react";
import { DateSearchDropdown } from "../../src/components/booking/search/DateSearchDropdown";
import { InlineDateRangePicker, type DailyRate } from "../../src/components/booking/search/InlineDateRangePicker";
import { defineStory } from "../lib/story";

/** Generate a future-relative date fixture so demos work on any day. */
function buildDemoRates(base: Date = new Date()): Record<string, DailyRate> {
  const rates: Record<string, DailyRate> = {};
  const pad = (n: number) => String(n).padStart(2, "0");
  const iso = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

  // Start ~2 weeks from now, span ~3 weeks
  const start = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate() + 14));
  for (let i = 0; i < 21; i++) {
    const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + i));
    const dateKey = iso(d);
    const dayOfWeek = d.getUTCDay();
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Fri/Sat
    const baseAmount = isWeekend ? 349 : 299;
    const variation = (i % 7) * 10;
    rates[dateKey] = {
      amount: baseAmount + variation,
      currency: "USD",
      available: i !== 7, // one unavailable day in the middle
      minNights: isWeekend ? 2 : 1,
      invalidStayLengths: i === 10 ? [3] : undefined, // one day with invalid stay length
    };
  }
  return rates;
}

const DEMO_RATES = buildDemoRates();

/** Add days to an ISO date string. */
function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Check if all dates in [checkIn, checkOut) are available in rates. */
function isRangeAvailable(rates: Record<string, DailyRate>, checkIn: string, checkOut: string): boolean {
  const checkInTime = new Date(`${checkIn}T00:00:00Z`).getTime();
  const checkOutTime = new Date(`${checkOut}T00:00:00Z`).getTime();
  for (let t = checkInTime; t < checkOutTime; t += 86_400_000) {
    const date = new Date(t).toISOString().slice(0, 10);
    if (!rates[date]?.available) return false;
  }
  return true;
}

/** Compute a valid default range: check-in with minNights > 1, check-out at least minNights days later, all days available. */
function getDefaultRange(rates: Record<string, DailyRate>): { checkIn: string; checkOut: string } {
  const available = Object.entries(rates)
    .filter(([, r]) => r.available)
    .sort(([a], [b]) => a.localeCompare(b));
  
  // Find first available day with minNights > 1 that can support a full valid stay
  for (const [checkIn, rate] of available) {
    const minNights = rate.minNights ?? 1;
    if (minNights <= 1) continue;
    
    const minCheckOut = addDays(checkIn, minNights);
    
    // Find first available date >= minCheckOut
    const checkOutEntry = available.find(([d]) => d >= minCheckOut);
    if (!checkOutEntry) continue;
    const checkOut = checkOutEntry[0];
    
    // Verify all dates in range are available
    if (isRangeAvailable(rates, checkIn, checkOut)) {
      return { checkIn, checkOut };
    }
  }
  
  // Fallback: first two available days
  if (available.length >= 2) {
    return { checkIn: available[0][0], checkOut: available[1][0] };
  }
  // Final fallback
  const keys = Object.keys(rates).sort();
  return { checkIn: keys[0] ?? "", checkOut: keys[1] ?? "" };
}

const DEFAULT_RANGE = getDefaultRange(DEMO_RATES);

// Assertion: verify default range satisfies minNights and availability
if (typeof window === "undefined") {
  // Only run in build/SSR context
  const checkInRate = DEMO_RATES[DEFAULT_RANGE.checkIn];
  const minNights = checkInRate?.minNights ?? 1;
  const checkOutDate = new Date(`${DEFAULT_RANGE.checkOut}T00:00:00Z`);
  const checkInDate = new Date(`${DEFAULT_RANGE.checkIn}T00:00:00Z`);
  const actualNights = Math.round((checkOutDate.getTime() - checkInDate.getTime()) / 86_400_000);
  
  if (actualNights < minNights) {
    throw new Error(`Default range check-out (${DEFAULT_RANGE.checkOut}) is only ${actualNights} nights after check-in (${DEFAULT_RANGE.checkIn}), but minNights is ${minNights}`);
  }
  if (!isRangeAvailable(DEMO_RATES, DEFAULT_RANGE.checkIn, DEFAULT_RANGE.checkOut)) {
    throw new Error(`Default range ${DEFAULT_RANGE.checkIn} → ${DEFAULT_RANGE.checkOut} contains unavailable dates`);
  }
}

function DateSearchDropdownDemo({ variant }: { variant: "confirm" | "external-actions" }) {
  const [range, setRange] = useState({ checkIn: DEFAULT_RANGE.checkIn, checkOut: DEFAULT_RANGE.checkOut });
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

function DateSearchDropdownUnselectedDemo() {
  const [range, setRange] = useState({ checkIn: "", checkOut: "" });
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
          variant="confirm"
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
  const [range, setRange] = useState({ checkIn: DEFAULT_RANGE.checkIn, checkOut: DEFAULT_RANGE.checkOut });
  // Use a minDate that's before our fixture start so the calendar can navigate
  const minDate = Object.keys(DEMO_RATES).sort()[0];
  return (
    <div className="w-full max-w-4xl space-y-2 py-4">
      <InlineDateRangePicker
        checkIn={range.checkIn}
        checkOut={range.checkOut}
        dailyRates={DEMO_RATES}
        minDate={minDate}
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

export const dateSearchDropdownUnselectedStory = defineStory({
  Component: DateSearchDropdownUnselectedDemo,
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