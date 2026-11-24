# W3 cutover progress — deployed state and remaining blockers (2026-11-24)

Scope: COW-108 (W3.6) / COW-111 (W3.7). No content-source flag was flipped by this pass; the
booking Worker still serves Webflow defaults, and Mews remains the sole ARI/transaction authority.

## Completed in this pass

- `urban-cowboy-admin` was redeployed with Access/role/tenant bindings: `CF_ACCESS_TEAM_DOMAIN`,
  `CF_ACCESS_AUD`, `ADMIN_EMAILS`, `ADMIN_GROUPS`, `TENANT_ID` and a deliberately empty
  `API_BASE_URL` (see the cross-origin caveat below).
- Found and corrected an AUD mismatch: the Access application protecting the admin Worker uses
  `4bf8d1515fc028e57532548fc1687b5750d68f534a7d0cee0c1542cdf99a3255`, not the booking Worker's
  `e284cf2d…`. Without this fix every verified JWT would have been rejected.
- **Cross-origin API blocker:** `createAdminDashboardApi()` sends credentialed browser requests to
  `API_BASE_URL`. The booking Worker has a different Access AUD and no credentialed CORS/OPTIONS
  policy, so setting that default would produce panels that cannot read or write data. The default
  is therefore empty until either (a) a same-origin App Router proxy forwards requests to the
  booking Worker through a service binding with a valid booking-Access service token, or (b) the
  narrow cross-origin Access/CORS integration is implemented and tested. A build plus an
  unauthenticated Access redirect does **not** exercise that connection.
- Cloudflare Access is active on `https://urban-cowboy-admin.revrebel.workers.dev`: unauthenticated
  requests (including `/api/health` and `/api/auth/session`) are redirected to the Access login
  flow. That is the expected boundary behavior.

## Deployed booking Worker state (read-only inspection)

`urban-cowboy-booking-engine` has `ASSETS`, `DB`, `CALENDAR_CACHE`, Mews vars, all Webflow
collection/site IDs and `ADMIN_EMAILS`/Access AUD/team domain. Only
`CONTENT_SOURCE_ROOM_GALLERIES=d1` is set; `PHOTO_HOTSPOT_SOURCE=webflow` and the other content
flags are unset (Webflow default).

## D1 readiness (production database, read-only queries)

| Check | Observed | Implication |
| --- | --- | --- |
| `content_items` | policy = **draft** (1); site_settings published (1); room_gallery published (19); instagram 20 / outlet 3 published | policy D1 path falls back to Webflow |
| `add_ons` table | 9 published | not used by the guest adapter |
| `add_on` / `add_on_sync` content items | **none** | `/api/content/add-ons` D1 path always falls back (needs 9 published `add_on` revisions plus one published `add_on_sync/complete` marker with `expectedCount: 9`) |
| `published_snapshots` | 10 collections; `policyLanguage` has **0 items**; `roomGallery` 22, `addOns` 9, `siteSettings` present | policy snapshot must be refreshed after publish |
| `room_type_publication` | 22 | per-room gallery docs exist |
| `photo_hotspot_mappings` | **0** | no D1 hotspot data for a guest cutover |
| D1 rehearsal preview (`225c60db…`) | policy `{}`, add-ons `[]`, room-type-reviews galleries `{}`; site-settings `productionLayout: photo` from D1 | D1 mode fails closed and Webflow is preserved; not ready for guests |

## Why no flags were flipped

The runbook (`docs/application/w3-cutover-runbook.md` §2) requires published, tenant-scoped data
and per-domain parity before each flip. Publishing policy copy, seeding nine CMS-shaped add-on
revisions plus the cutover marker, and establishing published gallery/hotspot parity are data
migration tasks (W2 contract), not config changes. Flipping flags now would silently fall back to
Webflow and could hide incomplete content.

## Next steps (owner/W2 data work)

0. Implement and test the authenticated admin→booking API path (same-origin service-binding proxy
   or scoped cross-origin Access/CORS), including viewer/admin read and mutation requests and
   denial cases; `API_BASE_URL` stays empty until then.
1. Publish the policy content item and refresh the `policyLanguage` snapshot.
2. Create and publish the nine CMS-shaped `add_on` content revisions plus one
   `add_on_sync/complete` marker (`expectedCount: 9`), then refresh the `addOns` snapshot.
3. Verify per-room published `roomGallery` documents through the D1 guest adapter; refresh the
   `roomGallery` snapshot after any URL-only reimport.
4. Populate/review `photo_hotspot_mappings` only after gallery parity; hotspots flip last.
5. Then flip flags one at a time per runbook §4, verifying `X-Content-Source: d1`, guest response
   envelopes, Mews ARI and rollback after each.

No production flag, published snapshot or content row was changed by this pass.
