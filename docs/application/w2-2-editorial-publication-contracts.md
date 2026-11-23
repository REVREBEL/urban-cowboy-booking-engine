# COW-97 — W2.2 editorial publication state and typed contracts

**Status:** implemented. **Date:** 2026-11-23. **Follows:** [W2.1 assessment](w2-1-source-schema-authority-assessment.md).

This milestone closes the one schema change W2.1 justified before content import: `room_types` and `locations` have identity but no publication state, so the 2026-11-15 export's draft room type could not be distinguished from published rows. It also records the explicit contract for selectively mirrored Mews reference data.

## What changed

| Area | Change |
| --- | --- |
| `migrations/0012_editorial_publication_state.sql` | Additive `room_type_publication`, `location_publication` and `mews_reference_sync` tables; unique parent keys; indexes; published-by-default backfill. Registered in `migrations/manifest.json`. |
| `scripts/d1-rollback/0012_editorial_publication_state_down.sql` | Idempotent rollback for 0012 only. |
| `src/types/d1-contracts.ts` | `editorialStatusSchema`, publication row contracts, `mewsReferenceTypeSchema` and `mewsReferenceSyncRowSchema`. |
| `worker/d1.ts` | Scoped helpers: `publishedRoomTypeIds`, `publishedLocationIds`, `listPublishedRoomTypes`, `listPublishedLocations`, `listRoomTypePublications`, `listLocationPublications`, `listMewsReferenceSync`. |
| `worker/content-provider.ts` | Guest snapshots filter room types/locations by D1 publication state instead of the hardcoded deny-list in `publication-gate.ts`. |
| `scripts/seed-d1-from-webflow.mjs`, `seed.sql`, `docs/generated/d1-reconciliation.json` | Import publication state from source `isDraft`/`isArchived`/`lastPublished`: 22 room types (1 draft) and 4 locations. |
| `tests/editorialPublicationState.test.ts`, `tests/fixtures/editorial-publication-fixture.sql` | Migration, FK, contract, scope, guest/admin read and rollback coverage. |

## Publication contract

- State lives in extension tables, not a physical column. The migration runner applies every SQL file twice and SQLite has no `ALTER TABLE ADD COLUMN IF NOT EXISTS`; extension tables follow the `amenity_editorial` and `0006_working_revision_pointer` pattern.
- `status` is one of `draft`, `published`, `archived`. A record **with no publication row keeps the historical published behavior**, so databases seeded before 0012 do not lose content. The backfill writes `published` for existing rows with `INSERT OR IGNORE`.
- `PRIMARY KEY (tenant_id, <entity>_id)` plus a composite FK `(tenant_id, <entity>_id) → <table>(tenant_id, id)` prevents a tenant from claiming another tenant's publication state. Read helpers join the source row on both tenant and ID, so the rule holds even for legacy rows that predate the constraint.
- `source_snapshot_date` records the export that supplied the state.

## Mews reference-data contract

`mews_reference_sync` stores only **stable** reference identity and reconciliation metadata. `reference_type` is constrained in SQL and in Zod to `hotel`, `rate_group`, `product`, `room_category` and `age_category`. Availability, inventory, restrictions and live rates cannot be stored: the `CHECK` rejects them and the contract enum has no such value. `source_system` is pinned to `mews`; `synced_at` and optional `reconciled_at` make any mirror auditable. No ARI table or availability calculation was added.

## Editorial source-of-truth decision

This was an open gate in the W2.1 assessment. The decision for the migration window is:

1. **Webflow remains the editorial source until the W2.6 cutover.** Guest reads stay on the Webflow path by default; D1 snapshots are behind the existing per-route flags.
2. The CMS export supplies publication state **once**, at import. The seed uses `ON CONFLICT DO NOTHING` for publication rows, so a later reseed cannot revert a decision made in D1.
3. After import, the publication row is **editor-owned**: it changes through the COW-38 draft/publish flow (`publishRoomHotspots` is the established precedent for publish-time write-through), not through a CMS re-export.
4. Published-only reads use `listPublishedRoomTypes` / `listPublishedLocations` (and the provider's filtered collections). Draft/archived records never reach a published snapshot.

The old hardcoded deny-list in `worker/publication-gate.ts` remains the fallback for collections without a publication contract; it is no longer the source of truth for room types or locations in D1 reads.

## Verification

```bash
npm run d1:migrate:check
node --test tests/editorialPublicationState.test.ts
npm run test:seed
node --test tests/snapshotsParity.test.ts tests/roomAmenitiesAdmin.test.ts tests/publishedAmenitiesGuest.test.ts
npm test                 # 537 tests pass
npm run typecheck
npm run lint:controls
```

## Deployment ordering

Apply migration 0012 to the target D1 before deploying a Worker that uses these helpers. If the Worker lands first, snapshot reads fail safe to Webflow (the existing fallback) until the migration is applied; no draft content is served in the meantime.

## Remaining work

- W2.3 must populate `mews_reference_sync` only for approved stable references; no ARI surface may be added.
- W2.6 must confirm the production D1 ledger includes migration 0012 and that the draft room type stays out of published snapshots after the seed is applied remotely.
- W2.7 must verify the provider-switch readiness claim with sample record traces for publication state.
