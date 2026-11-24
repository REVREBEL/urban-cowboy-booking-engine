# COW-72 photo admin parity

Source: [REVREBEL/cowboy-dashboard](https://github.com/REVREBEL/cowboy-dashboard), commit `2d97d062ec4fda3d0309d51afdafa40e266e085b`. Target: the authenticated React dashboard in `src/dashboard`.

This is a migration of existing capabilities. The source Astro/Webflow runtime is not imported into the booking engine and no Webflow CMS token is used by the migrated module.

## Source inventory and mapping

| Source component / endpoint | Existing capability | React admin target | Status |
|---|---|---|---|
| `src/components/RoomPhotoPicker.tsx` | Pick a room type, browse its gallery, return `url`, `fileId`, `roomTypeId` | `src/dashboard/RoomPhotosPanel.tsx` with room selector and gallery cards | Implemented; read-only first slice |
| `src/components/MultiImageField.tsx` | Gallery thumbnails, reorder, alt text, replace, remove, hotspot badges | Shared gallery grid in the React panel; reorder and alt/replace in the write slice | Planned |
| `src/components/HotspotPicker.tsx` | Click/drag pin coordinates as x/y percentages | React hotspot editor with keyboard/number inputs | Planned; hotspot slice |
| `src/components/MultiHotspotTagger.tsx` | Multiple pins on one photo with room-scoped amenity selects | React multi-hotspot editor using D1 room/amenity eligibility | Planned; hotspot slice |
| `src/components/HotspotReview.tsx` | Read-only pin overlay and amenity list | React hotspot review mode | Planned; hotspot slice |
| `src/components/AltTextManager.tsx` | Edit alt text per image | Inline alt-text editor in the React gallery panel | Planned; write slice |
| `src/components/ItemEditor.tsx` | CMS item CRUD plus photo/hotspot special cases | React panel backed by editor draft/publish contracts (`worker/content-editor.ts`) | Planned; write slice |
| `src/pages/api/cms/[collectionId]/bulk.ts` | Bulk create and publish hotspot items | D1 transactional write in `worker/room-media.ts`, no CMS SDK | Replaced by D1 |
| `src/pages/api/cms/rekey-photo` | Re-point hotspots when a file is replaced | Immutable media ID plus new version in COW-33 registry | Replaced by registry |
| `src/lib/photo-hotspots.ts` | Fetch hotspots; legacy asset-id matching | D1 `photo_hotspots` keyed by `media_asset_id` + version | Replaced by D1 |
| `src/lib/room-type-photos.ts` | Room/photo/amenity scoping helpers | D1 tenant/location scoped queries and explicit room-amenity eligibility | Replaced by D1 |

Source documentation reviewed: `HOTSPOT_ARCHITECTURE_REF.md`, `PHOTO_HOTSPOTS_ROOM_AMENITIES.md`, `IMAGE_UPLOAD_GUIDE.md`, `multi-hotspot-progress.md`.

## Deliberate exclusions

- The Webflow CMS upload endpoint and `WEBFLOW_CMS_API_TOKEN` are not migrated. Uploads and delivery use the COW-35 Cloudinary contract.
- The Astro `portal/photo-hotspots/review.astro` page is replaced by a mode inside the React panel.
- `ItemEditor.tsx`'s generic CMS form is out of scope. Only its photo and hotspot behavior is mapped.
- Legacy 24-hex asset-id matching is not migrated. COW-33 aliases and immutable media IDs are the only identity source.

## Current gaps

- The legacy `photo_hotspots` table in `0001_init.sql` still has no `tenant_id`, `display_order`, `active`, `source_url` or `last_seen` columns. COW-34 supplied durable hotspot mappings and the re-crop policy in migration `0008`; hotspot UI writes are the next slice.
- `media_placements` in `0005_media_registry.sql` already carries tenant, media asset, target, placement type and display order, so gallery ordering can be migrated first.
- COW-35 Cloudinary ingestion is not complete. This first slice reads registry metadata and does not upload files.

## Verified first slice (read-only gallery)

This slice lands the read path only, so production image sourcing and Mews behavior are unchanged.

- `worker/room-media.ts` exposes `GET /api/admin/rooms` and `GET /api/admin/rooms/:id/photos`. Both use the repo's scoped authorization contract (`authorizeScopedRequest`, injectable for tests): a `viewer` role is required, a missing/blank `TENANT_ID` fails closed with 503, and a caller-supplied `?tenant=` that disagrees with the binding is rejected with 403. No fallback tenant is substituted.
- The gallery query is compatible with the COW-67 importer: it reads `placement_type IN ('room_gallery', 'gallery')`, returns only `kind = 'image'` assets, prefers per-room `alt_text_override`/`caption_override`/`description_override` over asset-level text, and reports dimensions from the current `media_versions` row so replacements do not show stale sizes.
- `src/types/d1-contracts.ts` adds `roomGalleryRowSchema`, which parses the placed media row into the camelCase domain shape and validates the JSON `tags` field.
- `src/dashboard/RoomPhotosPanel.tsx` is the new panel at `#/rooms`. It reads rooms and gallery via `src/dashboard/api.ts` and reuses `useDashboardResource` plus `LoadingPanel`/`ErrorPanel`/`EmptyPanel`. It shows registry order, media ID, version, Cloudinary public ID and caption; it does not render a delivery URL until COW-35. The gallery child is keyed by room ID and the list renders only on a successful current request, so a previous room's photos never leak into a new selection or an error state.
- `src/dashboard/api.ts` gives every dashboard fetch a bounded `AbortSignal` deadline, so a stalled request rejects into the existing error/retry state instead of loading forever. The Worker's admin route also returns 400 for a malformed room ID rather than throwing on `decodeURIComponent`.
- `tests/roomMediaAdmin.test.ts` (12 tests) runs the real handlers against in-memory SQLite with the real migrations: tenant isolation, fail-closed tenant config, cross-tenant room rejection, importer `room_gallery` visibility, override precedence and current-version dimensions, `display_order` ordering, non-gallery and non-image exclusion, real-JWT default-authorizer denial and `?tenant=` rejection, missing D1, malformed-tag rejection and route wiring.
- `tests/roomPhotosPanel.test.ts` and `tests/dashboardApiClient.test.ts` assert the panel states and stale-data guards, the admin endpoint paths, room-ID encoding, request deadlines and the absence of client-supplied tenant scope.

Admin URL for this slice: `/dashboard.html#/rooms` (static dashboard served by the Worker).

## COW-84 gallery editing slice

- Migration `0009_media_placement_flags.sql` adds tenant-scoped per-photo exclusion without an
  `ALTER TABLE`, so the twice-applied migration check stays valid. Absence of a flag row means
  "not excluded".
- `worker/d1.ts` owns the gallery query once (`listRoomGallery`). It returns the canonical
  Squarespace source URL and asset id from the COW-33 registry, applies placement/asset metadata
  precedence, reads the exclusion flag, and skips malformed rows rather than hiding the gallery.
- `GET /api/admin/media` returns the tenant image catalog for linking; the gallery endpoint now
  also returns the working `room_gallery` draft, revision ids and hasUnpublishedDraft so the panel
  can show unsaved state without leaking it to guests.
- `worker/gallery-publication.ts` writes a published gallery document through to canonical
  `media_placements` and flags. Ordering is two-phase (temporary park, then 1..N) so reorders never
  hit the `(room, display_order)` UNIQUE constraint. Images parked by COW-67 above `PARK_OFFSET`
  are left untouched, and unlinking removes only editor-selected active placements.
- `src/dashboard/RoomPhotosPanel.tsx` now renders source-URL previews with an image error fallback,
  accessible reorder/exclude/unlink/link controls, inline alt text/caption/description editing,
  and save/publish/rollback feedback. All controls use the shared `Button`/`Pill` contract.
- A published `roomGallery` snapshot feeds guest reads; excluded and parked photos are filtered
  there. No guest source flag is flipped by this slice.
- `tests/roomGalleryEditing.test.ts` covers reorder, metadata, exclusion, unlink, parked-row
  preservation, validation, draft/publish snapshot separation and tenant-scoped media reads.

## COW-84 hotspot slice

This slice adds the admin surface for COW-34 durable pins on top of the published gallery.

- `worker/hotspot-admin.ts` exposes `GET/POST /api/admin/rooms/:id/hotspots` (list/create), `PATCH .../hotspots/:mappingId`, and `POST .../hotspots/publish` and `.../hotspots/rollback`. Reads require `viewer`, mutations require `admin`, tenant scope comes from the verified principal, and a missing scope fails closed. Create validates the full room → placement → image asset → version relationship, so mismatched and cross-tenant ids are rejected. Amenity assignment is checked against `room_type_amenities` with tenant ownership proven by the room and amenity rows; coordinates are normalized `0..1` source-space values. Every create/update writes a `photo_hotspot_mapping_revisions` snapshot with the actor.
- Edits to an already published pin are stored as a tenant-scoped draft snapshot (`0010_photo_hotspot_drafts.sql`) and merged into the admin read; the published guest row is untouched until publish. Publish rejects pending review, applies the draft geometry, then delegates to COW-34 `publishMappings`. Publish and rollback require a placement belonging to the requested room and asset, and are scoped to that placement even when the same media is placed in several rooms. Rollback delegates to `rollbackMappings` and restores the newest resulting geometry snapshot deterministically.
- `src/dashboard/RoomHotspotsPanel.tsx` is the new `#/hotspots` dashboard route. It offers room/photo selection with stale-selection resets, click-to-place pins mapped through `containedRect`/`pointToSource` against the rendered image bounds (correct for portrait and non-16:9 photos), keyboard-editable X/Y inputs, room-eligible amenity selection, review approve/flag controls, and explicit publish/rollback feedback. The canvas is a focusable `role="button"` with arrow-key crosshair movement, Enter/Space placement and explicit new-pin X/Y inputs, so placement works without a pointer. No guest source or Mews behavior is changed.
- `tests/hotspotAdmin.test.ts` (8 tests), `tests/hotspotsPanel.test.ts` (7 tests) and `tests/hotspotCanvas.test.ts` (4 tests) cover tenant scoping, role denial, relationship validation, draft isolation for published pins, placement-scoped publish/rollback, revision snapshots, letterbox geometry for portrait/wide images and the panel contract.

## COW-81 Phase 3 — replacement and deletion lifecycle

- `POST /api/admin/rooms/:id/hotspots/plan` and `/apply` expose COW-34 `planReplacement`/`applyReplacement`. Plan is read-only and recomputed server side; callers never submit mapping rows. Both actions require admin scope, a placement bound to the requested room and media asset, and versions belonging to that same canonical asset. Fingerprint, dimension, EXIF and duplicate facts are derived exclusively from tenant-scoped `media_version_fingerprints` rows; callers cannot supply them, so forged hashes cannot downgrade a review-gated replacement to auto-publish. A stale or mixed source version is rejected before planning. URL-only replacement is a strict no-op. Publication is atomic: a single D1 batch carries a no-pending-review guard on every write (plus a sentinel), so a pending pin introduced concurrently before the batch blocks the whole publish and no deletion or draft is applied. Normalized admin crop rectangles are converted to pixels using each version's own authoritative dimensions: `cropBefore` with the source version, `cropAfter` with the target (so differing dimensions scale each crop correctly). URL-only, exact reupload, crop remap, crop review, replacement review and duplicate decisions are classified by the existing COW-34 policy. Proposed changes to published pins are staged in `photo_hotspot_drafts`; the guest row changes only on publish. Ambiguous geometry (including a pin excluded by a new crop) is written with `pending` review and cannot publish until an editor approves.
- Pin deletion (`DELETE .../hotspots/:mappingId`) is staged in `photo_hotspot_deletions` (`0011`) with a COW-34 revision snapshot. The published guest row is untouched until publish; publish soft-deletes it (`status='draft'`, `review_reason='deleted'`) so the audit chain stays intact and guest reads cannot see it. Rollback cancels pending removals on the placement.
- The `#/hotspots` panel adds a reviewed replacement planning section (from/to version, URL-only flag, explicit review approval), decision/review feedback, and a two-step delete action with pending-deletion and unpublished-edit indicators.
- `tests/hotspotAdmin.test.ts` (13 tests) and `tests/hotspotsPanel.test.ts` (10 tests) cover server-side planning scoping, read-only plan behavior, foreign-version rejection, review-gated apply/publish, crop classification, staged deletion, rollback cancellation and the matching UI contract.

## Phase 4 — guest cutover verification (COW-82)

### Published-only D1 guest hotspot read path

- `worker/published-hotspots.ts` loads hotspots from `photo_hotspot_mappings` only when `status='published'`, `review_state='approved'` and `review_reason != 'deleted'`. It joins the tenant-scoped placement and `media_assets` rows, derives canonical photo keys with `cmsPhotoKeys` (stable across resize variants), and groups pins **by room** so a photo placed in two rooms never mixes their pins. Stored source coordinates are remapped through the published crop rectangle and EXIF orientation before conversion to the guest's `0..100` display percentages, so cropped/rotated photos show pins in the right place.
- `worker/webflow/room-type-reviews.ts` applies the overlay on **every** response (not inside the Webflow cache), so a publish is visible immediately and a draft/pending edit never reaches a guest through cached content. The response carries a room-scoped `hotspotsByRoom` map; the flat `hotspots` map is intentionally left empty on the D1 path so a legacy client cannot render a cross-room merge. `PHOTO_HOTSPOT_SOURCE` defaults to `webflow`; only the explicit `d1` value enables the D1 path, and a D1 read failure falls back to the Webflow hotspot map. No guest request fetches the Squarespace image feed live. The journey selects `hotspotsByRoom[room.id]` in `RoomPhotoTour`, falling back to the flat Webflow map only when no room-scoped map is present.
- `PHOTO_HOTSPOT_SOURCE` is declared in `worker/mews/_lib.ts`, `wrangler.toml` and `.dev.vars.example`; an unset value is omitted by the deploy renderer and fails safe to Webflow.

### Verification evidence (local, reproducible)

**Recorded 2026-11-24** on `main` @ `69cf9e37` in a clean npm workspace (`npm ci`). Run from the
repo root:

| Check | Command | Result |
| --- | --- | --- |
| Full application suite (browser-only tests excluded; Playwright chromium not installed locally) | `find tests -maxdepth 1 -name '*.test.ts' ! -name 'dateDropdownAccessibility*' ! -name 'promoDropdownAccessibility*' -print0 \| xargs -0 node --test` | **596/596 pass** |
| Photo-admin targeted suite (published hotspots, hotspot admin/panel/geometry/replacement, gallery import, published gallery guest reads, Mews pricing) | `node --test tests/publishedHotspots.test.ts tests/hotspotAdmin.test.ts tests/hotspotsPanel.test.ts tests/hotspotGeometry.test.ts tests/hotspotMapping.test.ts tests/hotspotCanvas.test.ts tests/roomGallery.test.ts tests/roomGalleryEditing.test.ts tests/snapshotsParity.test.ts tests/mewsPricing.test.ts tests/catskillsMewsIds.test.ts` | **128/128 pass** |
| Published-only guest hotspots | `node --test tests/publishedHotspots.test.ts` | pass (included in targeted suite) |
| Hotspot admin lifecycle | `node --test tests/hotspotAdmin.test.ts` | pass (included in targeted suite) |
| Hotspot dashboard panel | `node --test tests/hotspotsPanel.test.ts` | pass (included in targeted suite) |
| Hotspot geometry/replacement | `node --test tests/hotspotGeometry.test.ts tests/hotspotMapping.test.ts tests/hotspotCanvas.test.ts` | pass (included in targeted suite) |
| Room gallery import (failure never deletes) | `node --test tests/roomGallery.test.ts` | pass; missing gallery reports removals but writes nothing |
| Published gallery guest reads | `node --test tests/roomGalleryEditing.test.ts snapshotsParity.test.ts` | pass |
| Mews pricing/availability unchanged | `node --test tests/mewsPricing.test.ts tests/catskillsMewsIds.test.ts` | pass |
| Typecheck / control contract | `npm run typecheck` / `npm run lint:controls` | pass |
| D1 migration integrity | `npm run d1:migrate:check` | **12 migrations** applied twice, FK/integrity pass |

Verified properties from the checks above: draft, pending-review and soft-deleted mappings never appear in the guest hotspot map; a D1 outage preserves the Webflow payload; a failed/empty image-feed import never deletes previously published gallery media; URL resize variants and source replacement keep a stable canonical photo identity; and Mews transactional tests remain green.

### Live deployed verification (2026-11-24)

Booking Worker: `https://urban-cowboy-booking-engine.revrebel.workers.dev` (workers.dev; no
custom domain/route found in the account).

| Check | Result |
| --- | --- |
| Guest landing, desktop browser | HTTP 200, title "Urban Cowboy — Book your stay", arrival form and navigation render; no console errors reported by the browser snapshot. |
| Guest landing with `?photoSource=mews` | HTTP 200, same arrival render. This query selects Mews imagery; it does **not** enable the D1 content path. |
| `/api/content/site-settings` | 200 with `x-content-source: webflow` — flags remain at Webflow defaults. |
| `/dashboard.html#/rooms` | Redirects to `/dashboard#/rooms` and serves the **legacy** Supabase dashboard ("Dashboard à configurer — Ajoute ta clé anon public Supabase…"). The React photo/hotspot admin is not reachable at this deployed URL. |
| Production D1 | 156 `room_gallery` placements; published `roomGallery`, `roomAmenities` and `roomTypes` snapshots present; **0** `photo_hotspot_mappings` rows. There is no production hotspot data for a D1 guest-hotspot check. |
| Local suite (separate verification run) | `npm test` 610/610 pass; targeted gallery/hotspot tests 83/83 pass, including published-only hotspot reads, draft isolation, review gates, publish/rollback, import-failure preservation and Mews tests. The 596/596 non-browser run recorded above used a different exclusion set. |

### Deployed admin and API trust boundary (2026-11-24, reconciled)

A separate Admin Portal Worker, `urban-cowboy-admin`, was deployed under COW-112 at
`https://urban-cowboy-admin.revrebel.workers.dev`; the earlier record noted that it failed closed to
`/login` because Access and `API_BASE_URL` were not configured. It is now configured with the Access
team/AUD, admin allowlist, tenant and booking API origin bindings, and unauthenticated requests
redirect to `https://revrebel.cloudflareaccess.com/...`.

The approved design is the **same-origin server-side admin API proxy** (`admin-app/app/api/[...path]/route.ts`
and `admin-app/lib/api-proxy.ts`): the browser calls the admin origin only, the proxy verifies the
admin session and same-origin mutation rule, and forwards the verified Access assertion to the
booking Worker. The booking Worker uses the same Access team domain, AUD and allowlist, so the
assertion is verified by the shared `worker/access.ts` verifier. The temporary separate Access
application on the booking Worker's `/api/admin/*` was deleted so it cannot intercept the
server-side fetch with a different AUD; this shared-AUD configuration is the deliberately
configured Worker-to-Worker trust boundary. It is not a public/bypassed API: the booking Worker
still verifies the end-user's signed assertion, role and tenant on every request (`worker/auth.ts`),
and browser cookies, bearer headers and client-supplied assertions are never forwarded by the proxy. The temporary browser CORS path and
the extra Access app on the booking Worker's `/api/admin/*` were removed; no credentialed
cross-origin browser access remains. Authorized/denied behavior is covered by
`tests/adminApiProxy.test.ts` and `tests/adminProxyAccessIntegration.test.ts` (signed admin reads and
mutations, viewer reads without mutation rights, expired/wrong-audience/wrong-issuer forgeries and
upstream failures).

19 `room_gallery` documents were created from the reviewed 156 media placements and snapshots were
refreshed, but this PR does **not** leave a production content flag flipped: the reviewed deployment
guard requires baseline `webflow` flags before the Gate 2 cutover runbook is followed. An earlier
API-level check with `CONTENT_SOURCE_ROOM_GALLERIES=d1` confirmed the D1 gallery response shape (20
rooms of importer URLs); production is back on the Webflow baseline. `PHOTO_HOTSPOT_SOURCE` remains
`webflow` and production has zero hotspot mappings.

### Acceptance status after live verification

| Acceptance item | Status | Evidence needed / noted gap |
| --- | --- | --- |
| Admin gallery and hotspot routes verified in the deployed environment | Pending | Admin Worker is deployed behind Access and the same-origin proxy is tested locally; the legacy Supabase dashboard is still served at booking Worker `/dashboard.html#/rooms`. Needs an authenticated browser run of the React admin's `#/rooms` and `#/hotspots`. |
| Published D1 gallery and hotspot data verified in guest Photo Journey | Partial | D1 gallery API reads were confirmed at API level under a temporary flag; production flags are Webflow-baseline, zero hotspot mappings, and no deployed guest Photo Journey E2E exists. |
| Draft isolation, review gates, publish and rollback verified end-to-end | Local only | Deployed browser run showing a draft/pending pin invisible to guests, then publish → visible, rollback → prior state. |
| Import/sync failure preserves existing published media | Local only | Deployed import failure trace plus before/after published gallery counts. |
| Desktop and mobile browser checks; no material console/network errors | Partial | Desktop guest arrival checked; mobile widths and the authenticated admin still need screenshots and console/network logs. |
| Mews booking behavior unchanged | Local only | Deployed rate/availability/checkout smoke result; Mews code and flags untouched. |
| Photo-admin parity documentation contains reproducible evidence | This section | Deployed URLs, dates and proxy/CMS checks recorded; browser screenshots still to be appended. |

The deployed guest arrival page renders and the D1 gallery API path was confirmed at API level, but
there is no authenticated admin publish/rollback E2E, desktop/mobile hotspot verification, or
published-D1 hotspot data. Follow the W3 cutover runbook for any flag change. COW-82 and COW-84 must
not be closed on the strength of local tests or API-level checks alone.
