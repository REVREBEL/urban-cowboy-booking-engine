// COW-40: preview form range and venue typing.
import assert from "node:assert/strict";
import test from "node:test";
import { buildPreviewFields, PREVIEW_MAX_MONTHS, previewRange } from "../src/dashboard/eventPreviewForm.ts";
import { localDateTimeToIso } from "../src/lib/event-recurrence.ts";
import { parseVenue } from "../src/lib/event-recurrence.ts";

test("preview range follows the selected event date, including cross-year dates", () => {
  assert.deepEqual(previewRange("2027-12-15"), { from: "2027-12-15", to: "2028-12-15" });
  assert.deepEqual(previewRange("2027-12-15", "2028-01-31"), { from: "2027-12-15", to: "2028-01-31" });
  assert.deepEqual(previewRange("2027-12-15", "2031-01-01"), {
    from: "2027-12-15",
    to: "2029-12-15", // capped at PREVIEW_MAX_MONTHS
  });
  assert.equal(PREVIEW_MAX_MONTHS, 24);
});

test("datetime-local input converts with the property time zone", () => {
  assert.equal(localDateTimeToIso("2027-12-31T08:30", "America/New_York"), "2027-12-31T13:30:00.000Z");
  assert.equal(localDateTimeToIso("2027-07-01T08:30", "America/New_York"), "2027-07-01T12:30:00.000Z");
});

test("onsite and offsite venue selections are serialized to different fields", () => {
  const base = {
    name: "Fondue",
    startLocal: "2027-02-01T08:40",
    recurrenceType: "d0ad84472f081450b147999db968f686",
    repeatOn: "fae03cbec436d68c927f322815f34da9",
  };
  const onsite = buildPreviewFields({ ...base, venue: "onsite:building-1" });
  assert.equal(onsite["onsite-event-location"], "building-1");
  assert.equal(onsite["offsite-event-location"], undefined);
  assert.equal(parseVenue(onsite).venueType, "onsite");

  const offsite = buildPreviewFields({ ...base, venue: "offsite:outlet-1" });
  assert.equal(offsite["offsite-event-location"], "outlet-1");
  assert.equal(offsite["onsite-event-location"], undefined);
  assert.equal(parseVenue(offsite).venueType, "offsite");
});
