# COW-96 — W2.1 source-to-target, schema and authority assessment

**Status:** review deliverable for W2.1. This document changes no schema, configuration or data. It is the evidence-backed review required before W2.2 may change the schema.

**Date:** 2026-11-23. **Source snapshot:** Webflow CMS export captured 2026-11-15. **Repository:** `REVREBEL/urban-cowboy-booking-engine`, branch `Workstream-2`.

**Evidence used**

| Artifact | What it establishes |
| --- | --- |
| [`source-system-audit.md`](../source-system-audit.md) (COW-29) | Source system inventory, field-level lineage, PII/retention register, exclusions, decommission gates |
| [`d1-reconciliation.json`](../generated/d1-reconciliation.json) | Per-collection row counts, hashes, relationship counts, findings F-01…F-19 |
| [`source-inventory-baseline.json`](../generated/source-inventory-baseline.json) | Byte counts and SHA-256 per exported CSV |
| [`d1-schema-contracts.md`](d1-schema-contracts.md) (COW-30) | Schema decisions, indexes, type contracts, provenance, rollback policy |
| [`durable-hotspot-mapping.md`](durable-hotspot-mapping.md) (COW-34) | Durable pin identity, source-space geometry, replacement/re-crop safety |
| [`d1-data-ingestion.md`](d1-data-ingestion.md) | CMS seed importer behavior, live read-only check, remaining gates |
| `migrations/0001_init.sql` … `0011_photo_hotspot_deletions.sql` | Current applied schema (the target being reviewed) |
| `src/types/d1-contracts.ts` | Existing typed contracts (stored snake_case → camelCase domain shapes) |
| `webflow_cms_export/*.csv` headers | First-hand field inventory, references and ordering fields |

## 0. Review decision

1. **No schema changes are made in W2.1**, per the issue's acceptance criterion.
2. The normalized model called for by W2.1 **already exists** in migrations 0001–0011. W2.2 is therefore a **targeted verification and gap-closing milestone, not a schema rewrite**.
3. Three items need an explicit W2.2 decision before any import is trusted:
   - **Publication state for `room_types` and `locations`** (F-05). Both lack a status column, yet the export contains one draft room type. Public D1 reads must not serve it.
   - **Import target for hotspots.** The legacy `photo_hotspots` table from 0001 is **not** the target. The durable model in `photo_hotspot_mappings` already carries `display_order`, source geometry, review state and immutable revisions; it supersedes F-12 from the older reconciliation.
   - **Editorial source-of-truth policy.** The seed uses upserts and can overwrite direct D1 edits. This must be settled before D1-native editing is enabled (it is not in this milestone).
4. Authority is unambiguous: **D1 owns editorial/configuration and media identity; Mews owns operational truth; ARI is read directly from Mews and has no authoritative D1 representation.**

## 1. Scope, method and governing invariants

The review is static: it compares the 2026-11-15 export, the reconciliation report and the committed migrations/contracts. Live-system verification (editorial confirmation of Mews mappings, timezone interpretation and offer activity) remains a human gate and is called out in §7.

Invariants that constrain W2.2–W2.7:

1. **Mews owns ARI.** Availability, inventory, restrictions and live operational rates are queried directly from Mews at request time. No D1 table, cache or calculation becomes authoritative for them.
2. **Published-only reads.** Every public D1 read path filters draft/archived content and reads a published item's current revision; ambiguous or missing data falls back to Webflow (COW-39).
3. **Media identity is permanent.** A logical image has one master media ID. Provider, source URL and delivery URL are mutable fields/aliases on that record. Room placements, amenity links, hotspots, ordering and publishing key on the master ID, never on a URL.
4. **Additive migrations only.** 0001 and 0002 are applied in production and are not edited. New work is forward-only SQL, checksummed in `migrations/manifest.json`.
5. **Dual-run before cutover.** Webflow stays live and reconcilable; per-route flags default to Webflow, with `shadow` for parity comparison.

## 2. CMS field inventory and crosswalk

Field names below are taken from the export headers. All collections carry `id`, `cmsLocaleId`, `createdOn`, `lastUpdated`, `lastPublished`, `isArchived`, `isDraft`, `name`, `slug`. Those universal fields are not repeated per row.

| Collection (source rows) | References / multi-references / ordering | Publication signals | D1 target and rationale |
| --- | --- | --- | --- |
| **Locations** (4) | none in export; `enable-demo-engine`, `production-layout`, `demo-layout`, `enable-feature-section`, feature copy, `enable-event-dates-quick-selection` drive property behavior | `isDraft`, `isArchived`, `lastPublished` | `locations` for identity/scope; property behavior and legal/contact copy → versioned `content_items` + `content_revisions` (`kind='site_settings'` / `policy`). A dedicated status column is **not** present (F-05). |
| **Buildings** (9) | `location` multi-reference → `location_id`; `sort` → `sort_order` | `isDraft`, `isArchived`, `lastPublished` | `buildings`, tenant + location scoped, ordered by `sort_order, id`. Child of Locations; justifies a relational column because it is independently queried and ordered. |
| **Room Types** (22) | `property-location` → `location_id`; `building` → building; `features-amenities` **multi-reference** → `room_type_amenities`; `amenity-display-order` + `restricted-amenity-ids` → display order and `excluded`; `sort` → `sort_order`; `mews-room-type-id` → `mews_room_category_id` | `isDraft`, `isArchived`, `lastPublished`, `active`; **1 draft** (`6abd4a1debcab0ea7e461c9a`) | `room_types` for identity and scoping; the amenity membership/order/exclusion is a genuine many-to-many with ordering and eligibility, so it is normalized rather than left in JSON. Editorial copy (`long-description`, `short-description`, `benefits-statment`, review fields) belongs in versioned content, not in ARI. |
| **Amenities** (76) | `location`, `global-amenity` (references); no `sort` column in export | `active`, `isDraft`, `isArchived`, `lastPublished` | `amenities` for canonical ID/name/order; `amenity_editorial` for published `short-name`, `short-description`, `long-description`, `active` (COW-73). **No `image-name`/`image-path` columns exist in this export** (F-02); icon paths are admin-authored, never guessed from display names. |
| **Events** (8) | `property-location` → `location_id`; `datetime` or `recurring-start` → `starts_at`; `recurrence-type`, `repeat-every`, `repeat-on`, `recurring-end`, `datetime-end`; venue from `onsite*` / `offsite*`. No ordering field | `isDraft`, `isArchived`, `lastPublished` | `events` with displayed/indexed reads. Recurrence semantics are versioned in the source row; `starts_at` uses the recurring start where `datetime` is empty (F-06). |
| **Offers** (8) | `location` → `location_id`; `mews-rate-id` → `rate_product_id`; `sort-order` → `rate_merchandising.position`; `active`, `member-only` | `isDraft`, `isArchived`, `lastPublished`, `active` | `offers` for editorial copy and status (published only when published **and** active); `rate_merchandising` for position. Mews still owns the rate itself. Styling/geo/cancellation fields have no D1 target (see §2.1). |
| **Add Ons** (9) | `mews-product-id` → Mews product reference; `sort`; `enable-quantity` / `max-quantity-per-stay` → quantity rule | `isDraft`, `isArchived`, `lastPublished` | `add_ons`. Editorial copy comes from `long-description`, **not** `short-description` (which can be a raw Mews UUID). Mews owns product identity and price. |
| **Photo Hotspots** (238) | `amenity` single reference (all 238 validate); `x-percent`, `y-percent` (source-space coordinates); `display-order`; **no `photo-file-id` / `photo-url` in this export** | `active`, `isDraft`, `isArchived`, `lastPublished` | **Not imported from this export** (F-11). Target is `photo_hotspot_mappings` (COW-34), which already has `display_order`, normalized `source_x/source_y`, `source_version_id`, crop geometry, review state and immutable revisions. It is keyed on master media ID + placement, never on a source URL. |
| **Instagrams** (20) | `sort`; `instagram-url`, `shortcode`, `media-type`, captions | `isDraft`, `isArchived`, `lastPublished` | `content_items` + `content_revisions` as `kind='instagram'`; full source row retained as validated `payload_json`. A dedicated table is not justified — content is read as an opaque, versioned editorial payload. |
| **Outlets** (3) | `location` reference; business contact fields | `isDraft`, `isArchived`, `lastPublished` | Versioned content `kind='outlet'`. Duplicate `Outlets 2.csv` is byte-identical and skipped (F-14). |
| **Content Settings** (1) | `location`; cancellation/refund language fields, due-date labels | `isDraft=true`, no `lastPublished` | Versioned content `kind='policy'`, status `draft` (F-19); will not appear in published APIs until approved. Published site-settings behavior comes from `kind='site_settings'` (F-09). |
| **Menu Items** (0) | — | — | Empty export; excluded (F-15). |

### 2.1 Fields with no D1 target (deliberate, not silent drops)

| Source fields | Decision |
| --- | --- |
| Locations: street address, city/state/postal, phone/email contacts, website/social, `google-maps-link`, `privacy-policy`, `terms-conditions`, `accessibility`, `location-details` | Public business contact and policy copy. Keep Webflow as source until the publication workflow for these fields is agreed; store as versioned content only when that decision is made (COW-29 §7 A). No PII concern while public. |
| Amenities: `image-name`, `image-path`, `type`, `marketing-*`, `key-benefit-*`, `category` | The export has no icon columns (F-02). Icon paths remain admin-authored under `public/assets/icons/`; the runtime validates paths and never injects `icon-svg` markup. Versioned fields can be carried in `payload_json` if a consumer needs them. |
| Offers: `button-color`, `text-color`, `card-fill`, `accent-color-2`, overlay positions, `default-card`, `rate-font`, `border-options`, geo-fencing flags, cancellation windows | Rate-card artwork/positions are editorial (COW-14) but have no structured D1 columns yet. Keep Webflow as source or add a versioned presentation payload; do **not** infer Mews pricing rules from these fields. |
| Events: recurrence rule details beyond `starts_at` | Preserved in the versioned source row; the structured table stores only what is indexed/filtered. |
| Photo Hotspots: coordinates, amenity reference, order, active | Preserved in the source export but **not imported** until photo identity is resolved by the W2.4 source adapter. |

## 3. Record-count baseline

From `docs/generated/d1-reconciliation.json` (generated 2026-11-19). Counts are parsed row counts, not newline counts (quoted multiline fields make newline counts wrong).

| Collection | Source rows | D1 destination rows |
| --- | ---: | --- |
| Locations | 4 | 4 |
| Buildings | 9 (+1 duplicate skipped) | 9 |
| Room Types | 22 | 22 |
| Amenities | 76 | 76 + 76 `amenity_editorial` |
| Room Type Amenity refs | 253 | 253 |
| Events | 8 | 8 |
| Offers | 8 | 8 |
| Rate merchandising | 5 | 5 |
| Add Ons | 9 | 9 |
| Instagrams | 20 | 20 versioned revisions |
| Outlets | 3 (+1 duplicate skipped) | 3 versioned revisions |
| Content Settings | 1 | 1 versioned revision (draft) |
| Photo Hotspots | 238 | 0 — blocked (F-11) |
| Menu Items | 0 | 0 |
| **Total** | **398** | **136 structured source records + 25 versioned items/revisions + 190 provenance rows** |

Tables intentionally empty at baseline: `media_assets`, `media_versions`, legacy `photo_hotspots`, `audit_log`, recovery/analytics tables and `upgrades`. These are populated by later milestones, not by seeding editorial content.

## 4. Normalized schema review (rationale per table)

All tables below **already exist** in migrations 0001–0011. This section records why each is relational rather than a JSON payload, satisfying the assessment's "rationale for each new table" requirement.

### 4.1 Core editorial entities

| Table | Why normalized |
| --- | --- |
| `locations` | Independently queried property root; tenant/location scoping boundary for every other table. |
| `buildings` | Child entity with its own ordering (`sort_order`) and reverse lookups. |
| `room_types` | Sellable identity with a Mews binding (`mews_room_category_id`) and location scope; the stable join target for gallery, amenities, reviews and merchandising. |
| `amenities` | Canonical amenity identity shared by many room types; reverse amenity → room lookups are indexed. |
| `amenity_editorial` | Additive overlay (COW-73): published, editable copy lives here while identity/icon/sort stay in `amenities`, so the migration is idempotent and reseeding preserves published edits. |
| `room_type_amenities` | Many-to-many with `display_order` and `excluded`; eligibility and ordering cannot be represented faithfully in a room-level JSON blob. |
| `events` | Date/display-filtered and indexed; guest lists need a queryable `starts_at`. |
| `offers`, `rate_merchandising` | Editorial offer status/copy plus a separate ordered merchandising position; Mews rate identity is a reference, not an owned price. |
| `add_ons` | Mews product reference plus editorial copy and quantity rules; price stays in Mews. |
| `content_items`, `content_revisions` | Versioned documents for flexible editorial payloads (instagrams, outlets, policy, site settings). Published-only reads use a single current revision; JSON is validated by contract before parsing. |

### 4.2 Media identity and placement

`media_assets.id` is the permanent master ID. `media_versions.id` is per upload. Triggers block changing either ID or moving a version to another asset. `media_aliases` holds provider-specific identifiers (`webflow_file_id`, `webflow_cdn_url`, `squarespace_asset_id`, …) with unique `(tenant_id, alias_type, alias_value)`; `resolveMediaAlias()` joins on tenant so an alias cannot leak another tenant's asset. `media_asset_metadata`, `media_version_files`, `media_placements`, `media_revisions` and `media_version_fingerprints` hold global metadata, upload facts, placement-level overrides, an immutable audit trail and duplicate-classification facts. Squarespace-shaped columns left in `media_assets`/`media_versions` by 0001 are legacy artifacts, not the identity model.

### 4.3 Hotspots

`photo_hotspot_mappings` is the durable pin: keyed on master media ID + optional placement, with normalized `source_x/source_y` (0–1), `source_version_id`, crop rectangle, `display_order`, `status`, `review_state` and derived/duplicate links. `photo_hotspot_mapping_revisions` snapshots every carry/remap/review/publish/rollback so a prior geometry can be restored. `photo_hotspot_drafts` and `photo_hotspot_deletions` isolate editor changes until an explicit publish. This resolves the old F-12 gap: ordering is preserved in the durable mapping, and the legacy `photo_hotspots` table is not an import target.

### 4.4 Governance and read-path tables

`content_provenance` records one row per imported record with source system, collection, ID, snapshot date and raw-byte hash. Published snapshot tables (COW-32) provide immutable published views; `parity_reports` stores Webflow-vs-D1 comparisons for shadow reads. The D1 migration ledger in `migrations/manifest.json` records applied migration IDs and checksums.

**No ARI table exists or should be added.** Availability, inventory, restrictions and live rates are excluded from this model by design (§5).

## 5. Mews / D1 authority matrix

| Fact | Authoritative source | D1 role | Rule |
| --- | --- | --- | --- |
| Availability, inventory, restrictions | **Mews** (live) | None | Always queried directly from Mews. No D1 availability table, no cached authoritative copy, no independent calculation. |
| Live operational rates, taxes/fees, currency, cancellation/deposit rules | **Mews** (live) | `rate_product_id` / `mews-rate-id` stored only as a reference for merchandising binding | Never author or compute a price in D1. A D1 value is never used to price a stay. |
| Reservation creation, settlement, payments, reservation numbers | **Mews** | None | D1 never authors transactional facts. |
| Guest PII and reservation notes | Mews / trusted booking flow | Separate, governed tables (COW-13) | Encrypt at rest; never in editorial CMS content or share URLs. |
| Room Type identity (`RoomCategoryId`) | **Mews** | `room_types.mews_room_category_id` binding | D1 stores the ID for joining; it does not redefine the category. |
| Mews reference data (rate groups, add-on product IDs, hotel IDs, bed counts) | **Mews** | Optional, selective mirror | Permitted **only** with an explicit sync contract: `source_system='mews'`, source IDs, sync timestamp, reconciliation and an owner. No authority transfer. |
| Room Type enhanced content, amenities, gallery, hotspots, reviews | **D1 / Webflow editorial** | Authoritative (after cutover) | Versioned, published-only; Mews images are reference inputs, not D1 authority. |
| Offers/upgrade merchandising copy and position, events, policy/legal copy, property settings | **D1 / Webflow editorial** | Authoritative | Mews owns any underlying rate/product; D1 owns presentation. |
| Media master identity, aliases, placements, ordering, hotspot geometry | **D1** | Authoritative | Master ID permanent; provider/URL mutable; relationships key on master ID. |
| Provenance, published snapshots, parity reports | D1 | Authoritative (system metadata) | Generated by importer/publish paths; never a source of editorial truth. |
| Recovery / analytics events | Application pipeline (COW-44/45/48) | Read model | Out of scope for W2.1–W2.7 content migration. |

### 5.1 Direct-live ARI rule (explicit)

Every availability, inventory, restriction and live-rate read goes to Mews at request time. The Worker's Mews client remains the only source. D1 may hold identifiers used to bind an editorial record to a Mews entity, but it must never be queried to answer "is this room available?", "what does it cost tonight?", or "what restrictions apply?". No future migration may introduce such a table under an "optimization" rationale; a performance improvement must preserve Mews ownership, source IDs, sync timestamps and reconciliation, and still revalidate live at booking time.

### 5.2 Media identity invariant

Every logical image has one permanent master media ID. Provider, source URL and delivery URL are mutable fields on that master record (plus aliases for reconciliation). Room placements, amenity links, hotspot mappings, ordering and publishing references use the master ID. Re-importing from Webflow updates URL/metadata on the **same** ID; a later Squarespace adapter replaces only the source integration. Image replacement and dimension changes follow the COW-34 geometry review policy. No Cloudinary upload/rehosting requirement exists (COW-35 is canceled).

## 6. Migration, compatibility and rollback plan

- **Forward-only:** new schema work is an additive migration file plus a `migrations/manifest.json` entry with a SHA-256. An applied SQL file cannot be silently edited; `npm run d1:migrate:check` verifies order and checksums.
- **Twice-applied:** the migration runner applies every migration to a fresh in-memory D1 with foreign keys enabled, twice, to prove idempotency. New statements therefore use `CREATE ... IF NOT EXISTS` and extension tables rather than in-place `ALTER TABLE ADD COLUMN`.
- **Rollback scripts live outside the migrations directory** in `scripts/d1-rollback/`; a numbered `_down.sql` inside `migrations/` would be executed as schema creation. Each script is idempotent and tested: it drops only what its migration created, base tables and foundational indexes survive, and `PRAGMA foreign_key_check` stays clean.
- **Foundational rollback:** 0001 has no in-place down script; reverting to pre-D1 state requires a point-in-time restore. Always export the remote database before applying or rolling back.
- **Compatibility:** public reads stay on Webflow by default; COW-39 per-route flags (`CONTENT_SOURCE`, `CONTENT_SOURCE_*`) support `webflow`, `shadow` and `d1` with safe fallback. No flag is switched to `d1` in W2.1–W2.4.
- **Seed compatibility:** the Webflow seed uses upserts and can overwrite direct D1 edits. Until the editorial source-of-truth policy is agreed, D1-native editing stays behind the admin gates and published editorial values are preserved by the amenity editorial overlay pattern.
- **No schema changes in this review.** W2.2 implements only the targeted decisions in §7/§8.

## 7. Open findings and disposition

Resolved by existing work:

| Finding | Disposition |
| --- | --- |
| F-02 (no icon columns) | Accepted: no fabricated filenames; icons admin-authored (COW-73) |
| F-03 (amenity editorial) | Resolved by `amenity_editorial` (0007) |
| F-04 (253 room/amenity refs) | Resolved: 253 relationship rows |
| F-07 (3 nonbookable offers) | Accepted: imported as draft/editorial-only |
| F-10 (190 provenance rows) | Resolved |
| F-12 (hotspot display order) | **Superseded** by `photo_hotspot_mappings.display_order` (0008) |
| F-13/F-14 (duplicate exports) | Resolved: byte-identical duplicates skipped |
| F-15 (empty Menu Items) | Resolved: excluded |
| F-16/F-17/F-18 (versioned collections) | Resolved by design (`content_items`/`content_revisions`) |

Still open — each must be closed by the named milestone:

| Finding | Owner | Required action |
| --- | --- | --- |
| F-01 — `locations.mews_hotel_id` NULL for all 4 | W2.3 / W2.6 + editorial | Confirm explicit per-location Mews hotel ID mapping; never infer it from a filename |
| F-05 — one draft room type; `room_types` has no status column | **W2.2** | Decide and implement publication-state handling so public D1 reads cannot serve the draft (`6abd4a1debcab0ea7e461c9a`) |
| F-06 — 5 recurring events use `recurring-start` | W2.3 + editorial | Confirm `America/New_York` interpretation of stored `Z` timestamps |
| F-08 — 9 add-on Mews product IDs | W2.3 / W3 | Validate against Mews as reference data only (no authority transfer) |
| F-09 / F-19 — settings publication states | W2.3 + editorial | Confirm published `site_settings` vs draft `policy` item split before publishing |
| F-11 — 238 hotspots blocked | **W2.4** | Build the Webflow source adapter to resolve photo identity, then import through the durable mapping model |
| Publication state for `locations` | **W2.2** | Decide how a future draft location would be filtered; current export has none |
| Editorial source-of-truth policy | W2.2 / W2.6 | Agree who may edit D1 directly without being overwritten by reseed |

## 8. W2.2 readiness decision

**Ready to proceed to W2.2** with a deliberately narrow scope:

1. Add publication-state handling for `room_types` and `locations` (F-05 and the location equivalent). Prefer an additive status column with an explicit backfill rule over silent filtering in the read layer.
2. Verify that the typed contracts in `src/types/d1-contracts.ts` cover every D1 table consumed by W1 writes and W3 reads; they already cover media registry and hotspot mapping shapes, so this is an audit, not a rebuild.
3. Add/extend migration fixtures for tenant + location isolation and published/draft rows, including the new status columns.
4. Confirm no D1 ARI surface is introduced (§5.1) and that the media-ID invariant is encoded in contracts (§5.2).
5. Record the editorial source-of-truth decision before enabling D1-native editing.

Explicitly **out of scope** for W2.2: new ARI tables, Cloudinary ingestion (COW-35 is canceled), hotspot data import, public read cutover, and any change to 0001/0002.

## 9. Verification evidence for this review

```bash
npm run d1:migrate:check     # manifest order/checksums, twice-applied migration integrity
npm run test:seed            # seed applies with FKs on; counts, idempotency, reconciliation
node --test tests/d1SchemaContracts.test.ts tests/mediaRegistrySchema.test.ts
npm run typecheck
```

No files under `migrations/`, `worker/`, `src/`, `seed.sql` or configuration were changed by W2.1.
