# COW-98 — W2.3 Webflow CMS import and D1 reconciliation

**Status:** implemented. **Date:** 2026-11-23. **Follows:** [W2.2 publication contracts](w2-2-editorial-publication-contracts.md).

This milestone completes the non-photo CMS import using the existing generator rather than a parallel importer, and adds the reconciliation artifacts the acceptance criteria require.

## What changed

| Area | Change |
| --- | --- |
| `src/lib/cms-field-mapping.ts` | Explicit per-collection field contract: which source fields map to which D1 targets, which are import metadata, and why the rest are not stored. |
| `docs/generated/cms-field-mapping.json` | Generated field-level mapping report covering every exported field in all 12 collections. |
| `scripts/seed-d1-from-webflow.mjs` | `--check` (fail when committed generated files are stale, ignoring `generatedAt`) and `--diff` (added/removed line summary); field-map output; documented Catskills Mews hotel ID; DST-safe event note. |
| `package.json` | `seed:check` and `seed:diff` scripts. |
| `seed.sql`, `docs/generated/d1-reconciliation.json` | Regenerated: 398 source records, 547 SQL rows across 15 tables, 190 provenance rows. |

## Coverage and reconciliation

The 2026-11-15 export contains 12 collections and 398 records. `assertSourceCoverage()` still fails fast on any new collection that is neither mapped nor explicitly excluded.

| Collection | Source rows | D1 result |
| --- | ---: | --- |
| Locations | 4 | 4 rows + 4 publication rows + published `site_settings` content item |
| Buildings | 9 (+1 duplicate skipped) | 9 location-scoped rows |
| Room Types | 22 | 22 rows, 253 amenity relationships, 22 publication rows (1 draft) |
| Amenities | 76 | 76 rows + 76 `amenity_editorial` rows |
| Events | 8 | 8 DST-safe rows with per-property time zone |
| Offers | 8 | 8 rows (3 nonbookable kept as draft), 5 merchandising rows |
| Add Ons | 9 | 9 rows with editorial copy from `long-description` |
| Instagrams / Outlets / Content Settings | 20 / 3 / 1 | Versioned `content_items` + `content_revisions` |
| Photo Hotspots | 238 | Excluded — no stable media identity in this export (W2.4) |
| Menu Items | 0 | Excluded — empty collection |

Idempotency, dry-run, deduplication, parent-before-child ordering and provenance were already covered by the seed and its tests; `--check` now makes generated-file drift a CI-detectable failure and `--diff` gives a reviewable change summary without writing.

## Findings closed in this milestone

- **F-01 (partial):** `locations.mews_hotel_id` is now populated for Catskills from the documented non-secret Hotel ID in `docs/catskills-mews-ids.md`. The other three locations stay NULL — no per-property ID is documented, and the importer does not infer one. This field is editorial reference metadata; the Worker never uses it to call Mews.
- **F-06:** recurring events use their property time zone and a DST-safe `recurrence_rule` (COW-40), not a hard-coded Catskills offset.
- **Field-level mapping:** the acceptance report is now generated, deterministic and explicit about unmapped fields. Unmapped never means silently dropped. A test verifies every claimed `payload_json` target against the actual generated revision payloads, so the report cannot claim a field was imported when it was not.

## Still open (require live/editorial verification, not a code change)

- Add-on Mews product IDs (9) must be validated against Mews as the system of record.
- Three offers without a Mews rate product remain draft/editorial-only.
- Location address/contact, policy and feature-story copy have no D1 column; Webflow remains the source until a publication workflow is agreed. The `site_settings` revision deliberately contains only the five published behavior controls, and the field map tests assert that no other location field is claimed as imported.
- The 238 photo hotspots need stable media identity from the W2.4 source adapter.

## Verification

```bash
npm run seed:d1            # regenerate seed.sql + both reports
npm run seed:check         # fail if generated files are stale
npm run seed:diff          # review added/removed lines without writing
npm run test:seed          # seed applies with FKs on; counts, idempotency, field map
npm test
npm run typecheck
```

## Next

W2.4 (COW-99) builds the temporary Webflow photo URL importer behind a provider-neutral adapter. W2.3 and W2.4 converge at W2.5 / Sync Gate 1.
