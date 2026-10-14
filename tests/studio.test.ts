import test from "node:test";
import assert from "node:assert/strict";
import { demoMewsResponse, studioAvailability, studioHotel } from "../src/studio/demoData.ts";
import { getDemoScenario, setDemoScenario } from "../src/studio/runtime.ts";

test("Studio provides a fixture hotel, without payment credentials", async () => {
  setDemoScenario("standard");
  const hotel = await demoMewsResponse<typeof studioHotel>("hotel?lang=en");
  assert.equal(hotel.DefaultCurrencyCode, "USD");
  assert.equal(hotel.PaymentGateway, null);
  assert.ok(hotel.RoomCategories.length > 0);
});

test("Scenario fixture varies availability without making requests", () => {
  setDemoScenario("standard");
  const available = studioAvailability();
  assert.ok(available.RoomCategoryAvailabilities.some((room) => room.AvailableRoomCount > 0));
  setDemoScenario("soldout");
  const soldOut = studioAvailability();
  assert.ok(soldOut.RoomCategoryAvailabilities.every((room) => room.AvailableRoomCount === 0));
  setDemoScenario("error");
  assert.throws(() => studioAvailability(), /studio_simulated_availability_error/);
  setDemoScenario("standard");
});

test("Studio rejects reservation, payment and status operations", async () => {
  for (const endpoint of ["reservation", "payment-link", "reservation-status", "voucher"]) {
    await assert.rejects(demoMewsResponse(endpoint), /studio_transaction_disabled/);
  }
  assert.deepEqual(await demoMewsResponse("track"), { ok: false });
});

test("Demo scenario controls do not activate on regular booking paths", () => {
  assert.equal(getDemoScenario(), "standard");
});
