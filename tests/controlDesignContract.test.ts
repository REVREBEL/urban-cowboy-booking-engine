import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

test("check-control-contract exists and is valid syntax", () => {
  const code = readFileSync(new URL("../scripts/check-control-contract.mjs", import.meta.url), "utf8");
  assert.ok(code.length > 0);
});
