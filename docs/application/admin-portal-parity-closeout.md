# COW-94 — W1.6 Admin parity closeout (incremental record)

**Status:** in progress. Gate 1 is complete (COW-93/100/107 all Done), so post-gate work is
allowed. This document records the W1.6 slice delivered locally and what still blocks final
acceptance. It does not claim full parity or deployed E2E verification.

## 1. Delivered in this slice

| Item | Evidence |
| --- | --- |
| All 12 sections now render real data or a reused editor panel | `admin-app/components/DashboardPanelHost.tsx` |
| Remaining seven sections read shared D1 APIs | `admin-app/components/AdminResourcePanel.tsx`; `/api/admin/media`, `/api/content/offers`, `/api/content/policy-language`, `/api/d1/add-ons`, `/api/content/upgrades`, `/api/recovery`, `/api/analytics/summary` |
| Recovery role corrected to admin | `admin-app/lib/auth.ts` `CAPABILITY_ROLES.recovery`, `admin-app/lib/routes.ts` — matches `worker/d1-recovery.ts` `authorizeScopedRequest(..., "admin")` |
| Direct `/admin` and deep links `/admin/<section>` | `admin-app/app/admin/page.tsx`, `admin-app/app/admin/[section]/page.tsx` — redirect to the guarded section route |
| Tests | `tests/adminRoutes.test.ts` (6 tests), `tests/adminAuth.test.ts` (7 tests); 13/13 pass |

No new write API and no direct Webflow write was added; every fetch goes through
`createDashboardApi()` against the shared Worker.

## 2. Still missing for full W1.6 acceptance

| Gap | Parity IDs | Notes |
| --- | --- | --- |
| Generic field-driven editor (create/edit/preview/publish/rollback UI) | SRC-08/09/10/34/35/44/45 | Worker editor API is complete; the browser UI is not. Most important remaining gap. |
| Webflow utility tooling decisions | SRC-29/30/31/32/68/70/71 | Alt-text export/import, image upload, Mews sync trigger; needs product-owner scope decision D7 in Gate 1 record. |
| Reverse amenity editor and bespoke section layouts | SRC-51/52 | P1; not in this slice. |
| Deployed E2E + authorization evidence | — | Requires a Cloudflare preview and real Access identity (Gate 1 decision D1/D2/D3). |
| Responsive/keyboard review in a browser | SRC-81/83 | Local dev smoke only; deployed browser verification pending. |

Finding to report, not fix here: `worker/d1-modules.ts` (`/api/content/{events,offers,upgrades}`
and `/api/d1/add-ons`) has no `authorizeScopedRequest` call, unlike recovery/analytics. That is a
Worker-side authorization gap owned by W2/W3, not introduced by this W1 slice.

## 3. Verification evidence (local)

| Check | Result |
| --- | --- |
| `node --test tests/adminRoutes.test.ts tests/adminAuth.test.ts` | 13/13 pass |
| `npm run admin:typecheck`, `npm run typecheck` | pass |
| `npm run admin:build` | pass — routes `/`, `/:section`, `/admin`, `/admin/:section`, `/login`, auth/health APIs |
| `npm run lint:controls` | pass — no new control overrides |

## 4. Next

Either continue with the generic field-driven editor (largest remaining capability), or pause for
the deployed-preview decisions so E2E/authorization acceptance can be completed. W1.7 (COW-95)
remains the final production gate with W2.7 and W3.7.
