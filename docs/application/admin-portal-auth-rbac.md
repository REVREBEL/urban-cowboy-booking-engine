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
| `API_BASE_URL` | Shared Worker origin for W1.4 API calls |

All are read from `process.env` on the server and fail closed when absent. Before a Cloudflare
deployment, W3 must declare the non-secret values as Worker text bindings; the deploy is not
part of this issue.

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

## 8. Deferred

- W1.4: per-handler capability enforcement on all data APIs, role-aware navigation, and CSRF on
  every mutation route (not just logout).
- W3: bind the Access variables and coordinate the app's route/Access policy.
