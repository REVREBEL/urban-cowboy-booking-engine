# Webflow Room Type Reviews

## The Brief

Room-detail review quotes are editorial content owned by the Webflow **Room Types** CMS collection. They are not Mews inventory data and they are no longer hardcoded in the booking engine.

The booking engine loads the published CMS review overlay once, indexes it by the durable Mews Room Type ID, and passes the matching review into the room detail modal.

If the CMS `review` field is blank, the review section is not rendered.

There is intentionally no fallback to another room, another building, or static demo copy.

## Webflow Source

Site:

```text
Urban Cowboy Mockup
Site ID: 6aaa2497c8ea366207beba30
```

Collection:

```text
Room Types
Collection ID: 6abc815b36cbcba74b8b01c4
Slug: room-types
```

Review fields:

| CMS field | Webflow slug | Purpose |
| --- | --- | --- |
| Mews Room Type ID | `mews-room-type-id` | Durable join key to Mews `RoomCategoryId` |
| Review | `review` | Review/quote shown in the room detail UI |
| Review Source | `review-source` | Webflow Option field such as Google, Tripadvisor, Expedia, Booking, Yelp, Direct |
| Review URL | `review-url` | Optional source link |
| Review Date | `review-date` | Optional review date |
| Reviewer Name or Handle | `reviewer-name-or-handle` | Optional attribution |

The Mews ID is authoritative. Room names and Webflow slugs are not used as the join key.

## Data Flow

```text
Published Webflow Room Types
        |
        | Webflow Content Delivery API
        v
/api/content/room-type-reviews
        |
        | normalized map keyed by Mews Room Type ID
        v
Results.tsx
        |
        v
RoomDetailModal
        |
        +-- review exists --> GuestReviewQuoteCard
        |
        +-- review blank  --> no review section
```

The frontend receives a small object shaped approximately like:

```json
{
  "c76c83ca-eeef-4c9a-80a5-b10600706caf": {
    "roomTypeId": "c76c83ca-eeef-4c9a-80a5-b10600706caf",
    "quote": "Published review text...",
    "reviewer": "Reviewer Name",
    "source": "Google",
    "sourceUrl": "https://example.com/review",
    "reviewDate": "2026-02-09T00:00:00.000Z"
  }
}
```

Only Room Types with nonblank published `review` values are included.

## Published Content Only

The endpoint uses Webflow's Content Delivery API:

```text
https://api-cdn.webflow.com/v2/collections/{collectionId}/items/live
```

Draft and archived items are also rejected by the normalizer as an additional safeguard.

The standard Data API is used only to read collection schema metadata needed to translate the `review-source` option ID into its human-readable label.

## Cache Strategy

Reviews change infrequently, so production uses a six-hour application cache.

```text
fresh for 6 hours
        |
        v
stale data may remain available for up to 24 hours
        |
        v
background refresh replaces it
```

The preferred production binding is:

```text
WEBFLOW_CONTENT_CACHE
```

On Webflow Cloud this should be a Key Value Store binding. Webflow Cloud KV is the supported application-level cache for API responses and exposes the Cloudflare KV-style `get`, `put`, `delete`, and `list` methods.

When the binding is not available, such as local development, the endpoint falls back to module memory. A cold runtime can then call the Webflow Content Delivery API directly, which has its own short CDN cache.

The review feature therefore still works without KV. KV removes repeated CMS calls across production runtime instances.

## Stale-While-Revalidate

If cached editorial data is older than six hours but still present, the endpoint returns it immediately and refreshes Webflow in the background.

A temporary Webflow CMS failure therefore does not remove a review that was already cached.

A completely cold cache with an unavailable CMS fails safely by returning:

```json
{
  "reviews": {}
}
```

The booking flow itself is never blocked by review content.

## UI Rules

`GuestReviewQuoteCard` has no demo defaults.

The room detail modal only renders it when:

```ts
review?.quote?.trim()
```

is truthy.

This means:

- review populated in Webflow → show the review;
- review field empty/null/whitespace → hide the entire section;
- reviewer blank → quote can still display without reviewer;
- date blank → no date is shown;
- source blank → no source is shown;
- source URL blank → source is plain text rather than a link.

## Relevant Files

```text
worker/webflow/room-type-reviews.ts
    Webflow fetch, normalization, KV cache, stale-while-revalidate

worker/index.ts
    /api/content/room-type-reviews route

worker/mews/_lib.ts
    Webflow collection/config and WEBFLOW_CONTENT_CACHE binding types

src/types/room-type-cms.ts
    normalized frontend review contract

src/lib/api.ts
    roomTypeReviews() content call

src/steps/Results.tsx
    preloads review map once and joins by room.roomTypeId

src/components/RoomDetailModal.tsx
    conditionally renders the review section

src/components/GuestReviewQuoteCard.tsx
    presentation-only review component with no static defaults

tests/roomTypeReviews.test.ts
    normalization and blank-review behavior
```

## Removed Demo Data

The previous static review dataset:

```text
src/data/roomReviews.ts
```

was deleted.

The old building-level fallback behavior was also removed. A Walden room without its own CMS review will not inherit another Walden review.

## Production Setup Reminder

Before the Webflow Cloud production deployment, bind a Key Value Store named:

```text
WEBFLOW_CONTENT_CACHE
```

The code treats this binding as optional so local development does not require production storage.

The Webflow CMS API token remains server-side and must never be bundled into the browser.
