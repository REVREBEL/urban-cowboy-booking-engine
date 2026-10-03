import assert from "node:assert/strict";
import test from "node:test";
import { buildTopMatchCopy, seasonForDate } from "../src/lib/topMatch.ts";
import { merchandisingForKey } from "../src/lib/roomMerchandising.ts";
import type { RoomMerchandising } from "../src/types/merchandising.ts";

function merch(key: string): RoomMerchandising {
  const value = merchandisingForKey(key);
  assert.ok(value, `Missing merchandising fixture: ${key}`);
  return value;
}

test("uses the requested party framing", () => {
  const copy = buildTopMatchCopy(
    "Forest House Queen",
    { party: "solo", dog: false, interests: ["simple-comforts"] },
    "2026-04-10",
    merch("forest-house-queen"),
  );
  assert.equal(copy.party_summary, "a solo stay");
});

test("mentions a dog only when requested and confirmed eligible", () => {
  const eligible = buildTopMatchCopy(
    "Cabin",
    { party: "partner", dog: true, interests: ["your-own-hideaway"] },
    "2026-06-10",
    merch("cabin"),
  );
  assert.match(eligible.party_summary, /dog/);
  assert.match(eligible.benefit_2, /dog/);

  const ineligible = buildTopMatchCopy(
    "Walden Forest Bathing Suite with Den",
    { party: "partner", dog: true, interests: ["connection-with-nature"] },
    "2026-06-10",
    merch("walden-forest-bathing-suite-den"),
  );
  assert.doesNotMatch(`${ineligible.party_summary} ${ineligible.benefit_2}`, /dog/i);
});

test("describes an unsupported second interest honestly", () => {
  const copy = buildTopMatchCopy(
    "Alpine Bathing Suite",
    { party: "partner", dog: false, interests: ["indoor-sanctuaries", "connection-with-nature"] },
    "2026-01-10",
    merch("alpine-bathing-suite"),
  );
  assert.match(copy.interest_summary, /Indoor Sanctuaries and Connection with Nature/);
  assert.match(copy.benefit_1, /indoor/);
  assert.match(copy.benefit_2, /without overstating a specific outdoor connection/);
});

test("selects all four seasons from the check-in month", () => {
  assert.equal(seasonForDate("2026-01-10"), "winter");
  assert.equal(seasonForDate("2026-04-10"), "spring");
  assert.equal(seasonForDate("2026-07-10"), "summer");
  assert.equal(seasonForDate("2026-10-10"), "fall");
});

test("never uses seasonal feature claims without metadata support", () => {
  const metadata: RoomMerchandising = {
    key: "test-room",
    mewsRoomTypeId: "test-room-type-id",
    legacyNames: ["Test Room"],
    roomTypeGroupKey: "forest-house",
    dogPolicy: "unknown",
    agePolicy: "none",
    partyScores: { partner: 0, friends: 0, family: 0, solo: 0 },
    interestScores: { "indoor-sanctuaries": 0, "connection-with-nature": 0, "your-own-hideaway": 0, "scenic-mountain-views": 0, "simple-comforts": 5 },
    interestPriority: { "simple-comforts": 0 },
    matchReasons: { "simple-comforts": "its easygoing feel" },
    features: { simpleCozy: true },
  };
  const copy = buildTopMatchCopy(
    "Test Room",
    { party: "solo", dog: false, interests: ["simple-comforts"] },
    "2026-01-10",
    metadata,
  );
  const output = `${copy.benefit_1} ${copy.benefit_2} ${copy.benefit_3}`;
  assert.doesNotMatch(output, /heated floors|fireplace|wood stove|outdoor soak|private deck|view/i);
  assert.match(copy.benefit_3, /Winter in the Catskills/);
});


test("claims a separate living room only when the feature is verified", () => {
  const copy = buildTopMatchCopy(
    "Lodge Penthouse Suite",
    { party: "partner", dog: false, interests: ["spaces-for-connection"] },
    "2026-06-10",
    merch("lodge-penthouse-suite"),
  );
  assert.match(copy.benefit_1, /separate living room/i);
});

test("claims a kitchen only when the feature is verified", () => {
  const copy = buildTopMatchCopy(
    "Chalet",
    { party: "friends", dog: false, interests: ["spaces-to-gather"] },
    "2026-06-10",
    merch("chalet"),
  );
  assert.match(copy.benefit_1, /full kitchen/i);
});


test("describes Minimal Distractions from group setting", () => {
  const copy = buildTopMatchCopy(
    "Walden King",
    { party: "solo", dog: false, interests: ["minimal-distractions"] },
    "2026-06-10",
    merch("walden-king"),
  );
  assert.match(copy.benefit_1, /away from the Lodge core/i);
  assert.match(copy.benefit_1, /private/i);
});
