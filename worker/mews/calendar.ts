import {
  bad,
  json,
  propertyByKey,
  type Env,
} from "./_lib";
import {
  markCalendarRangeActive,
  queueCalendarRefresh,
  readCalendarRange,
} from "./calendar-engine";

interface Body {
  startDate?: string;
  endDate?: string;
  property?: string;
  currencyCode?: string;
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export const onRequestPost: PagesFunction<Env> = async ({ request, env, waitUntil }) => {
  const body = await request.json<Body>().catch(() => ({}));
  if (
    !body.startDate ||
    !body.endDate ||
    !DATE.test(body.startDate) ||
    !DATE.test(body.endDate)
  ) {
    return bad("missing_or_invalid_dates");
  }

  const days = Math.round(
    (Date.parse(`${body.endDate}T00:00:00Z`) -
      Date.parse(`${body.startDate}T00:00:00Z`)) /
      86_400_000,
  );
  if (days < 1 || days > 70) return bad("calendar_range_out_of_bounds");

  const property = propertyByKey(env, body.property ?? "hotel");
  if (!property) return bad("unknown_property");

  const currency =
    typeof body.currencyCode === "string" && /^[A-Z]{3}$/.test(body.currencyCode)
      ? body.currencyCode
      : "USD";

  // Calendar merchandising intentionally uses one canonical 2-adult public-rate
  // snapshot. Exact occupancy, promo-code eligibility, availability and pricing
  // are still validated by the live availability request after Search.
  const refreshRequest = {
    propertyKey: property.key,
    currency,
    startDate: body.startDate,
    endDate: body.endDate,
  };

  waitUntil(
    markCalendarRangeActive(
      env,
      property,
      currency,
      body.startDate,
      body.endDate,
    ),
  );

  let snapshot = await readCalendarRange(env, refreshRequest);

  if (snapshot.hasAny) {
    // Stale-while-revalidate: never make a guest wait when we already have a
    // usable snapshot. The refresh happens after the response has been returned.
    if (snapshot.missing || snapshot.stale) {
      waitUntil(queueCalendarRefresh(env, refreshRequest).catch(() => undefined));
    }

    return json(
      {
        dates: snapshot.dates,
        generatedAt: snapshot.generatedAt
          ? new Date(snapshot.generatedAt).toISOString()
          : null,
        stale: snapshot.stale,
        refreshing: snapshot.missing || snapshot.stale,
      },
      200,
      "public, max-age=60, stale-while-revalidate=3600",
    );
  }

  // Cold cache only. The UI remains interactive while this request is in flight,
  // so this does not gate date selection or Search. Once KV has been warmed by
  // traffic/scheduled refreshes this path should be rare.
  try {
    await queueCalendarRefresh(env, refreshRequest);
    snapshot = await readCalendarRange(env, refreshRequest);
  } catch {
    // Calendar enrichment is advisory. A failed snapshot refresh must never
    // prevent the guest from selecting dates and running the authoritative search.
  }

  return json(
    {
      dates: snapshot.dates,
      generatedAt: snapshot.generatedAt
        ? new Date(snapshot.generatedAt).toISOString()
        : null,
      stale: snapshot.stale,
      refreshing: snapshot.missing,
    },
    200,
    "public, max-age=60, stale-while-revalidate=3600",
  );
};
