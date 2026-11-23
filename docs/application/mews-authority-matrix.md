# COW-105 — Mews ARI authority matrix (W3.3)

This document codifies the Mews authority findings of the COW-103 audit
([`booking-runtime-webflow-dependency-inventory.md`](./booking-runtime-webflow-dependency-inventory.md),
especially §7 and §8) into a shared contract for the remaining W3 work and for
W1/W2. It is a **read-only authority specification**: it changes no production
behavior. The automated proof lives in `tests/mewsAriAuthority.test.ts`.

Line references are to the working tree at the time of writing. Paths are
relative to the repository root.

## 1. Governing rule

> **Mews is the only live ARI (availability, inventory, restrictions, rates),
> quote, reservation and payment authority. D1 is editorial/reference only.
> No D1 table, D1 content item, admin setting or cache may become an ARI source.**

- Every authoritative ARI/transactional value is produced by a direct
  `mewsJson()` / `mews()` call in `worker/mews/*`. All calls share one egress:
  `POST ${MEWS_BASE_URL}/api/distributor/v1/{operation}`
  (`worker/mews/_lib.ts:169` for `mews`, `:200` for `mewsJson`).
- D1 owns published editorial content, room presentation, amenities, media
  identity, property settings and merchandising configuration. It holds **only
  stable Mews reference IDs**, never live price, availability, inventory or
  settlement (`worker/d1.ts:1-3`, `worker/content-provider.ts:5-9`,
  `src/types/d1-contracts.ts:8-10`).
- No content flag (`CONTENT_SOURCE`, `CONTENT_SOURCE_POLICY_LANGUAGE`,
  `CONTENT_SOURCE_SITE_SETTINGS`, `PHOTO_HOTSPOT_SOURCE`) gates any
  `/api/mews/*` handler (audit §7.2).
- Guest code never calls Mews directly; the sole browser boundary is
  `src/lib/api.ts:57-101`. Studio fixture substitution happens before network
  I/O and is mirrored by a Referer guard (`worker/index.ts:301-308`).

## 2. Authority matrix

"D1 involvement permitted" is limited to the reference-data allowlist in §4;
it never includes the authoritative value itself.

| Operation | Guest purpose | Owner | Source (direct Mews endpoint) | D1 involvement permitted | Proof (file:line) |
| --- | --- | --- | --- | --- | --- |
| `configuration/get` | Hotel/catalog config, categories, products, default currency | Mews | `POST /api/distributor/v1/configuration/get` | None for operational values; product IDs may be referenced editorially | `worker/index.ts:72` → `worker/mews/hotel.ts:12,15`; egress `worker/mews/_lib.ts:200` |
| `hotels/getAvailability` | Live availability, rates, `ViolatedRestrictions` | Mews | `POST /api/distributor/v1/hotels/getAvailability` | None | `worker/index.ts:73` → `worker/mews/availability.ts:30,64` |
| `reservations/getPricing` | Exact room pricing for a defined occupancy | Mews | `POST /api/distributor/v1/reservations/getPricing` | None | `worker/index.ts:75` → `worker/mews/pricing.ts:16,28` |
| `reservations/price` | Final authoritative quote, `AmountToChargeOnConfirmation` | Mews | `POST /api/distributor/v1/reservations/price` | None; `ProductIds` are Mews IDs sent to Mews, not a D1 whitelist | `worker/index.ts:76` → `worker/mews/reservation-price.ts:33,57` |
| `reservationGroups/create` | Reservation creation (write) | Mews | `POST /api/distributor/v1/reservationGroups/create` | None; payload rebuilt from whitelisted inputs, never a D1 row | `worker/index.ts:77` → `worker/mews/reservation.ts:88,132` |
| `reservationGroups/get` | Payment status verification | Mews | `POST /api/distributor/v1/reservationGroups/get` | None | `worker/index.ts:78` → `worker/mews/reservation-status.ts:10,14` |
| `reservationGroups/get` | Resume hosted payment URL | Mews | `POST /api/distributor/v1/reservationGroups/get` + locally built Mews-hosted URL | None | `worker/index.ts:79` → `worker/mews/payment-link.ts:10,16` |
| `vouchers/validate` | Promo-code validation (raw passthrough) | Mews | `POST /api/distributor/v1/vouchers/validate` | None | `worker/index.ts:80` → `worker/mews/voucher.ts:9,12`; egress `worker/mews/_lib.ts:169` |
| `services/getAvailability` | Service restriction advisories (server/cron) | Mews | `POST /api/distributor/v1/services/getAvailability` | None | `worker/mews/service-restrictions.ts:165` (not a guest route) |

There is **no Mews payment/charge endpoint**: checkout is Mews-hosted. The
payment URL is built from the Mews-returned `PaymentRequestId`
(`worker/mews/reservation.ts:51-64,156-162`); verification is
`reservationGroups/get`.

The `/api/mews/calendar` route (`worker/index.ts:74` → `worker/mews/calendar.ts:22`,
snapshot produced at `worker/mews/calendar-engine.ts:426`) is **not** in this
table because it makes no direct Mews call in the request path. It is advisory
and is handled in §3.

## 3. Prohibited sources

None of the following is an ARI source today; each is a latent authority break
if wired into a live booking decision.

| Prohibited source | Why it is not ARI | Current state / guard |
| --- | --- | --- |
| **D1 snapshots** (`published_snapshots`, `content_items` revisions) | Editorial, versioned copies of CMS content; no price/availability/inventory columns and explicitly never resolve IDs to prices | No ARI table exists in `migrations/0001_init.sql`–`0011` (test: `tests/mewsAriAuthority.test.ts`, migration table-name check) |
| **D1 content items** (rate cards, add-ons, offers, room types) | Editorial overlays only; joined by reference IDs, never a source of bookability or price | `src/lib/addOnMerchandising.ts:44-49`, `src/lib/shaping.ts:174-187`, `src/lib/rateCardConfig.ts:15-30` resolve presentation, not value |
| **Admin settings** (`site_settings`, `SETTING_FIELDS`) | Layout/demo/event flags only | `worker/property-settings.ts:58-61`; no ARI field |
| **Any cache that can become authoritative** | A cached ARI-shaped value used as a booking gate makes stale data authoritative | The KV calendar snapshot below is the only ARI-shaped cache |
| **KV/Cache calendar snapshot** (`/api/mews/calendar`) | Mews-derived `amount`, `available`, `minNights`, `invalidStayLengths`, `restrictions` with a 14-day TTL; advisory and always revalidated by a live Search | Stored in `CALENDAR_CACHE` KV with Cache API fallback (`worker/mews/calendar-engine.ts:178-205`); advisory in UI (`src/steps/Dates.tsx:273-277`, `src/journey/PhotoArrival.tsx:109`). **Must stay KV-only — never move it to D1.** Test: `tests/mewsAriAuthority.test.ts`, calendar cache assertion |

Additional misleading boundary: `/api/mews/content` is a D1 endpoint inside the
Mews namespace (`worker/index.ts:84` → `worker/d1-content.ts`). It has no guest
caller and must not be read as evidence that D1 serves ARI.

## 4. Reference data in D1 (allowlist)

These six stable cross-references are the **only** Mews-derived fields permitted
in D1. Mews remains authoritative for every value they might be associated with;
**they never resolve to price or availability.**

| D1 object / field | Contract (file:line) | Guest use | Provenance | Staleness policy |
| --- | --- | --- | --- | --- |
| `locations.mews_hotel_id` | `src/types/d1-contracts.ts:65,73` (`mewsHotelId`) | Editorial metadata only; **not** used by Mews calls | `content_provenance` (`migrations/0003_property_scoped_contracts.sql:44-60`), source `webflow_cms`, snapshot `2026-11-15` | Fixed import snapshot; **no read-time staleness enforcement** |
| `room_types.mews_room_category_id` | `src/types/d1-contracts.ts:101,110` (`mewsRoomCategoryId`) | Keys editorial descriptions/galleries/amenities; not used for availability/price calls | same | same |
| `add_ons.mews_product_id` | `src/types/d1-contracts.ts:294,307` (`mewsProductId`) | CMS merchandising overlay joined to live Mews products; **not a whitelist** | same | same |
| `offers.rate_product_id` | `src/types/d1-contracts.ts:324,339` (`rateProductId`) | Editorial only | same | same |
| `rate_merchandising.rate_product_id` | `src/types/d1-contracts.ts:383,394` (`rateProductId`) | No current reader; fields seeded NULL | `content_provenance` rows | same |
| `media_aliases.alias_type='mews_asset_id'` | `src/types/d1-contracts.ts:22-29` (`MediaAliasType`) | Editorial media resolution (`worker/d1.ts:486`) | `created_at` only | same |

W2 added an explicit selective reference-sync contract
(`mewsReferenceSyncRowSchema`, `src/types/d1-contracts.ts:527-550`) whose
`mewsReferenceTypeSchema` enum allows only `hotel`, `rate_group`, `product`,
`room_category` and `age_category`. It stores stable IDs, a Mews payload and
`source_system`/`synced_at`/`reconciled_at` provenance — never availability,
inventory, restrictions or rates. The enforcing test asserts both the exact enum
and the absence of ARI reference types.

`content_provenance` records `source_system`, `source_collection`, `source_id`,
`source_snapshot_date`, `source_hash` and `imported_at`
(`migrations/0003_property_scoped_contracts.sql:44-60`). The current import is a
fixed `2026-11-15` snapshot (e.g. `tests/fixtures/d1-contracts-fixture.sql:40-44`).
There is **no automatic re-sync and no read-time staleness check**.

**Enforcing test:** `tests/mewsAriAuthority.test.ts` —
"D1 contracts expose only an explicit allowlist of Mews reference fields" parses
`src/types/d1-contracts.ts` for every `*mews*` token and fails on any field
outside this allowlist, so a future ARI-shaped column cannot be added silently.

## 5. Authority guardrails (W1 / W2 / W3)

| # | Guardrail | Rule | Enforcing test |
| --- | --- | --- | --- |
| G1 | No `ARI_SOURCE` / `RATE_SOURCE` flag | Adding a switch that can serve ARI from D1 is the clearest boundary break; none exists today (audit §8.8) | Static Mews/D1 boundary test (no ARI operations in D1 layers; no ARI tables) |
| G2 | Property → Mews config binding stays env-owned | `MEWS_CONFIG_ID` / `MEWS_HOTEL_ID` and age categories come from env (`worker/mews/_lib.ts:100-116`). D1 `mews_hotel_id` must never select the config for availability/quote/create calls | Handler egress tests assert `ConfigurationId`/`HotelId` derive from env, not D1 |
| G3 | Add-on IDs never become a whitelist | `mewsProductId` is merged non-filtering (`src/lib/addOnMerchandising.ts:44-49`); filtering it would drop valid Mews products from quotes and trip the completeness guard (`worker/mews/reservation-price.ts:81-93`) | Handler egress tests assert `ProductIds` are passed through to Mews; D1 handlers cannot supply them |
| G4 | `cancellation_rules` never read as booking restrictions | `rate_merchandising.cancellation_rules` (`src/types/d1-contracts.ts:387`) has no reader and must stay that way; Mews structured policy is authoritative | Reference-field allowlist keeps it editorial; static ARI-operation test blocks Mews ops in D1 code |
| G5 | Rate-card `mews-rate-id` is presentation-only | It selects editorial config by ID (`src/lib/rateCardConfig.ts:17-25`, `webflow/rate-cards.ts:186`); price still comes from the live Mews rate (`src/components/rates/RateSelectionView.tsx:253-273`) | Handler egress tests + allowlist test |
| G6 | No D1 ARI table and no D1 access from Mews handlers | No `env.DB`, `getDb` or ARI-shaped table; D1 layers contain no Mews ARI operation strings | "Mews handlers and D1/content layers keep the authority boundary in source" |
| G7 | Calendar cache stays KV/advisory | KV/Cache only; never D1, never a booking gate | "the advisory calendar snapshot is KV/Cache-backed, never D1-backed" |
| G8 | Every ARI handler egresses to the exact Mews operation | Single egress at `worker/mews/_lib.ts:169,200`; method POST with operation-specific body | "each authoritative handler POSTs to its exact Mews distributor operation" and "no authoritative handler reads D1" |

G1–G5 are shared guardrails: they apply to W1 (admin/runtime foundation), W2
(source-schema authority) and W3 (guest D1 adapters). G6–G8 are enforced directly
by `tests/mewsAriAuthority.test.ts`.

## 6. Sync-gate relevance (COW-107 / COW-111)

- The reference-data allowlist in §4 is the contract that **COW-107** (sync
  gates) must verify before any collection flag flips: parity for a collection
  is necessary, but a synced Mews ID is still never a source of price or
  availability.
- **COW-111** (Webflow runtime retirement) must remove the Webflow env vars and
  hosts listed in the audit §5.4 without introducing a D1 ARI path. The D1
  endpoints `/api/mews/content` and `/api/d1/*` are admin-only; they are not a
  substitute for any Mews operation in §2.
- This matrix is **shared with W1 and W2**. Any change to the authority split —
  a new D1 reference field, a new Mews operation, or a cache promoted to a
  booking gate — must be reflected here and in `tests/mewsAriAuthority.test.ts`.

## 7. Verification

`node --test tests/mewsAriAuthority.test.ts` — 5 tests covering handler egress
(a), D1 isolation (b), source invariants (c), the reference-data allowlist (d)
and the KV calendar cache (e). The tests require no network, Wrangler or live
Mews account; `globalThis.fetch` is stubbed and restored in `test.after`.
