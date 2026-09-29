import {
  mewsJson,
  readJson,
  bad,
  json,
  isIsoDate,
  clampInt,
  shapeReservationPriceResponse,
  occupancyData,
  occupancyForProperty,
  propertyByKey,
  propertiesForEnv,
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
  const prop = propertyByKey(env, b.property) ?? propertiesForEnv(env)[0];
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

  const shaped = shapeReservationPriceResponse(res.data, currencyCode);
  if (!shaped) return json({ error: "reservation_price_missing" }, 502);

  const quotedIds = new Set(
    shaped.productOrderPrices
      .filter((p) => p.total?.gross != null)
      .map((p) => p.productId)
      .filter((id): id is string => typeof id === "string"),
  );
  const missingProductIds = productIds.filter((id) => !quotedIds.has(id));
  if (missingProductIds.length) {
    return json(
      { error: "reservation_price_incomplete", missingProductIds },
      502,
    );
  }

  return json(shaped);
};
