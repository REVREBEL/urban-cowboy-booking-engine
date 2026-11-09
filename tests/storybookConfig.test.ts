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

test("Storybook uses the supported TypeScript compiler with react-docgen", () => {
  const manifest = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  const lockfile = JSON.parse(readFileSync(new URL("../package-lock.json", import.meta.url), "utf8"));
  assert.equal(manifest.devDependencies.typescript, "6.0.3");
  assert.equal(lockfile.packages["node_modules/typescript"].version, "6.0.3");
  assert.match(storybook, /reactDocgen: "react-docgen-typescript"/);
});
