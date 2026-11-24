# COW-111 W3 Gate 2 readiness — live verification and Webflow retirement

This is the W3-side preparation for Sync Gate 2. It is **not** a gate completion:
W1.7 (COW-95) and W2.7 (COW-102) are still open, live deployed evidence has not
been recorded, and no Webflow runtime dependency has been removed here. Nothing
in this document authorizes a flag flip or a production change by itself.

## 1. W3 deliverable status

| Requirement | Current state | Evidence |
| --- | --- | --- |
| Production booking URL serves the configured Photo Journey | Wired: published `site_settings.productionLayout` selects Card/Photo; actual production activation is a deployment decision | `src/lib/siteSettingsClient.ts`, `src/App.tsx`, `tests/productionLayout.test.ts`, [cutover runbook](./w3-cutover-runbook.md) §4 |
| Frontend presentation and flow unchanged | No redesign; only data wiring and layout selection logic changed | COW-103 audit §3–§4, COW-106/108 PRs |
| Guest content from published D1 | Adapters for policy language, site settings, add-ons, galleries, hotspots and events; all behind Webflow-default flags | `cms-read-migration.md`, `tests/*Adapter*.test.ts` |
| All migrated Webflow runtime reads removed | **Not yet** — inventory in §3; removal only after live verification and peer acceptance | COW-103 audit §5 |
| ARI/quotes/reservations/payments remain Mews | Direct Mews egress only, no source flag | `mews-authority-matrix.md`, `tests/mewsAriAuthority.test.ts` |
| Media URL/provider replacement preserves identity | Importer keeps master/alias/placement IDs; snapshot refresh is in the import transaction | `tests/cutoverPhotoResolution.test.ts`, `tests/webflowPhotoImport.test.ts` |
| Rollback and monitoring verified | Snapshot pointer rollback is scoped per collection; runbook defines flag rollback and verification | cutover runbook §6, `tests/snapshotsParity.test.ts` |

## 2. Live verification checklist (to record on COW-111)

Run against the deployed production URL after the reviewed flag flips in the
cutover runbook. Record the URL, date/time, viewport, result and evidence link
for each item.

**Desktop**
1. Arrival screen renders with no console errors; production layout matches the
   published `site_settings.productionLayout` (Card or Photo Journey).
2. Room discovery / Photo Journey: all room cards, hero images and gallery
   photos load; no broken images; hotspots appear on the right photos.
3. Rate presentation: rate cards render from published D1 copy; live prices
   come from Mews and match the availability response.
4. Extras: all Mews products appear; CMS merchandising does not filter them.
5. Date selection, search, guest details, checkout and payment return complete
   without regression.
6. Response headers on content routes show `X-Content-Source: d1`; no
   `webflow-fallback` appears in a healthy soak window.
7. **Worker-side egress evidence** (not a browser trace) proves no Webflow
   runtime calls. Webflow fetches are server-side in `worker/webflow/*`, so a
   browser network trace cannot detect them. With Workers Logs and Traces
   enabled (`observability.enabled` and `observability.traces.enabled`), inspect
   outbound fetch events during the soak window and record zero requests to
   `api.webflow.com` / `api-cdn.webflow.com`, plus zero `webflow-fallback`
   `X-Content-Source` responses. A browser trace may supplement this but is not
   sufficient evidence.

**Mobile** — repeat items 1–6 at a phone viewport, including hotspot placement
and the numbered-dot control.

**Mews ARI smoke (configuration/availability only)** — the existing scripts
`bash scripts/test-mews-booking-api.sh` and
`bash scripts/test-mews-production.sh` exercise only `configuration/get` and
`hotels/getAvailability`. `test-mews-booking-api.sh` defaults to a past window
(`2026-10-15`/`2026-10-16`), so set `MEWS_TEST_START_UTC` and
`MEWS_TEST_END_UTC` to a future stay window before running it. These scripts are
evidence for ARI connectivity only — they do **not** cover the transactional
operations below and must not be cited as such.

**Mews transactional regression (controlled)** — on a staging deployment with
Mews test credentials and a future stay window, drive the guest flow through
quote → reservation creation → status check → payment link and capture:

- Worker logs/traces showing `reservations/price`, `reservationGroups/create`
  and `reservationGroups/get` with the Mews IDs and response bodies;
- quote totals and `AmountToChargeOnConfirmation`, reservation group ID, and
  the hosted payment URL host (`MEWS_APP_BASE_URL`);
- confirmation that no D1 row, snapshot, cache or admin setting supplied an
  ARI or quote value (`node --test tests/mewsAriAuthority.test.ts`);
- a cancellation/cleanup record for any test reservation, so no real booking is
  left behind.

Record the exact stay window, timestamp and evidence links for each item. Do
not infer transactional results from the ARI smoke scripts.

**Monitoring/rollback** — confirm alerting on content errors and D1 read
failures; rehearse the per-collection snapshot rollback and flag fallback on
staging, recording the returned `pointers`/`skipped`.

## 3. Webflow runtime retirement inventory

Reference: COW-103 audit §5.4. These are the only Webflow runtime dependencies
to remove; the offline importer is a tool, not a guest runtime path.

| Dependency | Used by | Replacement / removal rule |
| --- | --- | --- |
| `WEBFLOW_CMS_API_TOKEN`, `WEBFLOW_SITE_ID` | all `worker/webflow/*`, `worker/shadow-read.ts`, `worker/photo-source-webflow.ts` | Remove after parity + soak; importer env vars may remain for editorial tooling if needed |
| `WEBFLOW_RATE_CARD_COLLECTION_ID` | `webflow/rate-cards.ts` | `offers` + `rate_merchandising` with full artwork fields and guest adapter |
| `WEBFLOW_ADD_ON_COLLECTION_ID` | `webflow/add-ons.ts` | published `add_on` documents + `add_on_sync/complete` marker |
| `WEBFLOW_ROOM_TYPE_COLLECTION_ID`, `WEBFLOW_PHOTO_HOTSPOT_COLLECTION_ID` | `webflow/room-type-reviews.ts` | `room_types`, `roomGallery` snapshot, `photo_hotspot_mappings` |
| `WEBFLOW_CONTENT_SETTINGS_COLLECTION_ID`, `WEBFLOW_POLICY_LANGUAGE_ITEM_ID` | `webflow/policy-language.ts` | published `policy` revision |
| `WEBFLOW_LOCATION_COLLECTION_ID`, `WEBFLOW_LOCATION_ITEM_ID`, `WEBFLOW_BUILDING_COLLECTION_ID` | `webflow/locations.ts`, `webflow/buildings.ts` | policy/settings D1 rows; prose fields still need W2 contract work |
| `WEBFLOW_AMENITY_COLLECTION_ID` | `webflow/photo-hotspots.ts`, `webflow/buildings.ts`, `webflow/room-type-reviews.ts` | `amenities` + `amenity_editorial` + published overlay |
| `WEBFLOW_CONTENT_CACHE` KV | `webflow/{locations,buildings,room-type-reviews}.ts` | published snapshots with version ETag |
| `api.webflow.com/v2`, `api-cdn.webflow.com/v2` | `worker/webflow/*`, `worker/shadow-read.ts` | no guest request after cutover |
| `/collections/{id}` option-label endpoint | `webflow/rate-cards.ts`, `webflow/room-type-reviews.ts` | resolved enum values in D1 |

`worker/photo-source-webflow.ts` is an offline importer adapter; it is allowed to
reference Webflow until the temporary photo source is retired, but it must never
be called from a guest request path. `tests/webflowRuntimeBoundary.test.ts`
enforces that all Webflow host references stay inside the legacy handlers,
shadow-read and the importer module.

Removal sequence: (1) all relevant flags on `d1` with a clean soak, no fallback,
and the Worker-side egress evidence from §2 item 7; (2) the remaining live
verification evidence recorded; (3) W1/W2 Gate 2 acceptance;
(4) delete the legacy handlers and route fallbacks; (5) remove env vars/bindings
from `wrangler.toml` and deployment config; (6) re-run typecheck and the full
suite. Keep the KV calendar cache — it is advisory and Mews-derived, not Webflow.

## 4. Peer dependencies and closeout

- W1 (COW-95) must confirm the production Admin Portal can manage/publish the
  content.
- W2 (COW-102) must confirm D1 parity and media integrity.
- All three Gate 2 issues must be complete before final migration closeout.
- Record evidence (deployed URL, viewport, timestamp, result, screenshot/log
  link) directly on COW-111; a local test run is not deployed evidence.

## 5. D1-mode preview rehearsal — 2026-11-24

A non-production preview of the deployed booking Worker was created with the same
script and bindings plus all content flags set to `d1`:

- Preview: `cow-111-d1-rehearsal`, deployment `225c60db-5a45-4a3e-b0b6-53756b0d3621`
- URL: `https://225c60db-urban-cowboy-booking-engine.revrebel.workers.dev`
- Bindings: production D1 database, `CALENDAR_CACHE` KV, Mews plain-text config,
  and `CONTENT_SOURCE_POLICY_LANGUAGE`, `CONTENT_SOURCE_SITE_SETTINGS`,
  `CONTENT_SOURCE_ADD_ONS`, `CONTENT_SOURCE_ROOM_GALLERIES`, `PHOTO_HOTSPOT_SOURCE`
  all set to `d1`. No production flag or deployment was changed.

Observed (2026-11-24, HTTP):

| Check | Result |
| --- | --- |
| `GET /api/content/site-settings` | `X-Content-Source: d1`, `{"productionLayout":"photo",...}` — published D1 config selects the Photo Journey |
| `GET /api/content/policy-language` | `X-Content-Source: webflow-fallback`, empty language — D1 `policy` item is **draft**, so published-only reads correctly refuse it |
| `GET /api/content/add-ons` | `X-Content-Source: webflow-fallback`, empty list — no published `add_on_sync/complete` cutover marker exists |
| `GET /api/content/room-type-reviews` | Empty galleries/hotspots — no room has a published `room_gallery` document, so Webflow is preserved; preview has no Webflow bindings, hence the empty payload |
| `POST /api/mews/availability` (future window, property `hotel`) | 200 with 2 rate groups, 3 rates, 14 room availabilities — ARI still comes directly from Mews |
| Production `urban-cowboy-booking-engine` Worker | No content flags bound; `/api/content/site-settings` reports `X-Content-Source: webflow`, live layout Card |

Direct D1 inspection (production database) confirmed 10 published snapshot
pointers including `roomGallery`, 9 published `add_ons`, 156 gallery placements,
but `content_items` contains only `site_settings` (published), `outlet`,
`instagram` and one **draft** `policy` row — no `add_on` or `room_gallery`
publication documents.

**Conclusion:** D1 mode is safe (draft/incomplete data fails closed, Mews stays
direct) but **not ready for a production cutover**. Before COW-111 can be
accepted: publish the policy content and an add-ons cutover marker, publish
per-room gallery documents, provision a preview with static assets for full
desktop/mobile Photo Journey verification, obtain W1's deployed admin
confirmation, and then flip production flags as a reviewed deployment. The
preview remains evidence only — it is not production acceptance.
