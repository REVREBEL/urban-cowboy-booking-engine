import assert from "node:assert/strict";
import test from "node:test";
import { api, ApiError } from "../src/lib/api.ts";
import { buildRooms } from "../src/lib/shaping.ts";
import { studioHotel, studioAvailability } from "../src/studio/demoData.ts";

test("Studio API uses fixture hotel, calendar, availability and never contacts live Mews", async () => {
  const oldWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const oldFetch = globalThis.fetch;
  let liveCalls = 0;
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { location: { pathname: "/booking/studio" } },
  });
  globalThis.fetch = async () => {
    liveCalls++;
    throw new Error("Studio must never send a Mews network request");
  };
  try {
    const hotel = await api.hotel();
    assert.equal(hotel.Id, studioHotel.Id);
    assert.ok(hotel.RoomCategories.every(room => room.ImageIds.length > 0));
    const availability = await api.availability({
      checkIn: "2026-11-10", checkOut: "2026-11-13",
      adults: 2, children: 0, infants: 0,
    });
    assert.ok(buildRooms(availability, hotel).some(room => room.rates.length > 0));
    const calendar = await api.calendar({
      startDate: "2026-11-01", endDate: "2026-12-01", property: "hotel",
    });
    assert.deepEqual(calendar.dates, {});
    await assert.rejects(
      api.createReservation({
        customer: { email: "demo@example.com", firstName: "Demo", lastName: "Guest" },
        reservations: [],
      }),
      (error: unknown) => error instanceof ApiError && error.code === "studio_transaction_disabled:reservation",
    );
    assert.equal(liveCalls, 0);
  } finally {
    globalThis.fetch = oldFetch;
    if (oldWindow) Object.defineProperty(globalThis, "window", oldWindow);
    else Reflect.deleteProperty(globalThis, "window");
  }
});

test("normal booking routes are not mistaken for Studio", async () => {
  const oldWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const oldFetch = globalThis.fetch;
  let requests = 0;
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { location: { pathname: "/booking" } },
  });
  globalThis.fetch = async () => {
    requests++;
    return new Response(JSON.stringify(studioHotel), { status: 200 });
  };
  try {
    await api.hotel();
    assert.equal(requests, 1);
  } finally {
    globalThis.fetch = oldFetch;
    if (oldWindow) Object.defineProperty(globalThis, "window", oldWindow);
    else Reflect.deleteProperty(globalThis, "window");
  }
});
