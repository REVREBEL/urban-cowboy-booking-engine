# COW-95 — W1.7 Sync Gate 2: Admin Portal acceptance record

**Status: deployment complete, acceptance NOT accepted.** W1.7 is the final shared checkpoint with
COW-102 (W2.7, Done) and COW-111 (W3.7, reopened to In Progress on 2026-11-24); COW-95 is In Review
and its child COW-112 owns the deployed verification. No Gate 2 issue currently proves production
acceptance. Cross-references below are evidence pointers only; neither issue status nor a linked
document establishes acceptance. Real Access/JWT checks, publish/rollback E2E and residual-scope
decisions remain open. Local W1 evidence was re-verified on 2026-11-24 (§6). Final acceptance
requires all three streams to pass together.

**Deployed 2026-11-24 (COW-112):** Worker `urban-cowboy-admin`, Version ID
`84daddb3-9bf0-4b21-b159-077e65ea2b13`, account `REVREBEL`
(`4c154709ffe87621073f9ecfa86a57dd`), URL
`https://urban-cowboy-admin.revrebel.workers.dev`. Deployment method: `npm run admin:deploy`
(vinext Cloudflare deploy via `cf`). Only the `ASSETS` binding is present — Access variables and
`API_BASE_URL` are not configured yet, so the app fails closed to `/login`.

## 1. W1 delivery chain (evidence)

| Step | Issue / PR | State |
| --- | --- | --- |
| W1.1 source inventory / parity matrix | COW-89; `docs/application/admin-portal-parity-matrix.md` | Done; 90 capability IDs |
| W1.2 foundation | COW-90 / PR #395 | Merged; `admin-app` vinext npm workspace |
| W1.3 auth/session/RBAC | COW-91 / PR #397 | Merged; Access verifier reuse, capability matrix, CSRF |
| W1.4 route port | COW-92 / PR #400 | Merged; 12 App Router sections, panel reuse |
| W1.5 Gate 1 | COW-93 / PR #405 | Done with COW-100/107 |
| W1.6 parity + D1 workflows | COW-94 / PR #409 | Merged; D1-backed sections, field mapping, `/admin` routes |
| W1.7 Gate 2 | COW-95 | **In Progress (reopened)** — local evidence re-verified; deployed evidence still missing |

## 2. W1 acceptance checks

| Requirement | Local evidence | Deployed evidence |
| --- | --- | --- |
| Production Next.js admin deployed at agreed route | `npm run admin:build` passes; `admin-app/cloudflare.config.ts` names `urban-cowboy-admin` | **Deployed** — Worker + Version ID + URL recorded above; no custom hostname/route yet |
| Auth, sessions, roles verified in deployed environment | 7 auth tests + 32 combined auth/route tests pass; dev smoke: 401 session, 307 to `/login` | **Partial** — unauthenticated 401/307 verified at deployed URL; real Access JWT/roles not exercised (Access not configured) |
| Parity matrix fully closed with evidence | All 90 IDs have a status; residuals listed in §3 | W2/W3 sign-off on residual scope still required |
| Content writes/publish/rollback/media use shared D1 | Domain panels call Worker APIs; editor API is Worker-side with revision/audit/rollback | **Not run** — no `API_BASE_URL`, no browser E2E of create → publish → rollback |
| No Astro / Webflow CMS write dependency in admin target | `admin-app/package.json` has no astro/webflow deps; no CMS token read by admin app | **Verified at build/deploy** — deployed bundle is the vinext Worker; legacy `dashboard.html` remains for rollback only |

### Deployed reachability record (2026-11-24, no Access configured)

`GET https://urban-cowboy-admin.revrebel.workers.dev`:

| Path | Result |
| --- | --- |
| `/api/health` | 200, body `{"status":"ok","app":"admin-app","apiBaseConfigured":false}`, `cache-control: no-store, private` |
| `/login` | 200 HTML, `cache-control: no-store, private` |
| `/`, `/admin`, `/admin/rooms`, `/rooms`, `/settings`, `/hotspots`, `/amenities`, `/media` | 307 → `/login?next=<encoded path>` (edge UX guard) |
| `/api/auth/session` | 401 `{"authenticated":false}` |

Boundary: with no Access team/AUD bindings, `getAdminSession()` fails closed, so the `/admin →
/rooms` redirect and authorized panel rendering cannot yet be observed on the deployed Worker.
That behavior is verified only by local tests and dev smoke until Access is configured.

## 3. Residual scope carried into acceptance (do not silently drop)

From `docs/application/admin-portal-parity-closeout.md`:

- Generic field-driven editor UI (SRC-08/09/10/34/35/44/45): Worker editor API exists; browser UI does not. Needs an explicit owner decision — implement in W1.6 follow-up or retire with rationale.
- Webflow utility tooling (SRC-29/30/31/32/68/70/71): alt-text export/import, image upload, Mews sync trigger — product-owner scope decision D7.
- Reverse amenity editor and bespoke section layouts (SRC-51/52): P1.
- Deployed responsive/keyboard review and E2E authorization evidence.

These are documented, not resolved. A green CI run does not prove deployed browser/Access integration.

## 4. Cross-workstream confirmations

- **W2 / COW-102 — Done, evidence recorded**: `docs/generated/w2-6-production-reconciliation.md`
  and `docs/application/w2-7-gate-2-evidence.md` record all 12 migrations, exact editorial counts,
  stable media master IDs, published snapshots and the ID-only Mews reference contract. W2
  explicitly notes that issue status is not acceptance and that deployed W1/W3 evidence is still
  missing.
- **W3 / COW-111 — In Progress (reopened 2026-11-24)**: `docs/application/w3-gate2-readiness.md`
  records the W3 deliverable status and live-verification checklist, but explicitly states that
  content flags remain at Webflow defaults, no Webflow runtime has been removed, and no live booking
  evidence exists. There is **no W3 confirmation of guest runtime consumption** to accept here.
- **W1 — still required**: deployed admin URL + browser evidence (§2), acknowledgment of the
  residual scope in §3, and the three open checklist items in §5. Note: the REVREBEL Cloudflare
  account was queried on 2026-11-24 and contains `urban-cowboy-booking-engine` but **no
  `urban-cowboy-admin` Worker**, so there is no deployed admin origin to evidence yet.

## 5. Gate 2 acceptance checklist

- [x] W1 code delivered via merged PRs with green CI and review approvals.
- [x] Source parity matrix and residual scope documented with evidence.
- [ ] Deployed admin URL and browser evidence attached — URL and deployment ID recorded (COW-112); browser screenshots still pending.
- [ ] Deployed auth/RBAC and role-restriction tests pass — Access team/AUD not configured yet; real JWT against team JWKS not exercised.
- [ ] Admin write/publish/rollback E2E against shared D1 recorded — `API_BASE_URL` not configured yet; browser E2E not run.
- [x] W2 confirms D1 parity and media integrity (explicit confirmation on COW-95; evidence in §4). This is a data-contract confirmation, not deployed acceptance.
- [ ] W3 confirms guest runtime consumption — **not granted**: COW-111 is In Progress and its record has no live evidence.
- [x] Gate 2 issues cross-reference the same evidence documents (§4) — pointers only, not proof of acceptance.
- [ ] Residual scope in §3 acknowledged/closed by the product owner.

**Not claimed:** production acceptance, full parity, or W1 closeout. Local verification (§6) does
not substitute for deployed evidence. COW-95 stays open (currently In Review) until the five open
items are closed.

## 6. Local verification record — 2026-11-24

| Command | Result |
| --- | --- |
| `npm run admin:build` | Build complete; routes include `/api/auth/session`, `/api/health`, `/login` |
| `npm run admin:typecheck` | Pass (`admin-app` `tsc --noEmit`) |
| `node --test tests/adminAppFoundation.test.ts tests/adminAuth.test.ts tests/adminRoutes.test.ts tests/auth.test.ts tests/dashboardAccessIntegration.test.ts` | 29 passed, 0 failed |
| Cloudflare account worker list (REVREBEL) | `urban-cowboy-booking-engine` and the deployed `urban-cowboy-admin` Worker (COW-112) are present |

These confirm the code and local contracts only. The deployed Worker was recorded separately by
COW-112 (§2); this record performed no deployment, flag flip or production write.
