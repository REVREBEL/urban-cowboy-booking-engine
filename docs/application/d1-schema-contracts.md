# D1 property-scoped schema contracts (COW-30)

This document records the schema decisions delivered for COW-30. It complements the [COW-29 source audit](../source-system-audit.md) and the [D1 ingestion notes](d1-data-ingestion.md).

## Governing decisions

1. **Additive migrations only.** `0001_init.sql` and `0002_module_list_indexes.sql` are already applied in production and are not edited. New work lives in `migrations/0003_property_scoped_contracts.sql`.
2. **Rollback scripts are not migrations.** They live in `scripts/d1-rollback/`, outside `migrations_dir`. Wrangler applies every `*.sql` in `migrations_dir` as a forward migration, so a numbered `_down.sql` there would be executed as schema creation and undo the migration.
3. **Mews remains the transactional authority.** No table here stores prices, availability, restrictions, settlement or reservation facts. D1 holds editorial content, versioned content, stable media identity, provenance and (in later milestones) operational/analytics read models.
4. **Stable internal IDs, legacy IDs as aliases.** A Webflow file ID, CDN URL, Squarespace asset ID or Mews asset ID never becomes a primary key or a column on `media_assets`.
5. **Relational columns for filtering, JSON for presentation only.** Scoped reads filter on `tenant_id` / `location_id` / `status` columns; revision payloads stay as validated `payload_json`.
6. **Nothing switches public reads to D1 yet.** The Webflow path and feature flag remain the rollback path.

## New tables

### `media_aliases`

| Column | Purpose |
| --- | --- |
| `id`, `tenant_id`, `media_asset_id` | Stable internal alias row, owning tenant and `media_assets` FK. A composite FK `(tenant_id, media_asset_id) → media_assets(tenant_id, id)` (backed by a unique parent key) prevents an alias from claiming tenant A while referencing tenant B's asset |
| `alias_type` | Free text in SQL (e.g. `webflow_file_id`, `webflow_cdn_url`, `squarespace_asset_id`, `squarespace_url`, `mews_asset_id`); the Zod contract is the validation boundary, so a new provider needs no DB migration |
| `alias_value` | Legacy value as supplied by the source; `UNIQUE (tenant_id, alias_type, alias_value)` allows two tenants to hold the same legacy ID while preventing ambiguous resolution inside one |
| `created_at` | Import timestamp |

`resolveMediaAlias()` in `worker/d1.ts` always joins `media_assets` with `m.tenant_id = a.tenant_id`, for both scoped and tenant-wide lookups, and enforces the optional location through the same join. The read path does not rely solely on the composite FK, so a legacy row inserted before the constraint was added still cannot leak another tenant's media ID. A test inserts a deliberately mismatched alias (with FK checks temporarily off) and asserts it is never resolvable.

Note: `0001_init.sql` still has `squarespace_asset_id` / `squarespace_url` columns on `media_assets` and `media_versions`. They are legacy artifacts, not the identity model. New imports should write aliases; removing those columns is a separate, breaking migration for a later milestone.

### `content_provenance`

| Column | Purpose |
| --- | --- |
| `tenant_id`, `target_table`, `target_id` | Composite primary key — one provenance row per imported record, idempotent by construction |
| `location_id` | Denormalised from the source row so a location-scoped lookup cannot leak across locations of the same tenant |
| `source_system` | `webflow_cms`, `mews`, `n8n`, `manual` or `import` |
| `source_collection`, `source_id` | Source collection slug and the original item ID |
| `source_snapshot_date`, `source_hash` | Export date and raw-byte SHA-256 of the export file |
| `imported_at` | Database-supplied timestamp |

`getProvenance()` reads a row by tenant, optional location, target table and target ID.

## Property-scoped indexes

The scoped query helpers build a separate SQL statement for each supported combination (location present/absent, kind present/absent) with explicit predicates rather than an `IS NULL OR` pattern. This lets SQLite use the location-prefixed index. The query builders (`contentItemsQuery`, `eventsQuery`, `mediaAssetsQuery`, `locationsQuery`, `mediaAliasQuery`, `provenanceQuery`) are exported and used by both the helpers and the EXPLAIN tests, so a regression in helper SQL cannot be masked by a copied test query.

Indexes include the `id` tiebreaker and `updated_at DESC` where needed, so `ORDER BY` clauses are covered without a temporary B-tree sort.

| Index | Query shape |
| --- | --- |
| `idx_content_items_scope_kind_status_updated` | tenant + kind + `status='published'` |
| `idx_content_items_scope_location_kind_status_updated` | same, with a concrete location |
| `idx_content_items_tenant_status_updated` / `idx_content_items_loc_status_updated` | tenant/location + status, no kind filter |
| `idx_events_scope_display_starts` / `idx_events_tenant_display_starts` | location-scoped and tenant-wide displayed events |
| `idx_media_assets_scope_kind`, `idx_media_assets_scope_id`, `idx_media_assets_tenant_kind`, `idx_media_assets_tenant_id` | all four media list combinations |
| `idx_room_types_scope_sort` / `idx_buildings_scope_sort` | tenant + location, ordered by `sort_order, id` |
| `idx_rate_merchandising_scope_position` | tenant + location, ordered by `position, id` |
| `idx_amenities_tenant_sort` | tenant, ordered by `sort_order, id` |
| `idx_room_type_amenities_amenity` | reverse amenity → room lookup |
| `idx_media_aliases_asset` | reverse media-asset → alias lookup |
| `idx_content_provenance_location` / `idx_content_provenance_source` | location-scoped and source-scoped provenance reads |

`tests/d1SchemaContracts.test.ts` checks plans with `EXPLAIN QUERY PLAN` using the builders' exact SQL and bindings, failing on full scans or unexpected temp sorts.

## Type contracts

`src/types/d1-contracts.ts` defines Zod schemas for stored (snake_case) D1 rows and transforms them to camelCase domain shapes. Boolean columns stored as `0`/`1` are converted explicitly; `status`, `source_system` and `alias_type` are validated by contracts. `content_revisions.payload_json` is refined so malformed JSON is rejected before a consumer parses it.

`worker/d1.ts` adds contract-validated, property-scoped helpers and keeps existing helpers (`listContentItems`, `getContentItem`) unchanged so current endpoints keep their behavior.

## Source/provenance mapping

`src/lib/content-provenance.ts` records the Webflow collection → D1 target mapping derived from the COW-29 crosswalk:

- Ten mapped collections (locations, buildings, roomTypes, amenities, events, offers, addOns, instagrams, outlets, contentSettings), with versioned collections targeting `content_items` + `content_revisions` by `kind`, and per-collection location fields.
- Two explicit exclusions: `photoHotspots` (no media identity in the export) and `menuItems` (empty collection).
- `assertSourceCoverage()` is called by `scripts/seed-d1-from-webflow.mjs` with the exported collection names, so a new Webflow collection fails the seed instead of being silently dropped.
- `provenanceSeed()` builds a typed row; the regenerated `seed.sql` now inserts provenance for every imported source record, with the snapshot date and raw-byte export hash. Derived relationship rows (`room_type_amenities`) are intentionally not given provenance because they have no single row ID.

`tests/fixtures/d1-contracts-fixture.sql` is a self-contained fixture with two tenants, three locations, legacy aliases (including a future provider), published/draft content items, a hidden event and provenance rows across locations. It exercises tenant/location isolation without depending on the Webflow seed.

## Media registry (COW-33)

`migrations/0004_media_registry.sql` adds the registry extension. `media_assets.id` is the never-reused `media_id`. `media_versions.id` is the per-upload `version_id`. Triggers block updates to either ID and block moving a version to another media asset.

- `media_asset_metadata` holds global description, caption, tags, attribution, status and the current version ID.
- `media_version_files` holds Cloudinary `public_id`/`version`, SHA-256, byte size and MIME type for one upload. Dimensions stay on `media_versions`. Uniqueness is on `(tenant_id, cloudinary_public_id, cloudinary_version)` because Cloudinary keeps `public_id` stable across uploads and advances `version`.
- `media_placements` holds placement-level overrides and gallery order. Global metadata stays on the asset, so a reupload cannot change it.
- `media_revisions` records `create_new`, `link_existing`, `replace`, `retire` and `set_placement` actions with actor, note and from/to version IDs.

`worker/media-registry.ts` implements those actions. `createMediaAsset` creates the logical photo and its first version. `linkExistingMedia` adds a legacy alias and optional placement. `replaceMediaVersion` adds a new version, advances `current_version_id` and leaves every alias and placement untouched. `retireMediaAsset` marks the asset retired without deleting it. All actions validate before writing, are tenant scoped, run as one D1 batch including the audit row, and roll back completely on failure. Revision row IDs are generated per action, so reusing a caller tag cannot collide; the tag is stored in `metadata_json` together with placement overrides. A placement reorder is rejected before writes when another placement already holds the target display order.

New metadata lives in extension tables because the migration runner applies every migration twice and SQLite has no `ADD COLUMN IF NOT EXISTS`. The Squarespace-shaped columns from 0001 remain for legacy data; new uploads put deterministic fallback values there until a later migration removes them.

## Rollback policy

- `scripts/d1-rollback/0002_module_list_indexes_down.sql` drops only the four module indexes.
- `scripts/d1-rollback/0003_property_scoped_contracts_down.sql` drops only the indexes and tables created by 0003.
- `scripts/d1-rollback/0004_media_registry_down.sql` drops only the indexes, triggers and tables created by 0004.
- Every rollback script is idempotent and tested: base tables, rows and foundational indexes from earlier migrations survive; `PRAGMA foreign_key_check` stays clean; the up migrations re-apply afterwards.
- `0001_init.sql` is foundational. There is no in-place down script for it; rollback to the pre-D1 state requires a point-in-time restore of the D1 database. Always export the remote database before applying or rolling back a migration.

## Verification

```bash
node --test tests/d1SchemaContracts.test.ts   # migration, indexes, rollback, contracts, provenance, scoped queries
node --test tests/mediaRegistrySchema.test.ts  # 0004 schema, immutable IDs, placements, rollback
node --test tests/mediaRegistryService.test.ts # link/new/replace actions and cross-tenant denial
node --test tests/mediaRegistryContracts.test.ts # media registry Zod contracts
npm run test:seed                              # Webflow seed, provenance and FK integrity
npm test                                        # full suite
npm run typecheck
```

## Deferred (not in this change)

- Publication-state columns for `locations` and `room_types`. The 2026-11-15 export has no draft locations; the single draft room type is `6abd4a1debcab0ea7e461c9a`. Adding a status column requires a backfill decision and is tracked in the COW-29 audit gates.
- Importing the 238 photo hotspots: the source export still lacks stable media identity. The registry now exists; the re-export, importer and placement mapping are COW-34.
- Removing the Squarespace-shaped columns from `media_assets` / `media_versions`. New uploads carry deterministic fallback values there so the NOT NULL constraints stay satisfied.
- Using these helpers in public endpoints; that switch stays behind the parity/flag gates.
