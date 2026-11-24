# COW-91 — Admin Portal authentication, sessions and RBAC (W1.3)

**Status:** implemented locally and verified. No new auth provider was introduced; the admin
app reuses the booking-engine Worker's Cloudflare Access verifier and role derivation.

## 1. Source reconciliation

The source Astro portal had **no authentication, session or RBAC** (`docs/generated/w1-astro-source-inventory.md`,
SRC-84): its middleware was a DEV-only readiness probe and every `/api/cms/*` proxy used a
shared server-side Webflow token. This work is therefore a new requirement, not a port. The
destination already had a verified Access + roles foundation in `worker/access.ts` and
`worker/auth.ts`; that foundation is reused unchanged in behavior.

## 2. Identity and session flow

```
Cloudflare Access (sign-in, MFA, session, logout)
   → injects cf-access-jwt-assertion (Bearer accepted for service setups)
   → admin-app/lib/session.ts calls worker/access.ts verifyAccessJwt()
   → worker/auth.ts principalFromClaims() derives viewer/admin + tenantId
   → AdminSession (email, roles, tenantId, exp)
   → server layout / route handlers authorize capabilities
```

- **No local session store, cookie or password flow.** Access owns the session lifecycle;
  token expiry (`exp`, `nbf`), issuer and audience are verified by the shared verifier. Every
  verification failure returns null and fails closed.
- `admin-app/lib/auth.ts` holds pure, testable logic (role derivation, capability map, public
  session shape, same-origin CSRF check). `admin-app/lib/session.ts` is the thin server-only
  request binding that reads `next/headers` and performs verification. Neither module ever
  returns token material to the browser.
- Booking Studio enablement is not read anywhere in this path; it stays a separate runtime
  concern (W3).

## 3. Capability matrix

| Capability | Required role | Intended use |
| --- | --- | --- |
| `read` | viewer | Any admin page or read API |
| `edit` | admin | Field/content mutations |
| `publish` | admin | Publish/rollback actions |
| `settings` | admin | Site settings and runtime flags |
| `destructiveMedia` | admin | Media deletion/replacement actions |

`viewer` is the baseline for any verified principal; `admin` is added by an allowlisted email
(`ADMIN_EMAILS`) or Access group (`ADMIN_GROUPS`). A caller-supplied `?tenant=` or client header
cannot grant a role or change scope.

## 4. Route protection

- `admin-app/proxy.ts` performs a cheap UX redirect for page requests with no assertion. It
  does **not** verify the JWT and is not the trust boundary.
- `admin-app/app/(admin)/layout.tsx` is authoritative for pages: it calls `getAdminSession()`
  and redirects to `/login?next=…` when the session is missing. It renders the email and an
  admin badge only after verification.
- `/api/auth/session` returns the public session shape or `401`; `/api/auth/logout` requires an
  explicit same-origin `Origin` header for the POST (CSRF) and redirects to the Access logout
  endpoint with a fixed `redirect_uri` derived from the request origin. A missing/invalid team
  domain fails closed with `503`.
- W1.4 will repeat `can(session, capability)` and same-origin checks inside every data-mutating
  App Router handler; UI hiding is never the authorization boundary.

## 5. Environment contract

| Name | Purpose |
| --- | --- |
| `CF_ACCESS_TEAM_DOMAIN` | Access tenant host used for issuer/JWKS and logout URL |
| `CF_ACCESS_AUD` | Expected Access application AUD |
| `ADMIN_EMAILS`, `ADMIN_GROUPS` | Admin role allowlists |
| `TENANT_ID` | Server-side tenant scope (never taken from the request) |
| `API_BASE_URL` | Booking Worker origin used only by the server-side API proxy |
| `API_REQUEST_TIMEOUT_MS` | Server proxy deadline, default `8000` |

The Access, role, tenant and API values are required for production. `ADMIN_GROUPS` and
`API_REQUEST_TIMEOUT_MS` are optional. Missing or malformed required values fail closed.
`cloudflare.config.ts` declares the nonsecret text bindings, and `npm run admin:deploy` loads
them through the guarded root deployment wrapper. The booking Worker must use the same Access
team domain, AUD, admin allowlist and tenant scope.

## 6. Files

```
admin-app/lib/auth.ts                         pure session/role/CSRF logic
admin-app/lib/session.ts                      server request binding (verifier reuse)
admin-app/app/(admin)/layout.tsx              protected shell
admin-app/app/login/page.tsx                  unauthorized/sign-in state
admin-app/components/SignOutButton.tsx        same-origin form POST
admin-app/app/api/auth/session/route.ts       GET session
admin-app/app/api/auth/session-response.ts    testable response builder
admin-app/app/api/auth/logout/route.ts        POST Access logout
admin-app/app/api/[...path]/route.ts           verified same-origin API proxy
admin-app/lib/api-proxy.ts                     path, CSRF and assertion forwarding boundary
admin-app/proxy.ts                            UX redirect + no-store policy
worker/access.ts                              type-only BufferSource fix for dual tsconfigs
tests/adminAuth.test.ts                       7 tests
```

## 7. Verification evidence (local, 2026-11-23)

| Check | Result |
| --- | --- |
| `node --test tests/adminAuth.test.ts tests/adminAppFoundation.test.ts tests/auth.test.ts` | 22/22 pass |
| `npm run admin:typecheck` / `npm run typecheck` | pass |
| `npm run admin:build` | pass — routes `/`, `/login`, `api/health`, `api/auth/session`, `api/auth/logout` |
| `npm run lint:controls` | pass — no new control overrides |
| Local dev smoke (no Access configured) | `/api/health` 200, `/api/auth/session` 401, `/` 307 → `/login?next=%2F`, `/login` 200 |

A real Access JWT against the configured team/JWKS and a deployed preview were not exercised
here; those require the owner-provided environment described in §5.

## 8. Same-origin API integration

W1.7 replaced direct browser calls to the booking Worker with a server-side proxy. The browser
calls relative `/api/*` paths on the admin origin. The catch-all route verifies the Access
session, requires a same-origin `Origin` for mutations and forwards only dashboard API families.
It sends the verified assertion to the booking Worker and strips browser cookies, authorization
and client-supplied assertion headers. Worker authorization remains authoritative.

The production `API_BASE_URL` is pinned to the Urban Cowboy booking Worker origin. Both Workers
must use the admin Access application's AUD, and the booking Worker must remain outside a
different Access application. If that changes, replace assertion forwarding with a service
binding that verifies end-user identity independently. The proxy rejects upstream redirects, so
an unexpected Access edge fails closed instead of forwarding the assertion elsewhere.

## 9. Deferred

- W3 must deploy matching Access/RBAC/tenant bindings on both Workers and record real Access,
  browser and D1 publish/rollback evidence for Gate 2.
