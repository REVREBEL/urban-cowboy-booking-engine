import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { posix } from "node:path";

const read = (path: string) =>
  readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8");


const cssEntry = "styles/index.css";

// Resolve first-party stylesheet imports recursively, without expanding Tailwind itself.
const importedCss = (path: string, visited = new Set<string>()): string => {
  if (visited.has(path)) return "";
  visited.add(path);
  const css = read(path);
  const importedPaths = [...css.matchAll(/@import\s+["'](\.\/[^"']+\.css)["']/g)]
    .map((match) => posix.normalize(posix.join(posix.dirname(path), match[1])));
  return [css, ...importedPaths.map((child) => importedCss(child, visited))].join("\n");
};

test("Photo utility tokens are registered in the Tailwind v4 entry CSS", () => {
  const entry = read(cssEntry);
  const combined = importedCss(cssEntry);
  assert.match(entry, /@import "tailwindcss";/);
  assert.equal((entry.match(/@import "tailwindcss";/g) ?? []).length, 1);
  assert.doesNotMatch(entry, /@tailwind utilities/);
  assert.doesNotMatch(entry, /@import "tailwindcss\/preflight"/);
  for (const token of [
    "--color-smoke", "--color-paper", "--color-foreground",
    "--color-alpine-linen", "--color-lake-forest-fade", "--color-ash",
    "--font-heading", "--font-label", "--font-body",
  ]) {
    assert.ok(combined.includes(token), `Photo utility token missing: ${token}`);
  }
});

test("Photo CSS loads on arrival and its color variables are scoped to Photo layout", () => {
  const entry = read("main.tsx");
  const photo = read("styles/room-photo-tour.css");
  const palette = importedCss(cssEntry);
  const app = read("App.tsx");
  assert.match(entry, /import "\.\/styles\/index\.css"/);
  assert.match(entry, /import "\.\/styles\/room-photo-tour\.css"/);
  assert.match(photo, /\.photo-journey\s*\{/);
  for (const token of ["--smoke:", "--paper:"]) {
    assert.ok(photo.includes(token) || palette.includes(token), "Missing Photo color token: " + token);
  }
  assert.match(photo, /\.j-room-tour/);
  assert.match(photo, /\.j-journey-header/);
  assert.match(app, /photo-journey flex min-h-dvh/);
});

test("Photo screens contain no invalid legacy palette utility names", () => {
  for (const file of [
    "App.tsx", "steps/Results.tsx", "journey/PhotoArrival.tsx",
    "journey/PhotoJournal.tsx", "journey/PhotoRooms.tsx",
    "journey/PhotoRateStep.tsx", "journey/PhotoExtrasStep.tsx",
    "journey/PhotoReviewGuest.tsx",
  ]) {
    const source = read(file);
    for (const pattern of [/text--paper\b/, /bg--paper\b/, /border--paper\b/, /outline--paper\b/]) {
      assert.doesNotMatch(source, pattern, `Unregistered Photo utility in ${file}`);
    }
  }
});
