import {
  bad,
  clampInt,
  json,
  mewsJson,
  occupancyForProperty,
  propertyByKey,
  propertyDateUtc,
  type Env,
} from "./_lib";

interface Body {
  startDate?: string;
  endDate?: string;
  adults?: number;
  children?: number;
  infants?: number;
  property?: string;
  currencyCode?: string;
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const CACHE_TTL_MS = 15 * 60 * 1000;
const calendarCache = new Map<string, { expiresAt: number; dates: Record<string, CalendarDay> }>();

interface CalendarDay {
  amount: number;
  currency: string;
  available: boolean;
  minNights?: number;
}
const addDays = (date: string, days: number) => {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
};

const restrictionMinimum = (restrictions: unknown): number | undefined => {
  if (!Array.isArray(restrictions)) return undefined;
  for (const restriction of restrictions) {
    if (!restriction || typeof restriction !== "object") continue;
    const record = restriction as Record<string, unknown>;
    const value = record.MinimumTimeUnits ?? record.MinimumNights ?? record.MinNights;
    if (typeof value === "number" && value > 1) return value;
  }
  return undefined;
};

const availabilityPrices = (data: any, currency: string): number[] =>
  (data?.RoomCategoryAvailabilities ?? []).flatMap((category: any) =>
    (category.RoomOccupancyAvailabilities ?? []).flatMap((availability: any) =>
      (availability.Pricing ?? []).map((pricing: any) =>
        pricing.Price?.TotalAmount?.[currency]?.NetValue ?? pricing.Price?.Total?.[currency],
      ),
    ),
  ).filter((value: unknown): value is number => typeof value === "number" && Number.isFinite(value));

export const onRequestPost: PagesFunction<Env> = async ({ request, env, waitUntil }) => {
  const body = await request.json<Body>().catch(() => ({}));
  if (!body.startDate || !body.endDate || !DATE.test(body.startDate) || !DATE.test(body.endDate)) return bad("missing_or_invalid_dates");
  const days = Math.round((Date.parse(`${body.endDate}T00:00:00Z`) - Date.parse(`${body.startDate}T00:00:00Z`)) / 86_400_000);
  if (days < 1 || days > 70) return bad("calendar_range_out_of_bounds");

  const property = propertyByKey(env, body.property ?? "hotel");
  if (!property) return bad("unknown_property");
  const adults = clampInt(body.adults, 1, 30, 2);
  const children = clampInt(body.children, 0, 20, 0);
  const infants = clampInt(body.infants, 0, 10, 0);
  const currency = typeof body.currencyCode === "string" && /^[A-Z]{3}$/.test(body.currencyCode) ? body.currencyCode : "USD";
  const cacheKey = JSON.stringify([property.configId, body.startDate, body.endDate, adults, children, infants, currency]);
  const cached = calendarCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return json({ dates: cached.dates }, 200, "public, max-age=300");

  // POST responses are not cached by Cloudflare automatically. A synthetic GET
  // key lets successful calendar lookups survive isolate restarts and be reused
  // across visitors at the same edge location.
  const edgeCacheKey = new Request(`${new URL(request.url).origin}/api/mews/calendar-cache?key=${encodeURIComponent(cacheKey)}`);
  const edgeCached = await caches.default.match(edgeCacheKey);
  if (edgeCached) return edgeCached;
  const dates = Array.from({ length: days }, (_, index) => addDays(body.startDate!, index));

  const entries: Array<[string, CalendarDay]> = [];
  for (let offset = 0; offset < dates.length; offset += 8) {
    const batch = dates.slice(offset, offset + 8);
    const results = await Promise.all(batch.map(async (date) => {
      const requestAvailability = async (nights: number) => {
        const result = await mewsJson<any>(env, "hotels/getAvailability", {
          ConfigurationId: property.configId,
          HotelId: env.MEWS_HOTEL_ID,
          StartUtc: propertyDateUtc(date),
          EndUtc: propertyDateUtc(addDays(date, nights)),
          CurrencyCode: currency,
          LanguageCode: "en-US",
          OccupancyData: occupancyForProperty(property, adults, children, infants),
        });
        if (!result.ok) throw new Error(`mews_calendar_${result.status}`);
        return result;
      };
      const response = await requestAvailability(1);
      const prices = availabilityPrices(response.data, currency);
      let minNights = restrictionMinimum(response.data?.ViolatedRestrictions);

      // The Distributor API often returns an empty restriction list for a minimum-stay
      // failure. Probe the two common longer stays only when one night is unavailable.
      // This identifies 2- and 3-night rules without multiplying every calendar request.
      if (!prices.length && !minNights) {
        const [twoNights, threeNights] = await Promise.all([requestAvailability(2), requestAvailability(3)]);
        if (availabilityPrices(twoNights.data, currency).length) minNights = 2;
        else if (availabilityPrices(threeNights.data, currency).length) minNights = 3;
      }
      return [date, {
        amount: prices.length ? Math.min(...prices) : 0,
        currency,
        available: prices.length > 0 || Boolean(minNights),
        ...(minNights ? { minNights } : {}),
      }] as const;
    }));
    entries.push(...results);
  }

  const responseDates = Object.fromEntries(entries);
  calendarCache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, dates: responseDates });
  if (calendarCache.size > 100) calendarCache.delete(calendarCache.keys().next().value as string);
  const response = json({ dates: responseDates }, 200, "public, max-age=900, stale-while-revalidate=43200");
  waitUntil(caches.default.put(edgeCacheKey, response.clone()));
  return response;
};
