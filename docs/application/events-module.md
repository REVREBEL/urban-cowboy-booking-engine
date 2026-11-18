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

## Remaining work (next slices)

- Calendar editor UI, venue/reference pickers and preview rendering in the dashboard (with screenshots).
- Wire `duringStay` into the room journey behind an explicit flag, with Mews-backed availability language only.
- Materialized `event_occurrences` table and refresh job if range queries outgrow on-demand expansion.
- Re-export/verify any offsite venue references against the Outlets collection before displaying addresses.
