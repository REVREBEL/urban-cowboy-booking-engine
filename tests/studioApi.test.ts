import assert from "node:assert/strict";
import test from "node:test";
import { demoMewsResponse, studioHotel, studioAvailability } from "../src/studio/demoData.ts";
import { isStudioRoute, setDemoScenario } from "../src/studio/runtime.ts";

test("Studio serves hotel, availability and photo galleries from local fixtures", async () => {
  setDemoScenario("standard");
  const oldFetch = globalThis.fetch;
  let liveCalls = 0;
  globalThis.fetch = async () => {
    liveCalls++;
    throw new Error("Studio must never call Mews");
  };
  try {
    const hotel = await demoMewsResponse<typeof studioHotel>("hotel?lang=en");
    assert.equal(hotel.Id, studioHotel.Id);
    assert.ok(hotel.RoomCategories.every(room => room.ImageIds.length > 0));
    const availability = await demoMewsResponse<ReturnType<typeof studioAvailability>>("availability");
    assert.ok(availability.RoomCategoryAvailabilities.some(room => room.AvailableRoomCount > 0));
    const calendar = await demoMewsResponse<{ dates: Record<string, unknown> }>("calendar");
    assert.deepEqual(calendar.dates, {});
    assert.deepEqual(await demoMewsResponse("geo"), { country: null });
    assert.equal(liveCalls, 0);
  } finally {
    globalThis.fetch = oldFetch;
  }
});

test("Studio refuses transactional calls instead of falling through to live Mews", async () => {
  await assert.rejects(
    demoMewsResponse("reservation"),
    /studio_transaction_disabled:reservation/,
  );
  await assert.rejects(
    demoMewsResponse("payment-link"),
    /studio_transaction_disabled:payment-link/,
  );
});

test("only the Studio pathname can activate the demo API", () => {
  const oldWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  try {
    Object.defineProperty(globalThis, "window", { configurable: true, value: { location: { pathname: "/booking/studio" } } });
    assert.equal(isStudioRoute(), true);
    Object.defineProperty(globalThis, "window", { configurable: true, value: { location: { pathname: "/booking" } } });
    assert.equal(isStudioRoute(), false);
  } finally {
    if (oldWindow) Object.defineProperty(globalThis, "window", oldWindow);
    else Reflect.deleteProperty(globalThis, "window");
  }
});
