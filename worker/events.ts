/** Events module endpoints (COW-40): editor preview and scoped occurrences. */

import type { Env } from "./mews/_lib.ts";
import { authorizeScopedRequest, type Principal } from "./auth.ts";
import {
  EVENT_TIME_ZONE,
  type EventSchedule,
  type EventOccurrence,
  type WebflowEventFields,
} from "../src/types/event-contracts.ts";
import {
  eventsForStay,
  expandEventOccurrences,
  parseRecurrenceRule,
  parseVenue,
  toEventSchedule,
} from "../src/lib/event-recurrence.ts";

export type EventCtx = { request: Request; env: Env; waitUntil: (promise: Promise<unknown>) => void };
export type EventAuthorize = (request: Request, env: Env, role: "admin" | "viewer") => Promise<Principal | Response>;

const NO_STORE: Record<string, string> = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store, private",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: NO_STORE });
const isTrue = (value: string | boolean | undefined): boolean =>
  value === true || String(value ?? "").toLowerCase() === "true";
const isDate = (value: string | null | undefined): value is string =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

/** Admin preview of a draft event: expands the schedule without publishing. */
export async function eventPreview(
  ctx: EventCtx,
  authorize: EventAuthorize = authorizeScopedRequest,
): Promise<Response> {
  const principal = await authorize(ctx.request, ctx.env, "admin");
  if (principal instanceof Response) return principal;
  let body: { fields?: WebflowEventFields; from?: string; to?: string };
  try {
    body = await ctx.request.json();
  } catch {
    return json({ error: "invalid_input" }, 400);
  }
  const fields = body.fields;
  const from = body.from;
  const to = body.to;
  if (!fields || typeof fields !== "object" || !isDate(from) || !isDate(to)) {
    return json({ error: "invalid_input" }, 400);
  }
  const anchor = fields["recurring-start"] || fields.datetime;
  if (!anchor || Number.isNaN(Date.parse(anchor))) {
    return json({ error: "missing_start" }, 400);
  }
  const venue = parseVenue(fields);
  const schedule: EventSchedule = {
    id: fields.id ?? "preview",
    title: fields.name ?? "Untitled event",
    timeZone: EVENT_TIME_ZONE,
    startsAt: anchor,
    endsAt: fields["datetime-end"] || null,
    recurrenceRule: parseRecurrenceRule(fields),
    displayFlag: true,
    venue: venue.venue,
    venueType: venue.venueType,
    adultsOnly: isTrue(fields["adults-only-21"]),
  };
  return json({
    schedule,
    occurrences: expandEventOccurrences(schedule, from, to),
    note: "Schedule preview only; availability and pricing come from Mews at booking time.",
  });
}

/** Venue references for the calendar editor: onsite buildings and outlet records. */
export async function eventVenues(
  ctx: EventCtx,
  authorize: EventAuthorize = authorizeScopedRequest,
): Promise<Response> {
  const principal = await authorize(ctx.request, ctx.env, "admin");
  if (principal instanceof Response) return principal;
  const db = ctx.env.DB;
  if (!db) return json({ error: "D1 not configured" }, 503);

  const buildings = await db.prepare(
    "SELECT id, name FROM buildings WHERE tenant_id = ?1 ORDER BY name, id",
  ).bind(principal.tenantId).all();
  const outlets = await db.prepare(
    "SELECT id, slug FROM content_items WHERE tenant_id = ?1 AND kind = 'outlet' AND status = 'published' ORDER BY slug, id",
  ).bind(principal.tenantId).all();

  return json({
    onsite: (buildings.results ?? []).map((row: any) => ({ id: row.id, name: row.name })),
    outlets: (outlets.results ?? []).map((row: any) => ({ id: row.id, name: row.slug })),
  });
}

/** Published event occurrences in a local date range, scoped by tenant/location. */
export async function eventOccurrences(
  ctx: EventCtx,
  authorize: EventAuthorize = authorizeScopedRequest,
): Promise<Response> {
  const principal = await authorize(ctx.request, ctx.env, "viewer");
  if (principal instanceof Response) return principal;
  const db = ctx.env.DB;
  if (!db) return json({ error: "D1 not configured" }, 503);

  const url = new URL(ctx.request.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  if (!isDate(from) || !isDate(to) || from > to) {
    return json({ error: "invalid_range" }, 400);
  }
  const locationId = url.searchParams.get("location");
  if (locationId && !/^[a-zA-Z0-9]+$/.test(locationId)) {
    return json({ error: "invalid_location" }, 400);
  }

  const result = await db.prepare(
    "SELECT * FROM events WHERE tenant_id = ?1 AND display_flag = 1 AND (?2 IS NULL OR location_id = ?2) ORDER BY starts_at, id",
  ).bind(principal.tenantId, locationId ?? null).all();

  const occurrences: EventOccurrence[] = [];
  for (const row of (result.results ?? []) as any[]) {
    occurrences.push(...expandEventOccurrences(toEventSchedule(row), from, to));
  }
  const checkIn = url.searchParams.get("checkIn");
  const checkOut = url.searchParams.get("checkOut");
  const duringStay = isDate(checkIn) && isDate(checkOut) && checkIn < checkOut
    ? eventsForStay(occurrences, checkIn, checkOut)
    : [];

  return json({
    source: "d1_schedule",
    occurrences: occurrences.sort((a, b) => a.startsAt.localeCompare(b.startsAt) || a.eventId.localeCompare(b.eventId)),
    duringStay,
    note: "Schedule only; no availability or price is asserted. Mews remains authoritative for booking.",
  });
}
