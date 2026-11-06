import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { money } from "../src/lib/format.ts";

const source = readFileSync(
  new URL("../src/components/rates/ProductionRateTray.tsx", import.meta.url),
  "utf8",
);

test("rate tray currency formatting preserves en-US display through the cached helper", () => {
  assert.equal(money(1234, "USD", { locale: "en-US" }), "$1,234");
  assert.equal(money(1234.5, "USD", { locale: "en-US" }), "$1,234.50");
  assert.equal(money(1234.5, "EUR", { locale: "en-US" }), "€1,234.50");
  const card = readFileSync(new URL("../src/components/rates/FigmaRateComponents.tsx", import.meta.url), "utf8");
  assert.match(card, /currencyMoney\(amount, currency, \{ locale: "en-US", decimals: 2 \}\)/);
});

test("rate tray date formatters are allocated at module scope and reused", () => {
  assert.match(source, /const rateSelectionHeadingFmt = new Intl\.DateTimeFormat/);
  assert.match(source, /rateSelectionHeadingFmt\.format\(date\)/);
  assert.match(source, /const propertyTodayFmt = new Intl\.DateTimeFormat/);
  assert.match(source, /propertyTodayFmt\.formatToParts\(new Date\(\)\)/);
});
