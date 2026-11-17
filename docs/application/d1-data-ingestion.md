# Webflow CMS export → D1 data ingestion

This document records what was broken in the CMS→D1 ingestion, what was fixed,
and the decisions that still require a human or a live-system check. It is the
companion to the generated [reconciliation report](../generated/d1-reconciliation.json).

## Root causes

1. **There was no committed importer.** `scripts/seed-d1-from-webflow.mjs` only
   printed per-file row counts and an Events-only `INSERT` example to stdout. It
   never wrote `seed.sql` and never contacted D1. `seed.sql` was produced by an
   ad-hoc process that is not in the repository, so the migration was not
   reproducible. The old script also ended with a stray shell heredoc marker and
   `node … | head` line (since removed).
2. **The generated seed covered only 7 of 12 collections** (128 rows): amenities,
   add-ons, offers, locations, buildings, room types. Events, photo hotspots,
   instagrams, outlets, content settings and every relationship table were absent.
3. **Relationships were never built.** `room_type_amenities` was 0 rows even though
   `features-amenities` holds 253 valid references across the 22 room types.
4. **Location scoping was dropped.** `room_types.location_id` and
   `buildings.location_id` were NULL for all rows, despite `property-location`
   and `location` carrying the Catskills ID.
5. **Field-level mapping errors.**
   - Add-on `description` came from `short-description`. For `Celebration Cake`
     that field is a raw Mews product UUID, and for `Bathing Ritual Kit` it is the
     display name; the editorial copy is in `long-description`.
   - All 8 offers were marked `published`, including 3 with `active=false` and no
     Mews rate product (editorial/nonbookable).
   - Amenity `image_name` was fabricated from the CMS display `name` (e.g.
     `Wallpaper Opas Cabin`), which is not an icon filename. The export has no
     `image-name`/`image-path` columns at all.
   - Events with only `recurring-start` produced `starts_at = NULL`, which
     violates `events.starts_at NOT NULL`.
6. **Photo hotspots were faked, then deleted.** The first generated seed inserted
   238 hotspots with `media_asset_id = 'placeholder-media'`, a foreign key to a
   non-existent `media_assets` row. A follow-up commit deleted all 238 lines
   instead of resolving media identity. The CSV export has no `photo-file-id` or
   `photo-url` (required by `worker/webflow/photo-hotspots.ts`), so there is no
   legitimate media ID to use.
7. **Silent skips.** Every statement used `INSERT OR IGNORE`, so conflicts and bad
   rows disappeared without an audit trail. There was no reconciliation report.
8. **Duplicate exports.** `Buildings 2.csv` and `Outlets 2.csv` are byte-identical
   copies of their canonical files; a glob-based importer could double-import or
   pick the wrong one.

## What changed

- `scripts/seed-d1-from-webflow.mjs` is now a full, deterministic generator:
  strict CSV parsing (quoted/multiline fields, BOM, hard failure on malformed
  rows), explicit collection resolution with duplicate detection, correct
  column mappings, parent-before-child ordering, `ON CONFLICT DO UPDATE`
  upserts, and a reconciliation report. Default is a dry run; `--write` emits
  the files. `npm run seed:d1` regenerates both.
- `seed.sql` was regenerated: 443 rows across 12 tables, including the tenant
  parent, 253 room/amenity relationships, all 8 events with valid `starts_at`,
  publication flags that respect `active`/draft state, and versioned content for
  instagrams, outlets and policy settings.
- `tests/seedD1.test.mjs` (`npm run test:seed`) applies the migration and seed to
  an in-memory SQLite database with `PRAGMA foreign_keys = ON`, then checks row
  counts, `foreign_key_check`, `integrity_check`, mappings, idempotency and the
  reconciliation report.
- `migrations/0002_module_list_indexes.sql` adds `(tenant_id, status, created_at)`
  indexes for `add_ons`/`offers`/`upgrades` and `(tenant_id, display_flag, created_at)`
  for `events`, matching the list queries in `worker/d1-modules.ts`. It is a
  separate migration because `0001_init.sql` is already applied in production.
  `tests/moduleIndexes.test.ts` verifies the query plans use the indexes.
- Private routes are now gated by a verified Cloudflare Access JWT.
  `worker/access.ts` verifies the RS256 signature against the team JWKS and
  checks issuer/audience/expiry; `worker/auth.ts` derives `viewer`/`admin` roles
  from bound email/group allowlists. Tenant scope comes from `TENANT_ID`, and a
  caller's `?tenant=` is rejected when it differs. Analytics requires `viewer`,
  recovery (PII) requires `admin`, and the legacy `ADMIN_TOKEN` is no longer an
  authorization input. `tests/auth.test.ts` holds the role matrix and
  `tests/tenantScope.test.ts` covers cross-tenant denial.
- `scripts/migrate-d1.mjs` is the migration runner. It validates filename order
  and checksums against `migrations/manifest.json` (so an applied SQL file cannot
  be silently edited), applies every migration twice to a fresh in-memory SQLite
  database with foreign keys enabled, and offers a guarded `--remote` apply that
  reuses the approved-account check and captures a dated backup. `npm run
  d1:migrate:check` and `tests/migrateD1.test.mjs` run in CI; the operational
  workflow is documented in [cloudflare-env-deployment.md](../cloudflare-env-deployment.md).

## Decisions on collections and empty tables

| Collection | Rows | Decision |
|---|---:|---|
| Locations / Buildings / Room Types / Amenities / Events / Offers / Add Ons | 136 | Imported into their structured tables with corrected mappings. |
| Photo Hotspots | 238 | **Not imported.** Missing `photo-file-id`/`photo-url` in the export means no stable `media_asset_id`. Re-export with media identity and import media_assets + media_versions first. No placeholder FKs used. |
| Instagrams | 20 | No dedicated table: imported as versioned `content_items`/`content_revisions` (`kind='instagram'`). |
| Outlets | 3 | Same versioned model (`kind='outlet'`). |
| Content Settings | 1 | Same versioned model (`kind='policy'`). Draft in source; stays `draft` in D1 until approved. |
| Menu Items | 0 | Nothing to import. |
| `media_assets`, `media_versions`, `photo_hotspots` | 0 | Blocked on the media-identity gap above. |
| `rate_merchandising` | 5 | Position only from `sort-order`; styling/geo/cancellation fields are not in the export and stay NULL. |
| `content_revisions` | 24 | Full source row stored as JSON payload for future typed readers. |
| Recovery, analytics, upgrades, audit tables | 0 | Out of scope for the CMS content migration. |

## Live read-only check (2026-11-17)

Read-only queries against `urban-cowboy-content` confirmed the diagnosis exactly:
4 locations, 9 buildings, 22 room types, 76 amenities, 8 events, 8 offers and
9 add-ons are present, while `room_type_amenities`, `photo_hotspots`,
`media_assets`, `content_items`, `content_revisions` and `rate_merchandising`
are all 0 rows; `room_types.location_id` is NULL for 22/22 and
`buildings.location_id` for 9/9; all 8 offers are `published`.

The deployed `urban-cowboy-booking-engine` Worker **does** currently list a `DB`
binding of type `d1` pointing at this database (the audit's "no DB binding"
observation is stale or referred to a different runtime). It does **not** have
an `ADMIN_TOKEN` secret binding. No data was written to the live database by
this work; applying the regenerated seed is a separate, explicitly approved step.

## Remaining gates (not resolved by this code change)

- `locations.mews_hotel_id` is NULL for all 4 locations: the export has no Mews
  hotel field. Confirm the per-location Mews mapping.
- 1 of 22 room types is a draft in Webflow but `room_types` has no status column,
  so D1 cannot filter it. Add editorial status or resolve the draft before
  cutover. The draft ID is recorded in the reconciliation report.
- 5 of 8 events use `recurring-start` as `starts_at`; timestamps keep their `Z`
  suffix. Confirm the `America/New_York` interpretation with editorial.
- Photo hotspot `display-order` has no D1 column; add it in a migration before
  importing hotspots so medallion order is preserved.
- These fixes address **data ingestion and the two PR review findings**. The
  merge gate still requires a read-only health check of the deployed Worker's
  `DB` binding and live verification of the Cloudflare Access JWT gate and its
  `CF_ACCESS_*` / `ADMIN_EMAILS` / `ADMIN_GROUPS` bindings — the code no longer
  trusts `ADMIN_TOKEN`, but the deployed Worker must be configured for Access
  before the private routes are usable — typed content-service parity
  behind a feature flag, a rollback test, and CI/end-to-end smoke tests. Do not
  switch public reads from Webflow to D1 until those pass.
