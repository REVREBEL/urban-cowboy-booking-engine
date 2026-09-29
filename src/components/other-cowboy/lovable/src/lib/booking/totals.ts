import { ADDONS, addonTotal } from "./addons";
import { nights as countNights } from "./matching";
import { RATES, ROOMS, rateNightly } from "./rooms";
import type { BookingState } from "./store";

const TAX_RATE = 0.12;

export function bookingTotals(booking: BookingState) {
  const stayNights = countNights(booking.stay);
  const room = ROOMS.find((item) => item.id === booking.roomId) ?? null;
  const rate = RATES.find((item) => item.id === booking.rateId) ?? null;
  const nightly = room && rate ? rateNightly(room, rate) : 0;
  const roomTotal = nightly * stayNights;

  const addons = ADDONS.filter((addon) => booking.addonIds.includes(addon.id));
  const extrasTotal = addons.reduce(
    (total, addon) => total + addonTotal(addon, stayNights),
    0,
  );

  const subtotal = roomTotal + extrasTotal;
  const tax = Math.round(subtotal * TAX_RATE);

  return {
    stayNights,
    room,
    rate,
    nightly,
    roomTotal,
    addons,
    extrasTotal,
    subtotal,
    tax,
    total: subtotal + tax,
  };
}

export function money(value: number) {
  return `$${value.toLocaleString("en-US")}`;
}
