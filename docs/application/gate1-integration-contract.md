# Gate 1 integration contract — v1.0 (W3 proposal, pending W1/W2 acceptance)

This is the shared integration contract proposed by **W3 (booking runtime)** for
Sync Gate 1 (COW-107 / COW-93 / COW-100). It consolidates the contracts W3 must
agree with W1 (admin app) and W2 (D1 schema/data/media). **Version `gate1-v1.0`
is proposed, not yet agreed**: W1 and W2 must record acceptance on their own gate
issues. Until all three accept, every content source flag stays at its Webflow
default and COW-108 (W3.6) must not start.

## 1. Owners and scope

| Workstream | Gate issue | Owner of | Acceptance still required from |
| --- | --- | --- | --- |
| W1 — admin app | COW-93 | Admin route/auth/RBAC and content-write boundaries | W2 (D1 write contracts), W3 (guest consumers) |
| W2 — D1 platform | COW-100 | Schema, versioned content, media master identity, provenance, reference sync | W1 (admin forms/editor), W3 (guest reads, Mews boundary) |
| W3 — booking runtime | COW-107 | Guest response contracts, published reads, Mews ARI boundary | W1, W2 |

All three gate issues must reference this same document and version. A change to
any section requires a new version and re-acceptance by all three.

## 2. Authority matrix (invariant)

- **D1 owns** published editorial content, room presentation, amenities, media
  master identity and placements, galleries/hotspots, property settings and
  merchandising configuration.
- **Mews is the only live ARI and transactional authority**: availability,
  inventory, restrictions, live rates, quotes, reservation creation, payment
  status. No D1 table, snapshot, cache or admin setting may become an ARI source.
- Stable Mews reference IDs may be mirrored in D1 only under the W2 allowlist
  (`mewsReferenceTypeSchema`: hotel, rate_group, product, room_category,
  age_category) with `source_system='mews'`, `synced_at` and `reconciled_at`.
- Proof and full matrix: [`mews-authority-matrix.md`](./mews-authority-matrix.md).

## 3. Guest read contracts (W3 ↔ W2)

Envelopes must remain identical to the current frontend consumers; no
presentation refactor is part of Gate 1.

| Route | Envelope | Flag (default) | Published source |
| --- | --- | --- | --- |
| `/api/content/policy-language` | `{ language }` | `CONTENT_SOURCE_POLICY_LANGUAGE` (webflow) | single published `policy` revision, all 10 fields non-empty |
| `/api/content/site-settings` | `{ settings, source, itemId? }` | `CONTENT_SOURCE_SITE_SETTINGS` (webflow) | single published `site_settings` revision; client accepts only `source === "d1"` |
| `/api/content/add-ons` | `{ addOns }` | `CONTENT_SOURCE_ADD_ONS` (webflow) | published `add_on` revisions plus a published `add_on_sync/complete` marker with matching `expectedCount` |
| `/api/content/room-type-reviews` (galleries overlay) | `{ …, galleries }` | `CONTENT_SOURCE_ROOM_GALLERIES` (webflow) | immutable `roomGallery` snapshot; per-room merge gated on published `room_gallery` documents |
| `/api/content/room-type-reviews` (hotspots overlay) | `{ …, hotspotsByRoom }` | `PHOTO_HOTSPOT_SOURCE` (webflow) | published, approved, non-deleted hotspot mappings |
| `/api/content/events/occurrences` | `{ source, occurrences, duringStay, note }` | unconditional D1 | displayed events, schedule only |

The flag and fallback paragraph below describes **current behavior of the
full-route adapters only**. It is not a uniform requirement for every row in the
table; overlays and unconditional D1 reads have different semantics:

- **Full-route adapters** (policy language, site settings, add-ons): `webflow`
  calls the legacy handler unchanged; `shadow` keeps the Webflow response and
  writes a parity summary only when it changes; `d1` serves published data and,
  on any incomplete/missing/ambiguous/failed read, returns the Webflow response
  with `X-Content-Source: webflow-fallback` and `Cache-Control: no-store`.
- **Overlays** (room galleries, hotspots): a two-state flag with `webflow`
  (default) and `d1` only — no `shadow` mode and no separate fallback response.
  They are applied inside the existing Webflow room-content response. When the
  flag is off, or published data is missing/empty/unreadable, the original
  Webflow `galleries` / `hotspots` are preserved unchanged (no `webflow-fallback`
  header). In `d1` mode galleries are merged per migrated room; hotspots are
  replaced by published `hotspotsByRoom`.
- **Unconditional D1** (events occurrences): no source flag; the response is a
  D1 schedule only and asserts no availability or price.

All published reads are tenant and location scoped. More than one matching
published row is ambiguous and fails closed to Webflow (or preserves the
Webflow overlay payload).
- Full route/consumer/source map:
  [`booking-runtime-webflow-dependency-inventory.md`](./booking-runtime-webflow-dependency-inventory.md).

## 4. Publication semantics (W1 ↔ W2 ↔ W3)

- Guests read **published** snapshots/revisions only. Draft, pending-review and
  archived data must never reach a guest response.
- Publish and rollback of an editor item refresh the relevant published
  snapshots in the same transaction path (`content-editor.ts`,
  `gallery-publication.ts`, `amenity-publication.ts`). Draft saves do not.
- Snapshots are content-addressed (SHA-256 of canonical JSON), pinned by ETag,
  rollback-capable and immutable at a given version
  (`published-snapshots.ts`, `d1-snapshots-parity.md`).
- Per-collection migration gates are explicit: a cutover marker with an expected
  count (add-ons), or a per-room published document (galleries). A partially
  migrated collection must not silently hide content.
- Admin reads and writes are Access-JWT/RBAC gated and tenant scoped
  (`worker/auth.ts`, COW-91); guest routes never rely on admin-setting writes for
  ARI decisions.

## 5. Media identity (W2 ↔ W3)

- `media_assets.id` / `media_versions.id` are stable, never reused; Webflow file
  IDs, CDN URLs, Squarespace and Mews asset IDs are aliases
  (`d1-schema-contracts.md`).
- The delivery URL is a **mutable field on the current media version**. A
  URL-only change or provider switch preserves `media_asset_id`, room
  placements, amenity links, hotspot IDs and normalized geometry.
- Galleries resolve from the published `roomGallery` snapshot keyed by stable
  Mews room category ID. Excluded and parked placements stay out of the guest
  view. Hotspot geometry is stored in source space with crop/EXIF remapping.
- No guest request fetches a Webflow or Squarespace feed live once the
  corresponding D1 flag is enabled and the collection has passed parity.

## 6. Acceptance checklist

| # | Criterion | Owner | Status |
| --- | --- | --- | --- |
| A1 | Runtime dependency map and frontend response contracts complete | W3 | **Met** — COW-103 audit |
| A2 | Contract tests/fixtures prove existing frontend consumption | W3 | **Met** — adapter/gallery/settings tests, 64 targeted tests passing |
| A3 | ARI paths identified and protected by tests | W3 | **Met** — COW-105 authority matrix + 5 tests |
| A4 | D1 guest-read, publication and media contracts documented | W2 + W3 | W3 documented; **W2 acceptance pending** (COW-100) |
| A5 | Admin auth/content-write boundaries documented | W1 + W2 | W1 auth merged (COW-91); **W1 acceptance pending** (COW-93) |
| A6 | W1 records acceptance of `gate1-v1.0` | W1 | **Pending** |
| A7 | W2 records acceptance of `gate1-v1.0` | W2 | **Pending** |
| A8 | W3 records acceptance of `gate1-v1.0` | W3 | **Pending** until A6/A7 land; W3 readiness assessed on COW-107 |
| A9 | All three gate issues link this same document and version | All | **Pending** |

## 7. Open decisions (must close before cutover)

1. **Production flag flip timing** — COW-108 only, after all three Gate 1 issues
   accept. No flag defaults change in Gate 1.
2. **Per-room parity thresholds** — number of photos / field completeness a room
   must match before its gallery document is published. W2/W3 to confirm.
3. **Calendar cache** — the Mews-derived calendar snapshot stays in KV/Cache and
   advisory; never in D1 and never a booking gate.
4. **Reference sync** — W2's ID-only mirror is approved in shape; no ARI
   reference types may be added to the enum without a new contract version.

## 8. Evidence index

- COW-103 audit, COW-105 authority matrix, `cms-read-migration.md`,
  `d1-snapshots-parity.md`, `d1-schema-contracts.md`, `property-settings-audit.md`.
- Tests: `tests/addOnAdapter.test.ts`, `tests/mewsAriAuthority.test.ts`,
  `tests/publishedGalleriesGuest.test.ts`, `tests/productionLayout.test.ts`,
  `tests/contentMigrationPolicy.test.ts`, `tests/propertySettings.test.ts`,
  `tests/snapshotsParity.test.ts`.
