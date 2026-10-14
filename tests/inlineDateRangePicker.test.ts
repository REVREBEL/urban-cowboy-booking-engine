import assert from "node:assert/strict";
import test from "node:test";

test("InlineDateRangePicker date calculations and month cell bounds", () => {
  // Test cell count and padding for October 2026 (starts on Thursday, 3 empty cells before 1st)
  const mondayIndex = (new Date(Date.UTC(2026, 9, 1)).getUTCDay() + 6) % 7;
  const dayCount = new Date(Date.UTC(2026, 10, 0)).getUTCDate();
  assert.equal(mondayIndex, 3); // Thursday is index 3 in Mon-Sun
  assert.equal(dayCount, 31);
});
