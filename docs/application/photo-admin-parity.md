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

- `POST /api/admin/rooms/:id/hotspots/plan` and `/apply` expose COW-34 `planReplacement`/`applyReplacement`. Plan is read-only and recomputed server side; callers never submit mapping rows. Both actions require admin scope, a placement bound to the requested room and media asset, and versions belonging to that same canonical asset. URL-only replacement is a strict no-op. Publication preflights base-row and draft pending-review state before any write, so a blocked publish cannot partially apply a staged deletion. Normalized admin crop rectangles are converted to source pixels before COW-34 remapping. URL-only, exact reupload, crop remap, crop review, replacement review and duplicate decisions are classified by the existing COW-34 policy. Proposed changes to published pins are staged in `photo_hotspot_drafts`; the guest row changes only on publish. Ambiguous geometry (including a pin excluded by a new crop) is written with `pending` review and cannot publish until an editor approves.
- Pin deletion (`DELETE .../hotspots/:mappingId`) is staged in `photo_hotspot_deletions` (`0011`) with a COW-34 revision snapshot. The published guest row is untouched until publish; publish soft-deletes it (`status='draft'`, `review_reason='deleted'`) so the audit chain stays intact and guest reads cannot see it. Rollback cancels pending removals on the placement.
- The `#/hotspots` panel adds a reviewed replacement planning section (from/to version, URL-only flag, explicit review approval), decision/review feedback, and a two-step delete action with pending-deletion and unpublished-edit indicators.
- `tests/hotspotAdmin.test.ts` (13 tests) and `tests/hotspotsPanel.test.ts` (10 tests) cover server-side planning scoping, read-only plan behavior, foreign-version rejection, review-gated apply/publish, crop classification, staged deletion, rollback cancellation and the matching UI contract.

**Still open:** guest Photo Journey cutover to published D1 hotspots and deployed admin/guest browser verification are Phase 4 (COW-82), not part of this phase.

## Remaining slices (not in this PR)

- Write actions (gallery reorder, link/unlink, alt text, replace, per-photo exclusion) in `worker/room-media.ts` and the panel, reusing `media_revisions` and editor draft/publish contracts.
- Hotspot placement, multi-tag, review and re-crop safeguards, gated on the COW-34 `photo_hotspots` schema and identity policy and the COW-35 Cloudinary ingestion contract.
- Guest Photo Journey cutover only after published D1 state passes parity, auth/RBAC and rollback checks.

## Cutover gates

No production flag is changed in this issue. Guest Photo Journey reads stay on their current source until published D1 state passes parity, auth/RBAC, and rollback checks. No Mews booking, pricing or availability code is touched.
