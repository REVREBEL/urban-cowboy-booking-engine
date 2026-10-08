import assert from "node:assert/strict";
import test from "node:test";
import {
  addCalendarDays,
  calendarFreshnessMs,
  reservationRefreshRange,
} from "../worker/mews/calendar-engine.ts";

test("reservation calendar refresh includes the LOS shoulder on both sides", () => {
  assert.deepEqual(reservationRefreshRange("2026-10-10", "2026-10-13"), {
    startDate: "2026-10-08",
    endDate: "2026-10-15",
  });
});

test("calendar freshness uses America/New_York daytime and overnight cadence", () => {
  const daytime = Date.parse("2026-10-08T14:00:00Z"); // 10:00 AM EDT
  const overnight = Date.parse("2026-10-09T02:00:00Z"); // 10:00 PM EDT

  assert.equal(calendarFreshnessMs("2026-10-20", daytime), 30 * 60 * 1000);
  assert.equal(calendarFreshnessMs("2026-10-20", overnight), 60 * 60 * 1000);
});

test("farther calendar inventory receives progressively longer freshness windows", () => {
  const now = Date.parse("2026-10-08T14:00:00Z");

  assert.equal(calendarFreshnessMs("2027-01-20", now), 4 * 60 * 60 * 1000);
  assert.equal(calendarFreshnessMs("2027-06-01", now), 12 * 60 * 60 * 1000);
});

test("calendar date arithmetic remains stable across DST boundaries", () => {
  assert.equal(addCalendarDays("2026-10-31", 2), "2026-11-02");
  assert.equal(addCalendarDays("2027-03-13", 2), "2027-03-15");
});
