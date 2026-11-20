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

test("historical Storybook avoids the TS7-incompatible docgen TypeScript plugin", () => {
  assert.match(storybook, /reactDocgen: "react-docgen"/);
  assert.doesNotMatch(storybook, /reactDocgen: "react-docgen-typescript"/);
  assert.doesNotMatch(storybook, /reactDocgenTypescriptOptions/);
});

test("Storybook uses the supported TypeScript compiler with react-docgen", () => {
  const manifest = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  const lockfile = JSON.parse(readFileSync(new URL("../package-lock.json", import.meta.url), "utf8"));
  const declared: string = manifest.devDependencies.typescript;
  const installed: string = lockfile.packages["node_modules/typescript"].version;
  // Renovate bumps TypeScript; pinning a literal version here breaks CI on every
  // bump. Require the manifest and lockfile to agree on a real release instead.
  assert.match(declared, /^\d+\.\d+\.\d+$/);
  assert.equal(installed, declared, "lockfile TypeScript version must match the manifest");
  assert.match(storybook, /reactDocgen: "react-docgen"/);
});
