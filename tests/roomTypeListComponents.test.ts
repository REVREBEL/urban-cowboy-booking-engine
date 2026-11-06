import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const read = (path: string) =>
  readFileSync(new URL("../src/components/rooms/" + path, import.meta.url), "utf8");

test("BuildingIcon uses the canonical buildings asset registry and Figma geometry", () => {
  const source = read("BuildingIcon.tsx");
  assert.match(source, /ROOM_TYPE_GROUP_PRESENTATION/);
  assert.match(source, /h-\[154\.88px\]/);
  assert.match(source, /w-\[283px\]/);
});

test("BuildingDescription uses Cowboy typography tokens", () => {
  const source = read("BuildingDescription.tsx");
  assert.match(source, /font-heading/);
  assert.match(source, /font-body/);
  assert.match(source, /font-label/);
  assert.match(source, /text-\[48px\]/);
});

test("RoomTypeCard preserves Figma card geometry and Tailwind 4 sizing", () => {
  const source = read("RoomTypeCard.tsx");
  assert.match(source, /h-\[345\.328px\]/);
  assert.match(source, /w-\[410px\]/);
  assert.match(source, /h-\[245\.328px\]/);
  assert.match(source, /w-\[368px\]/);
  assert.match(source, /font-number/);
  assert.match(source, /size-full/);
  assert.doesNotMatch(source, /w-full h-full/);
});

test("RoomListItem renders room cards from the collection rather than fixed slots", () => {
  const source = read("RoomListItem.tsx");
  assert.match(source, /roomTypes\.map/);
  assert.match(source, /<RoomTypeCard/);
  assert.match(source, /<BuildingIcon/);
  assert.match(source, /<BuildingDescription/);
});

test("RoomTypeList renders building groups from its collection", () => {
  const source = read("RoomTypeList.tsx");
  assert.match(source, /groups\.map/);
  assert.match(source, /<RoomListItem/);
  assert.match(source, /max-w-\[2175px\]/);
  assert.match(source, /gap-\[60px\]/);
});
