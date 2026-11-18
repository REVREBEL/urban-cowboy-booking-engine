# Events module: recurrence, venue and merchandising (COW-40)

First slice of COW-40: a D1-backed event schedule contract, a DST-safe recurrence engine, an admin preview endpoint and a scoped occurrence endpoint. No guest-facing route is switched, and Mews transactional behavior is untouched.

## Schedule contract

`src/types/event-contracts.ts` defines the canonical schedule types. Webflow's opaque option IDs are mapped once:

- Recurrence: One Time / Daily / Weekly / Monthly.
- Repeat-on: weekday option IDs (0 = Sunday) plus "Everyday".

`src/lib/event-recurrence.ts` stores a `RecurrenceRule` in `events.recurrence_rule` as JSON alongside `venueType` and `adultsOnly`:

```json
{
  "recurrenceRule": {
    "type": "weekly", "every": 1, "weekdays": [6],
    "timeZone": "America/New_York",
    "localStartDate": "2027-02-01", "localTime": "08:40",
    "untilLocalDate": "2027-03-31"
  },
  "venueType": "onsite",
  "adultsOnly": false
}
```

The importer (`scripts/seed-d1-from-webflow.mjs`) derives this from the Webflow Events export; the seed stores it in `events.recurrence_rule`. Legacy rows that still contain a raw option ID are parsed by `parseScheduleJson` using `starts_at`, so the migration is backward compatible without a schema change.

## DST correctness

Webflow stores instants in UTC. Anchoring on the local wall time avoids drifting an hour after a DST transition:

1. Convert the source instant to local parts in the event time zone (default `America/New_York`).
2. Generate recurrence dates on a local calendar (UTC-based date arithmetic, never a local `Date`).
3. Convert each local date + wall time back to an instant with offset iteration.

Example: a Saturday event anchored at `2027-02-01T13:40:00Z` is 08:40 EST. Its 2027-02-06 occurrence is `13:40Z`; its 2027-03-20 occurrence is `12:40Z` — still 08:40 local after the spring transition. The UTC-midnight Bingo anchor (`2026-10-06T00:00:00Z`) correctly resolves to Monday 20:00 local, which is why its Tuesday repeat lands on Tuesday local dates.

DST boundary policy is explicit in `resolveWallTime`: a repeated local time at fall-back resolves to the **first** (earlier) instant, and a nonexistent local time at spring-forward shifts **forward** by the offset gap (02:30 becomes 03:30 local). The result carries a `resolution` of `exact`, `ambiguous_earlier` or `shifted_forward`.

Occurrence expansion is capped (400 by default) to avoid runaway ranges. Daily, weekly and monthly rules jump to the first candidate at or after the requested window before applying the cap, so a recurrence anchored years earlier cannot be truncated before a far-future query window is reached.

## Endpoints

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/content/events/preview` | admin (Access) | Expand a draft Webflow-like event payload over a local date range without publishing |
| GET | `/api/content/events/occurrences?from=&to=&location=&checkIn=&checkOut=` | viewer (Access) | Published, displayed event occurrences in a range, with `duringStay` merchandising |
| GET | `/api/content/events/venues` | admin (Access) | Onsite buildings and published outlet references for venue pickers |

Both return `Cache-Control: no-store, private`. Tenant scope comes from the verified principal, never the query string. The existing `/api/content/events` route is unchanged.

## Merchandising without false claims

`eventsForStay(occurrences, checkIn, checkOut)` selects schedule entries whose local date falls within a stay. Occurrences contain only schedule fields (`startsAt`, `localDate`, `venue`, `venueType`, `adultsOnly`, `displayFlag`) — deliberately **no availability, price or booking field**. Both endpoints return a note that Mews remains authoritative for availability and pricing. The `duringStay` array is an optional merchandising input for a future room-journey UI; this slice does not wire it into guest views.

## Verification

```bash
node --test tests/eventsModule.test.ts  # DST, weekly/daily/monthly/once, venue, preview, no-availability contract
npm run test:seed                        # canonical schedule JSON in the generated seed
npm test
npm run typecheck
```

## Editor and merchandising UI

The dashboard `Events` route now renders `EventsCalendarPanel`: a calendar of published occurrences for the current month, plus a schedule preview form (name, start, recurrence, weekday, until, venue) that calls `/api/content/events/preview`. Venue options come from `/api/content/events/venues` and carry their type: buildings serialize as `onsite-event-location`, outlets as `offsite-event-location` plus `offsite-event=true`, so `parseVenue` preserves the distinction. The preview window is anchored to the selected event date (default 12 months, capped at 24, or the chosen `until`), not the calendar month, so a future event can be previewed while editing in an earlier month. Start times use a `datetime-local` control interpreted in the property time zone rather than a hardcoded UTC time. Preview never writes to D1; saving and publishing remain the separate COW-38 editor actions.

Room-journey merchandising is an optional `EventMerchandising` component mounted on the results step only when `VITE_EVENTS_MERCHANDISING=true`. It reads stay dates from `useBooking()`, requests `/api/content/events/occurrences` with `checkIn`/`checkOut`, renders only `duringStay` events, and states that availability and pricing are confirmed during booking. The flag defaults to off, so guest-facing behavior is unchanged by default.

No dashboard screenshots were captured in this change: the verification environment has no running dashboard/browser session. The UI follows the COW-37 shell and COW-38 shared control contract; screenshot capture is a follow-up verification task when a live environment is available.

## Remaining work

- Capture dashboard screenshots of the calendar panel and the flagged merchandising view in a live environment.
- Add write/save/publish controls to the calendar panel using the COW-38 editor API (preview is already wired).
- Materialized `event_occurrences` table and refresh job if range queries outgrow on-demand expansion.
- Re-export/verify any offsite venue references against the Outlets collection before displaying addresses.
