import {
  mewsJson,
  readJson,
  bad,
  json,
  isIsoDate,
  clampInt,
  normalizeAmount,
  occupancyData,
  occupancyForProperty,
  propertyByKey,
  PROPERTIES,
  type Env,
} from "./_lib";

interface Body {
  startUtc?: string;
  endUtc?: string;
  roomCategoryId?: string;
  rateId?: string;
  adults?: number;
  children?: number;
  infants?: number;
  productIds?: string[];
  voucherCode?: string;
  property?: string;
  currencyCode?: string;
}

// reservations/price — final quote for the selected rate. Unlike getPricing, this
// endpoint returns AmountToChargeOnConfirmation, which is the authoritative amount
// the booking engine should collect when the reservation group is confirmed.
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const b = await readJson<Body>(request);
  if (!isIsoDate(b.startUtc) || !isIsoDate(b.endUtc)) return bad("missing_or_invalid_dates");
  if (b.endUtc <= b.startUtc) return bad("end_before_start");
  if (typeof b.roomCategoryId !== "string" || !b.roomCategoryId) return bad("missing_room_category");
  if (typeof b.rateId !== "string" || !b.rateId) return bad("missing_rate");

  const adults = clampInt(b.adults, 1, 30, 2);
  const children = clampInt(b.children, 0, 20, 0);
  const infants = clampInt(b.infants, 0, 10, 0);
  const prop = propertyByKey(b.property) ?? PROPERTIES[0];
  const occupancy = prop
    ? occupancyForProperty(prop, adults, children, infants)
    : occupancyData(env, adults, children);

  const currencyCode =
    typeof b.currencyCode === "string" && /^[A-Z]{3}$/.test(b.currencyCode)
      ? b.currencyCode
      : "EUR";

  const productIds = Array.isArray(b.productIds)
    ? b.productIds.filter((x): x is string => typeof x === "string")
    : [];

  const res = await mewsJson<any>(env, "reservations/price", {
    ConfigurationId: prop?.configId ?? env.MEWS_CONFIG_ID,
    CurrencyCode: currencyCode,
    Reservations: [
      {
        Identifier: "selected",
        StartUtc: b.startUtc,
        EndUtc: b.endUtc,
        RoomCategoryId: b.roomCategoryId,
        RateId: b.rateId,
        OccupancyData: occupancy,
        ...(productIds.length ? { ProductIds: productIds } : {}),
        ...(typeof b.voucherCode === "string" && b.voucherCode
          ? { VoucherCode: b.voucherCode }
          : {}),
      },
    ],
  });

  if (!res.ok || !res.data) return json({ error: "reservation_price_failed", status: res.status }, 502);

  const quote = Array.isArray(res.data.ReservationPrice) ? res.data.ReservationPrice[0] : null;
  if (!quote) return json({ error: "reservation_price_missing" }, 502);

  return json({
    total: normalizeAmount(quote.TotalAmount, currencyCode),
    amountToChargeOnConfirmation: normalizeAmount(
      quote.AmountToChargeOnConfirmation,
      currencyCode,
    ),
    productOrderPrices: Array.isArray(quote.ProductOrderPrices)
      ? quote.ProductOrderPrices.map((p: any) => ({
          productId: p.ProductId ?? null,
          total: normalizeAmount(p.TotalAmount, currencyCode),
        }))
      : [],
  });
};
