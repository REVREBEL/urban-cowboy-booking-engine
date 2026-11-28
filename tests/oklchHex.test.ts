// The Colors page derives its swatch hex labels from the resolved OKLCH tokens.
import assert from "node:assert/strict";
import test from "node:test";
import { oklchToHex } from "../docs-app/lib/oklch-hex.ts";

test("resolved OKLCH tokens convert to display hex", () => {
  assert.equal(oklchToHex("oklch(27.726% 0.05667 152.427)"), "#0e301a");
  assert.equal(oklchToHex("oklch(98.2% 0.00 11.251)"), "#f9f9f9");
  assert.equal(oklchToHex("oklch(100% 0 0)"), "#ffffff");
  assert.equal(oklchToHex("oklch(0% 0 0)"), "#000000");
});

test("unresolved values pass through unchanged", () => {
  assert.equal(oklchToHex("var(--paper-500)"), "var(--paper-500)");
});
