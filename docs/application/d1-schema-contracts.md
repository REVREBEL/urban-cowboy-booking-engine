# D1 property-scoped schema contracts (COW-30)

This document records the schema decisions delivered for COW-30. It complements the [COW-29 source audit](../source-system-audit.md) and the [D1 ingestion notes](d1-data-ingestion.md).

## Governing decisions

1. **Additive migrations only.** `0001_init.sql` and `0002_module_list_indexes.sql` are already applied in production and are not edited. New work lives in `migrations/0003_property_scoped_contracts.sql`.
2. **Mews remains the transactional authority.** No table here stores prices, availability, restrictions, settlement or reservation facts. D1 holds editorial content, versioned content, stable media identity, provenance and (in later milestones) operational/analytics read models.
3. **Stable internal IDs, legacy IDs as aliases.** A Webflow file ID, Webflow CDN URL, Squarespace asset ID or Mews asset ID never becomes a primary key or a column on `media_assets`.
4. **Relational columns for filtering, JSON for presentation only.** Scoped reads filter on `tenant_id` / `location_id` / `status` columns; revision payloads stay as `payload_json`.
5. **Nothing switches public reads to D1 yet.** The Webflow path and feature flag remain the rollback path.

## New tables

### `media_aliases`

| Column | Purpose |
| --- | --- |
| `id`, `media_asset_id` | Stable internal alias row and its `media_assets` FK |
| `alias_type` | Constrained to `webflow_file_id`, `webflow_cdn_url`, `squarespace_asset_id`, `squarespace_url`, `mews_asset_id` |
| `alias_value` | The legacy value as supplied by the source; `UNIQUE (alias_type, alias_value)` prevents ambiguous resolution |
| `created_at` | Import timestamp |

Adding another legacy provider is a new enum value, not a schema rewrite. `resolveMediaAlias()` in `worker/d1.ts` resolves an alias only when the owning media asset belongs to the requested tenant (and optional location).

Note: `0001_init.sql` still has `squarespace_asset_id` / `squarespace_url` columns on `media_assets` and `media_versions`. They are legacy artifacts, not the identity model. New imports should write aliases; removing those columns is a separate, breaking migration for a later milestone.

### `content_provenance`

| Column | Purpose |
| --- | --- |
| `tenant_id`, `target_table`, `target_id` | Composite primary key — one provenance row per imported record, idempotent by construction |
| `source_system` | `webflow_cms`, `mews`, `n8n`, `manual` or `import` |
| `source_collection`, `source_id` | Source collection slug and the original item ID |
| `source_snapshot_date`, `source_hash` | Which export and which file/row hash produced the row |
| `imported_at` | Database-supplied timestamp |

`getProvenance()` reads a row by tenant, target table and target ID.

## Property-scoped indexes

All list helpers bind `tenant_id` plus an optional `location_id` (a null scope means "all locations in this tenant"). Indexes include the `id` tiebreaker and, for content items, `updated_at DESC`, so the helpers' `ORDER BY` clauses are covered without a temporary B-tree sort.

| Index | Query shape |
| --- | --- |
| `idx_content_items_scope_kind_status_updated` | tenant + kind + `status='published'`, ordered by `updated_at DESC, id` |
| `idx_content_items_scope_location_kind_status_updated` | same, with a concrete location |
| `idx_room_types_scope_sort` / `idx_buildings_scope_sort` | tenant + optional location, ordered by `sort_order, id` |
| `idx_rate_merchandising_scope_position` | tenant + optional location, ordered by `position, id` |
| `idx_events_scope_display_starts` | tenant + optional location + `display_flag=1`, ordered by `starts_at, id` |
| `idx_amenities_tenant_sort` | tenant, ordered by `sort_order, id` |
| `idx_room_type_amenities_amenity` | reverse amenity → room lookup |
| `idx_media_assets_scope_kind` | tenant + optional location + optional kind |
| `idx_content_provenance_source` | tenant + source system + source collection |

`tests/d1SchemaContracts.test.ts` checks each plan with `EXPLAIN QUERY PLAN` and fails on a full table scan or an unexpected temp sort.

## Type contracts

`src/types/d1-contracts.ts` defines Zod schemas for the stored (snake_case) D1 rows and transforms them to the camelCase shapes used by the app. Boolean columns stored as `0`/`1` are validated and converted explicitly; `status`, `alias_type` and `source_system` are enums.

`worker/d1.ts` adds contract-validated, property-scoped helpers: `listScopedContentItems`, `listScopedLocations`, `listScopedEvents`, `listScopedMediaAssets`, `resolveMediaAlias` and `getProvenance`. Existing helpers are unchanged so current endpoints keep their behavior.

## Source/provenance mapping

`src/lib/content-provenance.ts` records the Webflow collection → D1 target mapping derived from the COW-29 crosswalk:

- Ten mapped collections (locations, buildings, roomTypes, amenities, events, offers, addOns, instagrams, outlets, contentSettings), with versioned collections targeting `content_items` + `content_revisions` by `kind`.
- Two explicit exclusions: `photoHotspots` (no media identity in the export) and `menuItems` (empty collection).
- `assertSourceCoverage()` fails when a collection is neither mapped nor excluded, so a new Webflow collection cannot be silently dropped.
- `provenanceSeed()` builds a typed provenance row (without the DB-supplied `imported_at`) for the importer.

`tests/fixtures/d1-contracts-fixture.sql` is a self-contained fixture with two tenants, legacy media aliases, published/draft content items, a hidden event and provenance rows. It exercises tenant isolation without depending on the Webflow seed.

## Rollback policy

- `migrations/0002_module_list_indexes_down.sql` drops only the four module indexes.
- `migrations/0003_property_scoped_contracts_down.sql` drops only the indexes and tables created by 0003.
- Both scripts are idempotent and are tested: base tables and rows survive, `PRAGMA foreign_key_check` stays clean, and the up migrations re-apply afterwards.
- `0001_init.sql` is foundational. There is no in-place down script for it; rollback to the pre-D1 state requires the documented point-in-time restore of the D1 database. Always export the remote database before applying or rolling back a migration.

## Verification

```bash
node --test tests/d1SchemaContracts.test.ts   # migration, indexes, rollback, contracts, provenance, scoped queries
npm run test:seed                              # Webflow seed and FK integrity
npm test                                        # full suite (260 tests)
npm run typecheck
```

## Deferred (not in this change)

- Publication-state columns for `locations` and `room_types`. The 2026-11-15 export has no draft locations; the single draft room type is `6abd4a1debcab0ea7e461c9a`. Adding a status column requires a backfill decision and is tracked in the COW-29 audit gates.
- Importing the 238 photo hotspots and their media assets (COW-33/34).
- Removing the Squarespace-shaped columns from `media_assets` / `media_versions`.
- Using these helpers in public endpoints; that switch stays behind the parity/flag gates.
