# COW-95 W1.7 Sync Gate 2: Admin Portal acceptance record

**Status: local integration implemented, production acceptance NOT accepted.** COW-95 is In
Review. COW-112 was reopened to In Progress because its required Access and D1 E2E evidence does
not exist. COW-102 is Done. COW-111 is In Review and has no confirmation of guest runtime
consumption. No Gate 2 issue currently proves production acceptance.

The Admin Portal now has a same-origin server API proxy and a guarded deployment binding
contract in source. Those changes were verified locally on 2026-11-24 and have not been deployed.
Real Access/JWT checks, browser evidence, D1 publish/rollback E2E, W3 cutover evidence and the
residual-scope owner decision remain open.

## 1. Deployed state recorded by COW-112

Worker `urban-cowboy-admin`, Version ID `84daddb3-9bf0-4b21-b159-077e65ea2b13`, account `REVREBEL`
(`4c154709ffe87621073f9ecfa86a57dd`), was deployed on 2026-11-24 at
https://urban-cowboy-admin.revrebel.workers.dev. The deployment used the earlier
`npm run admin:deploy` command. It contains only the `ASSETS` binding and predates the local
same-origin proxy.

Cloudflare Access application `Urban Cowboy React Admin`
(`5947dfdf-d0e0-4f0c-9556-4aee4b02942e`) was created at 15:35 UTC for the same hostname. Its AUD
is `4bf8d1515fc028e57532548fc1687b5750d68f534a7d0cee0c1542cdf99a3255`. The allow policy includes
`gary@revrebel.io`. The application has no custom hostname or route.

A read-only Cloudflare settings check on 2026-11-24 confirmed:

| Worker | Bindings present | Bindings absent for Gate 2 |
| --- | --- | --- |
| `urban-cowboy-admin` | `ASSETS` | Access team/AUD, role allowlists, tenant, `API_BASE_URL` |
| `urban-cowboy-booking-engine` | `ADMIN_TOKEN`, `ASSETS`, `CALENDAR_CACHE`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, `DB`, Mews values, `WEBFLOW_CMS_API_TOKEN` | Access team/AUD, role allowlists, tenant, content-source flags, Webflow site/collection/item IDs |

`ADMIN_TOKEN` is a legacy secret and is not used for authorization. The booking Worker cannot
verify the admin assertion until its Access, role and tenant bindings are deployed.

### Deployed reachability evidence

At 15:28 UTC, before the Access application existed, COW-112 observed `/api/health` 200,
`/login` 200, admin sections 307 to `/login?next=...`, and `/api/auth/session` 401. Those results
described the earlier unprotected deployment and are historical.

At 15:49 UTC, after Access was configured, unauthenticated requests to `/api/health`, `/login`,
`/api/auth/session` and `/rooms` all returned the Cloudflare Access sign-in page with status 200.
This confirms that the edge application is active. It does not exercise the Admin Portal session,
role or API code. Authenticated browser evidence is still pending.

## 2. W1 delivery chain

| Step | Issue / PR | State |
| --- | --- | --- |
| W1.1 source inventory / parity matrix | COW-89; `docs/application/admin-portal-parity-matrix.md` | Done; 90 capability IDs |
| W1.2 foundation | COW-90 / PR #395 | Merged; `admin-app` vinext npm workspace |
| W1.3 auth/session/RBAC | COW-91 / PR #397 | Merged; Access verifier reuse, capability matrix, CSRF |
| W1.4 route port | COW-92 / PR #400 | Merged; 12 App Router sections, panel reuse |
| W1.5 Gate 1 | COW-93 / PR #405 | Done with COW-100/107 |
| W1.6 parity + D1 workflows | COW-94 / PR #409 | Merged; reopened for residual scope |
| W1.7 Gate 2 | COW-95 | **In Review**; local proxy and binding contract verified, deployed acceptance open |
| Deployment evidence | COW-112 / PR #423 | **Reopened to In Progress**; Worker deployed, Access and D1 E2E missing |

## 3. W1 acceptance checks

| Requirement | Local evidence | Deployed evidence |
| --- | --- | --- |
| Production Next.js admin deployed at agreed route | `npm run admin:build` passes; config names `urban-cowboy-admin` | **Partial**. Worker and `workers.dev` URL exist. No agreed custom hostname/route, and the deployed version predates the proxy. |
| Auth, sessions and roles verified in deployed environment | Auth and proxy tests pass; server route verifies session before forwarding | **Partial**. Access edge sign-in observed. Real JWT, expiry, viewer/admin restrictions and authenticated refresh are not exercised. |
| Parity matrix fully closed with evidence | All 90 IDs have a status; residuals listed in §4 | W2/W3 sign-off on residual scope is still required. |
| Content writes, publish, rollback and media use shared D1 | Domain panels use relative APIs; server proxy forwards the verified assertion; Worker owns revision/audit/rollback | **Not run**. Admin API and booking Worker bindings are absent, so no deployed create/edit/publish/rollback or guest read exists. |
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
- [ ] Deployed admin URL and authenticated browser evidence attached. The URL and deployment ID
  are recorded, but the deployed version lacks the proxy and no authenticated screenshots exist.
- [ ] Deployed auth/RBAC and role-restriction tests pass. The Access application exists, but the
  team/AUD, role and tenant bindings are absent on both Workers.
- [ ] Admin read/edit/publish/rollback E2E against shared D1 is recorded and reverted safely.
- [ ] W3 confirms guest runtime consumption from published D1.
- [ ] Residual scope in §4 is acknowledged or closed by the product owner.

**Not claimed:** production acceptance, full parity or W1 closeout. COW-95 stays open until all
five unchecked items are closed.

## 7. Local verification record, 2026-11-24

| Command | Result |
| --- | --- |
| `node --test tests/adminApiProxy.test.ts tests/adminDeployConfig.test.ts tests/adminAppFoundation.test.ts tests/adminRoutes.test.ts tests/adminAuth.test.ts tests/dashboardAccessIntegration.test.ts` | 32 passed, 0 failed |
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
browser calls and deployment-config validation. They do not exercise a real Access identity,
the deployed Workers or production D1.

## 8. Required production closeout

1. Approve the admin hostname, Access team/AUD, admin allowlist, tenant and booking API origin.
2. Deploy the admin Worker through `npm run admin:deploy` and deploy matching Access/RBAC/tenant
   bindings on the booking Worker.
3. Record a real Access login, invalid/expired token behavior, viewer/admin restrictions,
   authenticated refresh and direct section links at desktop and mobile viewports.
4. Run controlled D1 read/edit/publish/rollback operations through the Admin Portal, capture the
   guest published read and restore the original state.
5. Record W3 D1 content consumption, Mews regression evidence and Webflow runtime retirement.
6. Record the product-owner decision on the residual scope in §4.

The local implementation task made no deployment, binding edit, Access change, content-flag
change or production-data write.
