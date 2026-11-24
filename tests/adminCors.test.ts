// COW-84: the Worker's cross-origin CORS boundary is restricted to one admin
// origin and always allows credentials. The entrypoint uses bundler-style
// extensionless imports, so this test inspects its source (as other entrypoint
// tests do) rather than importing it into node:test.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../worker/index.ts", import.meta.url), "utf8");

test("CORS is limited to the approved admin origin", () => {
  assert.match(source, /ADMIN_ORIGIN = "https:\/\/urban-cowboy-admin\.revrebel\.workers\.dev"/);
  assert.match(source, /origin === ADMIN_ORIGIN/);
  assert.match(source, /origin !== ADMIN_ORIGIN\) return response/);
});

test("preflight and credentialed responses are configured", () => {
  assert.match(source, /request\.method === "OPTIONS"/);
  assert.match(source, /"Access-Control-Allow-Credentials": "true"/);
  assert.match(source, /"Access-Control-Allow-Origin": origin/);
  assert.match(source, /Vary: "Origin"/);
});
