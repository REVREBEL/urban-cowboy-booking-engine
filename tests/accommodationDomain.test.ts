import assert from "node:assert/strict";
import test from "node:test";
import { ROOM_TYPE_GROUPS } from "../src/data/roomTypeGroups.ts";
import { ROOM_TYPE_GROUP_PRESENTATION } from "../src/data/roomTypeGroupPresentation.ts";
import { ROOM_MERCHANDISING } from "../src/lib/roomMerchandising.ts";

test("all current Catskills Room Types have unique production Mews IDs", () => {
  assert.equal(ROOM_MERCHANDISING.length, 22);

  const ids = ROOM_MERCHANDISING.map((room) => room.mewsRoomTypeId);
  assert.equal(new Set(ids).size, ids.length);

  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  for (const id of ids) assert.match(id, uuid);
});

test("every Room Type belongs to a defined Room Type Group", () => {
  const groupKeys = new Set(ROOM_TYPE_GROUPS.map((group) => group.key));
  assert.equal(groupKeys.size, 9);

  for (const room of ROOM_MERCHANDISING) {
    assert.ok(
      groupKeys.has(room.roomTypeGroupKey),
      `Unknown Room Type Group "${room.roomTypeGroupKey}" for ${room.key}`,
    );
  }
});

test("the current Room Type Group registry contains the expected Catskills groups", () => {
  assert.deepEqual(
    ROOM_TYPE_GROUPS.map((group) => group.key),
    [
      "alpine",
      "walden",
      "lodge",
      "forest-house",
      "cabin",
      "chalet",
      "opas",
      "slide-mountain",
      "mountain-view",
    ],
  );
});


test("Room Type Group presentation order covers every Room Type exactly once", () => {
  const presentedKeys = ROOM_TYPE_GROUPS.flatMap(
    (group) => ROOM_TYPE_GROUP_PRESENTATION[group.key].roomOrder,
  );
  const merchandisingKeys = ROOM_MERCHANDISING.map((room) => room.key);

  assert.equal(presentedKeys.length, ROOM_MERCHANDISING.length);
  assert.equal(new Set(presentedKeys).size, presentedKeys.length);
  assert.deepEqual(
    [...presentedKeys].sort(),
    [...merchandisingKeys].sort(),
  );
});
