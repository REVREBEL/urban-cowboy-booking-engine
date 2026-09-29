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

function addAmount(
  a: ReturnType<typeof normalizeAmount>,
  b: ReturnType<typeof normalizeAmount>,
) {
  if (!a) return b;
  if (!b) return a;
  const taxByCode = new Map<string | null, number>();
  for (const tax of [...a.taxes, ...b.taxes]) {
    taxByCode.set(tax.taxRateCode, (taxByCode.get(tax.taxRateCode) ?? 0) + tax.value);
  }
  return {
    currency: a.currency,
    gross: a.gross != null && b.gross != null ? +(a.gross + b.gross).toFixed(2) : null,
    net: a.net != null && b.net != null ? +(a.net + b.net).toFixed(2) : null,
    taxTotal:
      a.taxTotal != null && b.taxTotal != null
        ? +(a.taxTotal + b.taxTotal).toFixed(2)
        : null,
    taxes: [...taxByCode].map(([taxRateCode, value]) => ({
      taxRateCode,
      value: +value.toFixed(2),
    })),
  };
}

export function shapeReservationPriceResponse(
  data: any,
  currencyCode: string,
): {
  total: ReturnType<typeof normalizeAmount>;
  amountToChargeOnConfirmation: ReturnType<typeof normalizeAmount>;
  productOrderPrices: {
    productId: string | null;
    total: ReturnType<typeof normalizeAmount>;
  }[];
} | null {
  const quote = Array.isArray(data?.ReservationPrice) ? data.ReservationPrice[0] : null;
  if (!quote) return null;

  const total = normalizeAmount(quote.TotalAmount, currencyCode);
  if (total?.gross == null) return null;

  const grouped = new Map<string, ReturnType<typeof normalizeAmount>>();
  const withoutId: {
    productId: string | null;
    total: ReturnType<typeof normalizeAmount>;
  }[] = [];

  for (const row of Array.isArray(quote.ProductOrderPrices) ? quote.ProductOrderPrices : []) {
    const amount = normalizeAmount(row?.TotalAmount, currencyCode);
    const productId = typeof row?.ProductId === "string" ? row.ProductId : null;
    if (!productId) {
      withoutId.push({ productId: null, total: amount });
      continue;
    }
    grouped.set(productId, addAmount(grouped.get(productId) ?? null, amount));
  }

  return {
    total,
    amountToChargeOnConfirmation: normalizeAmount(
      quote.AmountToChargeOnConfirmation,
      currencyCode,
    ),
    productOrderPrices: [
      ...[...grouped].map(([productId, total]) => ({ productId, total })),
      ...withoutId,
    ],
  };
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

  const shaped = shapeReservationPriceResponse(res.data, currencyCode);
  if (!shaped) return json({ error: "reservation_price_missing" }, 502);

  const quotedIds = new Set(
    shaped.productOrderPrices
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
