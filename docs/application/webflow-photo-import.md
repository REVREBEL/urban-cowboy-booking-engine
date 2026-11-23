# COW-99 — Temporary Webflow photo URL importer

**Status:** implemented. **Date:** 2026-11-23. **Follows:** [W2.3 CMS import](w2-3-cms-import-reconciliation.md).

This importer uses the existing Webflow photo/CMS functionality as a temporary image URL source so gallery and hotspot work can proceed before the Squarespace decision. It stores URL references only — no image binaries are downloaded or rehosted, and there is no Cloudinary requirement (COW-35 is canceled).

## Adapter contract

`worker/photo-source-adapter.ts` defines the provider-neutral boundary:

- `PhotoSourceAdapter.parse(input)` returns a `PhotoSourceSnapshot` with stable aliases, room type references, one-based gallery positions, metadata, issues and the rooms seen in the source.
- `worker/photo-source-webflow.ts` is the only Webflow-aware module. It accepts a captured CMS payload or a live fetch (`fetchWebflowRoomTypeItems`) and emits that snapshot. Room types resolve from the Webflow item ID or the explicit `mews-room-type-id` binding — never from a filename or gallery heading. Zero or ambiguous matches are reported and skipped.
- A later Squarespace adapter implements the same contract. For a photo that replaces an existing image it emits `sameAs`, pointing at an existing alias (for example a Webflow file ID); the importer resolves that alias to the same master media ID.

## Master media identity

- New IDs are derived deterministically from `(tenant, provider-neutral logical key)` and use the neutral `mm-` prefix. URLs and provider names never become identity.
- `media_aliases` holds stable source identifiers (`webflow_file_id`, `webflow_cdn_url`, and any future provider alias). Resolution is tenant-scoped and joins `media_assets` on both tenant and ID, so another tenant's alias is never reused.
- A re-import resolves the same aliases, updates `squarespace_url`/`squarespace_url`-backed version URL, dimensions and alt text on the **same** `media_assets.id`, and upserts the same placement ID (`pl-<roomTypeId>-<mediaId>`). Hotspot mappings keyed on media/placement IDs survive.
- Reordering changes only `media_placements.display_order`. Room remapping adds a placement; the old placement is never deleted.
- `media_asset_metadata.current_version_id` stays on `<mediaId>:v1` for a URL-only import — a URL change is not a new binary version.

## Safety properties

1. Rooms that do not resolve to exactly one canonical room type contribute no statements.
2. An unresolved/invalid photo is reported and skipped; it never creates a placeholder media ID.
3. Duplicate source aliases in one run are reported; only the first is imported.
4. Removed source images are **reported only**. No `DELETE` statement is ever emitted.
5. Placement order collisions are freed by parking the occupying placement once; a re-import with unchanged order produces no park update.
6. Aliases are inserted with `ON CONFLICT DO NOTHING`, so a second provider cannot steal an existing master ID.

## CLI

```bash
# Offline dry run from a captured Webflow CMS payload
node scripts/sync-webflow-photos.mjs \
  --file tests/fixtures/webflow-room-types-photos.json \
  --room-types tests/fixtures/webflow-photo-room-types.json

# Live Webflow CMS (credentials are env-only)
WEBFLOW_SITE_ID=... WEBFLOW_ROOM_TYPE_COLLECTION_ID=... WEBFLOW_CMS_API_TOKEN=... \
  node scripts/sync-webflow-photos.mjs --api --room-types room-types.json

# Emit a reviewable script, then apply explicitly
node scripts/sync-webflow-photos.mjs --file photos.json --room-types room-types.json \
  --db local.sqlite --sql-out /tmp/webflow-photos.sql
wrangler d1 execute urban-cowboy-content --local  --file /tmp/webflow-photos.sql
wrangler d1 execute urban-cowboy-content --remote --file /tmp/webflow-photos.sql   # separate approval
```

`--room-types` is required for explicit room resolution. `--db` points at a local SQLite file seeded from D1; without it the dry run seeds the supplied room types into an in-memory database, so per-room matching is still meaningful but existing-state diffs are empty. `--now` fixes the timestamp for deterministic output.

The dry-run report shows matched, created, updated, duplicate, invalid, unresolved and reported-removed counts plus each source issue. `--sql-out` writes a `BEGIN`/`COMMIT` script with no deletions.

## Verification

```bash
node --test tests/webflowPhotoImport.test.ts
npm test                 # 570 tests pass
npm run typecheck
npm run lint:controls
npm run d1:migrate:check
```

The test suite covers explicit room resolution, deterministic IDs, ordered placements, URL changes, provider switch, duplicate aliases, tenant isolation, room remapping, empty-source safety, non-deletion and paginated live fetch.

## Next

W2.3 and W2.4 converge at W2.5 / Sync Gate 1. Hotspot photo identity continues to use the COW-34 geometry policy; this importer supplies the master IDs those mappings reference.
