# Room amenity administration — parity inventory (COW-73)

This documents the **existing** Webflow-dashboard amenity tooling and maps it to the
authenticated React admin and canonical D1 records. It is the parity checklist for
[COW-73](https://linear.app/revrebel/issue/COW-73). "Amenity Studio" is shorthand for
these established controls; this work does not create a separate product.

Sources inspected (all paths verified 2026-11-19):

- Tooling source: `cowboy-dashboard` (local clone `/Users/garystringham/github-revrebel/cowboy-dashboard`, GitHub `REVREBEL/cowboy-dashboard`).
- Target: this repository (`REVREBEL/urban-cowboy-booking-engine`).

## 1. Source controls and behavior

| Source control / field | Source path | Behavior |
| --- | --- | --- |
| `AmenitySortingGrid` | `cowboy-dashboard/src/components/AmenitySortingGrid.tsx` | Visual reorder of the amenities selected on a Room Type. Merges saved order with newly selected ids, drops unselected ids, writes the result to the Room Type `amenity-display-order` PlainText field (comma-separated amenity ids). Left/right move buttons with `aria-label` "Move {name} earlier/later"; disabled at the ends. Renders the Amenity icon image when available, otherwise a Sparkles + name tile. |
| `RestrictedAmenitiesPicker` | `cowboy-dashboard/src/components/RestrictedAmenitiesPicker.tsx` | Per-room toggle flagging a selected amenity as "restricted": hidden from the general amenities list on the live site **unless** the same amenity is tagged on one of the room's photos by a Photo Hotspot. Writes `restricted-amenity-ids` (comma-separated ids), always a subset of `features-amenities`. Uses `aria-pressed`, lock/unlock badges, and a Tooltip explanation. |
| `features-amenities` field | Room Types CMS collection `6abc815b36cbcba74b8b01c4` | Multi-reference from Room Type → Amenities. Defines room membership; ordering cannot add an amenity that is not referenced. |
| Item editor wiring | `cowboy-dashboard/src/components/ItemEditor.tsx` (≈L2052–2071) | Renders both controls above inside the Room Type "Amenities & Policies" field group. |
| Field groups | `cowboy-dashboard/src/lib/field-groups.ts` (≈L223–226, 289–317) | Room Type group: `features-amenities`, `policies`, `amenity-display-order`, `restricted-amenity-ids`. Amenity groups: Basic Information (`name`, `slug`, `full-name`, `short-name`), Marketing (`short-description`, `long-description`, marketing headline/subhead, key benefit), Media (`image`, `icon-svg`), Settings (`type`, `category`, `location`, `active`, `global-amenity`). |
| Field layout | `cowboy-dashboard/src/lib/field-layouts.ts` (≈L81, 301–326) | Full-width layout for the amenity prose and media fields; Room Type `features-amenities` is full-width. |
| Amenity inline content | Amenities CMS collection `6abc8175a7bbdc92fa9e6599`, edited through the same `ItemEditor.tsx` | `short-name`, `name`, `short-description`, `long-description`, `image-path`, `image-name`, `active`. Published values drive the on-image note, the Little Comforts list and icon artwork. |
| Photo tagging | `cowboy-dashboard/src/components/MultiHotspotTagger.tsx`, `src/lib/photo-hotspots.ts`, `src/lib/sync-photo-hotspots.ts` | Photo Hotspots CMS collection `6acfb8250c28159487fb2aaf`; one item per marker with Amenity reference, photo file id/URL, x/y percent, display order, active. Owned by the sibling photo editor (COW-36); COW-73 only needs to preserve the amenity eligibility rule. |

## 2. Data contract mapping (CMS → D1 → React admin)

| CMS field (authoritative today) | Current D1 storage | Target |
| --- | --- | --- |
| Amenity `id` | `amenities.id` (preserved Webflow id) | Preserve unchanged. |
| `name` / `short-name` | `amenities.name` only | Add `amenities.short_name`; keep `name` as the full name. |
| `short-description` | **not stored** | Add `amenities.short_description`. |
| `long-description` | **not stored** | Add `amenities.long_description`. |
| `image-path` | `amenities.image_path` (seed leaves NULL — export has no such column) | Editable, validated site-local SVG path. |
| `image-name` | `amenities.image_name` (seed leaves NULL) | Editable; Worker resolves under `assets/icons/icons-simple/` when `image-path` is blank. |
| `active` | **not stored** | Add `amenities.active`. |
| Room Type `features-amenities` | `room_type_amenities` row per (room_type_id, amenity_id) | Assign/unassign rows; membership stays the eligibility gate. |
| `amenity-display-order` | `room_type_amenities.display_order` | Reorder updates `display_order` (already imported by `scripts/seed-d1-from-webflow.mjs`). |
| `restricted-amenity-ids` | `room_type_amenities.excluded` (1 = restricted) | Toggle updates `excluded`; never set for an unassigned amenity. |
| Draft/published state | Amenities are in the implicitly-published snapshot set; no revision history | Editorial edits use the existing `content_items`/`content_revisions`/pointer editor (COW-38) with kinds `amenity-content` and `room-amenities`; publish writes through to the canonical tables and refreshes the published snapshot. Guests read published values only. |

Related implementation references in this repository:

- D1 schema and seed: `migrations/0001_init.sql` (amenities, room_type_amenities, photo_hotspots), `scripts/seed-d1-from-webflow.mjs` (≈L291–358: amenity rows, order, restricted flags), `webflow_cms_export/2026-11-15 - Amenities.csv`, `webflow_cms_export/2026-11-15 - Room Types.csv`.
- Contracts: `src/types/d1-contracts.ts` (`amenityRowSchema`, `roomTypeAmenityRowSchema`), `src/types/editor-contracts.ts`, `src/types/photo-hotspot-cms.ts`.
- Editor/publishing: `worker/content-editor.ts`, `worker/content-provider.ts`, `worker/published-snapshots.ts`, `worker/publication-gate.ts`, `worker/index.ts`.
- Auth/RBAC: `worker/auth.ts` (Cloudflare Access viewer/admin, tenant from bound `TENANT_ID`), `worker/access.ts`.
- React admin shell: `src/dashboard/DashboardApp.tsx`, `src/dashboard/navigation.ts`, `src/dashboard/api.ts`, `src/dashboard/RoomPhotosPanel.tsx` (COW-72 read/scoping pattern), `src/dashboard/states.tsx`, `src/components/ui/Button.tsx`, `src/components/ui/Pill.tsx`.

## 3. Guest rendering parity

- `worker/webflow/room-type-reviews.ts` loads published CMS Amenities and Room Types and maps them with `normalizePublishedAmenities`, `normalizeRoomAmenityMap`, `normalizePhotoHotspots` in `worker/webflow/photo-hotspots.ts`.
- `src/journey/cmsTour.ts` builds Photo Journey highlights; `src/journey/tour.ts` (`roomAmenities`) feeds room cards and detail; `src/data/photoTourRooms.ts`, `src/components/rooms/RoomsListCard.tsx`, `src/components/rooms/RoomDetailModal.tsx` render them.
- `src/lib/cmsPhotoHotspots.ts` (`cmsIconUrl`) permits only site-local SVG paths under `assets/icons/`; `src/components/rooms/CmsAmenityIcon.tsx` falls back to `TourIcon`. Raw `icon-svg` markup is never injected.
- Target: published D1 amenity content (descriptions, short name, icon path/name, active), per-room `display_order` and `excluded` are consumed by the guest response, with the existing Webflow path retained as fallback and the published-only/room-eligibility/photo-coordinate rules unchanged. Restricted amenities stay hidden from the general list unless a published hotspot references them for that room.

## 4. Gaps to close in COW-73

1. Descriptions, short name and active flag have no D1 columns and no editor.
2. Icon `image-path`/`image-name` are NULL in the seed and have no editor or validation at write time.
3. Assignment/order/restriction are imported but not editable; no tenant-scoped write API.
4. No draft/publish/revision history for amenity editorial changes; amends go straight to the implicitly-published table.
5. Guest rendering does not read published D1 amenity values.

## 5. Explicit non-goals / preserved behavior

- Do not build a second hardcoded icon catalog from Figma; use checked-in local SVGs from validated CMS/D1 paths (see `docs/application/webflow-photo-hotspots.md`, "Amenity data contract and icon resolution").
- Do not inject `icon-svg` markup, accept remote SVG URLs, path traversal, or untrusted asset paths.
- Preserve Webflow ids, room/amenity membership, published-only filtering and photo-specific coordinates.
- Photo Ingestion/Cloudinary ownership and hotspot coordinate authoring remain with the sibling photo editor.
- Retrying an `image-name` candidate after an explicitly supplied but unloadable `image-path` remains a known, separate gap (documented in `docs/application/webflow-photo-hotspots.md`); this task does not silently substitute a different folder convention.
