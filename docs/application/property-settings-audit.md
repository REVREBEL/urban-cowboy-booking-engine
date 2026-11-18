# COW-68 audit: property settings and live layout cutover

Audit of the code merged through PRs #298–#308 (COW-30/31/32/37/38/39/40) before changing anything. Linear "Done" status is not treated as proof of deployment or routing.

## What already exists (do not rebuild)

| Capability | Evidence |
| --- | --- |
| D1 schema and migrations | `migrations/0001_init.sql` … `0006_working_revision_pointer.sql`, runner `scripts/migrate-d1.mjs`, manifest `migrations/manifest.json` |
| Access JWT RBAC and scoped admin APIs | `worker/access.ts`, `worker/auth.ts` (`requireAdmin`, `requireViewer`, `authorizeScopedRequest`) |
| Draft/publish editor with revision history, optimistic conflicts, audit and rollback | `worker/content-editor.ts`, `src/types/editor-contracts.ts`, migration 0006 |
| Immutable published snapshots and shadow parity | `worker/published-snapshots.ts`, `worker/shadow-read.ts`, `worker/content-routes.ts` |
| Dashboard shell, navigation and protected API client | `src/dashboard/DashboardShell.tsx`, `navigation.ts`, `api.ts`, `DashboardApp.tsx` |
| Per-route D1 migration adapters with Webflow fallback | `worker/content-adapters.ts` (COW-39 policy language), `worker/content-source.ts` flags |

## Actual gaps found

1. **No D1 property-settings record.** The five settings exist only as Webflow location fields, normalized in `worker/webflow/locations.ts` (`normalizeLocationItem`: `production-layout`, `demo-layout`, `enable-demo-engine`, `enable-event-dates-quick-selection`, `enable-feature-section`). `content_items` has no `site_settings` kind and the seed does not import these values. There is no typed settings contract or validation.
2. **Admin route is not bound.** `worker/index.ts` sends every non-API request to `env.ASSETS.fetch(request)`; `wrangler.toml` uses `not_found_handling = "single-page-application"`. A direct request to `/admin` or `/dashboard` therefore receives the guest `index.html`, not `dashboard.html`. The dashboard is only directly reachable at `/dashboard.html`.
3. **Settings panel is not wired.** `src/dashboard/DashboardApp.tsx` renders `EmptyPanel` for the `settings` route even though navigation includes it.
4. **Runtime reads are Webflow-only.** `src/App.tsx` chooses Photo Journey vs Card from `api.locations()` (Webflow `/api/content/locations`); `worker/webflow/locations.ts:onRequestStudioConfig` reads the published Webflow location item. Neither has a D1 flag, fallback or parity comparison.
5. **No import/parity for the five settings.** COW-39's adapter pattern exists for policy language only; there is no equivalent for site settings.

## Scope of this change

- Import the five **published** Webflow Catskills values into a `site_settings` content item and revision, with typed validation and safe defaults that preserve current behavior.
- Add a `siteSettings` route flag (`webflow` default, `shadow`, `d1`) following COW-39: shadow compares, d1 reads published D1 with Webflow fallback.
- Bind `/admin` and `/dashboard` to the existing `dashboard.html`, keeping the SPA asset fallback for guest routes.
- Wire the authenticated Settings panel with all five controls, draft → validate → preview → publish, revision history, conflict handling and rollback via the existing editor API.
- Add a flagged runtime path for booking layout and Studio enablement; keep `/api/content/locations` and `/api/studio/config` response contracts stable.
- Test publish isolation, role enforcement, fallback/parity and route serving. Production deployment verification requires a live environment and is recorded separately, never claimed from local tests.

## Implemented in this PR

- The five published Catskills values are imported as a `site_settings` content item and revision with provenance; incomplete Webflow fields fail seed generation rather than silently defaulting (`scripts/seed-d1-from-webflow.mjs`).
- `src/types/site-settings.ts` owns the typed contract, exact Webflow option-ID semantics and guest-safe defaults; draft saves and publishes validate the payload before any write.
- `worker/property-settings.ts` provides `siteSettings` route flag handling (webflow default, shadow parity, d1 with Webflow fallback), a no-store admin view with revision history, and a public settings contract.
- `worker/admin-pages.ts` serves the existing `dashboard.html` at `/admin` and `/dashboard`; guest routes still use the SPA fallback.
- The dashboard Settings route renders the five controls with draft → preview → publish → rollback, role enforcement on the Worker, and optimistic conflict handling. Publish is disabled while the form differs from the saved working revision, so an edit cannot be silently discarded by publishing an older revision.
- The public settings document is `no-store` in every mode: a five-minute shared cache cannot be invalidated on publish/rollback yet, so serving stale guest settings is avoided until a revisioned key or purge exists.
- Runtime: production layout, event date shortcuts and feature stories read published D1 settings only when the Worker reports a `d1` source; otherwise the legacy Webflow path is unchanged. `/api/studio/config` uses the published D1 enablement/default layout in `d1` mode with its response contract intact.
- Inherited gap fixed: seeded items lacked a working-revision pointer row (migration 0006 ran before the seed), so draft saves self-heal the pointer before the guarded batch.

## Verification evidence (local)

- `node --test tests/propertySettings.test.ts` — 8/8 (contracts, seed import, flag/fallback, admin auth, publish isolation, Studio enablement, admin routes, client contract).
- `npm test` — 362/362; `npm run test:seed` — 12/12; migration check — 6/6 applied twice with FK/integrity checks; control contract passed; typecheck clean.

These are local checks. They do **not** prove production deployment or routing.

## Deployment verification still required

1. Confirm the deployed Worker serves `/admin` and `/dashboard` with the dashboard bundle and that Cloudflare Access challenges unauthenticated requests to `/api/admin/*`.
2. Publish Photo Journey → Card → Photo Journey through the admin UI and verify the real guest booking URL changes without redeploy; check cache invalidation in a second session.
3. Verify Studio enablement blocks `/api/studio/config` and the Studio route at the Worker level, and that changing the Studio default layout independently works.
4. Compare Webflow and D1 published values in shadow mode before setting `CONTENT_SOURCE_SITE_SETTINGS=d1`; remove the fallback only after parity and rollback are confirmed.
5. Record deployed URLs and results in the issue/PR. Do not treat local tests as production verification.

## Out of scope

Astro port, Room/Rate editor redesign, Cloudinary media migration, Mews transactional changes.
