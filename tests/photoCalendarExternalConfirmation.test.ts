import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const source = (path: string) => readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8");

test("Photo Arrival uses external date confirmation through the existing search CTAs", () => {
  const photo = source("journey/PhotoArrival.tsx");
  assert.match(photo, /<DateSearchDropdown\s+variant="external-actions"/);
  assert.match(photo, /const proceed = \(path: "journal" \| "rooms"\)/);
  assert.match(photo, /if \(!checkIn \|\| !checkOut \|\| nights <= 0\) return/);
  assert.match(photo, /booking\.setSearch\(\{/);
  assert.match(photo, /onClick=\{\(\) => ready && props\.onMatch\(\)\}/);
  assert.match(photo, /onClick=\{\(\) => ready && props\.onBrowse\(\)\}/);
  assert.match(photo, /variant="filled"\s+colorScheme="light"\s+size="small"/);
  assert.match(photo, /variant="outline" colorScheme="light" size="small"/);
  assert.doesNotMatch(photo, /rounded-full uppercase tracking-\[0\.2em\]/);
  assert.doesNotMatch(photo, /style=\{\{ opacity: 1 \}\}/);
});

test("Calendar Clear removes the entire range without closing the dropdown", () => {
  const dropdown = source("components/booking/search/DateSearchDropdown.tsx");
  assert.match(dropdown, /onClick=\{\(\) => onChange\("", ""\)\}/);
  assert.match(dropdown, /disabled=\{!checkIn && !checkOut\}/);
  assert.match(dropdown, /\{variant === "confirm" && \(/);
  assert.match(dropdown, />\s*Confirm dates\s*</);
  assert.match(dropdown, /<InlineDateRangePicker/);
});

test("Calendar layout reserves identical cell space across months and rate loading", () => {
  const picker = source("components/booking/search/InlineDateRangePicker.tsx");
  assert.match(picker, /cached\.push\(\.\.\.Array<MonthCell \| null>\(42 - cached\.length\)\.fill\(null\)\)/);
  assert.match(picker, /className="h-14"/);
  assert.match(picker, /className=\{`relative h-14/);
  assert.doesNotMatch(picker, /hasDailyRates/);
  assert.match(picker, /min-w-0 flex-1 truncate px-2 text-center/);
});

test("The above-bar Photo dropdown stays viewport-constrained without a duplicate date hint", () => {
  const photo = source("journey/PhotoArrival.tsx");
  const search = source("components/booking/search/SearchBarExpanded.tsx");
  assert.match(photo, /constrainAboveToViewport/);
  assert.match(photo, />Pick your arrival and departure dates to continue\.<\/p>/);
  assert.doesNotMatch(photo, /dates-hint/);
  assert.match(photo, /max-w-\[48ch\] text-balance text-paper\/80/);
  assert.match(search, /getBoundingClientRect\(\)\.top/);
  assert.match(search, /maxHeight: availableAbove/);
  assert.match(search, /overflow-y-auto overscroll-contain/);
  assert.match(search, /absolute bottom-full left-0 right-0 z-50 mb-3/);
});
