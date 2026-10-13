import type {
  AvailabilityResponse, HotelConfig, PricingResult,
  ReservationQuoteResult, ReservationCreateResult, ReservationStatusResult,
  MewsAmount,
} from "@/types/mews";
import { demoRooms } from "@/component-library/fixtures";
import { CATSKILLS_MEWS_IDS } from "@/lib/catskillsMewsIds";

export const isStudioRoute = () =>
  typeof window !== "undefined" && /^\/booking\/studio\/?$/.test(window.location.pathname);

export type StudioScenario = "standard" | "sold-out" | "family" | "dog" | "member" | "payment-error";
const scenarios: StudioScenario[] = ["standard", "sold-out", "family", "dog", "member", "payment-error"];
export function currentStudioScenario(): StudioScenario {
  const raw = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("scenario") : null;
  return scenarios.includes(raw as StudioScenario) ? raw as StudioScenario : "standard";
}

export const studioHotel: HotelConfig = {
  Id: "demo-hotel",
  ImageBaseUrl: "",
  Name: { en: "Urban Cowboy Lodge · Demo" },
  Description: { en: "Simulated booking data" },
  DefaultCurrencyCode: "USD",
  Properties: [{ key: "hotel", label: "Urban Cowboy Lodge Catskills" }],
  RoomCategories: demoRooms.map((room) => ({
    Id: "studio-" + room.id,
    Name: { en: room.name },
    Description: { en: room.description },
    ImageIds: room.images,
    NormalBedCount: room.features.twoBeds ? 2 : 1,
    ExtraBedCount: 0,
    SpaceType: "Room",
    Property: "hotel",
  })),
  Products: [],
  PaymentGateway: null,
};

const amount = (gross: number): { USD: MewsAmount } => ({
  USD: { Currency: "USD", GrossValue: gross, NetValue: Math.round(gross / 1.1 * 100) / 100 },
});

export function studioAvailability(): AvailabilityResponse {
  const scenario = currentStudioScenario();
  const selected = demoRooms.filter((room) =>
    scenario !== "sold-out" &&
    (scenario !== "family" || !!room.features.familyFriendly) &&
    (scenario !== "dog" || !!room.features.dogFriendly)
  );
  const rateGroups = [
    { Id: CATSKILLS_MEWS_IDS.rateGroups.FLEXIBLE, SettlementType: "Automatic", SettlementAction: "ChargeCreditCard", SettlementTrigger: "Confirmation", SettlementValue: 0.5 },
    { Id: CATSKILLS_MEWS_IDS.rateGroups.NON_REFUNDABLE, SettlementType: "Automatic", SettlementAction: "ChargeCreditCard", SettlementTrigger: "Confirmation", SettlementValue: 1 },
  ];
  const rates = [
    { Id: "studio-flex", Name: { en: "Keep Your Options Open" }, Description: { en: "Flexible demo rate" }, RateGroupId: rateGroups[0].Id, IsPrivate: false },
    { Id: "studio-advance", Name: { en: "Plan Ahead. Save a Little." }, Description: { en: "Non-refundable demo rate" }, RateGroupId: rateGroups[1].Id, IsPrivate: false },
    ...(scenario === "member" ? [{ Id: "studio-member", Name: { en: "For the Regulars" }, Description: { en: "Member demo rate" }, RateGroupId: rateGroups[0].Id, IsPrivate: false }] : []),
  ];
  return {
    RateGroups: rateGroups,
    Rates: rates,
    RoomCategoryAvailabilities: selected.map((room) => ({
      RoomCategoryId: "studio-" + room.id,
      AvailableRoomCount: 3,
      RoomOccupancyAvailabilities: [{
        AdultCount: scenario === "family" ? 2 : 2,
        ChildCount: scenario === "family" ? 2 : 0,
        OccupancyData: [],
        Pricing: rates.map((rate) => {
          const night = rate.Id === "studio-advance" ? room.startingFrom * 0.85 : rate.Id === "studio-member" ? room.startingFrom * 0.9 : room.startingFrom;
          return {
            RateId: rate.Id,
            Price: { TotalAmount: amount(night * 3), AverageAmountPerTimeUnit: amount(night) },
          };
        }),
      }],
    })),
  };
}

const quoteAmount = (gross: number) => ({
  currency: "USD",
  gross,
  net: Math.round(gross / 1.1 * 100) / 100,
  taxTotal: Math.round((gross - gross / 1.1) * 100) / 100,
  taxes: [],
});
const demoTotal = 1275;

export function studioMewsResponse(path: string, init?: RequestInit): unknown {
  const key = path.split("?")[0];
  const payload = init?.body ? JSON.parse(String(init.body)) as Record<string, unknown> : {};
  switch (key) {
    case "hotel": return studioHotel;
    case "availability": return studioAvailability();
    case "calendar": return { dates: {}, generatedAt: new Date().toISOString(), stale: false, refreshing: false };
    case "pricing": {
      const room = demoRooms.find((r) => "studio-" + r.id === payload.roomCategoryId) ?? demoRooms[0];
      const gross = room.startingFrom * 3;
      const pricing: PricingResult = { occupancyPrices: [{ occupancy: null, pricing: [{ rateId: "studio-flex", total: quoteAmount(gross), perNight: quoteAmount(room.startingFrom), max: null }] }] };
      return pricing;
    }
    case "reservation-price": {
      const quote: ReservationQuoteResult = { total: quoteAmount(demoTotal), amountToChargeOnConfirmation: quoteAmount(demoTotal / 2), productOrderPrices: [] };
      return quote;
    }
    case "reservation": {
      if (currentStudioScenario() === "payment-error") throw new Error("Simulated payment failure. No transaction occurred.");
      const created: ReservationCreateResult = {
        id: "STUDIO-DEMO-RESERVATION", customerId: "STUDIO-GUEST",
        paymentRequestId: null, paymentUrl: null, creditCardAvailable: false,
        totalAmount: quoteAmount(demoTotal),
        reservations: [{ id: "STUDIO-DEMO-ROOM", number: "DEMO-ONLY", roomCategoryId: String((payload.reservations as {roomCategoryId?:string}[] | undefined)?.[0]?.roomCategoryId ?? ""),
          rateId: "studio-flex", startUtc: "", endUtc: "", adultCount: 2, childCount: 0, amount: quoteAmount(demoTotal) }],
      };
      return created;
    }
    case "reservation-status": {
      const status: ReservationStatusResult = { id: "STUDIO-DEMO-RESERVATION", paid: true, finalFailure: false, paymentRequests: [], payments: [], reservations: [{ number: "DEMO-ONLY" }] };
      return status;
    }
    case "payment-link": return { paymentUrl: null, paid: true };
    case "geo": return { country: null };
    case "voucher": return { valid: true };
    case "track": return { ok: false };
    case "products-debug": return { source: "studio", currencyCode: "USD", configurationCount: 0, productCount: 0, products: [] };
    default: throw new Error("Studio API mock is unavailable for " + key);
  }
}

export function studioContentResponse(path: string): unknown {
  switch (path) {
    case "rate-cards": return { cards: [] };
    case "add-ons": return { addOns: [] };
    case "room-type-reviews": return { reviews: {}, descriptions: {} };
    case "buildings": return { buildings: {} };
    default: throw new Error("Studio CMS mock is unavailable for " + path);
  }
}
