# COW-92 — Admin Portal route and workflow port (W1.4)

**Status:** route surface delivered locally; the migrated admin app reuses the already-delivered
React panels instead of rebuilding them. Data APIs remain owned by the booking-engine Worker.

## 1. Route map

All twelve dashboard sections from `src/dashboard/navigation.ts` are reachable as App Router
paths through `admin-app/app/(admin)/[section]/page.tsx`:

`/rooms`, `/hotspots`, `/amenities`, `/media`, `/rates`, `/policies`, `/events`, `/add-ons`,
`/upgrades`, `/recovery`, `/analytics`, `/settings`.

Unknown segments call `notFound()`; every page is protected by the `(admin)` layout's verified
Access session and by a per-route capability check:

| Sections | Required capability |
| --- | --- |
| rooms, hotspots, amenities | `edit` (admin) |
| settings | `settings` (admin) |
| media, rates, policies, events, add-ons, upgrades, recovery, analytics | `read` (viewer) |

A viewer who requests an admin-only section sees an "Insufficient role" state and **no content is
loaded**. This is UX defence only — the actual write authorization stays at the Worker API.

## 2. Panel reuse

`admin-app/components/DashboardPanelHost.tsx` renders the existing panels unchanged:

| Route | Reused component | Source parity |
| --- | --- | --- |
| `/rooms` | `src/dashboard/RoomPhotosPanel.tsx` | COW-72/84 gallery, publications |
| `/hotspots` | `src/dashboard/RoomHotspotsPanel.tsx` | COW-84/81 pin lifecycle, reviews |
| `/amenities` | `src/dashboard/RoomAmenitiesPanel.tsx` | COW-73 assignments, order, content |
| `/events` | `src/dashboard/EventsCalendarPanel.tsx` | editorial events |
| `/settings` | `src/dashboard/SiteSettingsPanel.tsx` | COW-68 five published settings |

No panel code was duplicated. `admin-app/lib/dashboard-api.ts` adapts the origin via
`API_BASE_URL` and keeps the shared `createDashboardApi()` contract, deadlines and typed errors.
When the API lives on another origin the browser sends credentials; W3 owns the CORS/cookie
arrangement. With an empty `API_BASE_URL` the app uses relative `/api` paths (same origin).

Sections still backed by a placeholder (`media`, `rates`, `policies`, `add-ons`, `upgrades`,
`recovery`, `analytics`) are explicitly listed in the W1.1 parity matrix as remaining W1.6 work.
The legacy Supabase-backed funnel panel is intentionally not reused; its retirement is tracked in
`content-editor-publishing.md`.

## 3. Navigation and the legacy defect

`admin-app/components/AdminNav.tsx` reuses `DASHBOARD_NAV` metadata and renders real `<Link>`
paths with `aria-current`, replacing the legacy hash router in the migrated app. The legacy
`dashboard.html` entry remains available for rollback.

Fixed the destination wiring defect `D-01` in `src/dashboard/DashboardApp.tsx:66`: `#/hotspots`
previously rendered both `RoomHotspotsPanel` and the "not wired yet" `EmptyPanel`.

## 4. Files

```
admin-app/app/(admin)/[section]/page.tsx   route parity + capability gate
admin-app/components/DashboardPanelHost.tsx reused panels / placeholder state
admin-app/components/AdminNav.tsx          grouped navigation, real paths
admin-app/lib/routes.ts                    route ↔ capability map
admin-app/lib/dashboard-api.ts             API origin adapter
src/dashboard/DashboardApp.tsx             D-01 one-line fix
tests/adminRoutes.test.ts                  5 tests
```

## 5. Verification evidence (local, 2026-11-23)

| Check | Result |
| --- | --- |
| `node --test tests/adminRoutes.test.ts` | 5/5 pass |
| Combined dashboard/auth/routes tests | 32/32 pass |
| `npm run admin:build` | pass — route table includes `ƒ /:section` and the auth/health APIs |
| `npm run admin:typecheck`, `npm run typecheck` | pass |
| `npm run lint:controls` | pass — no new control overrides |

Interaction-level verification with a real Access identity and the booking-engine Worker APIs
requires the deployed environment; it is not claimed here.

**PR CI note:** the `validate` check on the PR fails in `tests/mewsAriAuthority.test.ts` because
`src/types/d1-contracts.ts` exposes `mewsReference*` fields that are not in that test's allowlist.
That test and the failing contract state arrived on `main` in PR #398 after this branch was
created; `main`'s own CI is failing for the same reason. This is unrelated to the W1.4 changes
(no files in this PR touch those two paths) and is reported rather than silently patched here.

## 6. Deferred to W1.6 / sync gates

- Missing panels and the generic field editor from the parity matrix (SRC-08/09/10/34/35/44/45).
- Webflow utility tooling decisions (alt-text, upload, Mews sync trigger).
- W1.5 Sync Gate 1 with COW-100 and COW-107: no post-gate integration until all three gates pass.
