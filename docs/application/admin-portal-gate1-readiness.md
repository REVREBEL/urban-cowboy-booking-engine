# COW-93 — W1.5 Sync Gate 1: Admin app readiness record

**Status: prepared locally, NOT complete.** W1's evidence and contracts are recorded here, but
Gate 1 is joint with COW-100 (W2.5, currently Backlog) and COW-107 (W3.5, currently In Review).
W1.6/W2.6/W3.6 must not start until all three issues are complete. Do not treat this document
as Gate 1 acceptance: it explicitly lists what is still missing.

Date: 2026-11-23. Workstream: W1 — Admin Portal (Astro → Cloudflare Next.js).

## 1. W1 deliverables and evidence

| Deliverable | Evidence | State |
| --- | --- | --- |
| Source inventory / parity matrix | `docs/generated/w1-astro-source-inventory.md`, `docs/generated/w1-react-dashboard-audit.md`, `docs/application/admin-portal-parity-matrix.md` (90 capabilities) | Complete |
| Cloudflare Next.js foundation (COW-90) | `admin-app/` vinext App Router workspace, PR #395 merged; `docs/application/admin-portal-nextjs-foundation.md` | Complete locally; **preview deploy pending** |
| Auth/session/RBAC (COW-91) | PR #397 merged; `docs/application/admin-portal-auth-rbac.md`; 7 dedicated tests | Complete locally; real Access JWT pending |
| Route/workflow port (COW-92) | PR #400 merged; `docs/application/admin-portal-route-port.md`; 5 dedicated tests | Complete locally; live API calls pending |
| Build/test evidence | CI green on PR #400 (`validate` ×2, GitGuardian, Kilo); locally 552/552 non-browser tests and 566/566 in CI after the final head | See §6 |
| Preview URL | **not yet attached** — no Cloudflare deploy was performed; auth and Worker routing decisions required | Open |

## 2. Route contract offered by W1

All twelve sections from `src/dashboard/navigation.ts` are App Router paths under `/(admin)`:

| Capability | Routes | Panels reused |
| --- | --- | --- |
| `read` (viewer) | `/media`, `/rates`, `/policies`, `/events`, `/add-ons`, `/upgrades`, `/recovery`, `/analytics` | `EventsCalendarPanel`; others are explicit placeholders tracked to W1.6 |
| `edit` (admin) | `/rooms`, `/hotspots`, `/amenities` | `RoomPhotosPanel`, `RoomHotspotsPanel`, `RoomAmenitiesPanel` |
| `settings` (admin) | `/settings` | `SiteSettingsPanel` |

Unknown segments return 404; every page is guarded by a verified server session before any
content is loaded. Navigation metadata and route ids are shared with the delivered dashboard,
so the legacy `dashboard.html` remains a rollback path.

## 3. API contract consumed from W2

The admin app adds no data API of its own. All reads and writes go through the existing Worker
routes; the browser client is the shared `createDashboardApi()` with only the origin adapted:

- Editorial drafts/publishing: `GET/POST /api/content/editor/items`, `GET/PATCH .../items/:id`,
  `POST .../items/:id/{publish,rollback}`. Draft isolation, two revision pointers, optimistic
  locking (`409 edit_conflict`), audit rows and rollback are enforced by the Worker.
- Rooms/media: `GET /api/admin/rooms`, `.../:id/photos`, `GET /api/admin/media`.
- Hotspots (COW-34/81): `GET/POST /api/admin/rooms/:id/hotspots`, `PATCH/DELETE .../:mappingId`,
  `POST .../hotspots/{publish,rollback,plan,apply}`.
- Amenities (COW-73): `GET /api/admin/amenities`, `GET /api/admin/rooms/:id/amenities`; writes use
  the editorial editor API.
- Settings/events: `GET /api/admin/site-settings`, `/api/content/events`, `.../preview`,
  `.../venues`, `.../occurrences`.
- W1 does **not** add direct Webflow writes or duplicate domain logic.

**Origin rule:** empty `API_BASE_URL` → relative `/api` (same-origin); a non-empty value must be
an absolute `http(s)` origin with no path/query/fragment, and the browser sends credentials.
Cross-origin cookie/CORS/service-binding routing is a W3 decision (§5).

## 4. Auth contract offered to W2/W3

- Identity: Cloudflare Access JWT assertion (`cf-access-jwt-assertion`; Bearer accepted for
  service setups). Verification reuses `worker/access.ts verifyAccessJwt` — no second provider.
- Roles: `viewer` baseline; `admin` from bound `ADMIN_EMAILS` / `ADMIN_GROUPS` allowlists via
  `worker/auth.ts principalFromClaims`. Tenant scope comes only from bound `TENANT_ID`; any
  caller-supplied `?tenant=` that disagrees is rejected by the Worker.
- Capabilities: `read` → viewer; `edit`, `publish`, `settings`, `destructiveMedia` → admin.
  Server-side checks are authoritative; UI gating is UX only. Mutations require a same-origin
  `Origin` header (CSRF). Logout delegates to Cloudflare Access.
- Booking Studio enablement is **not** part of admin auth and remains a separate runtime flag.
- Contract for W2: every data-mutating endpoint must independently require the `admin` role and
  the bound tenant; W1 will not rely on the admin app's UI gate.
- Contract for W3: Access policy for the admin Worker and the shared Worker must agree on the
  team domain/AUD and on how the verified identity reaches both Workers.

## 5. Assumptions and decisions required before Gate 1 can close

| # | Decision | Owner | Status |
| --- | --- | --- | --- |
| D1 | Deploy `urban-cowboy-admin` to a Cloudflare preview and attach URL | W1 owner / Cloudflare auth | **Open** |
| D2 | `API_BASE_URL` vs service binding; CORS + Access cookie arrangement for cross-origin panel calls | W3 (runtime config) + W1 | **Open** |
| D3 | Bind `CF_ACCESS_TEAM_DOMAIN`, `CF_ACCESS_AUD`, `ADMIN_EMAILS`, `ADMIN_GROUPS`, `TENANT_ID` on both Workers; agree AUD | W3 + W1 | **Open** |
| D4 | Confirm W2 D1 contract version: draft/publish pointers, `409 edit_conflict`, audit, tenant ownership; W1 confirms form compatibility | W2 (COW-100) + W1 | **Open** (peer in Backlog) |
| D5 | Confirm guest-read/published-snapshot and media-identity contract with W3; no ARI data in D1 | W3 (COW-107) + W2 | **Open** (peer In Review) |
| D6 | Auto-publish retirement (source published on save; target requires explicit publish) | Product owner | **Open** — recorded in parity matrix |
| D7 | Tooling scope: alt-text import/export, image upload, Mews sync trigger, generic field editor | Product owner / W1.6 | **Open** |
| D8 | Mount path / base path for the admin app | W3 + W1 | **Open** |

No decision above is assumed closed by a local build or test result.

## 6. Verification evidence (W1, local + CI)

| Check | Result |
| --- | --- |
| `npm run admin:build` | pass — routes `/`, `/:section`, `/login`, `api/health`, `api/auth/session`, `api/auth/logout` |
| `npm run admin:typecheck`, `npm run typecheck` | pass |
| `npm run lint:controls` | pass — no new control overrides |
| Focused suites (auth, sessions, routes, dashboard navigation/API/shell) | 32/32 pass |
| Non-browser test suite (excluding two Playwright-dependent files unavailable locally) | 552/552 pass |
| PR #400 CI on final head | green (`validate` ×2, GitGuardian, Kilo Code Review); human review APPROVED |
| Dev smoke | `/api/health` 200, `/api/auth/session` 401, unauthenticated sections → 307 `/login?next=…`, `/login` 200 |

## 7. Gate 1 acceptance checklist

- [x] Source route/feature parity matrix complete with evidence.
- [x] Foundation, auth and route structure implemented; API client boundary documented.
- [x] Server-enforced auth/RBAC contract documented and tested locally.
- [x] Build/test evidence attached to W1 issues and PRs.
- [ ] Cloudflare preview URL attached (D1).
- [ ] Shared D1 data/auth/API contract version agreed and recorded in all three Gate 1 issues (D3–D5).
- [ ] W3 confirms runtime/admin-write boundary and ARI protection (D2, D5).
- [ ] W2 confirms admin form/editor compatibility with the D1 contract (D4).
- [ ] All unresolved decisions above have named owners and recorded outcomes.
- [ ] COW-100 and COW-107 complete; then all three Gate 1 issues closed together.

**Not claimed:** parity against the live Astro portal, deployed Access behavior, cross-origin
panel API calls, or any production acceptance. Those belong to W1.6/W1.7 after the joint gate.
