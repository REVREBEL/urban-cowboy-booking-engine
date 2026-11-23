# COW-89 — Admin Portal source parity matrix and migration sequence

**Status:** W1.1 deliverable. Documentation only — no production behavior changed by this issue.

**Sources of evidence**
- Source: `docs/generated/w1-astro-source-inventory.md` (cowboy-dashboard `main` @ `2d97d06`, 90 capability IDs `SRC-01`–`SRC-90`, every claim with `path:line`).
- Destination: `docs/generated/w1-react-dashboard-audit.md` (this repo, `Workstream-1`, 2026-11-23) plus the per-feature parity docs listed in §6 of that audit.
- Parent: COW-86 execution map; next issues COW-90 (W1.2) → COW-91 (W1.3) → COW-92 (W1.4) → COW-93/94/95 (gates and closeout).

## Status key

| Status | Meaning |
| --- | --- |
| **Migrated (M)** | Capability already delivered in the React admin / Worker, with evidence; reuse, do not rebuild. |
| **Adapted (A)** | Capability survives but with a deliberately different implementation or contract (safer, D1-native, npm-based). Verify behavior, not code identity. |
| **Partial (P)** | Some of the behavior exists; a named gap remains. |
| **Missing (X)** | No destination implementation found. Port in W1.4/W1.6 or explicitly retire. |
| **Obsolete candidate (O)** | Source evidence suggests it can be dropped; needs owner confirmation before omission. |

## Rollup

| Status | Count | Capability IDs |
| --- | ---: | --- |
| Migrated | 36 | SRC-14, 15, 17, 20, 22, 25, 26, 27, 28, 36–40, 49, 50, 55, 57–66, 69, 73–76, 80–83 |
| Adapted | 6 | SRC-02, 16, 18, 33, 84, 90 |
| Partial | 16 | SRC-04, 06, 11, 12, 29, 30, 43, 46–48, 53, 54, 56, 67, 72, 77 |
| Missing | 20 | SRC-01, 03, 08–10, 13, 19, 31, 32, 34, 35, 41, 42, 44, 45, 51, 52, 68, 70, 71 |
| Obsolete candidate | 12 | SRC-05, 07, 21, 23, 24, 78, 79, 85–89 |

**Headline:** the medium-to-high-risk photo, hotspot, amenity, gallery, settings and publishing surface is already migrated or adapted. The remaining work is mostly (a) a generic field editor / collection-browser layer, (b) Webflow utility tooling (alt-text, upload, Mews sync UI), and (c) the Next.js runtime foundation and auth reconciliation.

---

## 1. Platform and build (SRC-01–05)

| ID | Source evidence | Destination mapping | Status | Notes / owner |
| --- | --- | --- | --- | --- |
| SRC-01 | `astro.config.mjs:53-71` SSR + Cloudflare adapter | none — repo is Vite static + Worker | **X** | W1.2: establish vinext/Next.js App Router with Cloudflare target. Use upstream `migrate-to-vinext` flow; check compatibility before committing. |
| SRC-02 | `wrangler.jsonc:7-54` (no bindings/vars/crons) | `wrangler.toml` (ASSETS, D1, KV, Access vars, cron) | **A** | Destination supersedes source; do not copy the empty config. W3 coordinates runtime-facing config. |
| SRC-03 | `package.json:5-23`, `tsconfig.json` | root `package.json` scripts, `npm` lockfile | **X** | W1.2: add admin app workspace/package scripts with deterministic npm lockfile. |
| SRC-04 | `astro.config.mjs:54`, `src/lib/base-url.ts:1` base-path prefixing | `/admin`, `/dashboard`, `/dashboard.html` bound in `worker/admin-pages.ts` | **P** | Decide mount-path strategy with W3 before W1.4. Destination currently assumes root mount. |
| SRC-05 | `src/middleware.ts:3-19` DEV `/-wf/ready` probe + CORS | no equivalent | **O** | Webflow Workbench scaffolding; omit unless a deployment health probe is required (then replace with a real route). |

## 2. UI pages and navigation (SRC-06–14)

| ID | Source evidence | Destination mapping | Status | Notes / owner |
| --- | --- | --- | --- | --- |
| SRC-06 | `src/lib/collections-config.ts:8-124` (11 collections, sort fields) | `src/dashboard/navigation.ts:30-43`; D1 tables | **P** | Navigation and D1 storage exist; generic collection registry/browser does not. |
| SRC-07 | `portal/index.astro:13-28` live discovery + static fallback | D1 is authoritative; no discovery | **O** | Webflow live-discovery fallback is superseded by D1. Confirm before omitting. |
| SRC-08 | `portal/index.astro:8-90` collection browser | no equivalent | **X** | W1.4 decision: add a content/collection index or rely on domain panels. |
| SRC-09 | `portal/[slug].astro:15-201` item list (search/sort/status) | no generic item list | **X** | W1.4/W1.6; reuse `LoadingPanel`/`ErrorPanel`/`EmptyPanel` patterns. |
| SRC-10 | `portal/[slug]/new.astro:20-147` new item + hotspot hand-off | no generic new-item route; hotspot pins created in `#/hotspots` | **X** | Preserve hotspot hand-off semantics when the generic editor is built. |
| SRC-11 | `portal/[slug]/[itemId].astro:35-91` live/staged diff banner | `hasUnpublishedDraft` in `SiteSettingsPanel`, `RoomAmenitiesPanel`, gallery/hotspot APIs | **P** | Banner concept delivered per-domain; generic editor version missing. |
| SRC-12 | `portal/[slug]/reorder.astro:12-85` + `ReorderList.tsx` | gallery reorder in `RoomPhotosPanel`; amenity order in `RoomAmenitiesPanel` | **P** | Domain reorders exist; generic sortField-gated reorder page does not. |
| SRC-13 | `portal/tools/index.astro:34-55` tools hub (3 sections) | no tools hub | **X** | Depends on SRC-29/68/69/70/71 decisions; W1.4 or W1.6. |
| SRC-14 | `portal/photo-hotspots/review.astro:8-49` | `#/hotspots` review approve/flag (`RoomHotspotsPanel.tsx`) | **M** | Abbreviated source URL query params replaced by in-panel room/photo selection. |

## 3. API endpoints and operations (SRC-15–32)

| ID | Source evidence | Destination mapping | Status | Notes / owner |
| --- | --- | --- | --- | --- |
| SRC-15 | `api/cms/[collectionId].ts:4-31` staged list | `GET /api/content/editor/items` | **M** | Scoped by Access + tenant. |
| SRC-16 | `api/cms/[collectionId].ts:33-87` create + auto-publish | `POST /api/content/editor/items` creates draft; publish is explicit | **A** | Auto-publish deliberately retired (COW-38 invariant 4). Confirm with product owner. |
| SRC-17 | `api/cms/[collectionId]/[itemId].ts:4-25` live get | `GET /api/content/editor/items/:id` + published snapshots | **M** | Revision-preview support is destination-only. |
| SRC-18 | `api/cms/[collectionId]/[itemId].ts:27-76` update + auto-publish | `PATCH .../items/:id` + `POST .../publish` | **A** | Optimistic `expectedRevisionId` replaces source "last write wins". |
| SRC-19 | `api/cms/[collectionId]/[itemId].ts:78-105` delete | no delete in content editor API | **X** | Need D1 delete + audit + rollback contract before W1.4. |
| SRC-20 | `api/cms/.../publish.ts:16-18` | `POST .../items/:id/publish` | **M** | Snapshot refresh added. |
| SRC-21 | `api/cms/[collectionId]/bulk.ts:20-72` | no bulk create endpoint | **O** | Superseded by per-item saves in the tagger; confirm no external caller. |
| SRC-22 | `api/cms/[collectionId]/reorder.ts:21-64` chunked update+publish | `worker/gallery-publication.ts` two-phase ordering; amenity `display_order` drafts | **M** | Destination avoids the `(room, display_order)` UNIQUE conflict. |
| SRC-23 | `api/cms/collections.ts:28-62` | no introspection endpoint | **O** | D1 schema is known statically; confirm no external caller. |
| SRC-24 | `api/cms/discover-site.ts:5-35` | no equivalent | **O** | One-off bootstrap with a different token scope. |
| SRC-25 | `api/cms/reference/[itemId].ts:13-22` | `GET /api/admin/{rooms,amenities,media}` | **M** | Tenant scoped. |
| SRC-26 | `api/cms/rekey-photo.ts:25-154` | immutable media ID + version + `hotspots/plan|apply` (COW-33/34/81) | **M** | Replaced, not copied; preserves scoped, cautious behavior. |
| SRC-27 | `api/cms/sync-photo-hotspots.ts:7-42` GET dry run | `POST /api/admin/rooms/:id/hotspots/plan` (read-only, server-derived) | **M** | Callers cannot submit mapping rows — stronger than source. |
| SRC-28 | `api/cms/sync-photo-hotspots.ts:47-80` POST curated deletes | staged deletions + publish/rollback (`0011`) | **M** | Guest row changes only on publish. |
| SRC-29 | `api/cms/sync-room-photos.ts:2-48` child_process trigger | `scripts/sync-mews-room-photos.mjs` via `npm run sync:room-photos`; no HTTP/UI trigger | **P** | Source route is Worker-incompatible (SRC-90). Keep CLI; decide whether an admin UI trigger is needed. |
| SRC-30 | `api/cms/upload-image.ts:29-150` Webflow Assets upload | COW-35 Cloudinary contract; admin reads registry only | **P** | Upload path not complete; W2/W3 dependency. Port MIME/4 MB validation rules with it. |
| SRC-31 | `api/tools/alt-text/export.ts:26-98` | no equivalent | **X** | Needed only if alt-text tooling is in scope. |
| SRC-32 | `api/tools/alt-text/import.ts:30-140` | no equivalent | **X** | Writes live directly in source; if ported, must go through draft/publish. |

## 4. Shared contracts and helpers (SRC-33–43)

| ID | Source evidence | Destination mapping | Status | Notes / owner |
| --- | --- | --- | --- | --- |
| SRC-33 | `src/lib/webflow-client.ts:16-45` env resolution | Worker bindings + `getCloudflareContext()` | **A** | Admin no longer needs the Webflow CMS token; guest Webflow readers remain for rollback. |
| SRC-34 | `src/lib/field-groups.ts:17-467` | not ported | **X** | Prerequisite for the generic editor (SRC-44/45). |
| SRC-35 | `src/lib/field-layouts.ts:25-482` | not ported | **X** | Same slice as SRC-34. |
| SRC-36 | `src/lib/photo-fields-config.ts:32-106` | `worker/d1.ts listRoomGallery`, `media_placements` | **M** | Placement-type filtering replaces the source field map. |
| SRC-37 | `src/lib/photo-hotspots-utils.ts:68-111` asset-id matching | `cmsPhotoKeys` + crop/EXIF geometry | **M** | Destination is stable across resize variants and crops. |
| SRC-38 | `src/lib/photo-hotspots.ts:140-171` fetch/rekey helpers | `worker/hotspot-admin.ts`, `worker/published-hotspots.ts` | **M** | Scoped writes, revision snapshots. |
| SRC-39 | `src/lib/room-type-photos.ts:4+` photo scoping | `listRoomGallery` tenant-scoped query | **M** | — |
| SRC-40 | `src/lib/sync-photo-hotspots.ts:60-315` report engine | COW-34 `planReplacement`/`applyReplacement` | **M** | Facts derived server-side from tenant-scoped fingerprints. |
| SRC-41 | CSV encode/decode + BOM helpers | no CSV surface | **X** | Only needed with SRC-31/32/70/71. |
| SRC-42 | `src/lib/alt-text-types.ts:3-58` | no equivalent | **X** | Same dependency as above. |
| SRC-43 | `src/lib/image-upload-client.ts:12-27` MIME/size rules | Zod contracts + `ICON_PATH`/`ICON_NAME` in `RoomAmenitiesPanel.tsx:72-73` | **P** | No generic image upload validation in admin yet. |

## 5. Item editor and field components (SRC-44–67)

| ID | Source evidence | Destination mapping | Status | Notes / owner |
| --- | --- | --- | --- | --- |
| SRC-44 | `ItemEditor.tsx:82-93,782-927` form/save/delete | no generic editor | **X** | Largest remaining gap; 2,289-line source must be split into typed components. |
| SRC-45 | `ItemEditor.tsx:929-1474` field renderers | no equivalent | **X** | Same slice. |
| SRC-46 | `ItemEditor.tsx:626-643,787-802` slug + required checks | Zod structure/bounds in `src/types/editor-contracts.ts` | **P** | Field-level semantic validation still missing. |
| SRC-47 | `ItemEditor.tsx:561-624` async reference options | domain panels load rooms/amenities/media lists | **P** | Generic select/reference loader missing. |
| SRC-48 | `ItemEditor.tsx:123-184,1373-1456` amenity grouping | `RoomAmenitiesPanel` catalog (name, sort, icon) | **P** | Type/category grouping not present in D1 contract. |
| SRC-49 | `ItemEditor.tsx:482-530,1270-1339` hotspot amenity scoping | `worker/hotspot-admin.ts` checks `room_type_amenities` | **M** | Ownership proven by room + amenity rows. |
| SRC-50 | `ItemEditor.tsx:532-559` auto hotspot name/slug | server-derived facts in hotspot apply | **M** | Callers cannot forge names/fingerprints. |
| SRC-51 | `ItemEditor.tsx:356-456,2185-2226` reverse amenity editor | no equivalent | **X** | Decide whether room membership is edited from the amenity side in D1. |
| SRC-52 | `ItemEditor.tsx:1503-2137` bespoke section layouts | not ported | **X** | P1; re-map Webflow-specific option IDs to destination tokens. |
| SRC-53 | `ItemEditor.tsx:279-314,1889-1952` feature-icon upload | amenity icon path/name fields in `RoomAmenitiesPanel` | **P** | Path validation exists, upload does not. |
| SRC-54 | `ItemEditor.tsx:1476-1572` status banner | `active` in amenity payload; publish controls in settings/gallery | **P** | No shared status banner control. |
| SRC-55 | `ItemEditor.tsx:649-768,2262-2286` tagger integration | `RoomHotspotsPanel` create/update/delete | **M** | Draft/publish separation added. |
| SRC-56 | `ImageUpload.tsx:30-66,213-231` single image field | amenity icon path editor; no upload | **P** | See SRC-30. |
| SRC-57 | `MultiImageField.tsx:373-505` gallery grid | `RoomPhotosPanel` gallery | **M** | Source-URL previews, error fallback. |
| SRC-58 | `MultiImageField.tsx:190-297` replace + rekey | hotspot replacement plan/apply; gallery relink/publish | **M** | Replaced by immutable media identity. |
| SRC-59 | `MultiImageField.tsx:309-346` thumbnail reorder | `RoomPhotosPanel` reorder controls | **M** | Adapted to accessible buttons, two-phase DB ordering. |
| SRC-60 | `MultiImageField.tsx:422-489` hotspot badges / Tag / Review | `#/hotspots` pin list and review controls | **M** | — |
| SRC-61 | `AmenitySortingGrid.tsx:21-117` amenity order | `RoomAmenitiesPanel` move controls | **M** | Left/right buttons with `aria-label`s preserved. |
| SRC-62 | `RestrictedAmenitiesPicker.tsx:30-153` restricted toggle | `RoomAmenitiesPanel` restricted toggle | **M** | `excluded` is always a subset of assigned amenities. |
| SRC-63 | `HotspotPicker.tsx:14-68,125-162` click-to-place | `RoomHotspotsPanel` canvas + keyboard X/Y | **M** | Destination adds arrow-key crosshair placement. |
| SRC-64 | `MultiHotspotTagger.tsx:76-149,227-264` | `RoomHotspotsPanel` | **M** | — |
| SRC-65 | `RoomPhotoPicker.tsx:46-227` room→photo picker | `RoomPhotosPanel` room selector | **M** | — |
| SRC-66 | `HotspotReview.tsx:29-203` review overlay | `RoomHotspotsPanel` review controls | **M** | — |
| SRC-67 | `ReorderList.tsx:81-107,195-207` drag reorder | `RoomPhotosPanel` reorder buttons | **P** | Keyboard-accessible, but pointer drag not ported. Acceptable unless drag is explicitly required. |

## 6. Tools, errors, UI library, scripts (SRC-68–79)

| ID | Source evidence | Destination mapping | Status | Notes / owner |
| --- | --- | --- | --- | --- |
| SRC-68 | `SyncRoomPhotos.tsx:17-250` Mews sync panel | no admin UI; CLI script only | **X** | Blocked by Worker incompatibility (SRC-90); choose queue/cron/external runner. |
| SRC-69 | `SyncPhotoHotspots.tsx:58-147,231-304` analysis + curated delete | `hotspots/plan|apply` + replacement section in `RoomHotspotsPanel` | **M** | Confirmation and dry-run semantics preserved. |
| SRC-70 | `AltTextManager.tsx:49-392` audit/edit/CSV tabs | no equivalent | **X** | W1.6 candidate. |
| SRC-71 | `tools/AltTextImporter.tsx:92-472` CSV preview/confirm/apply | no equivalent | **X** | If ported, must be draft/publish and batched. |
| SRC-72 | `tools/AltTextManagerClient.tsx:5-21` error boundary + toaster | `PanelErrorBoundary` + shared controls | **P** | Boundary exists; toast mount needs verification in the Next.js shell (W1.2). |
| SRC-73 | `ErrorBoundary.tsx:26-69` retry | `PanelErrorBoundary` with Retry, reset on route change | **M** | — |
| SRC-74 | `src/components/ui/*` (46 shadcn/Radix files) | `src/components/ui/*` (Button, Pill and shared primitives) | **M** | Reuse destination components; respect the control contract. |
| SRC-75 | `generated/webflow.css`, `src/styles/global.css:9-90` | Tailwind v4 semantic tokens in `src/styles/{index,colors,utilities}.css` | **M** | Do not copy raw Webflow variable names/option IDs. |
| SRC-76 | `scripts/sync-mews-room-photos` (512 lines) | `scripts/sync-mews-room-photos.mjs`, `npm run sync:room-photos` | **M** | Dry-run default, append-only, fail-fast duplicates retained. |
| SRC-77 | `scripts/sync-photo-hotspots.ts:21-165` CLI | admin `plan|apply` API instead of CLI | **P** | CLI behavior preserved through API; decide if a scripted bulk path is still needed. |
| SRC-78 | doc generator scripts | destination fumadocs scripts | **O** | Different tooling; no application behavior. |
| SRC-79 | build/push/sync shell scripts | destination deploy scripts + CI | **O** | Repo maintenance, not app behavior. |

## 7. Cross-cutting behavior and blockers (SRC-80–90)

| ID | Source evidence | Destination mapping | Status | Notes / owner |
| --- | --- | --- | --- | --- |
| SRC-80 | staged vs live + auto-publish (`[itemId].astro:40-91`) | draft/publish invariants, two pointers, 409 conflicts, audit, rollback | **M** | Destination is strictly stronger; auto-publish retired. |
| SRC-81 | keyboard/a11y (`MultiImageField`, `HotspotPicker`, reorder controls) | shared control contract, keyboard hotspot canvas, skip link, `aria-current` | **M** | Re-verify in Next.js shell during W1.4. |
| SRC-82 | validation/loading/error/empty states | `src/dashboard/states.tsx`, PanelErrorBoundary, bounded fetch deadlines | **M** | Per-panel states preserved. |
| SRC-83 | responsive `sm:/md:/lg:` layouts, 44 px targets | Tailwind v4 responsive classes, shared controls | **M** | Re-verify visually after the framework migration. |
| SRC-84 | **no auth/session/RBAC anywhere** (`middleware.ts:3-19`, all pages/routes unguarded) | Access JWT + viewer/admin roles + tenant scope + Supabase shell gate | **A** | This is a *new requirement*, not a port. W1.3 must add role matrix/session/CSRF tests and keep Studio enablement separate. |
| SRC-85 | `src/site-components/**` (594 DevLink files) | not present | **O** | Generated marketing-site components; omit from admin app. |
| SRC-86 | `blaxel.toml:1-4` | not present | **O** | Foreign hosting platform. |
| SRC-87 | `TestComponent.tsx` (unused) | not present | **O** | Dead code. |
| SRC-88 | unused endpoints (publish/bulk/reference/discover/collections) | see individual rows | **O** | Confirm no external consumers before omission. |
| SRC-89 | starter README/bootstrap/dev-only injector | not present | **O** | Workbench scaffolding. |
| SRC-90 | `sync-room-photos.ts:2-48` child_process; `upload-image.ts:2,67-69` Node crypto/Buffer; pervasive `import.meta.env` | destination Worker uses WebCrypto, bindings, no child_process | **A** | Do not port Node-only code. Any new admin API must run under Workers/vinext; verify during W1.2. |

---

## Migration sequence (W1.2 → W1.6)

| Step | Issue | Depends on | What it consumes from this matrix |
| --- | --- | --- | --- |
| W1.2 | COW-90 | COW-89 | SRC-01/02/03/04; establish Next.js (vinext) app boundary, npm determinism, providers/error boundaries, protected-ready route shell. Keep SRC-75 tokens and SRC-74 controls. |
| W1.3 | COW-91 | W1.2 | SRC-84 (new requirement) + destination Access/RBAC foundation; role matrix, session lifecycle, server-side API authorization. |
| W1.4 | COW-92 | W1.1, W1.2, W1.3 | Missing/partial **P0/P1** routes: SRC-08–13, SRC-19, SRC-29/30, SRC-56, SRC-68 (decision-dependent), plus the D-01 wiring defect fix. Reuse all M/A rows; never rebuild SRC-14/26–28/57–66/69. |
| W1.5 | COW-93 | W1.4 | Sync Gate 1 with COW-100 (W2.5) and COW-107 (W3.5). No post-gate integration before all three are complete. |
| W1.6 | COW-94 | W1.5 + gate peers | Remaining parity: generic editor (SRC-34/35/44/45/46/47), utility tooling decisions (SRC-31/32/41/42/70/71), reverse editor (SRC-51), and D1-backed workflows. |
| W1.7 | COW-95 | W1.6 | Sync Gate 2 with COW-102 (W2.7) and COW-111 (W3.7); production acceptance requires all three workstreams together. |

## Open decisions for the product owner (no silent omissions)

1. **Auto-publish retirement** (SRC-16/18): source publishes on save; destination requires explicit publish. Confirm this is the intended behavior change.
2. **Obsolete endpoints** (SRC-21/23/24/88): confirm no external consumers before dropping.
3. **Alt-text + upload + Mews sync tools** (SRC-29/30/31/32/68/70/71): which are in scope, and is a Worker-safe trigger (queue/cron/external runner) available?
4. **Generic collection browser/editor** (SRC-08/09/10/34/35/44/45/51/52): confirm target breadth — full field-driven editor vs. domain panels only.
5. **Mount path** (SRC-04): coordinate with W3 before W1.4.
6. **Legacy single-hotspot flow**: source still links to `/portal/photo-hotspots/:id` (§8 of the source inventory); confirm whether to keep it alongside the multi-tagger.
7. **Delete semantics** (SRC-19): define D1 delete + audit + rollback before W1.4.

## Blocking risks to resolve early

- **SRC-90 runtime incompatibilities**: no `child_process`, Node `crypto`/`Buffer`, or `import.meta.env` in the new app. Verify vinext compatibility for React 19, Tailwind v4, Radix/shadcn and any required `next/*` imports during W1.2.
- **SRC-84 auth gap**: source had none; destination must not weaken the existing Access+roles boundary. UI hiding is never authorization.
- **High-risk behavioral cluster**: SRC-26/27/28/58/69 (rekey, dry-run analysis, curated deletes, replacement) must be verified end-to-end because these operations can destroy published content if safety properties regress.

## Verification for this deliverable

Documentation-only. No tests or builds were required by COW-89. The baseline from `photo-admin-parity.md:99-115` (npm test 524/524, typecheck, control contract, D1 migrations applied twice) must remain green when W1.2 begins.
