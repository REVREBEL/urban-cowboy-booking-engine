# Calendar Availability & Rate Snapshot Architecture

## The Brief

The booking calendar needs to show useful rate, sold-out, and minimum-stay guidance immediately, but the Mews Booking Engine API does not provide a single interval endpoint that returns a complete daily calendar with all rate and restriction behavior.

The original implementation solved that by calling `hotels/getAvailability` once for every arrival date. When a one-night search returned no price and did not explain the restriction, it fired both a two-night and a three-night request in parallel to infer whether the date had a minimum length of stay.

That worked, but it put expensive Mews work directly in the guest's calendar-loading path. A two-month calendar could require dozens of requests, and ambiguous dates could multiply those calls further. The result was correct data arriving after the guest had already selected dates or moved forward.

The architecture now separates **calendar merchandising guidance** from **authoritative live booking validation**.

---

## Core Principle

The calendar is a fast shopping aid.

It is allowed to say:

- From $329
- Sold
- Min 2 nights
- This selected stay length may be restricted

It is not the final source of truth for the reservation.

The live availability search after the guest presses **Search** remains authoritative for the actual dates, occupancy, promo code, room availability, and current pricing.

Cached calendar guidance must never prevent the guest from continuing to that live validation.

---

## Data Flow

```text
Mews Booking Engine API
        |
        v
Adaptive calendar refresh engine
        |
        v
Shared monthly calendar snapshot
Cloudflare KV preferred
Cache API fallback
        |
        v
/api/mews/calendar
        |
        v
Booking calendar
```

The browser normally reads a previously generated snapshot instead of causing the full Mews calculation itself.

When cached data is stale, the stale snapshot is returned immediately and refreshed in the background.

When there is no cached data at all, the Worker can build the initial snapshot while the calendar remains interactive. Date selection and Search are never gated on that enrichment request.

---

## Canonical Calendar Occupancy

Calendar snapshots use one canonical public shopping occupancy:

```text
2 adults
0 children
0 infants
public rates
USD for Catskills
```

This prevents the cache from fragmenting into separate copies for every possible guest combination.

Changing the guest selector from two adults to two adults plus one child therefore does not force the calendar to rebuild.

The exact guest mix is still sent to the normal live availability request after Search.

---

## Adaptive Availability Probing

Every Mews request should answer a question or narrow the next question.

The refresh engine therefore maintains an in-memory **evidence ledger** for each refresh operation. A probe is identified by:

```text
arrival date + length of stay
```

If another part of the refresh needs the same probe, the existing Promise/result is reused rather than calling Mews again.

### First probe

For each future arrival date:

```text
D -> D+1
1-night stay
```

If pricing is returned:

- the date is bookable;
- the lowest returned price becomes the calendar "from" rate;
- available room-category IDs are retained as evidence;
- no two-night or three-night request is made.

### Explicit restriction returned

If the one-night response returns no price but explicitly reports a minimum stay, for example:

```text
MinimumTimeUnits = 2
```

the engine does not blindly test both two and three nights.

It asks only the unanswered question:

```text
D -> D+2
Does inventory exist when the stated Min 2 restriction is satisfied?
```

If Mews then reports a higher explicit minimum, the resolver follows that value and tests the newly required LOS.

This both verifies bookability and avoids unnecessary calls.

### Ambiguous one-night failure

Sometimes the Booking Engine API returns no price and no useful `ViolatedRestrictions` explanation.

Only then does inference begin.

It is sequential:

```text
1 night fails without explanation
        |
        v
test 2 nights
        |
        +-- works -> infer Min 2, stop
        |
        +-- explicit higher minimum -> test exactly that LOS
        |
        v
test 3 nights only if still unanswered
        |
        +-- works -> infer Min 3
        |
        +-- fails -> unavailable / unresolved by supported inference
```

The old implementation fired the two-night and three-night tests together. The new implementation never spends the three-night request when the two-night result already answers the question.

The current fallback inference ceiling is three nights:

```ts
MAX_INFERRED_LOS = 3
```

Explicit Mews minimum-stay values can still direct a probe beyond that limit because Mews has already supplied the evidence for why the shorter stay failed.

---

## Arrival Minimum vs Stay-Through / LOS Effects

A minimum restriction attached to an arrival date and a restriction affecting a stay that crosses a compressed period are not the same thing.

For example:

```text
10/10 arrival requires Min 3
```

may be different from:

```text
a stay beginning 10/09 becomes invalid at 2 nights
because it crosses a Min 3 stay-through period on 10/10
```

A single `minNights` value on 10/09 cannot represent this correctly because:

```text
10/09 -> 10/10 = 1 night may still be valid
10/09 -> 10/11 = 2 nights may be invalid
10/09 -> 10/12 = 3 nights may be valid
```

For that reason the snapshot supports:

```ts
invalidStayLengths?: number[]
```

The engine only performs cross-date probes when a discovered restriction can reveal new information.

For a Min 2 restriction, there is no shorter stay from the prior arrival that both occupies the restricted night and remains below two nights, so a special prior-day probe would not answer anything useful.

For Min 3 or greater, the previous arrival can have an intermediate invalid LOS, so the engine selectively probes it. The result is stored as an invalid stay length rather than incorrectly changing that prior date into a blanket Min 3 arrival.

This is especially useful during compression periods such as ski weeks, holiday weeks, and event periods where restrictions are applied across groups of nights.

---

## Past Dates Are Never Polled

Visible calendar months can contain dates earlier than today.

Those dates are already disabled in the UI and cannot be selected.

The refresh engine skips them completely so they consume zero Mews calls.

---

## Shared Monthly Snapshot

Snapshots are stored by:

```text
property configuration
currency
calendar month
```

rather than by guest occupancy.

Monthly storage makes it possible to refresh a small reservation-affected range and merge only those changed dates into the applicable month.

### Preferred production store: Cloudflare KV

The Worker supports an optional binding:

```text
CALENDAR_CACHE
```

KV is preferred because the same snapshot can be reused across visitors and Worker locations.

The code intentionally falls back to the Workers Cache API until the namespace is provisioned so local development and deployment are not blocked.

The Wrangler configuration contains a commented binding template. **Scheduled calendar warming intentionally does not run until this shared KV binding exists**, because warming a single edge Cache API instance would spend Mews calls without creating a globally reusable snapshot.

After creating the namespace, add its real ID:

```toml
[[kv_namespaces]]
binding = "CALENDAR_CACHE"
id = "<cloudflare-kv-namespace-id>"
```

Do not commit a fabricated namespace ID.

---

## Stale-While-Revalidate

A stale snapshot is better than an empty calendar.

If usable cached data exists:

1. return it immediately;
2. mark the response as stale/refreshing;
3. rebuild the affected range with `waitUntil()`;
4. replace the cached dates when the refresh succeeds.

The previous snapshot is not deleted before a replacement exists.

This means a slow or temporarily unavailable Mews response does not turn the calendar blank.

---

## Refresh Cadence — America/New_York

Time rules use the IANA timezone:

```text
America/New_York
```

not a fixed EST offset. This automatically handles daylight saving time.

The Worker cron wakes every 15 minutes, but the refresh engine decides whether a Mews refresh is actually due.

### Revenue-management day

From 7:00 AM through 7:59 PM Eastern:

- active near-term calendars can refresh at most every 30 minutes;
- farther-out dates use progressively longer freshness windows.

### Revenue-management quiet window

From 8:00 PM through 6:59 AM Eastern:

- Mews calendar refreshes are limited to the top of each hour.

This reflects the lower likelihood of manual pricing/restriction changes overnight while avoiding unnecessary polling.

### Date-distance freshness

The current freshness targets are:

| Arrival distance | Refresh target |
| --- | --- |
| 0–30 days | 30 minutes daytime / 60 minutes overnight |
| 31–90 days | 60 minutes |
| 91–180 days | 4 hours |
| 181+ days | 12 hours |

These are cache freshness targets, not guarantees that every possible month is continuously polled.

---

## Demand-Driven Active Months

The Booking Engine API is a temporary source for this snapshot architecture and Mews explicitly advises against continuous server-side polling.

To reduce unnecessary API volume, the engine tracks months actually requested by guests.

An active-month marker lasts 48 hours.

Scheduled refreshes prioritize those active months instead of rebuilding the entire year every cycle.

A small safety seed refreshes the current and next month at 7:00 AM and 8:00 PM Eastern so commonly shopped inventory retains a usable snapshot even after traffic has been quiet.

A single scheduled run is capped to a limited number of active months.

---

## Reservation-Triggered Cache Refresh

Scheduled refreshes alone leave a risk during sudden pickup.

Example:

```text
10:05 cache refresh
10:08 reservation
10:09 reservation
10:11 reservation
10:15 next scheduled refresh
```

During a compression event, those reservations can:

- remove the cheapest remaining room type;
- change the calendar from-rate;
- create a sold-out date;
- cause an LOS rule to become the next relevant restriction;
- change which room categories remain bookable.

Therefore every successful `reservationGroups/create` triggers a background calendar refresh.

The reservation response and payment handoff do not wait for it.

```text
reservation created successfully
        |
        +----> guest response / payment continues
        |
        v
ctx.waitUntil(...)
        |
        v
refresh affected calendar range
```

### Refresh shoulder

The reservation refresh extends around the booked stay using:

```text
MAX_INFERRED_LOS - 1
```

days on each side.

With the current three-night inference ceiling, that is a two-day shoulder.

This catches arrival dates before the reservation whose multi-night stays can cross the newly changed inventory period.

---

## Refresh Burst Deduplication

Multiple reservations can arrive close together during a high-pickup period.

Within the same Worker isolate, overlapping refresh requests are coalesced into a shared pending range before execution.

If another reservation arrives while a refresh is running, its range is retained and processed in the next loop rather than being discarded.

The evidence ledger separately prevents duplicate `arrival + LOS` probes inside each refresh.

Cloudflare isolates are independent, so this is a best-effort application-level deduplication rather than a distributed lock. The future Connector API/event architecture will reduce the need for repeated probing further.

---

## Browser Behavior

The browser keeps a small local stale cache so the calendar can render immediately on repeat visits, but it no longer uses guest occupancy as part of the calendar cache key.

Cached restrictions are **advisory**.

The date picker does not disable a checkout merely because the snapshot says:

```text
Min 2nt
```

or because a specific LOS is listed in `invalidStayLengths`.

Instead it can visually flag the selection and explain that the live Search will verify availability.

Search is only blocked for structurally invalid input such as:

- missing check-in/check-out;
- check-out on or before check-in.

The subsequent live availability call remains the booking authority.

---

## What Happens After Search

The normal Results request still calls Mews live using the guest's actual:

```text
check-in
check-out
adults
children
infants
voucher/promo
currency
```

This is where the booking engine confirms:

- currently available room types;
- eligible rates;
- actual occupancy pricing;
- applicable live restrictions;
- promo eligibility.

The calendar snapshot never overrides that response.

---

## Connector API Migration

The snapshot/cache architecture is intentionally independent of the Mews source.

Today:

```text
Booking Engine API
        |
        v
adaptive probe resolver
        |
        v
calendar snapshot
```

After Connector API certification:

```text
Connector API
availability + rate pricing + restrictions
        |
        v
calendar snapshot
```

The calendar UI, monthly snapshot format, reservation invalidation concept, stale-while-revalidate behavior, and frontend contract can remain in place.

The provider changes, not the product experience.

Connector also opens the path to event-driven updates for pricing and reservation changes, reducing the amount of inference/polling required by the temporary Booking Engine API solution.

---

## Important Booking Engine API Constraint

Mews documents the Booking Engine API as intended for booking-engine/front-end use and warns that it is not suitable for continuous server-side polling because of anti-scraping protections and request limits.

For that reason this implementation deliberately uses:

- shared snapshots;
- demand-driven active months;
- progressive freshness windows;
- overnight throttling;
- reservation-triggered narrow refreshes;
- adaptive sequential probes;
- evidence reuse;
- stale-while-revalidate.

This is an interim architecture until the Connector API is available, not an attempt to turn the Booking Engine API into a high-frequency server feed.

References:

- Mews Booking Engine API usage guidelines: https://docs.mews.com/booking-engine-guide/booking-engine-api/guidelines
- Mews Booking Engine API request limits: https://docs.mews.com/booking-engine-guide/booking-engine-api/guidelines/requests
- Mews Booking Engine API hotels/getAvailability: https://docs.mews.com/booking-engine-guide/booking-engine-api/operations/hotels

---

## Relevant Implementation Files

```text
worker/mews/calendar-engine.ts
    adaptive probing
    evidence ledger
    monthly snapshot storage
    active-month tracking
    scheduled refresh logic
    reservation refresh queue

worker/mews/calendar.ts
    public calendar endpoint
    stale-while-revalidate behavior

worker/mews/reservation.ts
    post-reservation cache refresh trigger

worker/index.ts
    scheduled Worker handler

wrangler.toml
    cron trigger
    optional KV binding template

src/components/booking/search/InlineDateRangePicker.tsx
    advisory restriction display
    no restriction-based navigation gate

src/steps/Dates.tsx
    browser snapshot cache
    canonical calendar request
    live-search handoff
```

---

## Final Thoughts

The important design decision is that **calendar speed and booking truth are separate responsibilities**.

The calendar should feel immediate because it reads a shared snapshot.

Mews remains authoritative because the actual stay is checked live after Search and again during the later booking/pricing flow.

While the Booking Engine API is the data source, the refresh engine asks the smallest possible number of questions:

```text
use what Mews already told us
        |
        v
ask only the next unanswered question
        |
        v
stop as soon as the calendar has enough evidence
```

That principle should remain intact even as the underlying Mews integration evolves.
