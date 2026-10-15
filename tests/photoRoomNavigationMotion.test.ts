import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const source = (file: string) =>
  readFileSync(new URL(`../src/${file}`, import.meta.url), "utf8");

test("Room arrows animate vertical transitions at an even cadence and respect fixed toolbar offsets", () => {
  const rooms = source("journey/PhotoRooms.tsx");
  assert.match(rooms, /const visitRoom = \(index: number\) => \{/);
  assert.match(rooms, /getComputedStyle\(section\)\.scrollMarginTop/);
  assert.match(rooms, /const duration = 1250/);
  assert.match(rooms, /requestAnimationFrame\(animate\)/);
  assert.match(rooms, /window\.scrollTo\(\{ top: start \+ \(end - start\) \* progress, behavior: "instant" \}\)/);
  assert.match(rooms, /onPrevious=\{i > 0 \? \(\) => visitRoom\(i - 1\) : undefined\}/);
  assert.match(rooms, /onNext=\{i < list\.length - 1 \? \(\) => visitRoom\(i \+ 1\) : undefined\}/);
});

test("Navigation respects reduced-motion and interrupts scrolling when the guest starts a new gesture", () => {
  const rooms = source("journey/PhotoRooms.tsx");
  const tour = source("journey/RoomPhotoTour.tsx");
  assert.match(rooms, /matchMedia\("\(prefers-reduced-motion: reduce\)"\)/);
  assert.match(rooms, /section\.scrollIntoView\(\{ behavior: "instant", block: "start" \}\)/);
  assert.match(rooms, /window\.cancelAnimationFrame\(roomScrollFrame\.current\)/);
  assert.match(rooms, /window\.addEventListener\("wheel", onWheel/);
  assert.match(rooms, /window\.addEventListener\("touchstart", cancelRoomScroll/);
  assert.match(tour, /duration: 52/);
  assert.match(tour, /carousel\?\.scrollNext\(jump\)/);
  assert.match(tour, /carousel\?\.scrollPrev\(jump\)/);
  assert.match(tour, /carousel\?\.scrollTo\(index, window\.matchMedia/);
});

test("The Buildings and Features arrows disappear at non-scrollable edges without resizing filters", () => {
  const rooms = source("journey/PhotoRooms.tsx");
  const css = source("styles/room-photo-tour.css");
  for (const strip of ["buildingStrip", "featureStrip"]) {
    for (const edge of ["left", "right"]) {
      assert.ok(rooms.includes(`!${strip}.edges.${edge} ? "is-hidden" : ""`));
      assert.ok(rooms.includes(`disabled={!${strip}.edges.${edge}}`));
    }
  }
  assert.match(css, /\.j-photo-filter-nav\.is-hidden \{ visibility: hidden; pointer-events: none; \}/);
  assert.match(css, /\.j-photo-filter-nav \{ flex: none; \}/);
  assert.match(css, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(rooms, /onScroll=\{buildingStrip\.update\}/);
  assert.match(rooms, /onScroll=\{featureStrip\.update\}/);
});
