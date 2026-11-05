import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  rateSelectionDateFmt,
  dueDateFormat,
  formatDateDisplay,
  formatDueDate,
} from "../src/lib/rateSelectionFormatters.ts";

const source = readFileSync(
  new URL("../src/components/rates/RateSelectionView.tsx", import.meta.url),
  "utf8",
);

test("RateSelectionView delegates date formatting to module-scoped formatters", () => {
  assert.match(source, /from ['"]\.\.\/\.\.\/lib\/rateSelectionFormatters['"]/);
  assert.match(source, /formatDateDisplay\(criteria\.checkIn\)/);
  assert.match(source, /formatDueDate\(due\)/);
  // Ensure no local toLocaleDateString() is called inside the component
  assert.doesNotMatch(source, /\.toLocaleDateString\(/);
  // Ensure no local unmemoized dueDateFormat ref is created inside the component
  assert.doesNotMatch(source, /dueDateFormat = useRef/);
});

test("formatDateDisplay formats ISO dates into short US date strings using module formatter", () => {
  assert.equal(formatDateDisplay("2026-10-14"), "Oct 14, 2026");
  assert.equal(formatDateDisplay("2026-01-05"), "Jan 5, 2026");
  assert.equal(formatDateDisplay("2026-12-31"), "Dec 31, 2026");
  assert.equal(formatDateDisplay(""), "");
  assert.equal(formatDateDisplay("invalid-date"), "invalid-date");
});

test("formatDueDate and dueDateFormat format UTC date instances without timezone drift", () => {
  const sampleDue = new Date(Date.UTC(2026, 9, 14, 12));
  assert.equal(formatDueDate(sampleDue), "Oct 14");
  assert.equal(dueDateFormat.format(sampleDue), "Oct 14");
  assert.equal(rateSelectionDateFmt.format(sampleDue), "Oct 14, 2026");
});
