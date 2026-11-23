# W1.1 destination audit — existing React admin in `urban-cowboy-booking-engine`

Status: destination-side evidence for COW-89 (W1.1). Source-side inventory is in
[`w1-astro-source-inventory.md`](./w1-astro-source-inventory.md). This is a documentation-only
artifact; no production behavior is changed.

Repository: `REVREBEL/urban-cowboy-booking-engine`, branch `Workstream-1`, inspected 2026-11-23.

## 1. What the target currently is

- Static multi-page **Vite + React 19 + TypeScript** build, not Next.js and not Astro.
  `vite.config.ts:33-41` registers three HTML entries: `index.html` (guest), `dashboard.html`
  (admin), `components.html`. Cloudflare Workers serve `dist/` through the `ASSETS` binding
  (`wrangler.toml:7-12`); the Worker is `worker/index.ts`.
- The admin is `/dashboard.html`, also bound at `/admin` and `/dashboard` by
  `worker/admin-pages.ts` (`worker/index.ts:96-100`). Guest routes keep the SPA fallback.
- Styling is Tailwind CSS v4 (`@import "tailwindcss"`, `@theme`, `@utility`) through
  `@tailwindcss/vite`. Shared controls live in `src/components/ui/Button.tsx` and `Pill.tsx`
  and are governed by the control contract in `AGENTS.md`.
- There is **no Next.js / vinext / OpenNext dependency** in `package.json` and no upstream
  vinext skill installed in this checkout. W1.2 must establish it.

## 2. Admin route/screen map (destination)

Hash routes are owned by `src/dashboard/navigation.ts:7-69`; `DEFAULT_ROUTE = "analytics"`.

| Route | Panel / implementation | State |
| --- | --- | --- |
| `#/analytics` | `Dashboard.tsx` `FunnelPanel` (legacy Supabase reads) | Wired; inherited path, slated for retirement once editors are ported (`content-editor-publishing.md:58`) |
| `#/events` | `EventsCalendarPanel.tsx` | Wired |
| `#/settings` | `SiteSettingsPanel.tsx` | Wired by COW-68 (five published Webflow settings, draft→publish→rollback) |
| `#/rooms` | `RoomPhotosPanel.tsx` | Wired by COW-72/COW-84: room selector, gallery order, exclude/unlink/link, inline alt/caption/description, save/publish/rollback |
| `#/hotspots` | `RoomHotspotsPanel.tsx` | Wired by COW-84/COW-81: pin placement, keyboard X/Y, room-eligible amenities, review approve/flag, replacement plan/apply, staged delete, publish/rollback |
| `#/amenities` | `RoomAmenitiesPanel.tsx` | Wired by COW-73: assignment, reorder, restricted toggle, amenity prose/icon, draft/publish |
| `#/media`, `#/rates`, `#/policies`, `#/add-ons`, `#/upgrades`, `#/recovery` | `EmptyPanel` | Navigation placeholder only; no panel |

**Finding D-01 (wiring defect, not fixed here).** `DashboardApp.tsx:64` renders
`RoomHotspotsPanel` for `#/hotspots`, but the `EmptyPanel` fallback condition at
`DashboardApp.tsx:66` excludes every wired route *except* `hotspots`. Visiting `#/hotspots`
therefore renders both the working panel and a "panel is not wired yet" placeholder.
Also `docs/application/dashboard-shell.md:11-22` is stale: its route table omits `hotspots`
and `amenities`. Both are W1.4 follow-ups, not changes to this inventory issue.

## 3. Auth / session / authorization model (destination)

- Worker authorization: `worker/access.ts` verifies the Cloudflare Access JWT; `worker/auth.ts`
  derives `viewer` and `admin` roles from `ADMIN_EMAILS` / `ADMIN_GROUPS`, and
  `authorizeScopedRequest()` takes the tenant **only** from bound `TENANT_ID`, rejecting any
  differing `?tenant=` (`auth.ts:35-102`). Reads require `viewer`; writes/publishes require
  `admin`. No shared-token fallback.
- Browser: `createDashboardApi()` (`src/dashboard/api.ts`) uses `credentials: "same-origin"`,
  no `Authorization` header, bounded `AbortSignal`, and maps non-2xx to `DashboardApiError`.
  `DashboardApp.tsx:26-50` gates the shell on a Supabase session before any panel renders.
- Role-based *navigation* is not implemented; UI hiding is not an authorization boundary.
  This matches COW-91 scope (real session/RBAC + role matrix tests) but note the existing
  Access+roles foundation should be reused, not replaced.

## 4. Shared D1 / API surface (destination)

All routes are registered in `worker/index.ts:101-298`:

- Guest/content reads: `/api/content/{policy-language,rate-cards,add-ons,room-type-reviews,locations,buildings,site-settings,items,events,offers,upgrades}`,
  `/api/content/events/{venues,preview,occurrences}`, `/api/content/parity`,
  `/api/content/snapshots[/{name}|/rollback]`, `/api/studio/config`, `/api/mews/*`.
- Admin reads/writes: `/api/admin/site-settings`, `/api/admin/media`, `/api/admin/amenities`,
  `/api/admin/rooms`, `/api/admin/rooms/:id/{photos,amenities,hotspots}`, hotspot
  `publish|rollback|plan|apply`, hotspot mapping `PATCH|DELETE`.
- Editorial/publishing: `/api/content/editor/items` (GET/POST), `.../:id` (GET/PATCH),
  `.../:id/{publish,rollback}` (POST). `worker/content-editor.ts` enforces draft isolation,
  two revision pointers, optimistic conflict (`409 edit_conflict`), atomic D1 batches, audit
  rows, location ownership, and explicit publish/rollback (`content-editor-publishing.md:5-38`).
- Private analytics/recovery: `/api/recovery`, `/api/analytics/summary` (protected at the edge).

## 5. Existing parity documentation (reuse, do not re-derive)

- `docs/source-system-audit.md` (COW-29) — Webflow/Astro/Mews/Supabase inventory, lineage, PII, gates.
- `docs/application/dashboard-shell.md` (COW-37) — shell, route map, protection, API client.
- `docs/application/content-editor-publishing.md` (COW-38) — draft/publish API and remaining field-UI slice.
- `docs/application/photo-admin-parity.md` (COW-72/84/81/82) — photo/hotspot source→React mapping and verification.
- `docs/application/room-amenity-admin-parity.md` (COW-73) — amenity source→D1→React mapping.
- `docs/application/property-settings-audit.md` (COW-68) — settings import, route binding, flags.

## 6. Destination gaps that affect W1.4/W1.6

1. No generic CMS **field editor** ported from the source `ItemEditor.tsx` (2,290 lines);
   only domain-specific panels exist. `content-editor-publishing.md:52-57` lists this as the
   next slice (typed field components, field groups/layouts, selects/references, reorder,
   per-field validation, conflict UI).
2. Six navigation sections are still `EmptyPanel` (§2).
3. Legacy Supabase funnel panel still reads Supabase carts directly; retirement is gated on
   the editor port.
4. No file-upload/photo-sync/alt-text-import utility surface in the React admin.
5. No standalone Next.js app boundary, providers, error/loading boundaries, or npm workspace
   for an admin app (W1.2).
6. Role matrix / session / CSRF tests for the admin surface do not exist yet (W1.3).

## 7. Verification baseline recorded for this audit

Not re-run as part of COW-89 (documentation-only). Previously recorded on merged `main` in
`photo-admin-parity.md:99-115`: `npm test` 524/524, `npm run typecheck`, `npm run lint:controls`,
`npm run d1:migrate:check` 11/11 applied twice. Any W1.2+ change must keep these green.
