import assert from "node:assert/strict";
import test from "node:test";
import { formatReviewDate } from "../src/lib/reviewDate.ts";

test("guest review dates preserve the existing en-US UTC display", () => {
  assert.equal(formatReviewDate("2026-02-09T00:00:00.000Z"), "February 9, 2026");
  assert.equal(formatReviewDate("2026-02-09T23:59:59.000Z"), "February 9, 2026");
  assert.equal(formatReviewDate("2026-02-10T00:00:00+02:00"), "February 9, 2026");
  assert.equal(formatReviewDate("2027-03-14T04:30:00Z"), "March 14, 2027");
});

test("invalid or missing review dates continue to return null", () => {
  for (const value of [null, undefined, "", "not-a-date"]) {
    assert.equal(formatReviewDate(value), null);
  }
});

test("formatter reuse does not retain a prior review date", () => {
  assert.equal(formatReviewDate("2026-12-31T23:59:59Z"), "December 31, 2026");
  assert.equal(formatReviewDate("2027-01-01T00:00:00Z"), "January 1, 2027");
  assert.equal(formatReviewDate("2026-12-31T23:59:59Z"), "December 31, 2026");
});
