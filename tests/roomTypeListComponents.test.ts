import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const read = (path: string) =>
  readFileSync(new URL("../src/components/rooms/" + path, import.meta.url), "utf8");

test("BuildingIcon mirrors all Figma BuildingName variants and artwork geometry", () => {
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
  assert.match(source, /w-70\.75/);
  assert.match(source, /h-\[144\.028px\]/);
  assert.match(source, /h-\[228\.762px\]/);
  assert.match(source, /size-full/);
  for (const color of ["Smoke", "Snow", "LakeForest", "Ash", "Alpine"]) {
    assert.match(source, new RegExp(`"${color}"`));
  }
  assert.match(source, /Smoke: "bg-smoke"/);
  assert.match(source, /Snow: "bg-\[var\(--paper-50\)\]"/);
  assert.match(source, /LakeForest: "bg-lake-forest"/);
  assert.match(source, /Ash: "bg-ash"/);
  assert.match(source, /Alpine: "bg-alpine-linen-fade"/);
  assert.match(source, /const colorClass = BUILDING_ICON_COLOR_CLASS\[color\]/);
  assert.match(source, /data-color=\{color\}/);
  assert.match(source, /WebkitMask/);
  assert.match(source, /role="img"/);
  assert.match(source, /aria-label=\{config\.label\}/);
});

test("BuildingDescription mirrors the compact Figma BuildingSection contract", () => {
  const source = read("BuildingDescription.tsx");
  assert.match(source, /"StackedCenter"/);
  assert.match(source, /"Row"/);
  assert.match(source, /"StackedLeft"/);
  assert.match(source, /"Row Reverse"/);
  assert.match(source, /buildingIconSlot/);
  assert.match(source, /displayBuildingIcon/);
  assert.match(source, /max-w-\[555px\]/);
  assert.match(source, /max-w-\[350px\]/);
  assert.match(source, /xl:flex-row/);
  assert.match(source, /gap-\[10px\]/);
  assert.match(source, /min-h-\[212px\]/);
  assert.match(source, /min-h-\[158px\]/);
  assert.match(source, /tracking-\[-2px\]/);
  assert.match(source, /tracking-\[1px\]/);
  assert.match(source, /font-family:Inter,sans-serif/);
  assert.match(source, /1378:17369/);
  assert.doesNotMatch(source, /w-\[894px\]/);
  assert.doesNotMatch(source, /w-\[400px\]/);
});

test("RoomTypeCard preserves the compact Figma geometry and states", () => {
  const source = read("RoomTypeCard.tsx");
  assert.match(source, /"Default" \| "Focus"/);
  assert.match(source, /roomTypeImage\?: ReactNode/);
  assert.match(source, /min-h-\[295\.5px\]/);
  assert.match(source, /w-full max-w-\[350px\]/);
  assert.match(source, /p-\[17\.073px\]/);
  assert.match(source, /aspect-\[314\.146\/209\.426\]/);
  assert.match(source, /max-w-\[314\.146px\]/);
  assert.match(source, /rounded-\[6\.829px\]/);
  assert.match(source, /gap-\[12\.805px\]/);
  assert.match(source, /text-\[20\.488px\]/);
  assert.match(source, /text-\[11\.951px\]/);
  assert.match(source, /text-\[13\.659px\]/);
  assert.match(source, /tracking-\[0\.6031px\]/);
  assert.match(source, /text-mist/);
  assert.match(source, /text-alpine-linen-fade/);
  assert.match(source, /flex-wrap/);
  assert.match(source, /break-words/);
  assert.match(source, /DEFAULT_ROOM_TYPE_IMAGE_SRC/);
  assert.match(source, /object-contain/);
});

test("RoomListItem preserves the updated Default, Row, and RowReverse layouts", () => {
  const source = read("RoomListItem.tsx");
  assert.match(source, /"Default"/);
  assert.match(source, /"Row"/);
  assert.match(source, /"RowReverse"/);
  assert.match(source, /"Row Reverse"/);
  assert.match(source, /const normalizedLayout = layout === "Row Reverse" \? "RowReverse" : layout/);
  assert.match(source, /max-w-\[1460px\]/);
  assert.match(source, /max-w-\[1542px\]/);
  assert.match(source, /max-w-\[350px\]/);
  assert.match(source, /gap-\[30px\]/);
  assert.match(source, /gap-\[20px\]/);
  assert.match(source, /gap-\[15px\]/);
  assert.match(source, /px-\[10px\]/);
  assert.match(source, /px-\[20px\]/);
  assert.match(source, /roomTypes\.map/);
  assert.match(source, /xl:flex-row/);
  assert.match(source, /1378:17281/);
  assert.match(source, /isRowReverse[\s\S]*xl:order-2/);
  assert.match(source, /isRowReverse[\s\S]*xl:order-1/);
  assert.match(source, /\{buildingPanel\}[\s\S]*\{list\}/);
  assert.doesNotMatch(source, /w-\[1790px\]/);
  assert.doesNotMatch(source, /w-\[1330px\]/);
});

test("RoomTypeList preserves the updated 1513px three-slot composition", () => {
  const source = read("RoomTypeList.tsx");
  assert.match(source, /buildingGroup1\?: ReactNode \| null/);
  assert.match(source, /buildingGroup2\?: ReactNode \| null/);
  assert.match(source, /buildingGroup3\?: ReactNode \| null/);
  assert.match(source, /DEFAULT_BUILDING_GROUP_1/);
  assert.match(source, /DEFAULT_BUILDING_GROUP_2/);
  assert.match(source, /DEFAULT_BUILDING_GROUP_3/);
  assert.match(source, /w-full max-w-\[1513px\]/);
  assert.match(source, /gap-\[60px\]/);
  assert.match(source, /\{buildingGroup1 \?\? DEFAULT_BUILDING_GROUP_1\}/);
  assert.match(source, /\{buildingGroup2 \?\? DEFAULT_BUILDING_GROUP_2\}/);
  assert.match(source, /\{buildingGroup3 \?\? DEFAULT_BUILDING_GROUP_3\}/);
  assert.match(source, /<BuildingIcon buildingName="Alpine" \/>/);
  assert.match(source, /overflow-clip/);
  assert.doesNotMatch(source, /w-\[2175px\]/);
});
