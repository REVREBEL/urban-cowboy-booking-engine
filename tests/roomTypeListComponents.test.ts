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
  assert.match(source, /"Smoke" \|/);
  assert.match(source, /"Snow"/);
  assert.match(source, /"LakeForest"/);
  assert.match(source, /"Ash"/);
  assert.match(source, /"Alpine"/);
  assert.match(source, /BUILDING_ICON_COLOR_CLASS/);
  assert.match(source, /data-color=\{color\}/);
  assert.match(source, /bg-smoke/);
  assert.match(source, /WebkitMask/);
  assert.match(source, /role="img"/);
  assert.match(source, /aria-label=\{config\.label\}/);
  assert.doesNotMatch(source, /decorative\?:/);
  assert.doesNotMatch(source, /loading\?:/);
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
  assert.match(source, /tracking-\[-2px\]/);
  assert.match(source, /tracking-\[1px\]/);
  assert.match(source, /font-family:Inter,sans-serif/);
  assert.match(source, /<h2/);
  assert.match(source, /if \(!displayBuildingIcon\)/);
  assert.match(source, /flex w-\[894px\] items-end/);
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
  assert.match(source, /DEFAULT_ROOM_TYPE_IMAGE_SRC/);
  assert.match(source, /object-contain/);
  assert.match(source, /buildingName: string/);
  assert.match(source, /numberOfBeds: string/);
  assert.match(source, /price: string/);
  assert.match(source, /roomTypeName: string/);
  assert.match(source, /<article/);
  assert.match(source, /<h3/);
  assert.match(source, /text-alpine-linen-fade/);
  assert.doesNotMatch(source, /text-\[#e2e2e1\]/);
});

test("RoomListItem preserves Default, Row, and Row Reverse Figma layouts", () => {
  const source = read("RoomListItem.tsx");
  assert.match(source, /"Default" \| "Row" \| "Row Reverse"/);
  assert.match(source, /w-\[1790px\]/);
  assert.match(source, /w-\[1330px\]/);
  assert.match(source, /gap-\[30px\]/);
  assert.match(source, /gap-\[40px\]/);
  assert.match(source, /roomTypes\.map/);
  assert.match(source, /const buildingContent = buildingSectionSlot/);
  assert.match(
    source,
    /\{isRowReverse \? list : buildingPanel\}[\s\S]*\{isDefault \? list : isRow \? list : buildingPanel\}/,
  );
  assert.doesNotMatch(source, /<BuildingDescription/);
  assert.doesNotMatch(source, /ROOM_TYPE_GROUP_PRESENTATION/);
  assert.doesNotMatch(source, /ROOM_TYPE_GROUPS/);
});

test("RoomTypeList is the exact three-slot Figma composition", () => {
  const source = read("RoomTypeList.tsx");
  assert.match(source, /buildingGroup1\?: ReactNode \| null/);
  assert.match(source, /buildingGroup2\?: ReactNode \| null/);
  assert.match(source, /buildingGroup3\?: ReactNode \| null/);
  assert.match(source, /DEFAULT_BUILDING_GROUP_1/);
  assert.match(source, /DEFAULT_BUILDING_GROUP_2/);
  assert.match(source, /DEFAULT_BUILDING_GROUP_3/);
  assert.match(source, /\{buildingGroup1 \?\? DEFAULT_BUILDING_GROUP_1\}/);
  assert.match(source, /\{buildingGroup2 \?\? DEFAULT_BUILDING_GROUP_2\}/);
  assert.match(source, /\{buildingGroup3 \?\? DEFAULT_BUILDING_GROUP_3\}/);
  assert.match(source, /w-\[2175px\]/);
  assert.match(source, /gap-\[60px\]/);
  assert.match(source, /overflow-clip/);
  assert.doesNotMatch(source, /groups\.map/);
});
