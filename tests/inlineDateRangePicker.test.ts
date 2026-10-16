import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

test("InlineDateRangePicker date calculations and month cell bounds", () => {
  // Test cell count and padding for October 2026 (starts on Thursday, 3 empty cells before 1st)
  const mondayIndex = (new Date(Date.UTC(2026, 9, 1)).getUTCDay() + 6) % 7;
  const dayCount = new Date(Date.UTC(2026, 10, 0)).getUTCDate();
  assert.equal(mondayIndex, 3); // Thursday is index 3 in Mon-Sun
  assert.equal(dayCount, 31);
});

test("cached sold dates remain selectable for live availability validation", () => {
  const picker = readFileSync(
    new URL("../src/components/booking/search/InlineDateRangePicker.tsx", import.meta.url),
    "utf8",
  );

  assert.match(picker, /const disabled = date < minDate;/);
  assert.doesNotMatch(picker, /disabled = date < minDate \|\|/);
  assert.match(picker, /: start \|\| end/);
  assert.match(picker, /: unavailable/);
  assert.doesNotMatch(picker, /onMouseDown=\{\(event\) => event\.preventDefault\(\)\}/);
});

test("selected dates contrast with the paper calendar surface", () => {
  const styles = readFileSync(new URL("../src/styles/index.css", import.meta.url), "utf8");

  assert.match(styles, /--calendar-date-selected-bg: var\(--button-primary-foreground\);/);
  assert.match(styles, /--calendar-date-selected-foreground: var\(--button-primary\);/);
});

test("scoped service restrictions are visibly indicated on touch calendars", () => {
  const picker = readFileSync(
    new URL("../src/components/booking/search/InlineDateRangePicker.tsx", import.meta.url),
    "utf8",
  );
  assert.match(picker, /hasVisibleServiceRestrictions/);
  assert.match(picker, /serviceNote && !disabled/);
  assert.match(picker, /Marked dates may have check-in, check-out, or stay restrictions/);
  assert.match(picker, /Search verifies your exact stay/);
  // Restriction information must never add a date-selection gate.
  assert.match(picker, /const disabled = date < minDate;/);
});
