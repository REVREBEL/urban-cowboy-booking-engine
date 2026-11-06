import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const booking = readFileSync(new URL("../src/state/booking.tsx", import.meta.url), "utf8");
const storybook = readFileSync(new URL("../.storybook/main.ts", import.meta.url), "utf8");

test("booking URL synchronization retains Storybook story selection and controls", () => {
  assert.match(booking, /pathname\.endsWith\("\/iframe\.html"\)/);
  for (const key of ["id", "viewMode", "args", "globals"]) {
    assert.match(booking, new RegExp('"' + key + '"'));
  }
  assert.match(booking, /current\.getAll\(key\)/);
  assert.match(booking, /q\.append\(key, value\)/);
});

test("storybook docgen includes inherited public React and HTML props", () => {
  assert.match(storybook, /reactDocgen: "react-docgen-typescript"/);
  assert.match(storybook, /propFilter: \(\) => true/);
});
