# COW-95 — W1.7 Sync Gate 2: Admin Portal acceptance record

**Status: prepared, NOT accepted.** W1.7 is the final shared checkpoint with COW-102 (W2.7) and
COW-111 (W3.7). COW-102 is Done, but COW-111 was reopened to In Progress on 2026-11-24 and COW-95
is In Review — no Gate 2 issue currently proves production acceptance. Cross-references below are
evidence pointers only; neither issue status nor a linked document establishes deployed acceptance,
because no deployed live evidence exists for W1 or W3. The deployed URL, real Access/JWT checks,
publish/rollback E2E and residual-scope decisions remain open. Local W1 evidence was re-verified
on 2026-11-24 (§6). Final acceptance requires all three streams to pass together.

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
| Production Next.js admin deployed at agreed route | `npm run admin:build` passes; `admin-app/cloudflare.config.ts` names `urban-cowboy-admin` | **Missing** — no preview/production deploy or URL recorded (Gate 1 D1) |
| Auth, sessions, roles verified in deployed environment | 7 auth tests + 32 combined auth/route tests pass; dev smoke: 401 session, 307 to `/login` | **Missing** — real Access JWT against team JWKS not exercised |
| Parity matrix fully closed with evidence | All 90 IDs have a status; residuals listed in §3 | W2/W3 sign-off on residual scope still required |
| Content writes/publish/rollback/media use shared D1 | Domains panels call Worker APIs; editor API is Worker-side with revision/audit/rollback | Browser E2E of create → publish → rollback not run |
| No Astro / Webflow CMS write dependency in admin target | `admin-app/package.json` has no astro/webflow deps; no CMS token read by admin app | Confirm at deploy; legacy `dashboard.html` remains for rollback only |

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
- [x] W2 confirms D1 parity and media integrity (explicit confirmation on COW-95; evidence in §4). This is a data-contract confirmation, not deployed acceptance.
- [ ] W3 confirms guest runtime consumption — **not granted**: COW-111 is In Progress and its record has no live evidence.
- [x] Gate 2 issues cross-reference the same evidence documents (§4) — pointers only, not proof of acceptance.
- [ ] Deployed admin URL and browser evidence attached — **blocked**: no `urban-cowboy-admin` Worker deployed; deployment decision/credentials required.
- [ ] Deployed auth/RBAC and role-restriction tests pass — needs real Access JWT against team JWKS.
- [ ] Admin write/publish/rollback E2E against shared D1 recorded — browser E2E not run.
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
| Cloudflare account worker list (REVREBEL) | `urban-cowboy-booking-engine` present; no `urban-cowboy-admin` Worker |

These confirm the code and local contracts only. No deployment, flag flip or production write was
performed as part of this record.
