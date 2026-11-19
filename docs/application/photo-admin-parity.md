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

- `photo_hotspots` in `0001_init.sql` has no `tenant_id`, `display_order`, `active`, `source_url` or `last_seen` columns. COW-34 hotspot identity and re-crop policy must land before hotspot writes.
- `media_placements` in `0005_media_registry.sql` already carries tenant, media asset, target, placement type and display order, so gallery ordering can be migrated first.
- COW-35 Cloudinary ingestion is not complete. This first slice reads registry metadata and does not upload files.

## Verified first slice (read-only gallery)

This slice lands the read path only, so production image sourcing and Mews behavior are unchanged.

- `worker/room-media.ts` exposes `GET /api/admin/rooms` and `GET /api/admin/rooms/:id/photos`. Both require a `viewer` role through the injectable `RoomMediaAuthorize` gate (default `requireRole`). Tenant scope comes only from `TENANT_ID` on the Worker binding; a caller-supplied `?tenant=` is ignored by the query.
- `src/types/d1-contracts.ts` adds `roomGalleryRowSchema`, which parses the placed media row into the camelCase domain shape and validates the JSON `tags` field.
- `src/dashboard/RoomPhotosPanel.tsx` is the new panel at `#/rooms`. It reads rooms and gallery via `src/dashboard/api.ts` and reuses `useDashboardResource` plus `LoadingPanel`/`ErrorPanel`/`EmptyPanel`. It shows registry order, media ID, version, Cloudinary public ID and caption; it does not render a delivery URL until COW-35.
- `tests/roomMediaAdmin.test.ts` (8 tests) runs the real handlers against in-memory SQLite with the real migrations: tenant isolation, cross-tenant room rejection, `display_order` ordering, non-gallery exclusion, camelCase/tags parsing, auth denial, missing D1, and malformed-tag rejection.
- `tests/roomPhotosPanel.test.ts` and `tests/dashboardApiClient.test.ts` assert the panel states, the admin endpoint paths, room-ID encoding and the absence of client-supplied tenant scope.

Admin URL for this slice: `/dashboard.html#/rooms` (static dashboard served by the Worker).

## Remaining slices (not in this PR)

- Write actions (gallery reorder, link/unlink, alt text, replace, per-photo exclusion) in `worker/room-media.ts` and the panel, reusing `media_revisions` and editor draft/publish contracts.
- Hotspot placement, multi-tag, review and re-crop safeguards, gated on the COW-34 `photo_hotspots` schema and identity policy and the COW-35 Cloudinary ingestion contract.
- Guest Photo Journey cutover only after published D1 state passes parity, auth/RBAC and rollback checks.

## Cutover gates

No production flag is changed in this issue. Guest Photo Journey reads stay on their current source until published D1 state passes parity, auth/RBAC, and rollback checks. No Mews booking, pricing or availability code is touched.
