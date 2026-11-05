import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/components/booking/search/SearchBarPromoDropdown.tsx", import.meta.url), "utf8");

test("promo dropdown provides focus, Escape dismissal with stopPropagation, and focus restoration", () => {
  assert.match(source, /inputRef\.current\?\.focus\(\)/);
  assert.match(source, /triggerRef\.current\?\.isConnected/);
  assert.match(source, /triggerRef\.current\.focus\(\)/);
  assert.match(source, /e\.key === 'Escape'/);
  assert.match(source, /e\.stopPropagation\(\)/);
  assert.match(source, /role="dialog"/);
  assert.match(source, /focus-visible:outline-2/);
});
