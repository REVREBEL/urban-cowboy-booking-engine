import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const src = (file: string) =>
  readFileSync(new URL(`../src/${file}`, import.meta.url), "utf8");

test("Photo Journey header excludes the added hotel-name action", () => {
  const header = src("journey/PhotoJourneyHeader.tsx");
  assert.doesNotMatch(header, /Urban Cowboy · Catskills/);
  assert.match(header, /Booking progress/);
  assert.match(header, /booking\.goTo\(previous\[booking.step\]\)/);
});

test("Photo toolbar uses xsmall pills and a label-font sort selector", () => {
  const rooms = src("journey/PhotoRooms.tsx");
  const pill = src("components/ui/pill.tsx");
  const story = src("stories/components/ui/Pill.stories.tsx");

  assert.match(pill, /PillSize = "xsmall" \| "small" \| "default" \| "large"/);
  assert.match(pill, /xsmall:/);
  assert.match(rooms, /setBuilding\(b\)/);
  assert.match(rooms, /setView\(v\)/);
  assert.match(rooms, /setFeatures\(/);
  // Test sorting as a capability, not a particular select, menu, or toggle design.
  assert.match(rooms, /setSort\(/);
  assert.match(rooms, /"price-asc"/);
  assert.match(rooms, /"price-desc"/);
  assert.match(story, /\["xsmall", "small", "default", "large"\]/);
});

test("Photo headings specify 100% line height rather than leading-tight", () => {
  const files = [
    "journey/PhotoArrival.tsx",
    "journey/PhotoJournal.tsx",
    "journey/PhotoRooms.tsx",
    "journey/RoomPhotoTour.tsx",
    "journey/PhotoRateStep.tsx",
    "journey/PhotoExtrasStep.tsx",
    "journey/PhotoReviewGuest.tsx",
  ];
  for (const file of files) {
    const source = src(file);
    assert.doesNotMatch(source, /font-(?:headline|heading)\b[^"\n]*\bleading-tight\b/, file);
    // All explicit HTML headings using the display font should use leading-none.
    for (const match of source.matchAll(/<h[1-6]\s+className="([^"]+)"/g)) {
      if (match[1].includes("font-headline") || match[1].includes("font-heading")) {
        assert.match(match[1], /\bleading-none\b/, `${file}: heading lacks 100% leading`);
      }
    }
  }
});
