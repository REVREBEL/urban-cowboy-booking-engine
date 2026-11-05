import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const read = (path: string) =>
  readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8");

test("FocusAmenityCard preserves the Figma geometry on project tokens", () => {
  const source = read("components/rooms/FocusAmenityCard.tsx");
  assert.match(source, /max-w-\[405px\]/);
  assert.match(source, /px-\[35px\]/);
  assert.match(source, /py-\[30px\]/);
  assert.match(source, /rounded-\[11\.06px\]/);
  assert.match(source, /font-heading/);
  assert.match(source, /text-accent/);
  assert.match(source, /font-body/);
  assert.match(source, /text-secondary/);
});

test("SideBarFocusAmenity reuses FocusAmenityCard for selected amenity details", () => {
  const source = read("components/rooms/SideBarFocusAmenity.tsx");
  assert.match(source, /import \{ FocusAmenityCard \} from "\.\/FocusAmenityCard"/);
  assert.match(source, /<FocusAmenityCard/);
  assert.match(source, /headline=\{selected\.title\}/);
  assert.match(source, /description=\{selected\.description\}/);
});
