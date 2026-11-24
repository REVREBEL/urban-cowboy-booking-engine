# COW-95 — W1.7 Sync Gate 2: Admin Portal acceptance record

**Status: deployment complete, acceptance evidence still partial.** W1.7 is the final shared
checkpoint with COW-102 (W2.7, Done) and COW-111 (W3.7, currently In Progress); COW-95 is In
Review and its child COW-112 owns the deployed verification. Final acceptance requires all three
to be complete together.

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
| W1.7 Gate 2 | COW-95 | **Not complete** — this record is preparation only |

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

## 4. Cross-workstream confirmations required

- W2/COW-102: signed-off reconciliation counts, media master IDs, published snapshots and revision data; confirmation that the admin forms/APIs match the D1 contract (Gate 1 D4).
- W3/COW-111: guest runtime consumes published D1 data; ARI remains Mews-direct; admin-write boundary and AUD/team domain match the admin app's verification inputs (Gate 1 D2/D3/D5).
- W1: deployed admin URL + browser evidence (see §2), plus acknowledgment of the residual scope in §3.

## 5. Gate 2 acceptance checklist

- [x] W1 code delivered via merged PRs with green CI and review approvals.
- [x] Source parity matrix and residual scope documented with evidence.
- [x] Deployed admin URL and deployment identifier recorded (COW-112; see §Deployed reachability record). Browser screenshots still pending.
- [ ] Deployed auth/RBAC and role-restriction tests pass (Access team/AUD not configured yet).
- [ ] Admin write/publish/rollback E2E against shared D1 recorded (`API_BASE_URL` not configured yet).
- [x] W2 confirms D1 parity and media integrity (COW-102 Done).
- [ ] W3 confirms guest runtime consumption (COW-111 currently In Progress).
- [ ] All three Gate 2 issues cross-reference the same evidence and are complete.

**Not claimed:** production acceptance, full parity, or W1 closeout. This record exists so the
joint gate has W1's evidence in one place; COW-95 must stay open until the checklist is complete.
