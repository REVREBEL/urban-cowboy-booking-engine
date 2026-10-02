import assert from "node:assert/strict";
import test from "node:test";
import { rankRecommendedRooms } from "../src/lib/roomMatching.ts";
import { merchandisingForKey } from "../src/lib/roomMerchandising.ts";
import type { ShapedRoom } from "../src/types/mews.ts";

function room(key: string, price = 500): ShapedRoom {
  const merchandising = merchandisingForKey(key);
  assert.ok(merchandising, `Missing merchandising fixture: ${key}`);
  return {
    roomTypeId: `room-type-${key}`,
    categoryId: `room-type-${key}`,
    name: merchandising.legacyNames[0],
    description: "",
    imageIds: [],
    normalBedCount: 1,
    extraBedCount: 0,
    roomClass: "Room",
    spaceType: "Room",
    availableRoomCount: 1,
    capacity: 2,
    rates: [],
    fromGross: price,
    property: null,
    merchandising,
    merchandisingSource: "mewsRoomTypeId",
  };
}

test("single-interest Outdoor Soak follows the documented fallback ladder", () => {
  const rooms = [
    room("chalet", 300),
    room("walden-forest-bathing-suite-den", 200),
    room("walden-sunrise-bathing-suite", 250),
    room("walden-forest-bathing-suite", 400),
  ];
  const ranked = rankRecommendedRooms(
    rooms,
    { party: "partner", dog: false, interests: ["outdoorSoak"] },
    { children: 0, infants: 0 },
  );

  assert.deepEqual(
    ranked.map((r) => r.merchandising?.key),
    [
      "walden-forest-bathing-suite",
      "walden-sunrise-bathing-suite",
      "walden-forest-bathing-suite-den",
      "chalet",
    ],
  );
});

test("dog requested is a hard filter and unknown dog policy is not treated as eligible", () => {
  const rooms = [
    room("walden-forest-bathing-suite"),
    room("walden-sunrise-bathing-suite"),
    room("walden-forest-bathing-suite-den"),
    room("chalet"),
    room("mountain-view-haus-2-bedroom"),
  ];
  const ranked = rankRecommendedRooms(
    rooms,
    { party: "partner", dog: true, interests: ["outdoorSoak"] },
    { children: 0, infants: 0 },
  );

  assert.deepEqual(
    ranked.map((r) => r.merchandising?.key),
    ["walden-forest-bathing-suite", "walden-sunrise-bathing-suite", "chalet"],
  );
});

test("dog eligibility still applies when no interest ranking is active", () => {
  const rooms = [
    room("mountain-view-haus-2-bedroom"),
    room("forest-house-queen"),
    room("cabin"),
    room("chalet"),
  ];
  const ranked = rankRecommendedRooms(
    rooms,
    null,
    { children: 0, infants: 0, dogRequested: true },
  );

  assert.deepEqual(
    ranked.map((r) => r.merchandising?.key),
    ["cabin", "chalet"],
  );
});

test("children remove adults-only Alpine and Walden inventory regardless of party label", () => {
  const rooms = [
    room("alpine-bathing-suite"),
    room("walden-king"),
    room("forest-house-queen"),
    room("lodge-king"),
  ];
  const ranked = rankRecommendedRooms(
    rooms,
    { party: "friends", dog: false, interests: ["simpleCozy"] },
    { children: 1, infants: 0 },
  );

  assert.deepEqual(
    ranked.map((r) => r.merchandising?.key),
    ["forest-house-queen", "lodge-king"],
  );
});

test("two-interest intersection bonus makes Chalet the top Outdoor Soak + Own Place match", () => {
  const rooms = [
    room("walden-forest-bathing-suite"),
    room("cabin"),
    room("chalet"),
    room("mountain-view-haus-2-bedroom"),
  ];
  const [top] = rankRecommendedRooms(
    rooms,
    { party: "partner", dog: false, interests: ["outdoorSoak", "ownPlace"] },
    { children: 0, infants: 0 },
  );

  assert.equal(top.merchandising?.key, "chalet");
});

test("two-interest intersection bonus makes Cabin the top Icon Tub + Own Place match", () => {
  const rooms = [
    room("alpine-bathing-suite"),
    room("lodge-penthouse-suite"),
    room("cabin"),
    room("chalet"),
  ];
  const [top] = rankRecommendedRooms(
    rooms,
    { party: "partner", dog: false, interests: ["iconTub", "ownPlace"] },
    { children: 0, infants: 0 },
  );

  assert.equal(top.merchandising?.key, "cabin");
});

test("normal browsing preserves existing order while still enforcing known age eligibility", () => {
  const rooms = [
    room("alpine-bathing-suite", 100),
    room("forest-house-queen", 300),
    room("lodge-king", 200),
  ];
  const ranked = rankRecommendedRooms(rooms, null, { children: 1, infants: 0 });

  assert.deepEqual(
    ranked.map((r) => r.merchandising?.key),
    ["forest-house-queen", "lodge-king"],
  );
});
