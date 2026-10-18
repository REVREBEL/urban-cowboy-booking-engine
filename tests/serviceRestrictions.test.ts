import assert from "node:assert/strict";
import test from "node:test";
import { mapApplicableRestrictions } from "../worker/mews/service-restrictions.ts";

const weekend = {
  Conditions: {
    Type: "ClosedToStay",
    ResourceCategoryId: "room-a",
    ExactRateId: null,
    BaseRateId: null,
    RateGroupId: null,
    StartUtc: "2026-10-19T04:00:00Z",
    EndUtc: null,
    Days: ["Friday", "Saturday"],
  },
  Exceptions: {
    MinLength: "P0M2DT0H0M0S",
    MaxLength: null,
    MinAdvance: null,
  },
};

test("Mews Friday/Saturday ClosedToStay with a 2-day exception remains category scoped", () => {
  const output = mapApplicableRestrictions([weekend], "2026-10-22", "2026-10-26");
  assert.deepEqual(Object.keys(output), ["2026-10-23", "2026-10-24"]);
  assert.deepEqual(output["2026-10-23"], [{
    type: "ClosedToStay",
    categoryId: "room-a",
    exactRateId: null,
    baseRateId: null,
    rateGroupId: null,
    exceptionMinNights: 2,
    hasOtherExceptions: false,
  }]);
  assert.equal(output["2026-10-25"], undefined);
});

test("ClosedToArrival and ClosedToDeparture are distinct and preserve rate scope", () => {
  const output = mapApplicableRestrictions([
    {
      Conditions: {
        Type: "ClosedToArrival",
        ResourceCategoryId: "room-b",
        ExactRateId: "rate-1",
        StartUtc: "2026-10-23T04:00:00Z",
        EndUtc: "2026-10-24T04:00:00Z",
        Days: ["Friday"],
      },
      Exceptions: {},
    },
    {
      Conditions: {
        Type: "ClosedToDeparture",
        ResourceCategoryId: null,
        RateGroupId: "rate-group",
        StartUtc: "2026-10-25T04:00:00Z",
        EndUtc: "2026-10-27T04:00:00Z",
        Days: ["Sunday", "Monday", "Tuesday"],
      },
      Exceptions: { MinAdvance: "P0M1DT0H0M0S" },
    },
  ], "2026-10-23", "2026-10-26");
  assert.equal(output["2026-10-23"]?.[0]?.type, "ClosedToArrival");
  assert.equal(output["2026-10-23"]?.[0]?.exactRateId, "rate-1");
  assert.equal(output["2026-10-24"], undefined);
  assert.equal(output["2026-10-25"]?.[0]?.type, "ClosedToDeparture");
  assert.equal(output["2026-10-25"]?.[0]?.rateGroupId, "rate-group");
  assert.equal(output["2026-10-25"]?.[0]?.hasOtherExceptions, true);
  assert.equal(output["2026-10-26"]?.[0]?.type, "ClosedToDeparture");
});

test("Does not treat out-of-range and unrecognized Mews rules as hotel closures", () => {
  const output = mapApplicableRestrictions([
    { Conditions: { Type: "ClosedToArrival", StartUtc: "2026-11-01T04:00:00Z" } },
    { Conditions: { Type: "SomethingElse" } },
  ], "2026-10-23", "2026-10-27");
  assert.deepEqual(output, {});
});

test("Mews monthly durations are not inferred as fixed-night exceptions", () => {
  const output = mapApplicableRestrictions([{
    ...weekend,
    Exceptions: { MinLength: "P1M0DT0H0M0S", MaxLength: "P0M3DT0H0M0S" },
  }], "2026-10-23", "2026-10-24");
  assert.equal(output["2026-10-23"]?.[0]?.exceptionMinNights, undefined);
  assert.equal(output["2026-10-23"]?.[0]?.exceptionMaxNights, 3);
});

test("MinReservationCount is retained as an exception rather than reported as none", () => {
  const output = mapApplicableRestrictions([{
    ...weekend,
    Exceptions: {
      MinLength: "P0M2DT0H0M0S",
      MinReservationCount: 2,
    },
  }], "2026-10-23", "2026-10-24");
  assert.equal(output["2026-10-23"]?.[0]?.exceptionMinNights, 2);
  assert.equal(output["2026-10-23"]?.[0]?.hasOtherExceptions, true);
});

test("partial-day closures apply when they overlap local midnight-to-midnight interval", () => {
  const output = mapApplicableRestrictions([{
    Conditions: {
      Type: "ClosedToArrival",
      ResourceCategoryId: "room-c",
      StartUtc: "2026-10-23T16:00:00Z", // Fri noon Eastern, not midnight.
      EndUtc: "2026-10-24T01:00:00Z",   // Fri 9 PM Eastern.
      Days: ["Friday"],
    },
    Exceptions: {},
  }], "2026-10-22", "2026-10-25");

  assert.deepEqual(Object.keys(output), ["2026-10-23"]);
  assert.equal(output["2026-10-23"]?.[0]?.type, "ClosedToArrival");
});

test("restriction end at property-local midnight excludes following date", () => {
  const output = mapApplicableRestrictions([{
    Conditions: {
      Type: "ClosedToStay",
      StartUtc: "2026-10-23T18:00:00Z",
      EndUtc: "2026-10-24T04:00:00Z",
    },
    Exceptions: {},
  }], "2026-10-23", "2026-10-25");

  assert.deepEqual(Object.keys(output), ["2026-10-23"]);
});

test("partial-day overlap uses real local-day bounds across daylight saving change", () => {
  // Nov 1, 2026 is 25 hours long in America/New_York. The rule is active
  // during its final 30 minutes even though it is Nov 2 by UTC clock.
  const output = mapApplicableRestrictions([{
    Conditions: {
      Type: "ClosedToDeparture",
      StartUtc: "2026-11-02T04:30:00Z",
      EndUtc: "2026-11-02T05:30:00Z",
    },
    Exceptions: {},
  }], "2026-11-01", "2026-11-02");
  assert.equal(output["2026-11-01"]?.[0]?.type, "ClosedToDeparture");
  assert.equal(output["2026-11-02"]?.[0]?.type, "ClosedToDeparture");
});
