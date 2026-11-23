# COW-103 — Booking runtime Webflow dependency inventory (W3.1)

This is a **read-only audit**. It changes no production behavior, adds no feature flags and
refactors no guest-facing components. It is the W3.1 deliverable for
[COW-88](https://linear.app/revrebel/issue/COW-88) and is the input to COW-104
(D1 guest content adapters), COW-105 (Mews ARI authority), COW-106 (wire D1 media/settings
into the UI), COW-108 (cutover) and COW-111 (runtime retirement).

Line references are to the working tree at the time of the audit. Paths are relative to the
repository root.

## 1. Scope, method and governing invariants

Every runtime route, Worker handler, frontend `fetch` call site, cache layer and content field
was traced from the browser network boundary to its backend source. The audit was performed by
three independent passes — route/consumer mapping, content-field ownership, and Mews call-path
tracing — then cross-checked against the existing migration documents
(`cms-read-migration.md`, `d1-schema-contracts.md`, `d1-snapshots-parity.md`,
`source-system-audit.md`, `property-settings-audit.md`, `webflow-photo-hotspots.md`,
`rate-card-cms-model.md`).

The invariants from COW-88 were applied throughout:

1. **D1 owns** published editorial content, room presentation, amenities, media/master IDs,
   galleries/hotspots, property settings and merchandising configuration.
2. **Mews is the only live ARI source** — availability, inventory, restrictions and operational
   rates/quotes/reservations/payments. Never served from D1 or from a cache that can become
   authoritative.
3. Stable Mews reference IDs may live in D1 only as cross-references with Mews remaining
   authoritative; provenance/staleness metadata must exist.
4. Guest-facing response shapes and the current booking UI/flow must be preserved. D1 adapters
   must be same-shaped; no presentation refactor.
5. Guest reads use **published** D1 data only. Draft/pending-review data must never reach a guest.

## 2. Acceptance checklist (COW-103)

| Acceptance criterion | Status | Where satisfied |
| --- | --- | --- |
| Complete endpoint/consumer/source ownership map | Met | §3, §4 |
| All Webflow runtime dependencies and required replacements identified | Met | §5, §6 |
| Mews ARI/quote/reservation/payment call paths documented | Met | §7 |
| No production behavior changes in the audit issue | Met | Documentation only; no source files modified |

## 3. Runtime route → handler → source → flag → consumer map

### 3.1 Guest content routes

| Route | Worker handler | Source | Flag | Guest consumer | Response contract |
| --- | --- | --- | --- | --- | --- |
| `GET /api/content/policy-language` | `worker/index.ts:105` → `policyLanguageRead` `worker/content-adapters.ts:82` | Webflow (default) / D1 / shadow | `CONTENT_SOURCE_POLICY_LANGUAGE`, else `CONTENT_SOURCE` | `src/lib/api.ts:194` → `src/steps/Rates.tsx:24`, `src/journey/PhotoRateStep.tsx:22` | `{ language: Partial<PolicyLanguage> }` (10 fields, `src/types/policy-language.ts:2-13`) |
| `GET /api/content/rate-cards` | `worker/index.ts:109` → `worker/webflow/rate-cards.ts:250` | **Webflow only** | none | `src/lib/api.ts:200` → `src/steps/Rates.tsx:33`, `src/journey/PhotoRateStep.tsx:30` | `{ cards: RateCardConfig[] }` (`src/types/rate-card.ts`) |
| `GET /api/content/add-ons` | `worker/index.ts:113` → `worker/webflow/add-ons.ts:81` | **Webflow only** | none | `src/lib/api.ts:206` → `src/steps/Extras.tsx:54` | `{ addOns: AddOnCmsItem[] }` (`src/types/add-on-cms.ts:3-11`) |
| `GET /api/content/room-type-reviews` | `worker/index.ts:117` → `worker/webflow/room-type-reviews.ts:397` | Webflow base + **unconditional D1 amenity overlay** (`published-amenities.ts`, call at `room-type-reviews.ts:377`) + D1 hotspot overlay when flagged (`:378`) | `PHOTO_HOTSPOT_SOURCE` for hotspots; global `CONTENT_SOURCE` is **not** consulted | `src/lib/api.ts:224` → `src/steps/Results.tsx:197`; `src/journey/cmsTour.ts:10-19`; `src/journey/RoomPhotoTour.tsx:137` | `{ reviews, descriptions, galleries, amenities, hotspots, hotspotsByRoom?, hotspotSourceCount?, generatedAt, stale, amenitySource }` (`room-type-reviews.ts:379-394`) |
| `GET /api/content/locations` | `worker/index.ts:121` → `worker/webflow/locations.ts:352` | **Webflow only** | none | `src/lib/api.ts:120,259` → `src/App.tsx:140`, `src/steps/Dates.tsx:99`, `src/journey/PhotoArrival.tsx:72`, `src/components/booking/chrome/footer.tsx:49` | `{ locations: BookingLocationCmsMap, generatedAt, stale }` (`src/types/location-cms.ts:7-21`) |
| `GET /api/content/buildings` | `worker/index.ts:125` → `worker/webflow/buildings.ts:218` | **Webflow only** | none | `src/lib/api.ts:261` → `src/steps/Results.tsx:215` | `{ buildings: BuildingCmsMap, generatedAt, stale }` (`src/types/building-cms.ts:3-20`) |
| `GET /api/content/site-settings` | `worker/index.ts:129` → `siteSettingsRead` `worker/property-settings.ts:74` | Webflow (default) / D1 / shadow | `CONTENT_SOURCE_SITE_SETTINGS`, else `CONTENT_SOURCE` | `src/lib/siteSettingsClient.ts:15` → `src/App.tsx:140`, `src/steps/Dates.tsx:99`, `src/journey/PhotoArrival.tsx:72` | `{ settings: SiteSettings, source, itemId? }`; client accepts only `source === "d1"` (`siteSettingsClient.ts:24`) |
| `GET /api/studio/config` | `worker/index.ts:101` → `worker/webflow/locations.ts:431` | D1 `site_settings` when siteSettings flag is `d1`, else Webflow | same siteSettings flag | `src/App.tsx:149` (Studio only, non-guest) | `{ enabled, property, demoLayout, diagnostic?, publishedSwitch?, stagedSwitch? }` |
| `GET /api/content/events/occurrences` | `worker/index.ts:271` → `worker/events.ts:99` | **D1 only**, already live | mount flag `VITE_EVENTS_MERCHANDISING` | `src/journey/EventMerchandising.tsx:30` | `{ source: "d1_schedule", occurrences, duringStay, note }` |

### 3.2 Snapshot / parity / admin routes (not guest-serving by default)

| Route | Handler | Notes |
| --- | --- | --- |
| `GET /api/content/snapshots/:collection` | `snapshotGet` `worker/content-routes.ts:60` | D1 snapshot, public only in `d1` mode; otherwise `requireViewer`. Webflow fallback loader `worker/shadow-read.ts:40`. `?version=` pin, `X-Content-Source`, `X-Content-Fallback` |
| `POST /api/content/snapshots` | `snapshotsRefresh` `worker/content-routes.ts:125` | Admin; shadow compare when `CONTENT_SOURCE=shadow` |
| `POST /api/content/snapshots/rollback` | `snapshotsRollback` `worker/content-routes.ts:163` | Admin; D1 pointer write |
| `GET /api/content/parity` | `parityGet` `worker/content-routes.ts:192` | Admin; Webflow ↔ D1 parity reports |
| `GET /api/content/items`, `/api/content/{events,offers,upgrades}`, `/api/d1/add-ons` | `worker/d1-content.ts:6`, `worker/d1-modules.ts:47-50` | D1 only; consumed only by `src/lib/d1Client.ts` (admin), **no guest call sites found** |
| `POST /api/content/editor/items…`, `GET /api/admin/*` | `worker/content-editor.ts`, `worker/index.ts:142-244` | Admin, Access-role gated |

> Docs mismatch: `docs/application/d1-snapshots-parity.md:46` and
> `docs/application/content-editor-publishing.md:38` document
> `POST /api/content/snapshots/refresh`, but the router registers `POST /api/content/snapshots`
> (`worker/index.ts:250-253`). Correct the docs during W3.2/W3.6 — not this audit.

### 3.3 Guest Mews routes

All Mews routes are dispatched by `worker/index.ts:299-312` and share one egress
(`worker/mews/_lib.ts:160-219`). See §7 for the full call-path table.

## 4. Response contracts that must be preserved

Preserve these shapes verbatim when adding D1 adapters (same-shaped requirement from
`worker/content-adapters.ts:1-6`):

- `{ language: … }` — policy language
- `{ cards: RateCardConfig[] }` — rate cards
- `{ addOns: AddOnCmsItem[] }` — extras
- `{ locations | buildings, generatedAt, stale }` — discovery
- `{ reviews, descriptions, galleries, amenities, hotspots, hotspotsByRoom?, … }` — room content
- `{ settings, source, itemId? }` — property settings
- Mews response bodies (`AvailabilityResponse`, `PricingResult`, `ReservationQuoteResult`,
  `ReservationCreateResult`, `ReservationStatusResult`, `HotelConfig`) — untouched.

The single front network boundary is `src/lib/api.ts` (`call<T>()` at `:57-101`,
`contentCall()` at `:103-118`). Any adapter must keep these envelope keys or the guest components
must change, which the frontend constraint forbids.

## 5. Complete Webflow runtime dependency inventory → required replacement

### 5.1 HTTP reads that serve guests

All use `Authorization: Bearer ${env.WEBFLOW_CMS_API_TOKEN}` with an 8 s timeout.
`$W = https://api.webflow.com/v2`, `$CDN = https://api-cdn.webflow.com/v2`.

| # | Webflow read | Code | Required D1 replacement | Status |
| --- | --- | --- | --- | --- |
| 1 | `$W/collections/{rateCards}` (schema/option labels) | `webflow/rate-cards.ts:258` | `offers` + `rate_merchandising` + new artwork/overlay/font/button columns + guest adapter | **None yet** |
| 2 | `$W/collections/{rateCards}/items/live` | `webflow/rate-cards.ts:261` | as above | **None yet** |
| 3 | `$W/collections/{addOns}/items/live` | `webflow/add-ons.ts:88-91` | `add_ons` + `addOns` snapshot + **guest adapter missing** | Snapshot only |
| 4 | `$W/collections/{contentSettings}/items/{policyItem}/live` | `webflow/policy-language.ts:20-21` | `content_items` kind `policy`, slug `policy-language`, current revision | **Implemented behind `CONTENT_SOURCE_POLICY_LANGUAGE`** (`worker/content-adapters.ts:82-130`) |
| 5 | `$CDN/collections/{roomTypes}/items/live` | `webflow/room-type-reviews.ts:277-281` | `room_types`, `room_type_amenities`, `roomGallery`/`roomAmenities` snapshots | Partial; no guest gallery consumer; no review/description D1 data |
| 6 | `$W/collections/{roomTypes}` (option metadata) | `webflow/room-type-reviews.ts:284-288` | resolved enum values in D1 | **None** |
| 7 | `$CDN/collections/{amenities}/items/live` | `webflow/room-type-reviews.ts:264-268` | `amenities` + `amenity_editorial` + `room_type_amenities` | Overlay implemented; Webflow image URL residual |
| 8 | `$W/collections/{hotspots}/items/live` (paginated, deliberately API not CDN) | `webflow/room-type-reviews.ts:271-273` | `photo_hotspot_mappings` + media registry + fingerprints | **Behind `PHOTO_HOTSPOT_SOURCE=d1`**; source data not fully imported |
| 9 | `$CDN/collections/{locations}/items/live` | `webflow/locations.ts:245-248` | `locations` + `site_settings` content item | Settings behind flag; other fields **none yet** |
| 10 | `$W/collections/{locations}/items/{id}/live` (published verification) | `webflow/locations.ts:170`, `:418-423` | `content_items.status` + current revision | Publication gate partial |
| 11 | `$W/collections/{locations}/items/{id}` (staged, local diagnostic) | `webflow/locations.ts:178,491-495` | as above | Partial |
| 12 | `$CDN/collections/{buildings}/items/live` | `webflow/buildings.ts:139-142` | `buildings` (columns only — no prose/policy) | **No replacement for prose fields** |
| 13 | `$CDN/collections/{amenities}/items/live` (building `policy-2` refs) | `webflow/buildings.ts:143-146` | **none** | Still Webflow-only |

`worker/webflow/photo-hotspots.ts` contains normalizers only — no `fetch`.

### 5.2 Parity-only Webflow reads (never serve traffic)

- `$W/collections/{id}/items/live` for `SHADOW_COLLECTION_IDS` (locations, buildings,
  roomTypes, addOns, amenities) — `worker/shadow-read.ts:23-29,40-61`. Requires
  `WEBFLOW_SITE_ID`. Triggered by `snapshotsRefresh` and `parityGet`. Retire after W3.7 parity sign-off.

### 5.3 Webflow KV overlay reads (not HTTP)

- `WEBFLOW_CONTENT_CACHE.get<CachedReviewPayload>` — `webflow/room-type-reviews.ts:316` (write `:352`)
- `WEBFLOW_CONTENT_CACHE.get<CachedLocationPayload>` — `webflow/locations.ts:283` (write `:319`)
- `WEBFLOW_CONTENT_CACHE.get<CachedBuildingPayload>` — `webflow/buildings.ts:164` (write `:187`)

Replacement: D1 published snapshots + version ETag (`worker/content-source.ts:38-46`). Retire the KV
binding after cutover. Note this is the **content** KV; it is distinct from the Mews calendar KV (§7).

### 5.4 Webflow env vars / hosts to retire

`WEBFLOW_CMS_API_TOKEN`, `WEBFLOW_SITE_ID`, `WEBFLOW_RATE_CARD_COLLECTION_ID`,
`WEBFLOW_ADD_ON_COLLECTION_ID`, `WEBFLOW_ROOM_TYPE_COLLECTION_ID`,
`WEBFLOW_CONTENT_SETTINGS_COLLECTION_ID`, `WEBFLOW_POLICY_LANGUAGE_ITEM_ID`,
`WEBFLOW_LOCATION_COLLECTION_ID`, `WEBFLOW_LOCATION_ITEM_ID`, `WEBFLOW_BUILDING_COLLECTION_ID`,
`WEBFLOW_AMENITY_COLLECTION_ID`, `WEBFLOW_PHOTO_HOTSPOT_COLLECTION_ID`, `WEBFLOW_CONTENT_CACHE`,
hosts `api.webflow.com` / `api-cdn.webflow.com` (`worker/mews/_lib.ts:21`,
`worker/webflow/*.ts`, `worker/shadow-read.ts:21`).

## 6. Content-field ownership classification

Legend: **D1 editorial** = D1-authoritative after cutover; **Mews operational** = ARI/transactional,
never D1; **D1 ref→Mews** = stable Mews ID stored in D1 under a provenance contract, Mews authoritative.

| Domain | Fields (verbatim) | Owner | Webflow source | D1 replacement | Gap |
| --- | --- | --- | --- | --- | --- |
| Room identity | `mews-room-type-id`, `id` | D1 ref→Mews | `webflow/room-type-reviews.ts:164,204,237` | `room_types.mews_room_category_id` (`src/types/d1-contracts.ts:97-116`) | Binding only; Mews owns ARI |
| Room descriptions/reviews | `short-description`, `long-description`, `review`, `reviewer-name-or-handle`, `review-source`, `review-url`, `review-date` | D1 editorial | `webflow/room-type-reviews.ts:157-230` | **none** | No D1 content kind/importer/adapter |
| Room gallery | `hero-image`, `images`, `active` | D1 editorial | `webflow/room-type-reviews.ts:232-255`; `src/data/photoGalleries.ts:27-55` | `roomGallery` snapshot (`content-provider.ts:150-172`), kind `room_gallery` | **Snapshot built, no guest consumer** — `applyPublishedGalleries` does not exist (verified) |
| Room publication | `isDraft`, `isArchived`, `active` | D1 editorial | `webflow/room-type-reviews.ts:161,201,234,236` | No `status` column; hard deny-list `worker/publication-gate.ts:10-12` | COW-29 F-04 open |
| Room amenities | `features-amenities`, `amenity-display-order`, `restricted-amenity-ids`; D1 `display_order`, `excluded` | D1 editorial | `webflow/photo-hotspots.ts:44-69` | `room_type_amenities` + `worker/published-amenities.ts:39-98` | Overlay is **unconditional** once snapshot + `migrated===true`; no per-route flag |
| Buildings | `name`, `slug`, `short-description`, `long-description`, `feature-benefits`, `subheadline`, `policy-2`, `groupKey` | D1 editorial | `webflow/buildings.ts:33-43,70-131` | `buildings` columns only (`d1-contracts.ts:78-95`) | **No prose/policy replacement**; `/api/content/buildings` Webflow-only |
| Locations / settings | `full-location-name`, `city`, `state`, policy URLs, `feature-*`, `enable-feature-section`, `production-layout`, `demo-layout`, `enable-demo-engine`, `enable-event-dates-quick-selection` | D1 editorial | `webflow/locations.ts:58-67,100-120,186-216` | 5 `site_settings` fields via `worker/property-settings.ts:41-56,74-108` | Feature stories/city/state/policy URLs **none yet**; setting fields behind flag |
| Amenities | `name`, `short-name`, `short-description`, `long-description`, `image-path`, `image-name`, `image` (Webflow URL), `active` | D1 editorial | `webflow/photo-hotspots.ts:19-42` | `amenities` + `amenity_editorial` + overlay (`published-amenities.ts:39-98`) | Webflow `image` URL has no D1 column — overlay preserves it (`published-amenities.ts:62-67,88`) |
| Media identity | Webflow `fileId`/CDN URL; Mews `ImageIds` | D1 media authority / Mews for Mews photos | `webflow/room-type-reviews.ts:79-82,239-245` | media registry (`d1-contracts.ts:404-684`), `media_aliases` | 238 hotspots not imported (no media identity in export) |
| Hotspots | `amenity`, `photo-file-id/url`, `x-percent`, `y-percent`, `display-order`, `active`; D1 geometry + `review_state` | D1 editorial | `webflow/photo-hotspots.ts:71-101` | `photo_hotspot_mappings` (`d1-contracts.ts:693-769`), `worker/published-hotspots.ts:71-112` | Behind `PHOTO_HOTSPOT_SOURCE=d1`; source coverage incomplete |
| Policies — language | 10 `PolicyLanguage` fields | D1 editorial | `webflow/policy-language.ts:10-38` | `worker/content-adapters.ts:42-130` | Fully implemented, default-off; production verification needed |
| Policies — building refs | `policy-2` → `BuildingPolicyCms[]` | D1 editorial | `webflow/buildings.ts:70-83,113-115` | **none** | Resolved from Webflow Amenities items |
| Offers / rate cards | artwork, overlay positions, button style/color, text color, border, font pair, CTA, sort, `mews-rate-id`, cancellation *wording* windows | D1 editorial (artwork/config) / Mews (price, availability, `Rate.Id`) | `webflow/rate-cards.ts:147-218,250-269` | `offers` + `rate_merchandising` (`d1-contracts.ts:317-402`) | **Major gap**: no `/api/content/rate-cards` D1 adapter; D1 lacks artwork/overlay/font/button columns |
| Add-ons | `name`, `item-name`, `short/long-description`, `mews-product-id`, `image`, `isArchived` | D1 editorial overlay / Mews product+price | `webflow/add-ons.ts:32-59,81-103` | `add_ons` + snapshot | No guest adapter; `itemName`/`image` lack D1 fields |
| Upgrades | `name`, `description`, `priority`, `audience_rule`, `room_rule`, `media_asset_id`, `status` | D1 editorial | none (no Webflow handler) | `d1-contracts.ts:350-377`, admin only | D1-only, no guest consumer |
| Events | schedule fields + option IDs | D1 editorial (schedule only) | import mapping only | `events` (`d1-contracts.ts:253-286`), `worker/events.ts:99-138` | **Already D1-served for guests**; explicitly no availability/price asserted |
| Stories / content items | `instagrams.*`, `outlets.*`, `contentSettings.*` | D1 editorial | no guest Webflow route | `content_items` + `content_revisions` | Outlets used only by admin event-venue picker |
| Static code data | `ROOM_IMAGE_ASSETS`, `ROOMS`, `RATE_OPTIONS`, `EXTRAS`, `ROOM_TYPE_GROUP_PRESENTATION`, `FIND_YOUR_STAY_PREFERENCES` | D1 candidate / static today | none | **none** (`src/data/*.ts`) | No D1 contract; not ARI sources |

### 6.1 ARI-adjacent fields requiring verification (not currently ARI sources)

| Field | Where | Verification |
| --- | --- | --- |
| `cancellation-penalty-window*`, `cancellation-full-forfeit-window*` | `webflow/rate-cards.ts:210-213`, `src/types/rate-card.ts:78-81` | Presentation copy only; Mews structured policy authoritative (`rate-card-cms-model.md:298-300`) |
| `mews-rate-id`, `mews-product-id`, `mews_room_category_id`, `mews_hotel_id` | `webflow/rate-cards.ts:186`, `d1-contracts.ts:65,101,294,324,383` | Reference IDs only; snapshots explicitly never resolve them to prices (`d1-snapshots-parity.md:32`) |
| `quantityCap` (`add_ons.quantity_cap`) | `d1-contracts.ts:296,309` | Display/selection rule only; Mews remains bookability/price authority |
| `capacity` on events/rooms | `d1-contracts.ts:264,280`, `src/types/mews.ts:255` | Legacy bed-count/display estimate; Mews occupancy authoritative |
| Calendar `dates` (amount, sold-out, min-stay, restrictions) | `worker/mews/calendar.ts:48-88`, `calendar-engine.ts:426-450` | Cached in **KV, not D1**; advisory and always revalidated by live availability |
| `events.startsAt/endsAt/recurrenceRule/display_flag` | `d1-contracts.ts:261-281`, `worker/events.ts:119-138` | Schedule only; no availability/price asserted (`events.ts:137`) |
| `rate_merchandising.styling/geo_targeting/cancellation_rules` | `d1-contracts.ts:385-398`; seeded NULL (`seed.sql:473-477`) | **No reader found** (verified: only schema/seed/importer/contract references). Must never be read as a booking restriction |

## 7. Mews authority proof

### 7.1 Call paths (all authoritative values are direct Mews calls)

Single egress: `worker/mews/_lib.ts:169,200` → `POST ${MEWS_BASE_URL}/api/distributor/v1/{path}`.
Frontend boundary: `src/lib/api.ts:57-101` (sole `fetch(/api/mews/${path})` at `:79`).
Studio fixture substitution happens *before* network I/O (`src/lib/api.ts:62-75`) and is mirrored
by a Referer guard in the Worker (`worker/index.ts:301-308`).

| Purpose | Frontend | Worker route → handler | Mews operation | Direct |
| --- | --- | --- | --- | --- |
| Hotel/catalog config | `api.hotel` `src/lib/api.ts:273` → `booking.tsx:316` | `worker/index.ts:72` → `mews/hotel.ts:12` | `configuration/get` | Yes |
| Availability, live rates, `ViolatedRestrictions` | `api.availability` `src/lib/api.ts:279` → `Results.tsx:177`, `booking.tsx:348` | `index.ts:73` → `mews/availability.ts:30` | `hotels/getAvailability` | Yes |
| Exact room pricing (defined, no in-app caller) | `api.pricing` `src/lib/api.ts:299` | `index.ts:75` → `mews/pricing.ts:28` | `reservations/getPricing` | Yes |
| Final authoritative quote | `api.reservationPrice` `src/lib/api.ts:328` → `booking.tsx:711` | `index.ts:76` → `mews/reservation-price.ts:57` | `reservations/price` | Yes |
| Reservation creation | `api.createReservation` `src/lib/api.ts:362` → `Payment.tsx:105` | `index.ts:77` → `mews/reservation.ts:88` | `reservationGroups/create` | Yes (write) |
| Payment status verification | `api.reservationStatus` `src/lib/api.ts:374` → `Confirmation.tsx:41` | `index.ts:78` → `mews/reservation-status.ts:10` | `reservationGroups/get` | Yes |
| Resume hosted payment URL | `api.paymentLink` `src/lib/api.ts:380` → `Confirmation.tsx:91` | `index.ts:79` → `mews/payment-link.ts:10` | `reservationGroups/get` + locally built URL | Yes (status) |
| Voucher validation (no in-app caller) | `api.validateVoucher` `src/lib/api.ts:386` | `index.ts:80` → `mews/voucher.ts:9` | `vouchers/validate` | Yes (raw passthrough) |
| Calendar guidance | `api.calendar` `src/lib/api.ts:179` → `Dates.tsx:104`, `PhotoArrival.tsx:104` | `index.ts:74` → `mews/calendar.ts:22` | **No direct call in request path** — KV/Cache snapshot derived from prior Mews probes | Indirect, advisory |
| Service restrictions | server/cron | `mews/service-restrictions.ts` (not registered as a route) | `services/getAvailability` | Yes |
| Dev product catalog | `api.productCatalogDebug` `src/lib/api.ts:212` | `index.ts:83` → `mews/products-debug.ts:36` | `configuration/get` | Yes |

There is **no Mews payment/charge endpoint**: checkout is Mews-hosted. `reservation.ts:51-64,156-162`
builds `${MEWS_APP_BASE_URL}/navigator/payment-requests/detail/${paymentRequestId}?…` from the
Mews-returned `PaymentRequestId`; verification is `reservationGroups/get`.

### 7.2 Proof that no D1/cache/setting is an ARI source

- `worker/d1.ts:1-3`, `worker/content-provider.ts:5-9`, `src/types/d1-contracts.ts:8-10` all state the
  authority split explicitly; no D1 table models price, availability, inventory or settlement.
- `migrations/0001_init.sql` + `0002`–`0011` contain no ARI table. The only ARI-adjacent table,
  `rate_merchandising`, holds editorial `position`/`styling`/`geo_targeting`/`cancellation_rules`
  and has **no reader**.
- `worker/property-settings.ts:58-61` `SETTING_FIELDS` contains only layout/demo/event flags.
- Editorial overlays are explicitly non-filtering: `src/lib/addOnMerchandising.ts:44-49`,
  `src/lib/shaping.ts:174-187`. Rate cards resolve by `mewsRateId` but price comes from the live Mews
  rate (`src/lib/rateCardConfig.ts:15-30`, `src/components/rates/RateSelectionView.tsx:253-273`).
- Calendar snapshot is advisory in both worker and UI (`worker/mews/calendar.ts:48-50,98-100`,
  `src/steps/Dates.tsx:273-277`, `src/journey/PhotoArrival.tsx:109`) and is stored in **KV/Cache,
  not D1**.
- No content flag (`CONTENT_SOURCE`, `CONTENT_SOURCE_POLICY_LANGUAGE`,
  `CONTENT_SOURCE_SITE_SETTINGS`, `PHOTO_HOTSPOT_SOURCE`) gates any `/api/mews/*` handler.
- `worker/index.ts:299-312` rejects live Mews calls with a Studio referrer; guest code never calls
  Mews directly from the browser.

### 7.3 Reference data in D1 (stable Mews IDs)

| D1 object | Column | Guest use | Contract |
| --- | --- | --- | --- |
| `locations.mews_hotel_id` | `mewsHotelId` | Editorial metadata only; **not** used by Mews calls | `content_provenance` (source `webflow_cms`, snapshot `2026-11-15`, hash, `imported_at`) |
| `room_types.mews_room_category_id` | `mewsRoomCategoryId` | Keys editorial descriptions/galleries/amenities; not used for availability/price calls | same |
| `add_ons.mews_product_id` | `mewsProductId` | CMS merchandising overlay joined to live Mews products; not a whitelist | same |
| `offers.rate_product_id` | — | Editorial only | same |
| `rate_merchandising` | `rate_product_id`, editorial fields | No current reader | provenance rows; fields NULL in seed |
| `media_aliases.alias_type='mews_asset_id'` | — | Editorial media resolution (`worker/d1.ts:486`) | `created_at` only |

Source-system/staleness metadata is `content_provenance`
(`migrations/0003_property_scoped_contracts.sql:44-60`). There is **no automatic re-sync or read-time
staleness enforcement**. Property→Mews-config binding remains env-only
(`worker/mews/_lib.ts:100-116`); D1 `mews_hotel_id` is not consulted. That binding must stay env-owned
during migration.

## 8. Risks / latent authority violations

None of these currently makes D1 the ARI authority; all are latent paths to guard during W3.3/W3.6.

1. **Cached ARI-shaped data under a Mews-looking route.** `/api/mews/calendar` is a KV/Cache snapshot
   of `amount`, `available`, `minNights`, `invalidStayLengths`, `restrictions` with a 14-day TTL
   (`calendar-engine.ts:21,158-220,282-293`; `worker/mews/calendar.ts:68-112`). It is Mews-derived and
   advisory, but any future consumer using it as a booking gate would make stale data authoritative.
   Keep it KV-only; never move it to D1.
2. **Editorial cancellation rules hook.** `rate_merchandising.cancellation_rules` and offer fields can
   contradict Mews quote settlement terms if wired in. No reader exists today — keep it that way.
3. **Static rate fallback in UI.** `RateSelectionView.tsx:253-289` uses `basePrice * rateMultiplier`,
   8.5% tax, $25 resort fee, 50% deposit when no live rates. Story/preview branch only; ensure it is
   unreachable in the live Mews flow.
4. **Referer-based Studio guard.** `worker/index.ts:301-308` can be bypassed by a direct/spoofed
   request. Does not involve D1 but weakens the Studio-never-touches-live contract.
5. **`/api/mews/content` is a D1 endpoint inside the Mews namespace** (`worker/index.ts:84` →
   `worker/d1-content.ts`). Unused by guests; misleading for audits and refactors.
6. **Add-on identity could become a whitelist.** `mewsProductId` is merged non-filtering today
   (`addOnMerchandising.ts:44-49`); flipping it would drop valid Mews products from quotes and trip
   the `reservation-price` completeness guard (`reservation-price.ts:81-93`).
7. **Property/config binding is env-only.** Making D1 `locations` authoritative for config IDs would
   change which Mews config receives availability/quote/create calls — a violation.
8. **No `ARI_SOURCE`/`RATE_SOURCE` flag exists** — good. Adding one would be the clearest boundary break.
9. **Post-booking calendar refresh keys on quote currency** (`reservation.ts:207-215`,
   `calendar-engine.ts:158-165`) — can create parallel snapshots but does not change quotes.

## 9. Wire-up gaps (D1 data exists, guest does not consume it)

1. **Rate cards** — tables and `/api/content/offers` exist; no guest adapter, no artwork columns. Deferred in `cms-read-migration.md:62-64`.
2. **Add-ons** — `add_ons` + `addOns` snapshot exist; only admin route consumes them.
3. **Buildings** — D1 columns exist but no prose/policy fields and no guest adapter.
4. **Locations** — D1 row lacks feature stories, city, state, policy URLs; only 5 settings migrated.
5. **Room descriptions & reviews** — no D1 kind, importer mapping or adapter.
6. **Room galleries** — `roomGallery` snapshot built and publish triggers it (`gallery-publication.ts:26-28`), but `applyPublishedGalleries` does not exist; guest still reads Webflow `galleries`.
7. **Amenities** — unconditional overlay; no per-route flag or parity report (unlike policy language).
8. **Hotspots** — default-off; 238 source hotspots never imported, so D1 coverage is incomplete.
9. **Policy language / site settings** — fully implemented but default-off; production verification outstanding (`cms-read-migration.md:55-58`, `property-settings-audit.md:51-57`).
10. **Instagrams/outlets/upgrades** — D1 content exists, no guest consumer.
11. **Publication state** — no `status` column on `room_types`/`locations`; one draft room excluded by hard deny-list; `mews_hotel_id` unpopulated (F-01).
12. **Media identity** — registry exists, but no Webflow `fileId`/CDN import and no hotspot import; legacy Squarespace columns remain (`d1-schema-contracts.md:114-118`).
13. **Option-label metadata** — Webflow `validations.options` has no D1 equivalent.
14. **Webflow amenity image URL** — no D1 field; the overlay intentionally preserves it (`published-amenities.ts:62-67,88`). Residual Webflow asset dependency even in D1 mode.
15. **Snapshot freshness** — Webflow publish does not trigger a D1 refresh (`d1-snapshots-parity.md:49`).
16. **`/api/content/items` public with caller-controlled `?tenant=`** (`worker/d1-content.ts:15`, no auth) — unlike other D1 reads, which bind server-side `TENANT_ID`. Tighten before cutover.
17. **`amenitySource: "d1-published"` is hardcoded** (`room-type-reviews.ts:390`) even when no snapshot exists — overstates the actual source; fix in W3.2/W3.4.
18. **Hotspot map shape change on flag enable** — `applyPublishedHotspots` returns `hotspots: {}` and populates only `hotspotsByRoom` (`published-hotspots.ts:127-134`). Confirm which map `RoomPhotoTour` consumes before flipping `PHOTO_HOTSPOT_SOURCE`.
19. **`eventOccurrences` authorizes as `viewer`** (`worker/events.ts:103`) but is called unauthenticated by `EventMerchandising.tsx:30`. Mount is off by default; would 401 in production without Access viewer.

## 10. Requirements vs. existing functionality

**Requirements (COW-88, not yet true in code):** D1 supplies *all* published editorial content and
media references; Mews is the *only* ARI source; guest reads use published-only D1 data; response
shapes preserved with no presentation refactor; no Webflow runtime content dependency after parity.

**What exists today:**

- Default `CONTENT_SOURCE=webflow`; no public guest route switches to D1 by default.
- Only three guest paths can serve D1: policy language (per-route flag), site settings / Studio config
  (per-route flag), and events (`/api/content/events/occurrences`, unconditional). Amenities and
  hotspots are *overlays onto a Webflow response*, not D1-served routes.
- Snapshot infrastructure (snapshots, parity, pinning, rollback) is implemented but admin-only by
  default; Webflow publish does not trigger refresh.
- Mews ARI/transactional handlers are direct Mews calls, untouched by any content flag.
- Publication-only D1 reads are incomplete (hard deny-list, no status columns, 238 hotspots +
  media identity unimported).

## 11. Sequencing implications for the remaining W3 work

- **COW-104** (D1 adapters) must add same-shaped adapters for rate cards, add-ons, buildings,
  locations, room descriptions/reviews/galleries, close the media/hotspot import and publication-state
  gaps, and add a per-route flag for the amenity overlay. Fix gaps §9.16–18 here.
- **COW-105** (Mews authority) should codify §7 as an authority matrix shared with W1/W2, add tests
  proving ARI requests reach Mews and no D1 ARI endpoint is consumed, keep the calendar cache in KV,
  and add an allowlist assertion for reference-data sync.
- **COW-106** (wire D1 media/settings) is mostly *already wired behind flags* — the real work is
  enabling and verifying `PHOTO_HOTSPOT_SOURCE`, `CONTENT_SOURCE_POLICY_LANGUAGE` and
  `CONTENT_SOURCE_SITE_SETTINGS`, plus consuming the `roomGallery` snapshot.
- **COW-107 / COW-111** (sync gates) must confirm parity for each collection before any flag flips;
  Webflow retirement requires the env-var/host list in §5.4 to be removable.

## 12. Verification performed

This audit modified no source or configuration files. All findings were static inspection of the
working tree, corroborated by three independent investigation passes and spot-checked against the
code for the highest-impact claims (`applyPublishedGalleries` absent, `cancellation_rules` unread,
flag declarations in `wrangler.toml`, overlay call sites in `room-type-reviews.ts:377-378`).
No tests, builds or flag flips were run because no production behavior was changed.
