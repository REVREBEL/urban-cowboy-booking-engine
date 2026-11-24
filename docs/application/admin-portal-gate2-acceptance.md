# COW-95 W1.7 Sync Gate 2: Admin Portal acceptance record

**Status: deployed admin integration verified; COW-112 remains In Progress.** COW-95 is
closed. COW-102 is Done. COW-111 is In Review and still has no confirmation of guest runtime
consumption from D1. No Gate 2 issue currently proves full production acceptance.

The Admin Portal now has a deployed same-origin server API proxy and operational bindings.
The first proxy deployment exposed Cloudflare error `1042` because the admin Worker fetched
the booking Worker on the same zone without `global_fetch_strictly_public`; that compatibility
flag is now deployed. Real Access login, direct section links, D1 read/edit/publish/rollback,
and invalid-token denial were observed on 2026-11-24. Deployed viewer-role and expired-token
checks, custom hostname routing, W3 D1 guest consumption and the residual-scope owner decision
remain open.

## 1. Deployed state recorded by COW-112

Worker `urban-cowboy-admin`, Version ID `38eb7d47-6c17-4409-ac3b-748ec5a16040`, account `REVREBEL`
(`4c154709ffe87621073f9ecfa86a57dd`), was deployed on 2026-11-24 at
https://urban-cowboy-admin.revrebel.workers.dev. The deployment uses the root
`npm run admin:deploy` wrapper and includes `ASSETS`, Access team/AUD, admin email allowlist,
tenant, booking API origin and request timeout. It enables `nodejs_compat` and
`global_fetch_strictly_public`; the latter is required for the server proxy to fetch the
same-zone booking Worker without Cloudflare error `1042`.

The booking Worker is deployed at version `3eaa8aaa-1ef5-4d58-8320-754e6d0a8ed4` with matching
Access team/AUD, admin allowlist and tenant bindings, D1, Mews values, all Webflow content IDs,
and all content-source flags set to `webflow`. No content flag was changed by COW-112.

Cloudflare Access application `Urban Cowboy React Admin`
(`5947dfdf-d0e0-4f0c-9556-4aee4b02942e`) protects the admin hostname. Its AUD
is `4bf8d1515fc028e57532548fc1687b5750d68f534a7d0cee0c1542cdf99a3255`. The allow policy includes
`gary@revrebel.io`. The application has no custom hostname or route.

### Deployed reachability and operation evidence

At 2026-11-24 21:31–21:33 UTC, after a real Cloudflare Access email-code login:

| Check | Observed result |
| --- | --- |
| `/admin` | Redirected to authenticated `/rooms` |
| `/api/health` | `{"status":"ok","app":"admin-app","apiBaseConfigured":true}` |
| `/rooms` | Loaded 22 D1 room types and the published Squarespace gallery registry |
| `/settings` | Loaded published/working site settings and revision history |
| `/hotspots`, `/amenities`, `/media` | Loaded their D1-backed panels without console errors |
| `GET /api/admin/rooms` through admin origin | Proxy forwarded the verified assertion and returned the 22-room D1 payload |
| D1 draft/publish | `enableFeatureSection` changed `false → true`; draft `r2` saved and published |
| D1 rollback | Selected `r1`; published/working settings returned to `enableFeatureSection=false` |
| Guest `/api/content/site-settings` | Remained `X-Content-Source: webflow` with `enableFeatureSection=false`; no guest cutover occurred |
| Missing / forged Access assertion on booking `/api/admin/rooms` | HTTP 401 `{"error":"unauthorized"}` |
| Desktop / mobile | `/rooms` rendered at 1101×830 and 390×844; navigation and panels remained usable |

Screenshots: `docs/generated/cow112/cow112-admin-rooms-desktop-2026-11-24T21-31-46-387.jpg`,
`docs/generated/cow112/cow112-admin-rooms-mobile-2026-11-24T21-31-50-695.jpg`, and
`docs/generated/cow112/cow112-admin-settings-desktop-2026-11-24T21-33-24-303.jpg`.

The earlier 15:28 UTC reachability results and the `84daddb3` binding snapshot are historical.
The first proxy deployment returned `error code: 1042`; the compatibility-flag correction and
successful re-test are recorded above.

## 2. W1 delivery chain

| Step | Issue / PR | State |
| --- | --- | --- |
| W1.1 source inventory / parity matrix | COW-89; `docs/application/admin-portal-parity-matrix.md` | Done; 90 capability IDs |
| W1.2 foundation | COW-90 / PR #395 | Merged; `admin-app` vinext npm workspace |
| W1.3 auth/session/RBAC | COW-91 / PR #397 | Merged; Access verifier reuse, capability matrix, CSRF |
| W1.4 route port | COW-92 / PR #400 | Merged; 12 App Router sections, panel reuse |
| W1.5 Gate 1 | COW-93 / PR #405 | Done with COW-100/107 |
| W1.6 parity + D1 workflows | COW-94 / PR #409 | Merged; reopened for residual scope |
| W1.7 Gate 2 | COW-95 | **Done**; COW-112 remains In Progress for residual deployed evidence |
| Deployment evidence | COW-112 / PR #432 + compatibility-flag follow-up | **In Progress**; proxy/bindings deployed, Access and D1 E2E observed, viewer/expired-token/custom-route evidence open |

## 3. W1 acceptance checks

| Requirement | Local evidence | Deployed evidence |
| --- | --- | --- |
| Production Next.js admin deployed at agreed route | `npm run admin:build` passes; config names `urban-cowboy-admin` | **Partial**. Worker and `workers.dev` URL are deployed with proxy/bindings; no agreed custom hostname/route. |
| Auth, sessions and roles verified in deployed environment | Auth and proxy tests pass; server route verifies session before forwarding | **Partial**. Real admin Access login, direct links and invalid-token denial observed; viewer role and expired-token checks remain open. |
| Parity matrix fully closed with evidence | All 90 IDs have a status; residuals listed in §4 | W2/W3 sign-off on residual scope is still required. |
| Content writes, publish, rollback and media use shared D1 | Domain panels use relative APIs; server proxy forwards the verified assertion; Worker owns revision/audit/rollback | **Partial**. Settings draft `r2` → publish → rollback `r1` observed; remaining panel write coverage is assigned to COW-94, and guest D1 consumption remains open. |
| No Astro / Webflow CMS write dependency in admin target | `admin-app/package.json` has no Astro/Webflow dependency; no CMS token is read by the admin app | **Verified for the built target**. Legacy `dashboard.html` remains for rollback only. |

## 4. Residual scope carried into acceptance

From `docs/application/admin-portal-parity-closeout.md`:

- Generic field-driven editor UI for SRC-08/09/10/34/35/44/45. The Worker editor API exists; the
  browser UI does not. The product owner must choose implementation or retirement with rationale.
- Webflow utility tooling for SRC-29/30/31/32/68/70/71. Alt-text export/import, image upload and
  the Mews sync trigger need the product-owner scope decision D7.
- Reverse amenity editor and bespoke section layouts for SRC-51/52.
- Deployed responsive/keyboard review and E2E authorization evidence.

These items are documented and unresolved. A green CI run does not close them.

## 5. Cross-workstream confirmations

- **W2 / COW-102, Done.** `docs/generated/w2-6-production-reconciliation.md` and
  `docs/application/w2-7-gate-2-evidence.md` record all 12 migrations, exact editorial counts,
  stable media master IDs, published snapshots and the ID-only Mews reference contract. This is
  a data-contract confirmation, not deployed Admin Portal acceptance.
- **W3 / COW-111, In Review.** `docs/application/w3-gate2-readiness.md` and proposed PR #425
  record that the booking Worker has none of the five content-source flags or Webflow content
  IDs. Guest content endpoints return defaults, and `/api/content/site-settings` reports
  `X-Content-Source: webflow`. There is no W3 confirmation of guest runtime consumption.
- **W1 / COW-95, In Review.** The local same-origin proxy removes the cross-origin Access-cookie
  defect. The proxy and binding contract still need deployment, real identity checks and
  controlled D1 operation evidence.

## 6. Gate 2 acceptance checklist

- [x] W1 code delivered via merged PRs with review approvals.
- [x] Source parity matrix and residual scope documented with evidence.
- [x] W2 confirms D1 parity and media integrity.
- [x] Gate 2 issues cross-reference the same evidence documents.
- [x] Deployed admin URL and authenticated admin browser evidence attached. The proxy/bindings are deployed; `/admin`, direct sections and desktop/mobile `/rooms` were exercised.
- [ ] Deployed auth/RBAC and role-restriction tests pass. Admin login and invalid-token denial are observed; viewer-role and expired-token checks remain open.
- [ ] Admin read/edit/publish/rollback E2E across the required panels is recorded and reverted safely. Settings draft/publish/rollback passed; remaining panel writes are assigned to COW-94 for coverage rather than claimed here.
- [ ] W3 confirms guest runtime consumption from published D1.
- [ ] Residual scope in §4 is acknowledged or closed by the product owner.

**Not claimed:** full production acceptance, complete panel write parity or W1 closeout. COW-112 stays open until the remaining evidence is recorded.

## 7. Local verification record, 2026-11-24

| Command | Result |
| --- | --- |
| `node --test tests/adminApiProxy.test.ts tests/adminProxyAccessIntegration.test.ts tests/adminDeployConfig.test.ts tests/adminAppFoundation.test.ts tests/adminRoutes.test.ts tests/adminAuth.test.ts tests/dashboardAccessIntegration.test.ts` | 35 passed, 0 failed |
| Compatibility-flag regression | `adminAppFoundation.test.ts` asserts `global_fetch_strictly_public`; deployed proxy re-test returned the D1 room payload instead of error `1042` |
| `npm run admin:typecheck` | Pass |
| `npm run typecheck` | Pass |
| `npm run admin:build` | Pass; route table includes `λ /api/:path+` |
| `node --check scripts/deploy-admin.mjs` | Pass |
| `npm run lint:controls` | Pass; no new overrides. The checker emitted existing ambiguous `origin/main` warnings. |
| Client asset scan | No `API_BASE_URL`, booking Worker origin or Access assertion name in built client assets |
| Local dev smoke on `localhost:4199` | `/api/health` 200, `/api/admin/rooms` 401, `/rooms` 307 to `/login?next=%2Frooms`; all responses `no-store, private` |
| Read-only Cloudflare settings and Access application checks | Admin has only `ASSETS`; booking Worker lacks Access/RBAC/tenant bindings; Access app and AUD confirmed |

The tests cover allowed API paths, session-gated route wiring, same-origin mutation checks,
assertion forwarding, credential stripping, upstream failures, redirect rejection, relative
browser calls and deployment-config validation. A signed-JWT integration suite exercises valid
admin/viewer assertions and expired, wrong-audience, wrong-issuer and forged assertions through
both the admin verifier and the booking Worker authorizer. The tests do not exercise the deployed
Access edge or production D1.

## 8. Required production closeout

1. ~~Approve the admin hostname, Access team/AUD, admin allowlist, tenant and booking API origin.~~
   Approved values were deployed through the guarded wrapper; a custom hostname is still open.
2. ~~Deploy the admin Worker and matching Access/RBAC/tenant bindings on the booking Worker.~~
   Both are deployed; the admin proxy required `global_fetch_strictly_public` to avoid error `1042`.
3. Record a real Access login, invalid/expired token behavior, viewer/admin restrictions,
   authenticated refresh and direct section links at desktop and mobile viewports. Admin login,
   invalid-token denial, direct links and desktop/mobile rendering are recorded; viewer and
   expired-token checks remain.
4. Run controlled D1 read/edit/publish/rollback operations through the Admin Portal, capture the
   guest published read and restore the original state. Settings passed and was restored; the
   guest read correctly remained Webflow because no content flag was changed. Remaining panel
   write coverage is assigned to COW-94.
5. Record W3 D1 content consumption, Mews regression evidence and Webflow runtime retirement.
6. Record the product-owner decision on the residual scope in §4.

The deployment task changed only the admin Worker version/settings and the compatibility flag.
It did not change booking content flags, Mews configuration, Access policy or production content
except the controlled settings revision that was rolled back to `r1`.
