import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const read = (path: string) =>
  readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8");

test("Photo utility tokens are registered in the Tailwind v4 entry CSS", () => {
  const entry = read("index.css");
  assert.match(entry, /@import "tailwindcss";/);
  assert.equal((entry.match(/@import "tailwindcss";/g) ?? []).length, 1);
  assert.doesNotMatch(entry, /@tailwind utilities/);
  assert.doesNotMatch(entry, /@import "tailwindcss\/preflight"/);
  for (const token of [
    "--color-j-night", "--color-j-paper", "--color-j-ink",
    "--color-j-ember", "--color-j-moss", "--color-j-line",
    "--font-j-display", "--font-j-label", "--font-j-body",
  ]) {
    assert.ok(entry.includes(token), `Photo utility token missing: ${token}`);
  }
});

test("Photo CSS loads on arrival and its color variables are scoped to Photo layout", () => {
  const entry = read("main.tsx");
  const photo = read("styles/room-photo-tour.css");
  const app = read("App.tsx");
  assert.match(entry, /import "\.\/styles\/room-photo-tour\.css"/);
  assert.match(photo, /\.photo-journey\s*\{/);
  assert.match(photo, /--j-night:/);
  assert.match(photo, /--j-paper:/);
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
