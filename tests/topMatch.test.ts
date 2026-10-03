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
    { party: "solo", dog: false, interests: ["simple-cozy"] },
    "2026-04-10",
    merch("forest-house-queen"),
  );
  assert.equal(copy.party_summary, "a solo stay");
});

test("mentions a dog only when requested and confirmed eligible", () => {
  const eligible = buildTopMatchCopy(
    "Cabin",
    { party: "partner", dog: true, interests: ["my-own-place"] },
    "2026-06-10",
    merch("cabin"),
  );
  assert.match(eligible.party_summary, /dog/);
  assert.match(eligible.benefit_2, /dog/);

  const ineligible = buildTopMatchCopy(
    "Walden Forest Bathing Suite with Den",
    { party: "partner", dog: true, interests: ["bathe-outside"] },
    "2026-06-10",
    merch("walden-forest-bathing-suite-den"),
  );
  assert.doesNotMatch(`${ineligible.party_summary} ${ineligible.benefit_2}`, /dog/i);
});

test("describes an unsupported second interest honestly", () => {
  const copy = buildTopMatchCopy(
    "Alpine Bathing Suite",
    { party: "partner", dog: false, interests: ["iconic-tub", "bathe-outside"] },
    "2026-01-10",
    merch("alpine-bathing-suite"),
  );
  assert.match(copy.interest_summary, /Iconic Tub and Bathe Outside/);
  assert.match(copy.benefit_1, /indoor soaking tub/);
  assert.match(copy.benefit_2, /does not claim an outdoor soaking setup/);
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
    interestScores: { "iconic-tub": 0, "bathe-outside": 0, "my-own-place": 0, "mountain-views": 0, "simple-cozy": 5 },
    interestPriority: { "simple-cozy": 0 },
    matchReasons: { "simple-cozy": "its easygoing feel" },
    features: { simpleCozy: true },
  };
  const copy = buildTopMatchCopy(
    "Test Room",
    { party: "solo", dog: false, interests: ["simple-cozy"] },
    "2026-01-10",
    metadata,
  );
  const output = `${copy.benefit_1} ${copy.benefit_2} ${copy.benefit_3}`;
  assert.doesNotMatch(output, /heated floors|fireplace|wood stove|outdoor soak|private deck|view/i);
  assert.match(copy.benefit_3, /Winter in the Catskills/);
});
