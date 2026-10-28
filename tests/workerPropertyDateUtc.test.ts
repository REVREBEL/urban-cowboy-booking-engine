import assert from "node:assert/strict";
import test from "node:test";
import { propertyDateUtc } from "../worker/mews/_lib.ts";

test("Mews Worker property midnight conversion preserves DST boundary offsets", () => {
  for (const [date, utc] of [
    ["2027-03-14", "2027-03-14T05:00:00.000Z"],
    ["2027-03-15", "2027-03-15T04:00:00.000Z"],
    ["2027-11-07", "2027-11-07T04:00:00.000Z"],
    ["2027-11-08", "2027-11-08T05:00:00.000Z"],
  ]) assert.equal(propertyDateUtc(date), utc);
});

test("Mews Worker formatter cache keeps property time zones independent", () => {
  for (let n = 0; n < 2; n++) {
    assert.equal(propertyDateUtc("2027-03-15", "America/New_York"), "2027-03-15T04:00:00.000Z");
    assert.equal(propertyDateUtc("2027-03-15", "Asia/Tokyo"), "2027-03-14T15:00:00.000Z");
    assert.equal(propertyDateUtc("2027-03-15", "America/Los_Angeles"), "2027-03-15T07:00:00.000Z");
  }
});
