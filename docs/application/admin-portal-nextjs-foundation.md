# COW-90 — Cloudflare Next.js Admin Portal foundation (W1.2)

**Status:** foundation delivered locally. Deployment to a Cloudflare preview environment is a
separate owner action (see §7). No guest booking route, Worker domain handler or dashboard
panel was modified.

## 1. Application boundary

The Admin Portal is now a standalone Next.js (vinext) application in the `admin-app` npm
workspace. It deploys as its own Worker, `urban-cowboy-admin`, defined in
`admin-app/cloudflare.config.ts`. The existing booking-engine Worker (`worker/index.ts`) keeps
ownership of D1, Mews, publishing and all `/api/admin/*`, `/api/content/*` and
`/api/content/editor/*` contracts.

| Concern | Owner |
| --- | --- |
| Admin UI, routes, app router layouts/boundaries | `admin-app/app/**` |
| Admin runtime config and API client (client in W1.4) | `admin-app/lib/env.ts` |
| Cloudflare Worker config and deploy | `admin-app/cloudflare.config.ts` |
| D1/API contracts, auth verification, domain logic | existing Worker (`worker/**`) |
| Guest journey and legacy `dashboard.html` | unchanged |

Cross-origin API access is environment-driven: `API_BASE_URL` points at the booking-engine
Worker origin. An empty value means same-origin relative `/api` requests. W3 coordinates the
final routing/service-binding arrangement; no credential or account-specific value is
committed.

## 2. Runtime choices (confirmed before scaffolding)

- Cloudflare target via `create-vinext-app --use-npm`, App Router, TypeScript, Tailwind v4.
- Rendered response cache: **none**. Data cache: **none**. Image optimization: **none**.
  Prerendering: **none**. These fit an authenticated admin app that must not share cached HTML.
- `proxy.ts` (Next.js 16 proxy convention) marks every non-build response
  `Cache-Control: no-store, private`. W1.3 replaces it with real session/role verification;
  the comment in the file states the boundary.
- Cloudflare config keeps `nodejs_compat`, `ASSETS`, and the `runWorkerFirst` patterns required
  for middleware to run before static assets (build output stays excluded).

## 3. Design-system reuse

`admin-app/app/globals.css` imports the existing `src/styles/index.css`, so the admin app uses
the same Tailwind v4 tokens, fonts and utilities as the booking engine. `@source "../../src"`
keeps shared component utility classes in the generated CSS.

`admin-app/vite.config.ts` and `tsconfig.json` map `@/` to the repository's `src/`, which lets
the app import shared controls (the foundation page uses `Button`) without duplicating them.
Local admin modules use relative imports. The shared-control contract still applies.

## 4. Structure

```
admin-app/
  app/
    (admin)/layout.tsx        protected-ready shell, skip link, main landmark
    (admin)/page.tsx          foundation status + validated runtime config
    (admin)/loading.tsx       route loading state
    (admin)/error.tsx         client error boundary with retry
    (admin)/not-found.tsx     admin 404
    api/health/route.ts       non-secret deploy smoke endpoint
    globals.css               shared design-system import
    layout.tsx                root html/metadata
  lib/env.ts                  fail-closed runtime config parser
  proxy.ts                    no-store policy (W1.3 adds auth)
  cloudflare.config.ts        Worker: urban-cowboy-admin
  vite.config.ts              vinext + Cloudflare plugin + shared alias
  package.json                pinned npm dependencies, delegation scripts
tests/adminAppFoundation.test.ts
```

## 5. Environment contract

| Name | Scope | Default | Validation |
| --- | --- | --- | --- |
| `API_BASE_URL` | server | empty → same-origin | parsed with `URL`; must be an absolute `http(s)` origin with no credentials, path, query or fragment; trailing slashes normalised |
| `API_REQUEST_TIMEOUT_MS` | server | `8000` | integer 1000–60000 |

Declared string bindings appear on `process.env` in the Worker because `nodejs_compat` and a
compatibility date after 2025-04-01 are configured. `lib/env.ts` is server-only; never import it
from a client component. No Webflow Cloud or Astro runtime value is consumed by this app.

## 6. Scripts

From the repository root:

```bash
npm run admin:dev         # vite dev for admin-app
npm run admin:build       # production Worker build
npm run admin:typecheck   # tsc --noEmit for admin-app
npm run admin:deploy      # vinext-cloudflare deploy (needs Cloudflare auth)
node --test tests/adminAppFoundation.test.ts
```

Root `package.json` now includes `admin-app` in `workspaces` and delegates those scripts with
`-w admin-app`. All admin dependencies are pinned; `package-lock.json` is the single npm
lockfile for the repository.

## 7. Deployment still required (owner action)

`npm run admin:deploy` was **not** run here: it needs Cloudflare authentication and an owner
decision about the preview Worker name/route. Before deploying:

1. Confirm the Worker name `urban-cowboy-admin` is available in the target account.
2. Decide how the app reaches the booking-engine APIs (`API_BASE_URL` text binding or a
   service binding coordinated with W3). Do not commit environment values.
3. Deploy to a preview environment, request `/api/health`, and record the deployed URL in COW-90.
4. Confirm admin HTML responses are `no-store, private` and that no admin data is exposed before
   W1.3 session enforcement is in place. Keep the Worker non-public or behind Access until then.

## 8. Deferred to later W1 issues

- W1.3 (COW-91): real Cloudflare Access session verification, logout, expiry, role matrix, CSRF
  and unauthorized states; keep Booking Studio enablement separate from admin auth.
- W1.4 (COW-92): App Router routes for the parity matrix, API client, and reuse of the domain
  panels. Fix the destination wiring defect `D-01` recorded in the parity audit.
- W1.5/W1.7: sync gates; no post-gate integration until gate peers complete.

## 9. Local verification evidence (2026-11-23)

| Check | Result |
| --- | --- |
| `npm run admin:build` | pass — client + SSR + Worker output; routes `ƒ /` and `λ /api/health` |
| `npm run admin:typecheck` | pass |
| `npm run typecheck` (root + worker) | pass |
| `node --test tests/adminAppFoundation.test.ts` | 6/6 pass |
| `npm run lint:controls` | pass — no new control overrides |
| Local dev smoke: `npm run admin:dev -- --port 4173`, `GET /api/health` | `{"status":"ok","app":"admin-app","apiBaseConfigured":false}` |
| `npm test` (full suite) | 516 pass, 2 fail, 1 cancelled. Both failures are pre-existing browser tests (`dateDropdownAccessibility`, `promoDropdownAccessibility`) that cannot launch because Playwright's chromium headless shell is not installed in this environment (`npx playwright install` needed); the cancellation was the stopped run after the missing-browser hang. No admin-app test failed. |

Build emits upstream vinext warnings (ineffective dynamic imports in vinext shims and
sourcemap notices from `@vitejs/plugin-rsc`). They are framework-level warnings, not app errors,
and the build completes successfully.
