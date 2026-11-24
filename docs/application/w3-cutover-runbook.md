# W3 cutover runbook — Webflow to D1 (COW-108)

This runbook governs the controlled switch of guest content/configuration reads
from Webflow to published D1. It is the execution companion to the
[Gate 1 integration contract](./gate1-integration-contract.md) (`gate1-v1.0`).

**Nothing in this document is an authorization to flip a flag.** Gate 1 contract
acceptance is recorded on COW-107/COW-93/COW-100; the flip itself requires the
per-domain parity evidence below and must be performed as a reviewed deployment
change. Mews remains the sole live ARI/transaction authority throughout.

## 1. Flags and defaults

All source flags default to `webflow`. `shadow` means the Webflow response is
served and differences are recorded; `d1` serves published data with Webflow
fallback. Flags are declared in `wrangler.toml` and read in
`worker/content-source.ts` / `worker/hotspot-source.ts`.

| Flag | Domain | Rollback |
| --- | --- | --- |
| `CONTENT_SOURCE_POLICY_LANGUAGE` | cancellation/deposit copy (`{ language }`) | set back to `webflow` |
| `CONTENT_SOURCE_SITE_SETTINGS` | `{ settings, source }`, Studio config, production layout | set back to `webflow` |
| `CONTENT_SOURCE_ADD_ONS` | extras CMS cards (`{ addOns }`) | set back to `webflow` |
| `CONTENT_SOURCE_ROOM_GALLERIES` | room galleries overlay | set back to `webflow` |
| `PHOTO_HOTSPOT_SOURCE` | published hotspot pins | set back to `webflow` |
| `CONTENT_SOURCE` | global default used by routes without an override | set back to `webflow` |

There is deliberately **no** ARI/rate source flag. See the
[Mews authority matrix](./mews-authority-matrix.md).

## 2. Prerequisites before any flip

1. **Published-only data**: the collection's D1 rows are published and
   tenant/location scoped. Draft, pending-review and ambiguous rows fail closed.
2. **Parity**: the procedure is domain-specific — see §2a. Only policy language,
   site settings and add-ons support shadow mode; galleries and hotspots are
   two-state flags and need a direct published-data comparison instead.
3. **Migration gates**: add-ons require a published `add_on_sync/complete` marker
   whose `expectedCount` matches the published `add_on` items. Galleries require
   a published `room_gallery` document per room; unmigrated rooms keep Webflow.
4. **Snapshots refreshed**: room galleries, amenities and policy content are read
   from immutable published snapshots. A refresh is triggered by editor publish,
   and the W2 photo importer appends its `roomGallery` refresh to the same SQL
   transaction — see §3. Verify the pointer/version actually changed before
   enabling a flag.
5. **Rollback tested**: a collection-scoped snapshot rollback repoints only the
   named collection; verify it on staging before each flip (see §6).

## 2a. Parity procedures by domain

**Shadow-capable routes — policy language, site settings, add-ons.** These have
a real `shadow` mode. Set the per-route flag (`CONTENT_SOURCE_POLICY_LANGUAGE`,
`CONTENT_SOURCE_SITE_SETTINGS`, `CONTENT_SOURCE_ADD_ONS`) to `shadow`, then read
`GET /api/content/parity?collection=<name>` (admin). Valid collection names are
`policyLanguage`, `siteSettings` and `addOns`. The response contains `reports`
(the field-level diff summary) and `pointers` (the current snapshot version per
collection). Shadow writes a report only when the summary changes, so no new
report after a stable soak means no new drift. Compare the reported fields
against the guest-visible contract; resolve every unexplained difference.

**Galleries and hotspots — no shadow mode.** `CONTENT_SOURCE_ROOM_GALLERIES`
and `PHOTO_HOTSPOT_SOURCE` accept only `webflow` (default) or `d1`; there is no
`shadow` value and no parity summary is written for them. Verify before flipping:

1. Capture the current Webflow response from
   `GET /api/content/room-type-reviews` (`galleries` and `hotspots`) and keep it
   as the baseline.
2. On a staging Worker with the flag set to `d1`, capture the same response.
   Galleries are merged per room: only rooms with a published `room_gallery`
   document change; compare those rooms' ordered image URLs against the
   baseline and confirm every unmigrated room is byte-identical.
3. For hotspots, compare `hotspotsByRoom` from the D1 response against the
   baseline `hotspots` map by photo key and pinned amenity; verify pin IDs,
   display order, normalized x/y and geometry.
4. Do not use `GET /api/content/parity` as evidence for these two domains: it
   recomputes collection-level parity over `content_items`-backed collections,
   not the per-room gallery/hotspot guest payloads.

## 3. Temporary Webflow photo URLs (W2 importer → guest reads)

The W2 importer (`scripts/sync-webflow-photos.mjs`) stores URL references only:
a neutral `mm-` master ID, stable `media_aliases`, a mutable current-version URL
and one placement per room. Hotspot mappings reference the media/placement IDs,
so a URL-only change or provider switch preserves identity and geometry.

Sequence for a photo URL change:

1. Run the importer with `--sql-out` and review the generated script. It must
   contain no `DELETE` statements and must include the `roomGallery` snapshot
   refresh statements (`published_snapshots` insert plus `snapshot_pointers`
   update) appended to the import transaction.
2. Apply the script to D1. If applying through a different path that omits the
   refresh, send `POST /api/content/snapshots` with
   `{"collection":"roomGallery"}` (admin) explicitly. Without a refresh guests
   keep seeing the old published URL.
3. Verify guest resolution:
   `node --test tests/cutoverPhotoResolution.test.ts tests/webflowPhotoImport.test.ts`
   (temporary URL appears in the gallery; hotspot keys join on the same 24-hex
   file ID; a URL-only reimport keeps master/version/placement IDs and hotspot
   geometry; and the real CLI apply script refreshes the published snapshot).
4. Enable `CONTENT_SOURCE_ROOM_GALLERIES=d1` only after the published snapshot
   contains the new URLs and parity is accepted.

## 4. Flip order

Flip one domain at a time, in this order, allowing a full verification/soak
window between flips:

1. `CONTENT_SOURCE_POLICY_LANGUAGE=d1` — smallest document, 10 fields.
2. `CONTENT_SOURCE_SITE_SETTINGS=d1` — activates published D1 control of the
   production Card/Photo Journey selection; verify the intended experience
   without a frontend rebuild.
3. `CONTENT_SOURCE_ADD_ONS=d1` — verify all expected Mews products still appear;
   CMS IDs must never become a whitelist.
4. `CONTENT_SOURCE_ROOM_GALLERIES=d1` — after §3 and per-room parity.
5. `PHOTO_HOTSPOT_SOURCE=d1` — last, because the response shape changes
   (`hotspots` becomes empty and pins are served via `hotspotsByRoom`); confirm
   consuming components read `hotspotsByRoom` before flipping.

`GET /api/content/events/occurrences` is already D1-only and needs no flip.

## 5. Post-flip verification

- Guest response envelopes unchanged; no frontend redesign.
- `X-Content-Source: d1` on flagged content routes; any fallback is visible as
  `webflow-fallback` with `no-store`.
- ARI, prices, quotes, reservations and payment return remain live Mews calls
  (`node --test tests/mewsAriAuthority.test.ts`).
- No full-flow regressions in room selection, rates, extras, checkout or payment
  return.
- Relevant suites: `tests/addOnAdapter.test.ts`,
  `tests/publishedGalleriesGuest.test.ts`, `tests/productionLayout.test.ts`,
  `tests/contentMigrationPolicy.test.ts`, `tests/propertySettings.test.ts`,
  `tests/cutoverPhotoResolution.test.ts`.

## 6. Rollback

For any regression:

1. Set the affected per-route flag back to `webflow` (no data is deleted).
2. If published content itself is wrong, repoint **only that collection's**
   snapshot. `snapshotsRollback` defaults to all ten collections when no body is
   supplied, so always send the scoped JSON body:
   `POST /api/content/snapshots/rollback` with
   `{"collection":"roomGallery"}` (use `policyLanguage`, `siteSettings`,
   `addOns`, etc. for the other domains). The response is
   `{ "pointers": { "<collection>": "<newCurrentVersion>" }, "skipped": [...] }`:
   - `pointers` containing the named collection means the rollback succeeded and
     shows the version now current — record it.
   - a collection listed in `skipped` had no previous version, so nothing changed;
     do not assume a rollback happened.
   - `pointers` must not contain unrelated collections; if it does, the request
     was not scoped correctly.
3. Re-run the guest response check for the affected domain after rollback, then
   keep the failure visible in logs/parity reports; do not patch guest data
   directly.
4. Rollback controls stay in place until Gate 2 (COW-111) accepts Webflow
   runtime retirement.

## 7. Gate 2 hand-off

COW-111 may retire Webflow runtime reads only after all migrated domains have a
soak period on D1 with no fallback, per-room published-data parity is accepted,
the Webflow env vars/hosts from the COW-103 audit §5.4 are removable, and the
Mews authority tests still pass. Do not remove the KV calendar cache or move it
into D1 — it is advisory and Mews-derived.
