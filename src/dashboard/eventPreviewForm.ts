/** Pure contracts for the events calendar preview form (COW-40). */

import { EVENT_TIME_ZONE, type WebflowEventFields } from "../types/event-contracts.ts";
import { localDateTimeToIso } from "../lib/event-recurrence.ts";

export const PREVIEW_DEFAULT_MONTHS = 12;
export const PREVIEW_MAX_MONTHS = 24;

const addMonths = (date: string, months: number): string => {
  const utc = new Date(Date.UTC(
    Number(date.slice(0, 4)), Number(date.slice(5, 7)) - 1 + months, Number(date.slice(8, 10)),
  ));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${utc.getUTCFullYear()}-${pad(utc.getUTCMonth() + 1)}-${pad(utc.getUTCDate())}`;
};

/** Preview window anchored to the event's own dates, not the editor's calendar month. */
export function previewRange(startLocalDate: string, until?: string): { from: string; to: string } {
  const max = addMonths(startLocalDate, PREVIEW_MAX_MONTHS);
  if (until && until >= startLocalDate) return { from: startLocalDate, to: until > max ? max : until };
  return { from: startLocalDate, to: addMonths(startLocalDate, PREVIEW_DEFAULT_MONTHS) };
}

export interface PreviewFormInput {
  name: string;
  /** datetime-local value in the property time zone, e.g. 2027-12-31T08:30. */
  startLocal: string;
  until?: string;
  recurrenceType: string;
  repeatOn?: string;
  /** "onsite:<id>" or "offsite:<id>". */
  venue?: string;
}

/** Builds a Webflow-like field bag preserving the venue class. */
export function buildPreviewFields(input: PreviewFormInput): WebflowEventFields {
  const startIso = input.startLocal
    ? localDateTimeToIso(input.startLocal, EVENT_TIME_ZONE)
    : "";
  const venueSeparator = input.venue?.indexOf(":") ?? -1;
  const venueType = venueSeparator > 0 ? input.venue!.slice(0, venueSeparator) : "";
  const venueId = venueSeparator > 0 ? input.venue!.slice(venueSeparator + 1) : "";

  return {
    name: input.name || "Untitled event",
    ...(startIso ? { "recurring-start": startIso, datetime: startIso } : {}),
    ...(input.until
      ? { "recurring-end": `${input.until}T23:59:00.000Z` }
      : {}),
    "recurrence-type": input.recurrenceType,
    ...(input.repeatOn ? { "repeat-on": input.repeatOn, "repeat-every": "1" } : {}),
    ...(venueType === "onsite" && venueId ? { "onsite-event-location": venueId } : {}),
    ...(venueType === "offsite" && venueId
      ? { "offsite-event": "true", "offsite-event-location": venueId }
      : {}),
  };
}
