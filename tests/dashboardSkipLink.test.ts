// COW-37 skip-link keyboard behavior without router-hash mutation.
import assert from "node:assert/strict";
import test from "node:test";
import { activateSkipLink } from "../src/dashboard/skipLink.ts";

test("activates the skip link by preventing navigation and focusing main", () => {
  let prevented = 0;
  let focused = 0;
  const main = { focus: () => { focused += 1; } };

  activateSkipLink({ preventDefault: () => { prevented += 1; } }, main);

  assert.equal(prevented, 1);
  assert.equal(focused, 1);
});

test("still prevents navigation when the main landmark is unavailable", () => {
  let prevented = 0;
  activateSkipLink({ preventDefault: () => { prevented += 1; } }, null);
  assert.equal(prevented, 1);
});
