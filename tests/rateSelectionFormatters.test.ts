import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fmtDate, fmtMonthDay } from "../src/lib/format.ts";

test("shared date helpers return the production RateSelectionView display values and reuse formatters", () => {
  const OriginalDateTimeFormat = Intl.DateTimeFormat;
  let constructions = 0;

  const CountingDateTimeFormat = new Proxy(OriginalDateTimeFormat, {
    construct(target, args) {
      constructions += 1;
      return Reflect.construct(target, args);
    },
  });

  Object.defineProperty(Intl, "DateTimeFormat", {
    configurable: true,
    value: CountingDateTimeFormat,
  });

  try {
    assert.equal(
      fmtDate("2026-10-14", { locale: "en-US" }),
      "Oct 14, 2026",
    );
    assert.equal(
      fmtDate("2026-10-15", { locale: "en-US" }),
      "Oct 15, 2026",
    );
    assert.equal(
      fmtMonthDay("2026-10-10T12:00:00.000Z", { locale: "en-US" }),
      "Oct 10",
    );
    assert.equal(
      fmtMonthDay("2026-10-09T12:00:00.000Z", { locale: "en-US" }),
      "Oct 9",
    );

    assert.equal(
      constructions,
      2,
      "one cached Intl.DateTimeFormat should be created per shared format shape",
    );
  } finally {
    Object.defineProperty(Intl, "DateTimeFormat", {
      configurable: true,
      value: OriginalDateTimeFormat,
    });
  }
});

test("RateSelectionView consumes the shared formatter cache", () => {
  const source = readFileSync(
    new URL("../src/components/rates/RateSelectionView.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /import \{ fmtDate, fmtMonthDay \} from '\.\.\/\.\.\/lib\/format'/);
  assert.match(source, /fmtDate\(dateStr, \{ locale: 'en-US' \}\)/);
  assert.match(source, /Number\.isFinite\(due\.getTime\(\)\)/);
  assert.match(source, /fmtMonthDay\(due\.toISOString\(\), \{ locale: 'en-US' \}\)/);
  assert.doesNotMatch(source, /new Intl\.DateTimeFormat/);
  assert.doesNotMatch(source, /toLocaleDateString/);
  assert.doesNotMatch(source, /dueDateFormat/);
});
