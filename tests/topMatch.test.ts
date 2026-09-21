import assert from "node:assert/strict";
import test from "node:test";
import { buildTopMatchCopy, seasonForDate, type RoomMatchContent } from "../src/lib/topMatch.ts";

test("uses the requested party framing", () => {
  const copy = buildTopMatchCopy("Forest House Queen", { party: "solo", dog: false, interests: ["simpleCozy"] }, "2026-04-10");
  assert.equal(copy.party_summary, "a solo stay");
});

test("mentions a dog only when requested and confirmed eligible", () => {
  const eligible = buildTopMatchCopy("Cabin", { party: "partner", dog: true, interests: ["ownPlace"] }, "2026-06-10");
  assert.match(eligible.party_summary, /dog/);
  assert.match(eligible.benefit_2, /dog/);

  const ineligible = buildTopMatchCopy("Walden Forest Bathing Suite with Den", { party: "partner", dog: true, interests: ["outdoorSoak"] }, "2026-06-10");
  assert.doesNotMatch(`${ineligible.party_summary} ${ineligible.benefit_2}`, /dog/i);
});

test("describes an unsupported second interest honestly", () => {
  const copy = buildTopMatchCopy("Alpine Bathing Suite", { party: "partner", dog: false, interests: ["iconTub", "outdoorSoak"] }, "2026-01-10");
  assert.match(copy.interest_summary, /Icon Tub and Outdoor Soak/);
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
  const metadata: RoomMatchContent = { names: ["Test Room"], matchReasons: { simpleCozy: "its easygoing feel" }, features: {} };
  const copy = buildTopMatchCopy("Test Room", { party: "solo", dog: false, interests: ["simpleCozy"] }, "2026-01-10", metadata);
  const output = `${copy.benefit_1} ${copy.benefit_2} ${copy.benefit_3}`;
  assert.doesNotMatch(output, /heated floors|fireplace|wood stove|outdoor soak|private deck|view/i);
  assert.match(copy.benefit_3, /Winter in the Catskills/);
});
