import assert from "node:assert/strict";
import test from "node:test";
import { buildRoomCardPills } from "../src/lib/roomCardPills.ts";
import { merchandisingForKey } from "../src/lib/roomMerchandising.ts";
import type { ShapedRoom } from "../src/types/mews.ts";

function room(
  key: string,
  overrides: Partial<ShapedRoom> = {},
): ShapedRoom {
  const merchandising = merchandisingForKey(key);
  assert.ok(merchandising, `Missing merchandising fixture: ${key}`);

  return {
    categoryId: `category-${key}`,
    name: merchandising.legacyNames[0],
    description: "",
    imageIds: [],
    normalBedCount: 1,
    extraBedCount: 0,
    spaceType: "Room",
    availableRoomCount: 8,
    capacity: 2,
    rates: [],
    fromGross: null,
    property: null,
    merchandising,
    merchandisingSource: "categoryId",
    ...overrides,
  };
}

test("room card pills use Mews bed counts and do not infer guest capacity", () => {
  const pills = buildRoomCardPills(
    room("cabin", {
      normalBedCount: 2,
      extraBedCount: 1,
      capacity: 7,
    }),
  );

  assert.equal(pills.find((pill) => pill.key === "beds")?.label, "2 Beds + 1 Extra");
  assert.equal(
    pills.some((pill) => /guest|sleep/i.test(pill.label)),
    false,
  );
});

test("low availability comes from Mews inventory", () => {
  const pills = buildRoomCardPills(
    room("cabin", {
      availableRoomCount: 2,
    }),
  );

  const availability = pills.find((pill) => pill.key === "availability");
  assert.equal(availability?.label, "Only 2 Left");
  assert.equal(availability?.source, "mews");
  assert.equal(availability?.emphasis, "highlight");
});

test("dog and age pills come from Cowboy merchandising policy", () => {
  const pills = buildRoomCardPills(room("alpine-bathing-suite"));

  assert.equal(pills.find((pill) => pill.key === "dog")?.label, "Dogs Welcome");
  assert.equal(pills.find((pill) => pill.key === "21plus")?.label, "21+ Only");
  assert.equal(pills.find((pill) => pill.key === "dog")?.source, "cowboy");
});

test("unknown dog policy and unrestricted age do not invent positive policy claims", () => {
  const pills = buildRoomCardPills(
    room("mountain-view-haus-2-bedroom", {
      availableRoomCount: 8,
    }),
  );

  assert.equal(pills.some((pill) => pill.key === "dog"), false);
  assert.equal(pills.some((pill) => pill.key === "21plus"), false);
  assert.equal(pills.some((pill) => /family friendly/i.test(pill.label)), false);
});

test("merchandising feature flags populate feature pills", () => {
  const pills = buildRoomCardPills(room("chalet"));
  const labels = pills.map((pill) => pill.label);

  assert.ok(labels.includes("Outdoor Soak"));
  assert.ok(labels.includes("Private Deck"));
  assert.ok(labels.includes("Scenic Views"));
  assert.ok(labels.includes("Fireplace"));
  assert.ok(labels.includes("Full Kitchen"));
  assert.ok(labels.includes("Heated Floors"));
});
