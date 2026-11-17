# COW-29 — Source systems, contracts and migration inventory

**Status:** audit deliverable. This change is documentation and generated inventory only — no production behavior, configuration or data is changed. The issue remains **In Progress**: live-system sign-off and the downstream milestones (COW-30 onward) are still open.

**Date:** 2026-11-17. **Source snapshot:** Webflow CMS export captured 2026-11-15.

**Repositories in scope**
- Source dashboard: [`cowboy-dashboard`](https://github.com/REVREBEL/cowboy-dashboard) — local checkout `/Users/garystringham/github-revrebel/cowboy-dashboard`.
- Destination / booking engine: [`urban-cowboy-booking-engine`](https://github.com/REVREBEL/urban-cowboy-booking-engine) — this repository. PR [#298](https://github.com/REVREBEL/urban-cowboy-booking-engine/pull/298) is the foundation already merged.

**Companion artifacts**
- [`docs/generated/d1-reconciliation.json`](generated/d1-reconciliation.json) — per-collection source counts, destination counts, findings F-01…F-16.
- [`docs/generated/source-inventory-baseline.json`](generated/source-inventory-baseline.json) — byte counts and SHA-256 hashes for every exported CSV.
- [`docs/application/d1-data-ingestion.md`](application/d1-data-ingestion.md) — importer decisions, live read-only check and remaining gates.

---

## 1. Scope, method and governing invariants

This audit inventories what exists **today**, so that later milestones can move it without guessing. It covers Webflow editorial CMS, the Astro portal that edits it, Mews ownership boundaries, and the inherited Supabase/n8n funnel/recovery/analytics path. It produces a field-level lineage crosswalk, a PII/retention register, documented exclusions and decommission gates.

Method: static inspection of both repositories at the paths cited below, plus the reconciled counts and a read-only D1 check already recorded in `docs/application/d1-data-ingestion.md` (2026-11-17). No live writes were performed.

Invariants that constrain every later migration step:

1. **Mews is the source of truth** for availability, pricing, restrictions, payments, settlement and reservation creation. D1 must never author those transactional facts. Webflow holds editorial content; D1 holds editorial content plus Mews identifiers. D1 is also the planned store for **operational and analytics** data (guest sessions, email captures, recovery and analytics tables in §2.4) — that data is not editorial and is governed separately under §4 and COW-44/45/48.
2. **Published-only reads.** Public readers must never serve draft or archived CMS content. The current Worker enforces this per item (`worker/webflow/locations.ts`, `buildings.ts`, `policy-language.ts`, `photo-hotspots.ts`); any D1 read path must preserve it.
3. **No guest PII in shareable URLs.** Selection state may be shared; personal data may not (COW-2, COW-13).
4. **Dual-run before cutover.** Webflow/n8n/Supabase stay live and reconcilable until every gate in §7 passes.
5. **No decommission without sign-off** of parity, recovery/analytics dual-run, security and rollback.

---

## 2. Source system inventory

### 2.1 Webflow CMS — editorial source

The CMS site is identified at runtime by `WEBFLOW_SITE_ID`; that value is **not committed**. `webflow.json` in `cowboy-dashboard` contains a Webflow **DevLink project id** (`1ae27adc-e3b1-4f72-909d-ce5e60650dc0`), which is a different identifier and must not be used as the CMS site id.

Eleven collections are statically configured in `cowboy-dashboard/src/lib/collections-config.ts`; `getLiveCollections()` merges that config with the live collection list and falls back to it if the live call fails. Counts below are the reconciled parsed row counts from `d1-reconciliation.json`, not newline counts (quoted multiline fields make newline counts wrong).

| Collection | CMS collection id | Source rows | Publication / data notes | D1 destination (from PR #298) |
| --- | --- | ---: | --- | --- |
| Locations | `6abc812fd98b325b281d6301` | 4 | 1 draft; publication state is **not** carried into D1 (open gate §7 A); carries business contact fields and policy language | `locations` (4) |
| Buildings | `6abc8192a900d21d00b7c588` | 9 | Duplicate `Buildings 2.csv` skipped | `buildings` (9) |
| Room Types | `6abc815b36cbcba74b8b01c4` | 22 | 1 draft; `mews-room-type-id`, features/restricted amenities | `room_types` (22), `room_type_amenities` (253) |
| Amenities | `6abc8175a7bbdc92fa9e6599` | 76 | No icon name/path columns in export | `amenities` (76) |
| Events | `6abc810f36cbcba74b8af4a3` | 8 | 5 recurring (`recurring-start`); venue fallbacks | `events` (8) |
| Offers | `6abc811cb92ea32dd64d79e0` | 8 | 3 inactive / no Mews rate; styling & geo fields | `offers` (8), `rate_merchandising` (5) |
| Add Ons | `6ac364287c8782e8e653075e` | 9 | `mews-product-id`; copy lives in `long-description` | `add_ons` (9) |
| Photo Hotspots | `6acfb8250c28159487fb2aaf` | 238 | **Excluded** — export has no `photo-file-id` / `photo-url` | none |
| Instagrams | `6abe1d64ff9619885c7e5cf7` | 20 | No dedicated table | `content_items` / `content_revisions` (`kind='instagram'`) |
| Outlets | `6abc819c43b4b395a2b80752` | 3 | Duplicate `Outlets 2.csv` skipped; business contact fields | `content_items` / `content_revisions` (`kind='outlet'`) |
| Content Settings | — | 1 | Draft, no `lastPublished` — policy language | `content_items` / `content_revisions` (`kind='policy'`, status `draft`) |
| Menu Items | `6abc8145eb90b8f4d6d650f4` | 0 | Empty export | none |

Every export carries `isDraft`, `isArchived` and `lastPublished`. All runtime readers use Webflow's live/published endpoints and skip draft or archived items: `worker/webflow/buildings.ts:75-89, 133-145` filters them and fetches `/items/live`, and `worker/webflow/photo-hotspots.ts` and `worker/webflow/policy-language.ts:27-56` do the same at their own granularity. Only the **location-settings** path (`worker/webflow/locations.ts:118-176, 234-253`) goes further and compares the staged record with the live one using `lastPublished`, so an unpublished edit cannot silently override a published setting. `policy-language.ts` reads the single published item but does not model `lastPublished`; that safeguard must not be assumed elsewhere. Every D1 read path must at minimum preserve live-only, draft/archived-excluding reads, and add staged/publication checks for settings-equivalent content.

**Media identity.** Webflow has no internal immutable media id. Assets are addressed by a 24-hex Webflow `fileId` and a CDN URL of the form `https://cdn.prod.website-files.com/{siteId}/{assetId}_{filename}`. `cowboy-dashboard/src/lib/photo-hotspots-utils.ts` parses those ids out of `photo-file-id`/`photo-url` to bind a hotspot to a photo, and deliberately discards the shared `siteId` segment to avoid false matches. The portal repairs hotspots after a photo re-upload through `/api/cms/rekey-photo`. Because the CSV export omits `photo-file-id`/`photo-url`, all 238 hotspots are blocked (finding F-08); the export also has no `display-order` column in the D1 `photo_hotspots` table (F-09).

The current D1 schema is **Squarespace-shaped**: `media_assets` and `media_versions` name their identity columns `squarespace_asset_id` and `squarespace_url` (`migrations/0001_init.sql:37-59`), not Webflow `fileId`/CDN fields. Before a media import can be specified, decide whether to rename/generalise those columns or add Webflow-compatible identity columns plus aliases. This is an explicit gate in §7 A.

### 2.2 Astro portal and operations — `cowboy-dashboard`

**Deployment shape.** `@astrojs/cloudflare` with `output: 'server'` (`astro.config.mjs`). `wrangler.jsonc` declares only the `ASSETS` binding — **no D1 binding, no secrets, no auth configuration**. `src/middleware.ts` performs only a DEV readiness check; it does not authenticate. The `/api/cms/*` endpoints are unauthenticated proxies that use a server-side `WEBFLOW_CMS_API_TOKEN`. This is acceptable only while the portal is a trusted internal tool; the replacement dashboard must add RBAC (COW-37/38, and the `requireAdmin` gate already added in the booking engine).

**Editors / routes**

| Route | Operation |
| --- | --- |
| `/portal` | Collection list grouped by complexity; reads live collections when Webflow is reachable |
| `/portal/[slug]` | Item list for a collection |
| `/portal/[slug]/new`, `/portal/[slug]/[itemId]` | Create / edit CMS item |
| `/portal/[slug]/reorder` | Drag-and-drop ordering using each collection's configured `sortField` |
| `/portal/photo-hotspots/review` | Hotspot review tool |
| `/portal/tools` | Utility tools (including Mews photo sync) |

**API / operations**

| Endpoint | Operation |
| --- | --- |
| `/api/cms/collections`, `/api/cms/discover-site` | List collections / discover site |
| `/api/cms/[collectionId]`, `…/[itemId]`, `…/publish`, `…/bulk`, `…/reorder`, `/reference/[itemId]` | Read / write / publish / bulk / reorder / reference lookup against Webflow CMS |
| `/api/cms/upload-image` | Upload to Webflow Assets via presigned S3 POST; computes an MD5 hash and polls Webflow indexing before returning `fileId` + `hostedUrl` |
| `/api/cms/rekey-photo` | Re-point hotspots when a room photo is replaced |
| `/api/cms/sync-photo-hotspots` | GET = dry-run report (orphans/duplicates/coordinate drift); POST = delete curated ids |
| `/api/cms/sync-room-photos` | Runs `scripts/sync-mews-room-photos`: appends **Mews** room photos into the Webflow Room Types `images` field (Mews → Webflow direction) |
| `/api/tools/alt-text/export`, `/import` | Bulk alt-text import/export |

**Environment configuration:** `WEBFLOW_CMS_API_TOKEN`, `WEBFLOW_SITE_ID`, `WEBFLOW_API_HOST`, `WEBFLOW_CMS_SITE_API_TOKEN`, `WEBFLOW_ROOM_TYPE_COLLECTION_ID`, plus `MEWS_BASE_URL`, `MEWS_CLIENT` and `MEWS_CONFIG_ID` for the photo sync. None of these values are committed.

**Operational caveats worth carrying forward:** the photo sync appends to existing images rather than replacing them (`--clear-empty` is an explicit override); the rekey tool only touches hotspots scoped to the edited room type's gallery; and the hotspot sync deletes are driven by a curated id list from a prior dry-run report. Any ported tool (COW-36) must keep those safety properties.

### 2.3 Mews — transactional source of truth

Confirmed, non-secret identifiers are documented in [`docs/catskills-mews-ids.md`](catskills-mews-ids.md): the booking-engine configuration and hotel IDs, adult/child age categories, the subscription reference, the resort-fee and guest add-on product IDs, the rate groups, and the 22 production Room Type bindings used as `RoomCategoryId`. The registered `MEWS_CLIENT` string is deployment configuration, not a secret.

Ownership boundary to preserve:

| Owned by Mews | Owned by Webflow / D1 (editorial) |
| --- | --- |
| Availability, restrictions, rate groups, nightly rate, taxes/fees, currency, cancellation/deposit rules | Rate-card artwork, overlay positions, labels, sort order (COW-14) |
| Reservation creation, `reservationGroupId`, payment requests and payment status | Editorial offer/upgrade copy and merchandising position |
| Add-on product identity and price | Add-on display name, description, icon, quantity rules |
| Room category identity (`RoomCategoryId`) | Room gallery, hotspot placement, amenities, policy language |

Two documented gaps: Mews does not supply Room Type Group relationships (maintained in the domain/content layer, see `docs/accommodation-domain-model.md`), and creating operational tasks for scheduled add-on delivery requires the separately certified **Connector API**, which this project does not have — reservation notes remain the fallback. Do not attempt task creation with the Booking Engine/Distributor credentials.

### 2.4 Supabase / n8n — inherited funnel, recovery, analytics and email

**Current pipeline** (documented in [`docs/analytics-setup.md`](analytics-setup.md)):

```
browser → /api/mews/track (Worker) → WEBHOOK_EVENTS → n8n → Supabase
```

`worker/mews/track.ts` rebuilds a whitelisted payload — it does not forward the raw body — and posts it to the single n8n webhook via `waitUntil` (a no-op when `WEBHOOK_EVENTS` is unset). Accepted statuses are `etape`, `paiement_initie`, `paiement_valide` and `matches_saved`. Abandoned carts and failed payments are **derived** in Supabase, not dedicated events.

**Supabase schema:** `booking_events` (append-only log) and `carts` (one current row per cart, maintained by a `sync_cart_from_event` trigger). RLS is enabled with no public policy; `service_role` lives only in n8n. The booking engine's `/dashboard` reads `carts`/`booking_events` with a Supabase `anon` key plus email/password auth and RLS; `src/dashboard/config.ts` currently holds placeholders (`https://example.supabase.co`, `not-configured`).

**n8n:** one workflow ("Urban Cowboy — Booking Events") with a webhook node that inserts into `booking_events`. n8n is also the intended outbound layer for saved-match recovery email: `docs/application/email-templates/room-match-saved-v1.md` records the `cart.matches_saved` contract and states that the dedicated email template is **not built yet** (`deliveryStatus: "pending_template"`).

**Inherited / Bambou markers (COW-17):** EUR currency and `priceEur`, French status names, the airport-transfer extra used as a retargeting target, France/Martinique-first defaults, the original webhook and Supabase project. These must be removed or replaced by Urban Cowboy/REVREBEL-owned configuration; no clean clone may send data to inherited infrastructure.

**New D1 schema already scaffolded but empty (PR #298):** `guest_sessions`, `email_captures`, `saved_room_matches`, `cart_abandonments`, `recovery_campaigns`, `analytics_events`, `analytics_daily`. These are schema only — the CMS seed wrote zero rows to them. Populating them is COW-44/45/48 work, not this audit.

---

## 3. Count and hash baselines

- **Source records:** 398 across 12 collections (`d1-reconciliation.json`).
- **Represented in D1:** 160 source records total — 136 in the seven structured tables (→ 443 seed rows across 12 tables; this is the reconciliation's `structurallyRepresentedSourceRecords` figure) plus 24 versioned-content records (20 instagrams, 3 outlets, 1 content setting) in `content_items`/`content_revisions`.
- **Excluded:** 238 photo-hotspot records; 2 byte-identical duplicate files skipped; 1 empty collection.
- **Integrity:** per-file byte size and SHA-256 are in `docs/generated/source-inventory-baseline.json`. Verify with `shasum -a 256 webflow_cms_export/*.csv`. The two duplicate pairs have identical hashes, confirming the importer's duplicate detection.
- **Live read-only check (2026-11-17, recorded in the ingestion doc):** 4 locations, 9 buildings, 22 room types, 76 amenities, 8 events, 8 offers, 9 add-ons present in `urban-cowboy-content`; the relationship, hotspot, media and versioned-content tables are still at 0 rows, `mews_hotel_id` is NULL for all locations, and all 8 offers are `published`. That is the pre-seed state: applying the regenerated seed is a separate, explicitly approved step.

**Counting caveat:** raw newline counts are not row counts because several CMS fields contain quoted multiline text. Always use the importer's parsed counts (`sourceCounts` in `d1-reconciliation.json`).

---

## 4. Sensitive-data register and retention / PII classification

| Data / fields | Source system | Class | Handling and retention requirement |
| --- | --- | --- | --- |
| `customer.firstName`, `lastName`, `email`, `telephone`, `nationalityCode` | Booking journey → `/api/mews/track` → n8n → Supabase `booking_events.payload` and `carts.customer_*` | **Direct PII** | Never store or transmit as readable plaintext outside the trusted boundary. Encrypt at rest (AES-256-GCM, unique IV per value), keys only as Worker secrets; searchable email via keyed HMAC; decrypt only in an authenticated server workflow; no CDN caching. Retain only for the agreed recovery window, then delete/anonymise. (COW-13) |
| Guest notes / scheduled add-on delivery instructions | Mews reservation notes | **Operational PII** | Stays in Mews. Do not copy into analytics/D1. Never route to inherited n8n/Supabase. |
| `matchSave.shareUrl`, `topRoomCategoryId`, `alternateRoomCategoryIds`, `party`, `dog`, `interests` | `/api/mews/track` (`cart.matches_saved`) | **Sensitive / linkable** | Share URLs must carry selection only, never PII (COW-2). Treat as pseudonymous behavioural data; limit retention. |
| `cartId`, funnel `step`, stay dates/occupancy, room/rate choice, totals, payment state, `reservationGroupId`, `paymentRequestId` | `/api/mews/track` | **Pseudonymous behavioural** | Queryable in normal analytics columns. Linkable to a person via `cartId`; keep retention-limited and access-controlled. `reservationGroupId` is **capability-sensitive**: submitting it to the unauthenticated `reservation-status` endpoint can disclose payment state and reservation numbers. Do not log or expose it beyond the active booking flow, and require verifiable authorization before returning reservation details. `paymentRequestId` is a Mews correlation key, not a secret. |
| `utm_*`, `gclid`, `fbclid` | Arrival URL → attribution in `/api/mews/track` | **Pseudonymous / advertising identifiers** | Whitelist only known keys (already done in `track.ts`); minimise and expire with the cart record. |
| Locations: street addresses, `primary-phone`, `front-desk-operations-emails`, `reservations-email`, `sales-email`, `general-email`; Outlets: `email-address`, `main-phone`, addresses | Webflow Locations/Outlets | **Public business contact — not guest PII** | Safe to publish as property information. Keep Webflow as source and preserve provenance. |
| Editorial content (rooms, amenities, offers, events, policy language, instagrams) | Webflow CMS | **Non-sensitive** | No PII expected. Spot-check free-text fields before publishing a re-export. |
| `WEBFLOW_CMS_API_TOKEN`, `ADMIN_TOKEN`, `CLOUDFLARE_API_TOKEN`, Supabase `service_role` | Deployment / n8n | **Secret** | Never commit. Deploy as Worker secrets / n8n credentials only. `MEWS_CLIENT` and `SUPABASE_ANON_KEY` are public identifiers by design. |

**Access-control finding:** the deployed booking-engine Worker has a `DB` binding but no `ADMIN_TOKEN` secret binding (per the ingestion doc), and `requireAdmin` is a shared-token gate rather than session/role authentication. The private recovery/analytics endpoints must be protected by real session/role auth (or disabled) before any PII-bearing D1 table is populated.

---

## 5. Source → D1 field-level lineage crosswalk

Mappings are those implemented by `scripts/seed-d1-from-webflow.mjs` (regenerated 2026-11-17). "D1 only" columns not present in the export are left NULL or derived as noted.

| Source (`collection.field`) | D1 target (`table.column`) | Transformation / rule |
| --- | --- | --- |
| `locations.id`, `.slug`, `.name` | `locations.id`, `.slug`, `.name` | Direct. `time_zone` derived from slug (`catskills` → `America/New_York`, Denver/Nashville zones asserted by `deploy:d1`). |
| *(none — export gap)* | `locations.mews_hotel_id` | NULL. Per-location Mews mapping required (F-01). |
| `locations.street-address-line-1/2`, `.city`, `.state`, `.postal-code`, `.google-maps-link`, `.website`, `.instagram`, `.facebook`, `.trip-advisor`, `.youtube` | *(none — no D1 columns)* | Public property metadata; **not imported** by the current seed. Decide whether to add columns or keep Webflow as the source; no retention concern while the data stays public, but preserve re-export provenance. |
| `locations.primary-phone`, `.front-desk-operations-emails`, `.reservations-email`, `.sales-email`, `.general-email` | *(none — no D1 columns)* | Business contact points, classified in §4 as public business contact, not guest PII. Not imported by the current seed; retain only while published. |
| `locations.privacy-policy`, `.terms-conditions`, `.accessibility`, `.location-details` | *(candidate: `content_items`/`content_revisions`)* | Policy/legal copy; not imported by the current seed. Decide source and publication workflow before cutover. |
| `buildings.id`, `.name`, `.slug`, `.sort` | `buildings.id`, `.name`, `.slug`, `.sort_order` | Direct; `location` multi-ref → `location_id`. |
| `amenities.id`, `.name` (fallback `.short-name`) | `amenities.id`, `.name` | `image_name`/`image_path` NULL — export has no such columns; no fabricated icon names (F-02). |
| `roomTypes.id`, `.name`/`.short-name`, `.slug`, `.sort` | `room_types.id`, `.name`, `.slug`, `.sort_order` | `property-location` → `location_id`; `mews-room-type-id` → `mews_room_category_id` (validated non-empty). |
| `roomTypes.features-amenities` + `.amenity-display-order` + `.restricted-amenity-ids` | `room_type_amenities.room_type_id`, `.amenity_id`, `.display_order`, `.excluded` | JSON array parsed and de-duplicated; 253 references resolved; 21 restricted flags are subsets (F-03). |
| `events.id`, `.name`, `.short-description`/`.long-description` | `events.id`, `.title`, `.description` | `datetime` **or** `recurring-start` → `starts_at` (5 fallbacks); venue from onsite/custom/offsite fields; `time_zone` from location; `display_flag` from publication state. |
| `offers.id`, `.name`, `.headline`, `.description`/`.long-description` | `offers.id`, `.name`, `.headline`, `.description` | `mews-rate-id` → `rate_product_id`; status = published only when published **and** `active=true`; 3 offers have no rate (F-06). |
| `offers.sort-order` (+ rate id + published) | `rate_merchandising.position`, `.rate_product_id` | 5 rows. `styling`, `geo_targeting`, `cancellation_rules` NULL — not in export. |
| `addOns.id`, `.name`, `.long-description`/`.short-description` | `add_ons.id`, `.name`, `.description` | Copy taken from `long-description` (old seed used a Mews UUID from `short-description`); `mews-product-id` retained; quantity cap only when `enable-quantity`. |
| `instagrams.*`, `outlets.*`, `contentSettings.*` | `content_items` + `content_revisions` | Full source row stored as `payload_json`; `kind` = `instagram`/`outlet`/`policy`; `status` from publication; content settings stays `draft` (F-16). |
| `photoHotspots.*` | *(none)* | **Blocked.** No `photo-file-id`/`photo-url` in export; no legitimate `media_asset_id` (F-08). `display-order` also lacks a D1 column (F-09). |
| `menuItems.*` | *(none)* | Empty collection. |
| `matchSave` in `/api/mews/track` (`cart.matches_saved`) | Supabase event payload (current); D1 `saved_room_matches` (target, 0 rows) | Include `saved_room_matches` in the dual-run mapping (COW-44/46). Map `topRoomCategoryId` → `room_category_id`, the session/stay context → `session_id`, `check_in`, `check_out`, `adults`, `children`. `alternateRoomCategoryIds`, `party`, `dog`, `interests` and `shareUrl` have no dedicated column yet: add fields to the schema or document a deliberate exclusion before cutover. |
| Rest of `/api/mews/track` payload | Supabase `booking_events` / `carts` (current); D1 `guest_sessions` / `email_captures` / `cart_abandonments` / `analytics_events` / `analytics_daily` (target, 0 rows) | No field-level import exists yet. Define the mapping when the queued D1 ingestion dual-run is built (COW-44/45/48); encrypt PII per §4. |

Publication lineage: `isDraft`/`isArchived`/`lastPublished` → `content_items.status` and `content_revisions.published_at` for versioned content, and `offers.status` / `add_ons.status` / `events.display_flag` for structured tables. Two gaps remain: `room_types` has **no status column**, so the one draft room type cannot be filtered in D1 (F-04); and `locations` has no status column while the importer does not filter by `isDraft`, so the one draft location would be indistinguishable from published locations in D1. Both are gates in §7 A.

---

## 6. Migration exclusions

Explicitly **not** migrated, with the reason recorded so the decision is auditable:

1. **238 photo hotspots** — no media identity in the export. Requires a re-export containing `photo-file-id`/`photo-url`, a `media_assets`/`media_versions` import, and a `photo_hotspots.display-order` migration before it can be imported (COW-33/34).
2. **`media_assets`, `media_versions`, `photo_hotspots`** — 0 rows; blocked by the same media-identity gap.
3. **Duplicate exports** `Buildings 2.csv` and `Outlets 2.csv` — byte-identical (verified by SHA-256 in the baseline); the importer skips them.
4. **Menu Items** — empty collection.
5. **Recovery / analytics / audit / upgrades tables** — schema-only, out of scope for the CMS content migration; populated by later milestones.
6. **Inherited Bambou integrations and identifiers** — n8n webhook, Supabase project and Bambou IDs/EUR/French defaults. Remove, do not migrate (COW-17).
7. **Source fields with no D1 target** — amenity icon name/path, offer styling/geo/cancellation fields, room-type editorial status, hotspot display order. Tracked as findings F-02, F-04, F-09 and the NULL columns in §5.

---

## 7. Decommission acceptance criteria

All gates are **open** today. No legacy service may be decommissioned until every applicable gate is evidenced and signed off.

**A. Data and lineage**
- [ ] Re-run `npm run seed:d1 && npm run test:seed` and reconcile counts against `d1-reconciliation.json` and the hash baseline.
- [ ] Close unresolved references F-01 (per-location Mews hotel IDs), F-04 (draft room type status), F-05 (event timezone interpretation), F-06 (3 nonbookable offers), F-07 (9 add-on product IDs validated against Mews).
- [ ] Preserve publication state for the draft location in D1 (add a status column or exclude it from public reads) before any public D1 location read.
- [ ] Decide the D1 destination for location address/contact fields (new columns vs Webflow-as-source), with publication and retention notes.
- [ ] Re-export hotspots with stable media identity; migrate `photo_hotspots.display-order`; import and verify all 238 hotspot placements (COW-33/34). Resolve the Squarespace-shaped `squarespace_asset_id`/`squarespace_url` identity columns against Webflow `fileId`/CDN fields before specifying that import.
- [ ] Editorial source-of-truth policy agreed before D1-native editing (seed uses upserts and can overwrite direct D1 edits).

**B. Security and PII**
- [ ] Guest PII encrypted at rest and absent from routine analytics payloads; no PII in share URLs (COW-2, COW-13).
- [ ] `reservationGroupId` treated as capability-sensitive: not logged or exposed beyond the active booking flow, and `reservation-status` requires verifiable authorization before returning reservation details.
- [ ] Admin endpoints behind real session/role auth; `ADMIN_TOKEN` (or equivalent) bound in the deployed Worker; `/api/recovery` and `/api/analytics/summary` protected or disabled.
- [ ] n8n webhook authenticated (HMAC + replay protection) if retained; no raw PII in webhook events.
- [ ] Clean clone cannot reach Bambou/NoCodeFactory endpoints or inherited Supabase project (COW-17).

**C. Parity and behavior**
- [ ] Published-only filtering preserved for every D1 read path; no draft/archived content served publicly.
- [ ] Typed content-service parity against Webflow behind a feature flag, with zero room/rate/policy drift; Webflow path retained for rollback.
- [ ] Mews transactional behavior unchanged: exact price revalidation, reservation creation, payment requests and status verification; no D1-authored pricing/settlement facts.
- [ ] `reservation-status` preserves upstream Mews error body/status (the known demo defect) and is verified.

**D. Reliability and operations**
- [ ] CI includes seed validation, index plans, API-dependent tests and E2E smoke; rollback/restore drill passes against a backed-up D1.
- [ ] n8n/Supabase and D1 dual-run reconciled (event counts, carts, conversions); include `saved_room_matches` and the missing `matchSave` fields in the mapping (§5); email delivery and attribution verified against Mews-confirmed status.
- [ ] Observability and alerting for ingestion failures; no false sold-out from swallowed Mews errors.

**E. Governance and retirement sequence**
- [ ] Upstream license/provenance resolved for commercial reuse.
- [ ] Documented retirement owner and date; staged sequence: freeze writes to legacy → read-only reconciliation window → disable legacy endpoints/config → remove credentials → archive source data per retention schedule.

---

## 8. Overlap with existing work

COW-29 is an **input** to these tickets, not an alternative implementation. The overlap and division of labour:

| Ticket | Overlap with this audit | Boundary |
| --- | --- | --- |
| [COW-2](https://linear.app/revrebel/issue/COW-2/implement-secure-pre-booking-guest-identity-for-member-rates-and-cart) — secure pre-booking guest identity | §2.4 and §4 identify the plaintext `/api/mews/track` PII path and the `matches_saved`/cart-recovery data that this ticket replaces. | COW-29 registers the fields and current flow; COW-2 implements identity, member-rate eligibility and recovery carts. |
| [COW-13](https://linear.app/revrebel/issue/COW-13/secure-booking-analytics-with-field-level-pii-encryption) — field-level PII encryption | §4 is the sensitive-data register that defines which fields need encryption and which may stay queryable. | COW-29 classifies; COW-13 owns the crypto boundary and key management. |
| [COW-14](https://linear.app/revrebel/issue/COW-14/build-cms-configurable-rate-cards-and-webflow-integration) — CMS rate cards | §2.3 records the ownership split (Mews price/rules vs Webflow artwork/positions) and §5 maps offer → `rate_merchandising` position. | COW-29 documents the contract; COW-14 builds the configurable card system. |
| [COW-17](https://linear.app/revrebel/issue/COW-17/remove-inherited-bambou-production-integrations-and-identifiers) — remove inherited integrations | §2.4 and §6 enumerate inherited webhook/Supabase/EUR/French markers to be removed rather than migrated. | COW-29 inventories them; COW-17 removes and neutralises them. |

---

## 9. Acceptance checklist (COW-29 deliverables)

- [x] Source inventory — Webflow collections/fields/IDs/publication state (§2.1), Astro portal editors and operations (§2.2), Mews ownership (§2.3), Supabase/n8n events, emails and analytics (§2.4).
- [x] Lineage map — field-level source → D1 crosswalk (§5) plus baseline counts/hashes (§3).
- [x] Retention / PII classification — sensitive-data register (§4).
- [x] Migration exclusions (§6) and decommission acceptance criteria (§7).
- [x] Overlap with COW-2, COW-13, COW-14, COW-17 (§8).
- [ ] Live-system verification of the Astro/n8n inventories with their owners (configuration values and n8n workflow internals cannot be read from the repository).
- [ ] Regenerate the hash baseline after any CMS re-export.

**Not claimed:** this audit does not declare COW-29 Done. The comment on the issue records the same position: the foundation PR covers the Webflow CSV inventory, importer, counts, reconciliation, exclusions and Mews boundaries, while the operational inventory, PII classification, field-level lineage and decommission criteria are delivered here, with live verification pending.
