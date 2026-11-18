/** Event schedule contracts for the D1 events module (COW-40). */

export const EVENT_TIME_ZONE = "America/New_York";

export const RECURRENCE_TYPES = ["one_time", "daily", "weekly", "monthly"] as const;
export type RecurrenceType = (typeof RECURRENCE_TYPES)[number];

/** Webflow Events option IDs (see cowboy-dashboard/DETAILED_FIELDS.md). */
export const WEBFLOW_RECURRENCE_OPTION_IDS: Readonly<Record<string, RecurrenceType>> = Object.freeze({
  de874223b039df253956066a7d1b04d9: "one_time",
  "1ca8e904af0708d46f5e480d678256ca": "daily",
  d0ad84472f081450b147999db968f686: "weekly",
  "25f888fcdf13745275d035a6eacfe18c": "monthly",
});

/** Webflow weekday option IDs; 0 = Sunday. */
export const WEBFLOW_WEEKDAY_OPTION_IDS: Readonly<Record<string, number>> = Object.freeze({
  "98af54dd9ea9b5f335099c095aca1136": 0, // Sunday
  "7cc86e6537ed9a5131cdac1d17619c69": 1, // Monday
  "1921d71fca00d00f7cbcc5550b19ab23": 2, // Tuesday
  "29bbbd6b12272d329bd745713ac0b2ed": 3, // Wednesday
  cee5257a2f496e62195f2ab361114c66: 4, // Thursday
  eed4571c21a505739557d7c0c2d56aeb: 5, // Friday
  fae03cbec436d68c927f322815f34da9: 6, // Saturday
});
export const WEBFLOW_EVERYDAY_OPTION_ID = "aef6c1474053c11670fd05ac8e96f485";

export const VENUE_TYPES = ["onsite", "offsite", "custom", "unknown"] as const;
export type VenueType = (typeof VENUE_TYPES)[number];

export interface RecurrenceRule {
  type: RecurrenceType;
  every: number;
  /** 0 = Sunday; only meaningful for weekly rules. */
  weekdays: number[];
  timeZone: string;
  /** Anchor local calendar date and wall-clock time of the first occurrence. */
  localStartDate: string;
  localTime: string;
  /** Last local calendar date (inclusive), when the source defines one. */
  untilLocalDate: string | null;
}

export interface EventSchedule {
  id: string;
  title: string;
  timeZone: string;
  startsAt: string;
  endsAt: string | null;
  recurrenceRule: RecurrenceRule | null;
  displayFlag: boolean;
  venue: string | null;
  venueType: VenueType;
  adultsOnly: boolean;
}

export interface EventOccurrence {
  eventId: string;
  title: string;
  /** Local calendar date in the event's time zone (YYYY-MM-DD). */
  localDate: string;
  startsAt: string;
  endsAt: string | null;
  timeZone: string;
  venue: string | null;
  venueType: VenueType;
  adultsOnly: boolean;
  displayFlag: boolean;
}

/** Raw Webflow-like field bag used by the importer and the editor preview. */
export interface WebflowEventFields {
  id?: string;
  name?: string;
  datetime?: string;
  "datetime-end"?: string;
  "recurrence-type"?: string;
  "repeat-every"?: string | number;
  "repeat-on"?: string | number;
  "recurring-start"?: string;
  "recurring-end"?: string;
  onsite?: string | boolean;
  "offsite-event"?: string | boolean;
  "onsite-event-location"?: string;
  "offsite-event-location"?: string;
  "onsite-custom-location"?: string;
  "adults-only-21"?: string | boolean;
  active?: string | boolean;
  isDraft?: string | boolean;
}
