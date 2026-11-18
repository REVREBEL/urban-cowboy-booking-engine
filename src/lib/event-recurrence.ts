/**
 * Event recurrence expansion for the D1 events module (COW-40).
 *
 * Webflow stores event instants as UTC ISO strings. Recurrences must keep the
 * same local wall-clock time in the property time zone across DST, so the
 * anchor is converted to local parts once and each occurrence's local date is
 * converted back to an instant with an offset-iteration conversion.
 *
 * Occurrences are schedule facts only. They never assert room availability or
 * booking eligibility; Mews remains the source of truth for those.
 */
import {
  EVENT_TIME_ZONE,
  WEBFLOW_EVERYDAY_OPTION_ID,
  WEBFLOW_RECURRENCE_OPTION_IDS,
  WEBFLOW_WEEKDAY_OPTION_IDS,
  type EventOccurrence,
  type EventSchedule,
  type RecurrenceRule,
  type VenueType,
  type WebflowEventFields,
} from "../types/event-contracts.ts";

export interface EventScheduleJson {
  recurrenceRule: RecurrenceRule | null;
  venueType: VenueType;
  adultsOnly: boolean;
}

const DAY_MS = 86_400_000;
const fmtCache = new Map<string, Intl.DateTimeFormat>();

function zonedFormatter(timeZone: string): Intl.DateTimeFormat {
  let fmt = fmtCache.get(timeZone);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      hourCycle: "h23",
    });
    fmtCache.set(timeZone, fmt);
  }
  return fmt;
}

interface ZonedParts { year: number; month: number; day: number; hour: number; minute: number; second: number; weekday: number }

function zonedParts(instant: number, timeZone: string): ZonedParts {
  const parts = zonedFormatter(timeZone).formatToParts(new Date(instant));
  const value = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const weekdayName = parts.find((p) => p.type === "weekday")?.value ?? "Sunday";
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return {
    year: value("year"), month: value("month"), day: value("day"),
    hour: value("hour"), minute: value("minute"), second: value("second"),
    weekday: Math.max(0, weekdays.indexOf(weekdayName)),
  };
}

/** Offset of a time zone at an instant, in ms (UTC - local semantics). */
function zoneOffsetMs(instant: number, timeZone: string): number {
  const p = zonedParts(instant, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(instant / 1000) * 1000;
}

export type WallTimeResolution = "exact" | "ambiguous_earlier" | "shifted_forward";

export interface ResolvedWallTime {
  instant: number;
  resolution: WallTimeResolution;
}

/**
 * Convert local wall-clock parts in a time zone back to a UTC instant.
 *
 * Policy: a repeated time at fall-back resolves to the FIRST (earlier) instant;
 * a nonexistent time at spring-forward shifts forward by the offset gap (1 hour
 * in America/New_York), i.e. 02:30 becomes 03:30 local. Both are deterministic
 * and reported via `resolution` so callers can explain the result.
 */
export function resolveWallTime(
  year: number, month: number, day: number, hour: number, minute: number, timeZone: string,
): ResolvedWallTime {
  const wall = Date.UTC(year, month - 1, day, hour, minute, 0);
  const offsets = [...new Set([
    zoneOffsetMs(wall - DAY_MS, timeZone),
    zoneOffsetMs(wall, timeZone),
    zoneOffsetMs(wall + DAY_MS, timeZone),
  ])].sort((a, b) => a - b);
  const matches = offsets
    .map((offset) => wall - offset)
    .filter((instant) => {
      const p = zonedParts(instant, timeZone);
      return p.year === year && p.month === month && p.day === day && p.hour === hour && p.minute === minute;
    })
    .sort((a, b) => a - b);

  if (matches.length) {
    return { instant: matches[0], resolution: matches.length > 1 ? "ambiguous_earlier" : "exact" };
  }

  const gap = offsets.length > 1 ? offsets[offsets.length - 1] - offsets[0] : 3_600_000;
  const laterOffset = offsets[offsets.length - 1];
  // Shift the wall time forward by the gap and resolve with the later offset.
  return { instant: wall + gap - laterOffset, resolution: "shifted_forward" };
}

export function wallTimeToInstant(
  year: number, month: number, day: number, hour: number, minute: number, timeZone: string,
): number {
  return resolveWallTime(year, month, day, hour, minute, timeZone).instant;
}

const pad = (n: number) => String(n).padStart(2, "0");
export const localDateOf = (iso: string, timeZone: string): string => {
  const p = zonedParts(Date.parse(iso), timeZone);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
};
const localTimeOf = (iso: string, timeZone: string): string => {
  const p = zonedParts(Date.parse(iso), timeZone);
  return `${pad(p.hour)}:${pad(p.minute)}`;
};
const weekdayOfLocalDate = (date: string): number =>
  new Date(Date.UTC(Number(date.slice(0, 4)), Number(date.slice(5, 7)) - 1, Number(date.slice(8, 10)))).getUTCDay();

const addLocalDays = (date: string, days: number): string => {
  const t = Date.UTC(Number(date.slice(0, 4)), Number(date.slice(5, 7)) - 1, Number(date.slice(8, 10))) + days * DAY_MS;
  const d = new Date(t);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
};

function addLocalMonths(date: string, months: number): string {
  const year = Number(date.slice(0, 4));
  const month = Number(date.slice(5, 7)) - 1;
  const day = Number(date.slice(8, 10));
  const target = new Date(Date.UTC(year, month + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  return `${target.getUTCFullYear()}-${pad(target.getUTCMonth() + 1)}-${pad(Math.min(day, lastDay))}`;
}

const parseIds = (value: string | number | undefined): string[] =>
  String(value ?? "").split(",").map((part) => part.trim()).filter(Boolean);

/** Build the canonical recurrence rule from Webflow-like event fields. */
export function parseRecurrenceRule(
  fields: WebflowEventFields,
  timeZone = EVENT_TIME_ZONE,
): RecurrenceRule | null {
  const anchor = fields["recurring-start"] || fields.datetime;
  if (!anchor || Number.isNaN(Date.parse(anchor))) return null;

  const rawType = fields["recurrence-type"] ?? "";
  const type = WEBFLOW_RECURRENCE_OPTION_IDS[rawType] ?? "one_time";
  const every = Math.max(1, Math.min(365, Math.floor(Number(fields["repeat-every"]) || 1)));
  const localStartDate = localDateOf(anchor, timeZone);

  let weekdays = parseIds(fields["repeat-on"])
    .flatMap((id) => {
      if (id === WEBFLOW_EVERYDAY_OPTION_ID) return [0, 1, 2, 3, 4, 5, 6];
      const mapped = WEBFLOW_WEEKDAY_OPTION_IDS[id];
      if (typeof mapped === "number") return [mapped];
      return /^[0-6]$/.test(id) ? [Number(id)] : [];
    })
    .filter((day): day is number => typeof day === "number")
    .filter((day, index, all) => all.indexOf(day) === index)
    .sort((a, b) => a - b);
  if (type === "weekly" && weekdays.length === 0) weekdays = [weekdayOfLocalDate(localStartDate)];

  const untilRaw = fields["recurring-end"];
  return {
    type,
    every,
    weekdays,
    timeZone,
    localStartDate,
    localTime: localTimeOf(anchor, timeZone),
    untilLocalDate: untilRaw && !Number.isNaN(Date.parse(untilRaw)) ? localDateOf(untilRaw, timeZone) : null,
  };
}

/** Venue and adult-only classification from Webflow-like fields. */
export function parseVenue(fields: WebflowEventFields): { venue: string | null; venueType: VenueType } {
  if (fields["onsite-custom-location"]) return { venue: fields["onsite-custom-location"], venueType: "custom" };
  if (fields["offsite-event-location"]) return { venue: fields["offsite-event-location"], venueType: "offsite" };
  if (fields["onsite-event-location"]) return { venue: fields["onsite-event-location"], venueType: "onsite" };
  return { venue: null, venueType: "unknown" };
}

const isTrue = (value: string | boolean | undefined): boolean =>
  value === true || String(value ?? "").toLowerCase() === "true";

/** Canonical JSON stored in events.recurrence_rule. */
export function eventScheduleJson(fields: WebflowEventFields, timeZone = EVENT_TIME_ZONE): EventScheduleJson {
  return {
    recurrenceRule: parseRecurrenceRule(fields, timeZone),
    venueType: parseVenue(fields).venueType,
    adultsOnly: isTrue(fields["adults-only-21"]),
  };
}

/** Reads both the canonical JSON and legacy raw option IDs from D1 rows. */
export function parseScheduleJson(
  raw: string | null | undefined,
  startsAt: string,
  timeZone = EVENT_TIME_ZONE,
): EventScheduleJson {
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<EventScheduleJson>;
      if (parsed && "recurrenceRule" in parsed) {
        return {
          recurrenceRule: parsed.recurrenceRule ?? null,
          venueType: parsed.venueType ?? "unknown",
          adultsOnly: parsed.adultsOnly === true,
        };
      }
    } catch { /* legacy raw option ID, handled below */ }
    if (Object.prototype.hasOwnProperty.call(WEBFLOW_RECURRENCE_OPTION_IDS, raw)) {
      return {
        recurrenceRule: parseRecurrenceRule({ "recurrence-type": raw, "recurring-start": startsAt }, timeZone),
        venueType: "unknown",
        adultsOnly: false,
      };
    }
  }
  return { recurrenceRule: null, venueType: "unknown", adultsOnly: false };
}

/** Maps a D1 events row (snake_case) to the schedule contract. */
export function toEventSchedule(row: any, timeZone = EVENT_TIME_ZONE): EventSchedule {
  const meta = parseScheduleJson(row.recurrence_rule, row.starts_at, row.time_zone || timeZone);
  const venueType = meta.venueType;
  return {
    id: row.id,
    title: row.title,
    timeZone: row.time_zone || timeZone,
    startsAt: row.starts_at,
    endsAt: row.ends_at ?? null,
    recurrenceRule: meta.recurrenceRule,
    displayFlag: row.display_flag === 1 || row.display_flag === true,
    venue: row.venue ?? null,
    venueType,
    adultsOnly: meta.adultsOnly,
  };
}

const localDateMs = (date: string): number =>
  Date.UTC(Number(date.slice(0, 4)), Number(date.slice(5, 7)) - 1, Number(date.slice(8, 10)));
const diffLocalDays = (a: string, b: string): number => Math.floor((localDateMs(a) - localDateMs(b)) / DAY_MS);
const diffLocalMonths = (a: string, b: string): number =>
  (Number(a.slice(0, 4)) - Number(b.slice(0, 4))) * 12 +
  (Number(a.slice(5, 7)) - Number(b.slice(5, 7)));

/**
 * Candidates in [from, to]. Every branch jumps to the first candidate at or
 * after `from` before applying `limit`, so a long history cannot consume the
 * output budget before a far-future window is reached.
 */
function candidateLocalDates(rule: RecurrenceRule, from: string, to: string, limit: number): string[] {
  const last = rule.untilLocalDate && rule.untilLocalDate < to ? rule.untilLocalDate : to;
  if (last < from || rule.localStartDate > last) return [];
  const dates: string[] = [];

  if (rule.type === "one_time") {
    return [rule.localStartDate];
  }
  if (rule.type === "daily") {
    let step = Math.max(0, Math.ceil(diffLocalDays(from, rule.localStartDate) / rule.every));
    let date = addLocalDays(rule.localStartDate, step * rule.every);
    while (date <= last && dates.length < limit) {
      dates.push(date);
      step++;
      date = addLocalDays(rule.localStartDate, step * rule.every);
    }
    return dates;
  }
  if (rule.type === "monthly") {
    let step = Math.max(0, Math.ceil(diffLocalMonths(from, rule.localStartDate) / rule.every));
    let date = addLocalMonths(rule.localStartDate, step * rule.every);
    // Day-of-month clamping (e.g. the 31st in February) can land before `from`.
    while (date < from) {
      step++;
      date = addLocalMonths(rule.localStartDate, step * rule.every);
    }
    while (date <= last && dates.length < limit) {
      dates.push(date);
      step++;
      date = addLocalMonths(rule.localStartDate, step * rule.every);
    }
    return dates;
  }

  // Weekly: anchor the first week on the rule's start date, jump to the first
  // week overlapping `from`, then include each configured weekday in that week.
  const startDow = weekdayOfLocalDate(rule.localStartDate);
  const weekStart = addLocalDays(rule.localStartDate, -startDow);
  const weekdays = [...new Set(rule.weekdays)].sort((a, b) => a - b);
  let w = Math.max(0, Math.floor(diffLocalDays(from, weekStart) / (7 * rule.every)));
  for (;; w++) {
    const base = addLocalDays(weekStart, w * 7 * rule.every);
    if (base > last) break;
    for (const weekday of weekdays) {
      const date = addLocalDays(base, weekday);
      if (date >= rule.localStartDate && date >= from && date <= last) dates.push(date);
      if (dates.length >= limit) return dates.sort();
    }
  }
  return dates.sort();
}

/** Expand a schedule into concrete occurrences between two local dates (inclusive). */
export function expandEventOccurrences(
  event: EventSchedule,
  fromLocalDate: string,
  toLocalDate: string,
  limit = 400,
): EventOccurrence[] {
  if (fromLocalDate > toLocalDate) return [];
  const rule = event.recurrenceRule;
  const anchor = rule?.localStartDate ?? localDateOf(event.startsAt, event.timeZone);
  const localDates = rule
    ? candidateLocalDates(rule, fromLocalDate > anchor ? fromLocalDate : anchor, toLocalDate, limit)
    : (anchor >= fromLocalDate && anchor <= toLocalDate ? [anchor] : []);
  const [hour, minute] = (rule?.localTime ?? localTimeOf(event.startsAt, event.timeZone)).split(":").map(Number);
  const durationMs = event.endsAt && Date.parse(event.endsAt) > Date.parse(event.startsAt)
    ? Date.parse(event.endsAt) - Date.parse(event.startsAt)
    : null;

  return localDates
    .filter((date) => date >= fromLocalDate && date <= toLocalDate)
    .slice(0, limit)
    .map((localDate) => {
      const starts = wallTimeToInstant(
        Number(localDate.slice(0, 4)), Number(localDate.slice(5, 7)), Number(localDate.slice(8, 10)),
        hour, minute, event.timeZone,
      );
      return {
        eventId: event.id,
        title: event.title,
        localDate,
        startsAt: new Date(starts).toISOString(),
        endsAt: durationMs === null ? null : new Date(starts + durationMs).toISOString(),
        timeZone: event.timeZone,
        venue: event.venue,
        venueType: event.venueType,
        adultsOnly: event.adultsOnly,
        displayFlag: event.displayFlag,
      };
    });
}

/** Optional merchandising: events during a stay. Schedule only, no availability claim. */
export function eventsForStay(
  occurrences: readonly EventOccurrence[],
  checkIn: string,
  checkOut: string,
): EventOccurrence[] {
  return occurrences
    .filter((o) => o.localDate >= checkIn && o.localDate < checkOut)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt) || a.eventId.localeCompare(b.eventId));
}
