import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/components/booking/search/SearchBarGuestsDropdown.tsx", import.meta.url), "utf8");

test("guest dropdown provides focus, Escape dismissal, and focus restoration", () => {
  assert.match(source, /dialogRef\.current\?\.focus\(\)/);
  assert.match(source, /triggerRef\.current\?\.isConnected/);
  assert.match(source, /event\.key === 'Escape'/);
  assert.match(source, /event\.stopPropagation\(\)/);
  assert.match(source, /focus-visible:outline-2/);
});
