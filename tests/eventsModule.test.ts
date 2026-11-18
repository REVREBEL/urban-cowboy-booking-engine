// COW-40: DST-safe event recurrence, preview and schedule-only merchandising.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import {
  EVENT_TIME_ZONE,
  WEBFLOW_RECURRENCE_OPTION_IDS,
  WEBFLOW_WEEKDAY_OPTION_IDS,
  type EventSchedule,
} from "../src/types/event-contracts.ts";
import {
  eventScheduleJson,
  eventsForStay,
  expandEventOccurrences,
  parseRecurrenceRule,
  parseScheduleJson,
  resolveWallTime,
  toEventSchedule,
} from "../src/lib/event-recurrence.ts";
import { eventOccurrences, eventPreview } from "../worker/events.ts";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");
const WEEKLY = "d0ad84472f081450b147999db968f686";
const SATURDAY = WEBFLOW_WEEKDAY_OPTION_IDS["fae03cbec436d68c927f322815f34da9"];
const TUESDAY = WEBFLOW_WEEKDAY_OPTION_IDS["1921d71fca00d00f7cbcc5550b19ab23"];

function makeDb() {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON");
  for (const file of [
    "migrations/0001_init.sql", "migrations/0002_module_list_indexes.sql",
    "migrations/0003_property_scoped_contracts.sql", "migrations/0004_published_snapshots.sql",
    "migrations/0005_media_registry.sql", "migrations/0006_working_revision_pointer.sql",
  ]) db.exec(read(file));
  db.exec("INSERT INTO tenants (id, slug, name) VALUES ('urban-cowboy','urban-cowboy','Urban Cowboy')");
  db.exec("INSERT INTO locations (id, tenant_id, slug, name, time_zone) VALUES ('catskills','urban-cowboy','catskills','Catskills','America/New_York')");
  return db;
}

function d1(db: DatabaseSync): any {
  return {
    prepare(sql: string) {
      let params: unknown[] = [];
      return {
        bind(...v: unknown[]) { params = v; return this; },
        async all() { return { results: db.prepare(sql).all(...params) }; },
        async first() { return db.prepare(sql).get(...params) ?? null; },
        async run() { db.prepare(sql).run(...params); return { success: true, meta: { changes: 1 } }; },
      };
    },
  };
}

function schedule(overrides: Partial<EventSchedule> = {}): EventSchedule {
  return {
    id: "e1", title: "Event", timeZone: EVENT_TIME_ZONE,
    startsAt: "2027-02-01T13:40:00.000Z", endsAt: null,
    recurrenceRule: null, displayFlag: true, venue: null, venueType: "unknown", adultsOnly: false,
    ...overrides,
  };
}

test("webflow option IDs map to canonical recurrence types and weekdays", () => {
  assert.equal(WEBFLOW_RECURRENCE_OPTION_IDS[WEEKLY], "weekly");
  assert.equal(SATURDAY, 6);
  assert.equal(TUESDAY, 2);
  const rule = parseRecurrenceRule({
    "recurrence-type": WEEKLY, "repeat-every": "1", "repeat-on": WEBFLOW_WEEKDAY_OPTION_IDS["fae03cbec436d68c927f322815f34da9"],
    "recurring-start": "2027-02-01T13:40:00.000Z", "recurring-end": "2027-03-31T13:40:00.000Z",
  });
  assert.equal(rule?.type, "weekly");
  assert.deepEqual(rule?.weekdays, [6]);
  assert.equal(rule?.localStartDate, "2027-02-01");
  assert.equal(rule?.localTime, "08:40");
  assert.equal(rule?.untilLocalDate, "2027-03-31");
});

test("weekly recurrence keeps 08:40 local time across the spring DST transition", () => {
  const rule = parseRecurrenceRule({
    "recurrence-type": WEEKLY, "repeat-every": "1",
    "repeat-on": WEBFLOW_WEEKDAY_OPTION_IDS["fae03cbec436d68c927f322815f34da9"],
    "recurring-start": "2027-02-01T13:40:00.000Z", "recurring-end": "2027-03-31T13:40:00.000Z",
  })!;
  const occurrences = expandEventOccurrences(schedule({ id: "fondue", recurrenceRule: rule }), "2027-02-01", "2027-03-31");
  assert.ok(occurrences.length >= 8);
  assert.ok(occurrences.every((o) => o.localDate.startsWith("2027-") && new Date(`${o.localDate}T12:00:00Z`).getUTCDay() === 6));
  const before = occurrences.find((o) => o.localDate === "2027-02-06")!;
  const after = occurrences.find((o) => o.localDate === "2027-03-20")!;
  assert.equal(before.startsAt, "2027-02-06T13:40:00.000Z"); // EST
  assert.equal(after.startsAt, "2027-03-20T12:40:00.000Z"); // EDT, same 08:40 local
  assert.ok(occurrences.every((o) => !("availability" in o) && !("price" in o)));
});

test("a UTC-midnight anchor keeps its local weekday and time", () => {
  const rule = parseRecurrenceRule({
    "recurrence-type": WEEKLY, "repeat-every": "1",
    "repeat-on": WEBFLOW_WEEKDAY_OPTION_IDS["1921d71fca00d00f7cbcc5550b19ab23"],
    "recurring-start": "2026-10-06T00:00:00.000Z", "recurring-end": "2026-10-31T00:00:00.000Z",
  })!;
  assert.equal(rule.localTime, "20:00"); // Oct 5, 8pm EDT
  const occurrences = expandEventOccurrences(schedule({ recurrenceRule: rule }), "2026-10-01", "2026-10-31");
  const first = occurrences.find((o) => o.localDate === "2026-10-06")!;
  assert.ok(first);
  assert.equal(new Date(`${first.localDate}T12:00:00Z`).getUTCDay(), 2);
  assert.equal(first.startsAt, "2026-10-07T00:00:00.000Z");
});

test("daily and monthly rules keep local time and clamp short months", () => {
  const daily = parseRecurrenceRule({
    "recurrence-type": "1ca8e904af0708d46f5e480d678256ca",
    "repeat-every": "1", "datetime": "2027-03-12T13:00:00.000Z",
  })!;
  const dailyOccurrences = expandEventOccurrences(schedule({ recurrenceRule: daily }), "2027-03-12", "2027-03-16");
  assert.deepEqual(dailyOccurrences.map((o) => o.localDate), ["2027-03-12", "2027-03-13", "2027-03-14", "2027-03-15", "2027-03-16"]);
  assert.equal(dailyOccurrences[0].startsAt, "2027-03-12T13:00:00.000Z");
  assert.equal(dailyOccurrences[4].startsAt, "2027-03-16T12:00:00.000Z"); // same 08:00 local, now EDT

  const monthly = parseRecurrenceRule({
    "recurrence-type": "25f888fcdf13745275d035a6eacfe18c",
    "repeat-every": "1", "datetime": "2027-01-31T15:00:00.000Z",
  })!;
  const monthlyOccurrences = expandEventOccurrences(schedule({ recurrenceRule: monthly }), "2027-01-01", "2027-03-31");
  assert.deepEqual(monthlyOccurrences.map((o) => o.localDate), ["2027-01-31", "2027-02-28", "2027-03-31"]);
});

test("far-future windows are not truncated by a long recurrence history", () => {
  const daily = parseRecurrenceRule({
    "recurrence-type": "1ca8e904af0708d46f5e480d678256ca",
    "repeat-every": "1", "datetime": "2026-01-01T15:00:00.000Z",
  })!;
  const dailyOccurrences = expandEventOccurrences(schedule({ recurrenceRule: daily }), "2028-06-01", "2028-06-07");
  assert.deepEqual(dailyOccurrences.map((o) => o.localDate), [
    "2028-06-01", "2028-06-02", "2028-06-03", "2028-06-04", "2028-06-05", "2028-06-06", "2028-06-07",
  ]);

  const monthly = parseRecurrenceRule({
    "recurrence-type": "25f888fcdf13745275d035a6eacfe18c",
    "repeat-every": "1", "datetime": "2027-01-31T15:00:00.000Z",
  })!;
  const monthlyOccurrences = expandEventOccurrences(schedule({ recurrenceRule: monthly }), "2030-05-01", "2030-07-31");
  assert.deepEqual(monthlyOccurrences.map((o) => o.localDate), ["2030-05-31", "2030-06-30", "2030-07-31"]);
});

test("DST boundary local times use a documented deterministic policy", () => {
  // Spring forward: 02:30 does not exist; shift forward to 03:30 local (EDT).
  const spring = resolveWallTime(2027, 3, 14, 2, 30, EVENT_TIME_ZONE);
  assert.equal(spring.resolution, "shifted_forward");
  assert.equal(new Date(spring.instant).toISOString(), "2027-03-14T07:30:00.000Z");

  // Fall back: 01:30 happens twice; use the first (EDT) instant.
  const fall = resolveWallTime(2026, 11, 1, 1, 30, EVENT_TIME_ZONE);
  assert.equal(fall.resolution, "ambiguous_earlier");
  assert.equal(new Date(fall.instant).toISOString(), "2026-11-01T05:30:00.000Z");

  const ordinary = resolveWallTime(2027, 6, 1, 12, 0, EVENT_TIME_ZONE);
  assert.equal(ordinary.resolution, "exact");
  assert.equal(new Date(ordinary.instant).toISOString(), "2027-06-01T16:00:00.000Z");
});

test("one-time events expand once and stay merchandising never claims availability", () => {
  const once = parseRecurrenceRule({ "recurrence-type": "de874223b039df253956066a7d1b04d9", "datetime": "2027-01-10T15:00:00.000Z" })!;
  const occurrence = expandEventOccurrences(schedule({ recurrenceRule: once }), "2027-01-01", "2027-12-31");
  assert.equal(occurrence.length, 1);
  assert.deepEqual(eventsForStay(occurrence, "2027-01-09", "2027-01-12").map((o) => o.localDate), ["2027-01-10"]);
  assert.deepEqual(eventsForStay(occurrence, "2027-02-01", "2027-02-04"), []);
});

test("the seed stores a canonical schedule with venue and adults-only flags", () => {
  const meta = eventScheduleJson({
    id: "x", name: "Ranch 54", datetime: "2026-12-31T13:30:00.000Z", "datetime-end": "2026-12-31T20:30:00.000Z",
    onsite: "true", "onsite-event-location": "venue-1", "adults-only-21": "true",
  });
  assert.equal(meta.recurrenceRule?.type, "one_time");
  assert.equal(meta.venueType, "onsite");
  assert.equal(meta.adultsOnly, true);
  const legacy = parseScheduleJson(WEEKLY, "2027-02-01T13:40:00.000Z");
  assert.equal(legacy.recurrenceRule?.type, "weekly");
  assert.equal(legacy.recurrenceRule?.localTime, "08:40");

  const seed = read("seed.sql");
  assert.match(seed, /"venueType":"onsite"/);
  assert.match(seed, /"localTime":"08:40"/);
});

test("preview and occurrence endpoints are Access-gated and stay schedule-only", async () => {
  const db = makeDb();
  const admin: any = { sub: "s", email: "e@x.test", groups: [], roles: ["admin"], tenantId: "urban-cowboy" };
  const ctx = {
    request: new Request("https://example.test/api/content/events/preview", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: { name: "Saturday Fondue", "recurrence-type": WEEKLY, "repeat-on": WEBFLOW_WEEKDAY_OPTION_IDS["fae03cbec436d68c927f322815f34da9"], "recurring-start": "2027-02-01T13:40:00.000Z", "recurring-end": "2027-03-31T13:40:00.000Z" },
        from: "2027-02-01", to: "2027-03-31",
      }),
    }),
    env: { DB: d1(db) } as any,
    waitUntil: () => {},
  };
  const allowAdmin = async () => admin as any;
  const deny = async () => new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  const denied = await eventPreview(ctx, deny);
  assert.equal(denied.status, 401);
  const preview = await eventPreview(ctx, allowAdmin);
  assert.equal(preview.status, 200);
  const body = await preview.json() as any;
  assert.ok(body.occurrences.length >= 8);
  assert.match(body.note, /Mews/);

  db.prepare(
    "INSERT INTO events (id, tenant_id, location_id, title, time_zone, starts_at, recurrence_rule, display_flag) VALUES ('e-seed','urban-cowboy','catskills','Fondue','America/New_York','2027-02-01T13:40:00.000Z',?,1)",
  ).run(JSON.stringify({ recurrenceRule: parseRecurrenceRule({ "recurrence-type": WEEKLY, "repeat-on": WEBFLOW_WEEKDAY_OPTION_IDS["fae03cbec436d68c927f322815f34da9"], "recurring-start": "2027-02-01T13:40:00.000Z", "recurring-end": "2027-03-31T13:40:00.000Z" }), venueType: "onsite", adultsOnly: false }));
  const occurrencesCtx = {
    ...ctx,
    request: new Request("https://example.test/api/content/events/occurrences?from=2027-02-01&to=2027-03-31&checkIn=2027-02-05&checkOut=2027-02-08"),
  };
  const listed = await eventOccurrences(occurrencesCtx, async () => ({ ...admin, roles: ["viewer"] }) as any);
  assert.equal(listed.status, 200);
  const listedBody = await listed.json() as any;
  assert.ok(listedBody.occurrences.length >= 8);
  assert.equal(listedBody.duringStay.length, 1);
  assert.equal(listedBody.source, "d1_schedule");
  assert.match(listedBody.note, /no availability or price/i);
  const crossTenant = await eventOccurrences(occurrencesCtx, async () => ({ ...admin, roles: ["viewer"], tenantId: "other" }) as any);
  assert.equal(crossTenant.status, 200);
  assert.deepEqual((await crossTenant.json() as any).occurrences, []);
  db.close();
});

test("D1 row schedule parsing tolerates legacy raw option IDs", () => {
  const event = toEventSchedule({
    id: "legacy", title: "Legacy", starts_at: "2027-02-01T13:40:00.000Z", ends_at: null,
    time_zone: "America/New_York", recurrence_rule: WEEKLY, display_flag: 1, venue: null,
  });
  assert.equal(event.recurrenceRule?.type, "weekly");
  assert.equal(event.recurrenceRule?.localTime, "08:40");
});
