import assert from "node:assert/strict";
import test from "node:test";
import { buildCancellationTimeline, formatShortDate } from "../src/lib/cancellationTimeline.ts";

const policy = { freeCancelDays: 14, balanceDueDays: 5, depositShare: 0.5 };
const checkIn = "2027-06-20";

test("booked far out: three phases, 50% due today, full deposit refundable", () => {
  const t = buildCancellationTimeline("2027-05-01", checkIn, 1377.6, policy);
  assert.deepEqual(t.phases.map((p) => p.kind), ["refundable", "deposit-kept", "locked"]);
  assert.equal(t.dueToday, 688.8);
  assert.equal(t.refundIfCancelToday, 688.8);
  assert.equal(t.charges[1].date, "2027-06-15");
});

test("booked 365 days out: first phase is compressed", () => {
  const t = buildCancellationTimeline("2026-06-20", checkIn, 1000, policy);
  assert.equal(t.phases[0].compressed, true);
  assert.equal(t.phases[1].compressed, false);
});

test("booked 10 days out: free-cancel phase is gone and deposit is not refundable", () => {
  const t = buildCancellationTimeline("2027-06-10", checkIn, 1000, policy);
  assert.deepEqual(t.phases.map((p) => p.kind), ["deposit-kept", "locked"]);
  assert.equal(t.dueToday, 500);
  assert.equal(t.refundIfCancelToday, 0);
  assert.ok(t.warning);
});

test("booked 3 days out: full amount due today, nothing refundable", () => {
  const t = buildCancellationTimeline("2027-06-17", checkIn, 1000, policy);
  assert.deepEqual(t.phases.map((p) => p.kind), ["locked"]);
  assert.equal(t.dueToday, 1000);
  assert.equal(t.charges.length, 1);
});

test("the 14-day cutoff day itself is no longer free", () => {
  const t = buildCancellationTimeline("2027-06-06", checkIn, 1000, policy);
  assert.equal(t.currentPhase, "deposit-kept");
});


test("short cancellation dates preserve the existing en-US UTC display", () => {
  assert.equal(formatShortDate("2027-06-06"), "Jun 6");
});
