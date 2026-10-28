import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/components/rooms/SideFocusAmenityBar.tsx", import.meta.url), "utf8");

test("amenity panel uses per-instance IDs with a persistent trigger and panel", () => {
  assert.match(source, /const id = useId\(\)/);
  assert.match(source, /id=\{triggerId\}/);
  assert.match(source, /aria-controls=\{panelId\}/);
  assert.match(source, /aria-expanded=\{expanded\}/);
  assert.match(source, /id=\{panelId\}/);
  assert.match(source, /hidden=\{!expanded\}/);
  assert.doesNotMatch(source, /id="side-amenities-(trigger|panel)"/);
});

test("Escape is captured before the parent detail view and focus is restored", () => {
  assert.match(source, /addEventListener\("keydown", handleKeyDown, true\)/);
  assert.match(source, /removeEventListener\("keydown", handleKeyDown, true\)/);
  assert.match(source, /event\.stopImmediatePropagation\(\)/);
  assert.match(source, /triggerRef\.current\?\.focus\(\)/);
  assert.match(source, /restoreFocusRef\.current = true/);
});
