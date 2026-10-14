import type { AvailabilityResponse, HotelConfig, PricingResult, ReservationQuoteResult } from "../types/mews";
import { getDemoScenario } from "./runtime.ts";
import { ROOM_IMAGE_ASSETS } from "../data/roomImagePlaceholders.ts";

export const studioHotel: HotelConfig = {
  Id: "studio-location-hotel",
  ImageBaseUrl: "",
  Name: { en: "Urban Cowboy Lodge · DEMO" },
  Description: { en: "Simulated booking data. No reservations are created." },
  DefaultCurrencyCode: "USD",
  PaymentGateway: null,
  RoomCategories: [
    { Id: "demo-alpine", Name: { en: "Alpine Bathing Suite" }, Description: { en: "Iconic indoor soaking tub and forest views." }, ImageIds: [ROOM_IMAGE_ASSETS.ALPINE_BATHING_SUITE, ROOM_IMAGE_ASSETS.ALPINE_HEADBOARD, ROOM_IMAGE_ASSETS.ALPINE_PENTHOUSE_COPPER_TUB], NormalBedCount: 1, ExtraBedCount: 0, SpaceType: "Suite", Property: "hotel" },
    { Id: "demo-forest", Name: { en: "Forest House Double Queen" }, Description: { en: "Cozy Catskills comfort with two queen beds." }, ImageIds: [ROOM_IMAGE_ASSETS.LODGE_PENTHOUSE_BEDROOM, ROOM_IMAGE_ASSETS.LODGE_PENTHOUSE_LIVING_ROOM], NormalBedCount: 2, ExtraBedCount: 0, SpaceType: "Room", Property: "hotel" },
    { Id: "demo-cabin", Name: { en: "Private Cabin" }, Description: { en: "Your own secluded mountain hideaway." }, ImageIds: [ROOM_IMAGE_ASSETS.CABIN_BEDŞ, ROOM_IMAGE_ASSETS.CABIN_SITTING_AREA_SOAKING_TUB, ROOM_IMAGE_ASSETS.CABIN_SIDE_VIEW_SITTING_AREA], NormalBedCount: 1, ExtraBedCount: 0, SpaceType: "Cabin", Property: "hotel" },
  ],
  Products: [],
  Properties: [{ key: "hotel", label: "Urban Cowboy Lodge Catskills" }],
};

export function studioAvailability(): AvailabilityResponse {
  if (getDemoScenario() === "error") throw new Error("studio_simulated_availability_error");
  const sold = getDemoScenario() === "soldout";
  const nonref = getDemoScenario() === "nonrefundable";
  const rateId = nonref ? "demo-advance" : getDemoScenario() === "member" ? "demo-member" : "demo-flex";
  return {
    RateGroups: [{ Id: "demo-group", SettlementType: "Automatic", SettlementAction: "ChargeCreditCard", SettlementTrigger: "Confirmation", SettlementValue: 0.5 }],
    Rates: [{ Id: rateId, Name: { en: nonref ? "Plan Ahead · Non-refundable" : getDemoScenario() === "member" ? "Member Rate" : "Flexible Rate" }, Description: { en: nonref ? "Non-refundable demo rate" : "Free cancellation according to the displayed policy" }, RateGroupId: "demo-group", IsPrivate: false }],
    RoomCategoryAvailabilities: studioHotel.RoomCategories.map((room, index) => {
      const available = !sold && (getDemoScenario() !== "family" || room.Id !== "demo-alpine") && (getDemoScenario() !== "dog" || room.Id === "demo-cabin");
      const gross = [975, 675, 825][index];
      const amount = (n: number) => ({ USD: { Currency: "USD", GrossValue: n, NetValue: Math.round(n / 1.1 * 100) / 100 } });
      return {
        RoomCategoryId: room.Id,
        AvailableRoomCount: available ? (index + 1) : 0,
        RoomOccupancyAvailabilities: available ? [{
          AdultCount: 2, ChildCount: getDemoScenario() === "family" ? 1 : 0, OccupancyData: [],
          Pricing: [{ RateId: rateId, Price: { TotalAmount: amount(gross), AverageAmountPerTimeUnit: amount(gross / 3) } }],
        }] : [],
      };
    }),
  };
}

const money = (gross: number) => ({ currency: "USD", gross, net: Math.round(gross / 1.1 * 100) / 100, taxTotal: Math.round((gross - gross / 1.1) * 100) / 100, taxes: [] });
export const studioQuote = (): ReservationQuoteResult => ({
  total: money(975), amountToChargeOnConfirmation: money(487.5), productOrderPrices: [],
});
export const studioPricing = (): PricingResult => ({
  occupancyPrices: [{ occupancy: [], pricing: studioAvailability().Rates.map((rate) => ({ rateId: rate.Id, total: money(975), perNight: money(325), max: null })) }],
});

/** No live Mews request is ever made from the Studio route. */
export async function demoMewsResponse<T>(path: string): Promise<T> {
  const route = path.split("?")[0];
  let result: unknown;
  switch (route) {
    case "hotel": result = studioHotel; break;
    case "availability": result = studioAvailability(); break;
    case "reservation-price": result = studioQuote(); break;
    case "pricing": result = studioPricing(); break;
    case "calendar": result = { dates: {} }; break;
    case "geo": result = { country: null }; break;
    case "track": result = { ok: false }; break;
    default: throw new Error("studio_transaction_disabled:" + route);
  }
  return result as T;
}
