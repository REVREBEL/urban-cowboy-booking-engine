import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { calendarFreshnessMs } from "../worker/mews/calendar-engine.ts";

test("Eastern calendar freshness continues to distinguish daytime and overnight near DST", () => {
  assert.equal(calendarFreshnessMs("2027-03-14", Date.parse("2027-03-14T05:30:00Z")), 60 * 60 * 1000);
  assert.equal(calendarFreshnessMs("2027-03-14", Date.parse("2027-03-14T17:00:00Z")), 30 * 60 * 1000);
});

test("calendar's formatter is reused rather than recreated per Eastern timestamp", () => {
  const source = readFileSync(new URL("../worker/mews/calendar-engine.ts", import.meta.url), "utf8");
  assert.match(source, /const easternDateTimeFmt = new Intl\.DateTimeFormat/);
  assert.match(source, /easternDateTimeFmt\.formatToParts\(new Date\(timestamp\)\)/);
});

test("date picker selected range header depends only on check-in and check-out", () => {
  const source = readFileSync(new URL("../src/components/booking/search/InlineDateRangePicker.tsx", import.meta.url), "utf8");
  assert.match(source, /const selectedRangeHeader = useMemo\(/);
  assert.match(source, /\}, \[checkIn, checkOut\]\)/);
});
