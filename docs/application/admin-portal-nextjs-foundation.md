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
| Admin runtime config and server API proxy | `admin-app/lib/env.ts`, `admin-app/lib/api-proxy.ts` |
| Cloudflare Worker config and guarded deploy | `admin-app/cloudflare.config.ts`, `scripts/deploy-admin.mjs` |
| D1/API contracts, auth verification, domain logic | existing Worker (`worker/**`) |
| Guest journey and legacy `dashboard.html` | unchanged |

Dashboard panels call relative `/api/*` paths on the admin origin. The catch-all App Router
handler in `admin-app/app/api/[...path]/route.ts` verifies the Access session and forwards allowed
dashboard paths to the booking-engine Worker with the verified assertion. `API_BASE_URL` stays
server-only, so the browser never receives the booking Worker origin or Access JWT. The booking
Worker remains authoritative for D1, publishing and role checks.

## 2. Runtime choices (confirmed before scaffolding)

- Cloudflare target via `create-vinext-app --use-npm`, App Router, TypeScript, Tailwind v4.
- Rendered response cache: **none**. Data cache: **none**. Image optimization: **none**.
  Prerendering: **none**. These fit an authenticated admin app that must not share cached HTML.
- `proxy.ts` (Next.js 16 proxy convention) marks every non-build response
  `Cache-Control: no-store, private`. W1.3 added a cheap unauthenticated-page redirect;
  authoritative session/role verification lives in the protected layout and API handlers
  (see the W1.3 document).
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
    api/[...path]/route.ts    authenticated same-origin API proxy
    globals.css               shared design-system import
    layout.tsx                root html/metadata
  lib/env.ts                  fail-closed runtime config parser
  lib/api-proxy.ts            allowed-path forwarding and assertion handling
  proxy.ts                    no-store policy (W1.3 adds auth)
  cloudflare.config.ts        Worker: urban-cowboy-admin
  vite.config.ts              vinext + Cloudflare plugin + shared alias
  package.json                pinned npm dependencies, delegation scripts
tests/adminAppFoundation.test.ts
```

## 5. Environment contract

| Name | Scope | Default | Validation |
| --- | --- | --- | --- |
| `CF_ACCESS_TEAM_DOMAIN` | server | none | Cloudflare Access team hostname |
| `CF_ACCESS_AUD` | server | none | 64-character Access application AUD in the deploy wrapper |
| `ADMIN_EMAILS`, `ADMIN_GROUPS` | server | none | comma-separated role allowlists |
| `TENANT_ID` | server | none | nonblank server-bound tenant scope |
| `API_BASE_URL` | server proxy | none | absolute `http(s)` origin with no credentials, path, query or fragment; production wrapper requires HTTPS |
| `API_REQUEST_TIMEOUT_MS` | server proxy | `8000` | integer 1000–60000 |

Declared string bindings appear on `process.env` in the Worker because `nodejs_compat` and a
compatibility date after 2025-04-01 are configured. `lib/env.ts` is server-only; never import it
from a client component. No Webflow Cloud or Astro runtime value is consumed by this app.

## 6. Scripts

From the repository root:

```bash
npm run admin:dev         # vite dev for admin-app
npm run admin:build       # production Worker build
npm run admin:typecheck   # tsc --noEmit for admin-app
npm run admin:deploy:check # validate .env bindings without deploying
npm run admin:deploy      # guarded vinext-cloudflare deploy
node --test tests/adminAppFoundation.test.ts tests/adminApiProxy.test.ts tests/adminDeployConfig.test.ts
```

Root `package.json` includes `admin-app` in `workspaces`. The deployment wrapper reads the shared
`.env`, validates the approved account and forwards only the nonsecret bindings listed above.
All admin dependencies are pinned; `package-lock.json` is the single npm lockfile.

## 7. Deployment and production acceptance

`urban-cowboy-admin` was deployed on 2026-11-24, but production acceptance remains open. The
deployed version predates the same-origin API proxy and has only the `ASSETS` binding. Use
`npm run admin:deploy:check` before any later deployment, then `npm run admin:deploy` with the
approved shared `.env` values. The booking Worker must use the same Access team domain, AUD,
admin allowlist and tenant scope.

Deployed Access login, role restrictions, D1 read/edit/publish/rollback and browser evidence are
tracked in [admin-portal-gate2-acceptance.md](./admin-portal-gate2-acceptance.md). A local build
or configuration check does not close those items.

## 8. Deferred to later W1 issues

- W1.3 (COW-91): delivered. See [admin-portal-auth-rbac.md](./admin-portal-auth-rbac.md).
  Cloudflare Access session verification, logout, expiry, role matrix, CSRF and unauthorized
  states are in place; Booking Studio enablement remains separate.
- W1.4 (COW-92): App Router routes for the parity matrix, API client, and reuse of the domain
  panels. The destination wiring defect `D-01` is recorded in the parity audit.
- W1.5/W1.7: sync gates. W1.7 added the same-origin API proxy and deployment binding contract
  locally on 2026-11-24; production acceptance remains open.

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

## 10. Same-origin integration evidence, 2026-11-24

The authenticated API proxy, relative dashboard client and guarded deployment bindings were
implemented and verified locally. The command results and explicit production gaps are recorded
in [admin-portal-gate2-acceptance.md](./admin-portal-gate2-acceptance.md) §7. No deployment or
production setting was changed.
