# COW-101 — W2.6 production D1 population runbook

**Status:** prepared and locally rehearsed. **No production write has been performed.** Gate 1 is closed (COW-100 Done; COW-93 and COW-107 Done; `gate1-v1.0` recorded on all three).

Applying migrations, seed or generated SQL to the remote D1 is a separate, explicitly approved operation. The commands below are the reviewed sequence; do not run the `--remote` steps without that approval.

## Local preflight (no remote access)

```bash
npm run d1:migrate:check          # 12 migrations apply twice, FK/integrity clean
npm run test:seed                 # seed counts, idempotency, provenance, publication state
node --test tests/productionPopulation.test.ts tests/webflowPhotoImport.test.ts
npm run seed:check                # generated seed + both reports are current
npm test                          # full suite
npm run typecheck && npm run lint:controls
```

`tests/productionPopulation.test.ts` applies all 12 migrations plus `seed.sql` to a fresh database and asserts the production counts, no orphan relationships, a single draft room type, and that `scripts/publish-d1-snapshots.mjs` generates an idempotent, applyable snapshot script.

## Expected production counts

| Table | Rows |
| --- | ---: |
| tenants | 1 |
| locations / location_publication | 4 / 4 |
| buildings | 9 |
| room_types / room_type_publication | 22 / 22 (1 draft) |
| amenities / amenity_editorial | 76 / 76 |
| room_type_amenities | 253 |
| events / offers / add_ons | 8 / 8 / 9 |
| rate_merchandising | 5 |
| content_items / content_revisions | 25 / 25 |
| content_provenance | 190 |

Media tables are populated only by the reviewed photo-import script; hotspots remain governed by the COW-34 publication workflow.

## Approved apply sequence

1. **Export and back up the remote database.** `scripts/deploy-d1.mjs` does this automatically before writes; the backup lands in `backups/d1/` and must never be committed.
2. **Apply migrations:** `npm run d1:migrate:remote`. The runner validates filename order and manifest checksums, reuses the approved-account check, and applies only forward migrations. Migration 0012 adds the publication extension tables and the ARI-safe Mews reference contract.
3. **Apply the editorial seed:** `npm run deploy:d1`. It renders the approved Wrangler config, applies idempotent `seed.sql`, then verifies the counts above, per-location time zones and non-NULL `location_id`s.
4. **Generate the photo import script from a fresh export:**
   ```bash
   npx wrangler d1 execute urban-cowboy-content --remote --json \
     --command "SELECT id, name, slug, mews_room_category_id FROM room_types" > room-types.json
   # capture the Webflow room-type CMS payload as webflow-photos.json (live --api or saved fixture)
   npm run sync:webflow-photos -- --file webflow-photos.json --room-types room-types.json \
     --db /path/to/backup.sqlite --sql-out /tmp/webflow-photos.sql
   ```
   `--db` is mandatory for `--sql-out`: the generated script refreshes the published `roomGallery` snapshot in the same atomic D1 file import as the registry updates. The export is opened read-only. Review the dry-run counts before applying. Wrangler D1 rejects explicit `BEGIN`/`COMMIT`, so no transaction statements are emitted.
5. **Apply the reviewed photo script:** `npx wrangler d1 execute urban-cowboy-content --remote --file /tmp/webflow-photos.sql`.
6. **Publish the remaining initial snapshots:** `npm run d1:publish-snapshots -- --db /path/to/backup.sqlite --out /tmp/snapshots.sql`, review, then apply with `wrangler d1 execute ... --file /tmp/snapshots.sql`. Collection versions are content-addressed and the pointer update is idempotent, so a replay does not create duplicate versions.
7. **Verify** with the reconciliation queries below. Keep all content flags at `webflow`; W3 owns the cutover (COW-108).

## Reconciliation queries

```sql
SELECT COUNT(*) FROM media_assets;                       -- stable master IDs
SELECT COUNT(*) FROM media_aliases;                      -- provider aliases
SELECT COUNT(*) FROM media_placements;                   -- room gallery placements
SELECT COUNT(*) FROM media_placements p
  LEFT JOIN media_assets a ON a.id = p.media_asset_id
 WHERE a.id IS NULL;                                      -- must be 0
SELECT COUNT(*) FROM content_provenance;                 -- 190 after seed
SELECT room_type_id FROM room_type_publication WHERE status='draft';
SELECT collection, current_version FROM snapshot_pointers ORDER BY collection;
PRAGMA foreign_key_check;                                -- must be empty
```

No orphan media, placements, hotspots or references are acceptable. Import retry and source failure must preserve existing published content: the seed uses upserts, publication rows are editor-owned (`state_source='editor'` is never overwritten), the importer emits no `DELETE`, and a failed atomic import never repoints a snapshot.

## Selective Mews reference sync

`mews_reference_sync` accepts only `hotel`, `rate_group`, `product`, `room_category` and `age_category`, pinned to `source_system='mews'` with sync/reconciliation timestamps. No ARI reference type may be added without a new contract version. Nothing is populated here by default.

## Rollback

- Snapshots: repoint the relevant `snapshot_pointers.current_version` to `previous_version`, or use `rollbackSnapshot()`; no version row is deleted.
- Seed/media scripts: restore from the dated remote export in `backups/d1/`; idempotent inserts mean a re-apply is safe once the cause is understood.
- Migration 0012: `scripts/d1-rollback/0012_editorial_publication_state_down.sql`. Foundational migrations require a point-in-time restore.

## What remains

- Explicit owner approval for remote migration/seed/photo/snapshot apply.
- W1/W3 production acceptance for the populated data (W2.7 / COW-102).
