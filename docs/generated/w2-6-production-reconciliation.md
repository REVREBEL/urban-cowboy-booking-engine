# COW-101 — production D1 reconciliation evidence

**Database:** `urban-cowboy-content` (`0d09ca5a-74fe-4e83-a058-b8aa5fb21562`, approved REVREBEL account).
**Verified:** 2026-11-24 by read-only D1 query after the reviewed apply sequence.
**No content flag was flipped.**

## Apply sequence (all steps completed)

1. `npm run d1:migrate:remote` — applied 0010, 0011 and 0012 after a dated remote export backup.
2. `npm run deploy:d1` — applied idempotent `seed.sql` (737 queries) and verified counts/time zones.
3. `npm run sync:webflow-photos -- --api --room-types … --db <backup> --sql-out …` — 156 live Webflow gallery images, 122 new master assets, 34 additional placements on existing assets; applied via Wrangler.
4. Published 10 initial snapshots through the Cloudflare D1 API with bound parameters (the Wrangler SQL-file path hit D1's per-statement size limit on the large `roomGallery` payload). This path is now supported by `npm run d1:publish-snapshots -- --api-apply` and `npm run sync:webflow-photos -- --api-apply`, which send media and pointer updates in one atomic batch; tests cover a production-sized payload and an induced batch failure.

## Migration ledger

All 12 repository migrations are present in `d1_migrations`, `0001_init.sql` … `0012_editorial_publication_state.sql`. No unapplied or extra migration.

## Editorial and provenance counts

| Table | Rows |
| --- | ---: |
| tenants | 1 |
| locations / location_publication | 4 / 4 |
| buildings | 9 |
| room_types / room_type_publication | 22 / 22 |
| amenities / amenity_editorial | 76 / 76 |
| room_type_amenities | 253 |
| content_items / content_revisions | 25 / 25 |
| content_provenance | 190 |

Publication state: 21 published room types, 1 draft (`6abd4a1debcab0ea7e461c9a`) — the known Webflow draft is excluded from published reads.

## Media counts and integrity

| Table | Rows |
| --- | ---: |
| media_assets (permanent master IDs) | 122 |
| media_versions | 122 |
| media_aliases (provider aliases) | 265 |
| media_asset_metadata | 122 |
| media_placements | 156 |
| published_snapshots / snapshot_pointers | 10 / 10 |

Orphan checks (all zero): placements → media assets, aliases → media assets, room/amenity relationships → room types, publication rows → room types.

Snapshot pointers cover `locations`, `buildings`, `roomTypes`, `amenities`, `roomAmenities`, `roomGallery`, `addOns`, `events`, `contentItems` and `policyLanguage`, each with a content-addressed current version.

## Source issues from the live Webflow import

- Two room types had no gallery images in Webflow (`6abd50f0e0589519e89a7f10`, `6abd4a25cd450395156515c6`); they were reported and skipped, not guessed.
- No invalid URLs, duplicate source aliases or unresolved room references.
- No source image was deleted: the importer emits no `DELETE`.

## Authority and rollbacks

- `mews_reference_sync` remains empty; only stable reference types are permitted and no ARI value exists in D1.
- Snapshots are immutable per version and can be rolled back by repointing `snapshot_pointers`.
- Dated pre-migration and pre-seed exports are in `backups/d1/` (never committed); migration 0012 has an idempotent down script.

## Conclusion

W2.6 production population is complete and reconciled. W2.7 (COW-102) can now provide W2's Gate 2 evidence; W1 and W3 must record their own parity confirmations before the joint gate closes.
