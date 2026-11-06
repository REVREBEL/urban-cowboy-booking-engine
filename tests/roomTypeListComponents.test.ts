import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const read = (path: string) =>
  readFileSync(new URL("../src/components/rooms/" + path, import.meta.url), "utf8");

test("BuildingIcon mirrors all Figma BuildingName variants and exact artwork geometry", () => {
  const source = read("BuildingIcon.tsx");
  for (const variant of [
    "Default",
    "Alpine",
    "SlideMountain",
    "Ralphs",
    "Chalet",
    "ForestHaus",
    "MountianViewHaus",
    "EstonianSauna",
    "Cabin",
    "OpasCabin",
  ]) {
    assert.match(source, new RegExp(variant));
  }
  assert.match(source, /w-\[283px\]/);
  assert.match(source, /h-\[144\.028px\]/);
  assert.match(source, /h-\[228\.762px\]/);
  assert.match(source, /size-full/);
});

test("BuildingDescription mirrors the Figma BuildingSection property contract", () => {
  const source = read("BuildingDescription.tsx");
  assert.match(source, /"StackedCenter"/);
  assert.match(source, /"Row"/);
  assert.match(source, /"StackedLeft"/);
  assert.match(source, /"Row Reverse"/);
  assert.match(source, /buildingIconSlot/);
  assert.match(source, /displayBuildingIcon/);
  assert.match(source, /w-\[894px\]/);
  assert.match(source, /w-\[400px\]/);
  assert.doesNotMatch(source, /tone\??:/);
});

test("RoomTypeCard preserves the two Figma states and RoomTypeImage slot", () => {
  const source = read("RoomTypeCard.tsx");
  assert.match(source, /"Default" \| "Focus"/);
  assert.match(source, /roomTypeImage\?: ReactNode/);
  assert.match(source, /h-\[345\.328px\]/);
  assert.match(source, /w-\[410px\]/);
  assert.match(source, /h-\[245\.328px\]/);
  assert.match(source, /w-\[368px\]/);
  assert.match(source, /size-full/);
});

test("RoomListItem preserves Default, Row, and Row Reverse Figma layouts", () => {
  const source = read("RoomListItem.tsx");
  assert.match(source, /"Default" \| "Row" \| "Row Reverse"/);
  assert.match(source, /w-\[1790px\]/);
  assert.match(source, /w-\[1330px\]/);
  assert.match(source, /gap-\[30px\]/);
  assert.match(source, /gap-\[40px\]/);
  assert.match(source, /roomTypes\.map/);
  assert.doesNotMatch(source, /ROOM_TYPE_GROUP_PRESENTATION/);
  assert.doesNotMatch(source, /ROOM_TYPE_GROUPS/);
});

test("RoomTypeList is the exact three-slot Figma composition", () => {
  const source = read("RoomTypeList.tsx");
  assert.match(source, /buildingGroup1: ReactNode/);
  assert.match(source, /buildingGroup2: ReactNode/);
  assert.match(source, /buildingGroup3: ReactNode/);
  assert.match(source, /w-\[2175px\]/);
  assert.match(source, /gap-\[60px\]/);
  assert.match(source, /overflow-clip/);
  assert.doesNotMatch(source, /groups\.map/);
});
