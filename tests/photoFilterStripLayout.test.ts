import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const rooms = readFileSync(new URL("../src/journey/PhotoRooms.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../src/styles/room-photo-tour.css", import.meta.url), "utf8");

test("Buildings and features use independent, equally wide scroll containers", () => {
  assert.match(rooms, /useHorizontalFilterStrip\(buildings\.join\("\|"\)\)/);
  assert.match(rooms, /useHorizontalFilterStrip\("feature-options"\)/);
  assert.match(rooms, /j-photo-filter-pair/);
  assert.match(styles, /grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(styles, /\.j-photo-filter-segment\s*\{[^}]*min-width:\s*0/);
  assert.match(styles, /\.j-photo-filter-strip\s*\{[^}]*white-space:\s*nowrap/);
});

test("Both filter strips expose their own enabled/disabled scroll arrows", () => {
  for (const section of ["buildings", "features"]) {
    const strip = section === "buildings" ? "buildingStrip" : "featureStrip";
    for (const [direction, edge, numeric] of [["left", "left", "-1"], ["right", "right", "1"]] as const) {
      assert.match(rooms, new RegExp(`aria-label="Scroll ${section} ${direction}"[\\s\\S]*?disabled=\\{!${strip}\\.edges\\.${edge}\\}[\\s\\S]*?onClick=\\{\\(\\) => ${strip}\\.scroll\\(${numeric === "-1" ? "-1" : "1"}\\)\\}`));
    }
  }
  assert.match(rooms, /<PhotoTourArrow direction="left" size=\{16\} \/>/);
  assert.match(rooms, /<PhotoTourArrow direction="right" size=\{16\} \/>/);
});

test("Scroll controls react to resizing, font loading and actual horizontal position", () => {
  assert.match(rooms, /new ResizeObserver\(update\)/);
  assert.match(rooms, /observer\.observe\(element\)/);
  assert.match(rooms, /observer\.observe\(child\)/);
  assert.match(rooms, /element\.scrollWidth - element\.clientWidth - element\.scrollLeft > 2/);
  assert.match(rooms, /onScroll=\{buildingStrip\.update\}/);
  assert.match(rooms, /onScroll=\{featureStrip\.update\}/);
});

test("Building and feature filtering, sorting, and mobile filters are retained", () => {
  assert.match(rooms, /setBuilding\(b\)/);
  assert.match(rooms, /setFeatures\(on \? features\.filter/);
  assert.match(rooms, /<select id="sort"/);
  assert.match(rooms, /sheetOpen/);
  assert.match(rooms, /const measure = \(\) => stage\.style\.setProperty\('--j-room-top'/);
});
