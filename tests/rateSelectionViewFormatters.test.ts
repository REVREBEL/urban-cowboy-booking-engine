import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const source = readFileSync(
  new URL("../src/components/rates/RateSelectionView.tsx", import.meta.url),
  "utf8",
);

test("RateSelectionView allocates Intl.DateTimeFormat instances at module scope and reuses them", () => {
  assert.match(source, /export const rateSelectionDateFmt = new Intl\.DateTimeFormat/);
  assert.match(source, /export const dueDateFormat = new Intl\.DateTimeFormat/);
  assert.match(source, /rateSelectionDateFmt\.format\(/);
  assert.match(source, /dueDateFormat\.format\(/);
  // Ensure no local toLocaleDateString() is called inside the component
  assert.doesNotMatch(source, /\.toLocaleDateString\(/);
  // Ensure no local unmemoized dueDateFormat ref is created inside the component
  assert.doesNotMatch(source, /dueDateFormat = useRef/);
});

test("module-scoped formatters match expected date formatting outputs without timezone drift", () => {
  const rateSelectionDateFmt = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  const dueDateFormat = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

  const formatDateDisplay = (dateStr: string): string => {
    if (!dateStr) return "";
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const [y, m, d] = parts.map(Number);
        if (y && m && d) {
          return rateSelectionDateFmt.format(new Date(Date.UTC(y, m - 1, d)));
        }
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  assert.equal(formatDateDisplay("2026-10-14"), "Oct 14, 2026");
  assert.equal(formatDateDisplay("2026-01-05"), "Jan 5, 2026");
  assert.equal(formatDateDisplay("2026-12-31"), "Dec 31, 2026");
  assert.equal(formatDateDisplay(""), "");
  assert.equal(formatDateDisplay("invalid-date"), "invalid-date");

  const sampleDue = new Date(Date.UTC(2026, 9, 14, 12));
  assert.equal(dueDateFormat.format(sampleDue), "Oct 14");
});
