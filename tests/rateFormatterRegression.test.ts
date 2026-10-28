import assert from "node:assert/strict";
import test from "node:test";
import { toPropertyUtc } from "../src/lib/format.ts";
import { formatRateCardPrice } from "../src/lib/rateCardLiveContent.ts";

test("cached property formatter uses the midnight offset before and after both DST transitions", () => {
  for (const [date, expected] of [
    ["2027-03-13", "2027-03-13T05:00:00.000Z"],
    ["2027-03-14", "2027-03-14T05:00:00.000Z"],
    ["2027-03-15", "2027-03-15T04:00:00.000Z"],
    ["2027-11-06", "2027-11-06T04:00:00.000Z"],
    ["2027-11-07", "2027-11-07T04:00:00.000Z"],
    ["2027-11-08", "2027-11-08T05:00:00.000Z"],
  ].reverse()) {
    assert.equal(toPropertyUtc(date), expected);
  }
});

test("property formatter cache isolates time zones on interleaved calls", () => {
  for (let repeat = 0; repeat < 2; repeat++) {
    assert.equal(toPropertyUtc("2027-03-15", "America/New_York"), "2027-03-15T04:00:00.000Z");
    assert.equal(toPropertyUtc("2027-03-15", "Asia/Tokyo"), "2027-03-14T15:00:00.000Z");
    assert.equal(toPropertyUtc("2027-03-15", "America/Los_Angeles"), "2027-03-15T07:00:00.000Z");
    assert.equal(toPropertyUtc("2027-03-15", "UTC"), "2027-03-15T00:00:00.000Z");
  }
  assert.equal(toPropertyUtc(""), "");
  assert.equal(toPropertyUtc("2027-03-15T04:00:00Z"), "2027-03-15T04:00:00Z");
});

test("currency cache preserves explicit whole/fractional displays when currencies alternate", () => {
  const cache = new Map<string, Intl.NumberFormat>();
  const cases: [string, number, string][] = [
    ["USD", 1234, "$1,234"], ["USD", 1234.5, "$1,234.50"],
    ["EUR", 1234, "€1,234"], ["EUR", 1234.5, "€1,234.50"],
    ["GBP", 1234, "£1,234"], ["GBP", 1234.5, "£1,234.50"],
    ["CAD", 1234, "CA$1,234"], ["CAD", 1234.5, "CA$1,234.50"],
    // Preserve the UI's explicit 0/2 precision even for currencies with other defaults.
    ["JPY", 1234, "¥1,234"], ["JPY", 1234.5, "¥1,234.50"],
    ["KWD", 1234, "KWD 1,234"], ["KWD", 1234.5, "KWD 1,234.50"],
    ["CHF", 1234, "CHF 1,234"], ["CHF", 1234.5, "CHF 1,234.50"],
  ];
  for (const [currency, amount, expected] of [...cases, ...cases.toReversed()]) {
    assert.equal(formatRateCardPrice(currency, amount, cache), expected);
  }
  assert.equal(cache.size, 14);
});

test("currency cache reuses instances without retaining the previous amount", () => {
  const cache = new Map<string, Intl.NumberFormat>();
  assert.equal(formatRateCardPrice("USD", 10, cache), "$10");
  const whole = cache.get("USD:0");
  assert.ok(whole);
  assert.equal(formatRateCardPrice("USD", 10.5, cache), "$10.50");
  const fractional = cache.get("USD:2");
  assert.ok(fractional);
  assert.notEqual(whole, fractional);
  for (const [amount, expected] of [
    [0, "$0"], [-12, "-$12"], [1234, "$1,234"],
    [-12.5, "-$12.50"], [1.005, "$1.01"], [0.004, "$0.00"],
  ] as const) {
    assert.equal(formatRateCardPrice("USD", amount, cache), expected);
  }
  assert.equal(cache.get("USD:0"), whole);
  assert.equal(cache.get("USD:2"), fractional);
  assert.equal(cache.size, 2);
});
