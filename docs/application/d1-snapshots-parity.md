# D1 published snapshots, shadow reads and parity (COW-32)

This document describes the cutover-safe content layer added for COW-32. It complements the [COW-30 schema contracts](d1-schema-contracts.md) and the [COW-29 source audit](../source-system-audit.md).

## Invariants

1. **Mews remains transactional.** No snapshot contains price, availability, restrictions, payments or reservations.
2. **Default has no behavior change.** `CONTENT_SOURCE` defaults to `webflow`. Guest-facing routes still use the existing Webflow readers unless the flag is explicitly set to `d1`.
3. **Snapshots are immutable and content-addressed.** A version is the SHA-256 of the canonical JSON of its ordered records. Rebuilding unchanged content yields the same version.
4. **Shadow reads never serve traffic.** They only record structured differences.

## Feature flag modes

| `CONTENT_SOURCE` | Public snapshot reads | Shadow comparison | Purpose |
| --- | --- | --- | --- |
| `webflow` (default) | admin/viewer only | off | No change to production reads |
| `shadow` | admin/viewer only | on refresh and on demand | Accumulate parity evidence |
| `d1` | public | on demand | Guest reads may use pinned snapshots |

The flag is a Worker variable, never a request parameter. Rollback is setting it back to `webflow`; the previous snapshot version remains pinned until the pointer is repointed.

## Tables (migration 0004)

- `published_snapshots` — immutable rows keyed by `(tenant_id, location_id, collection, version)` with `payload_json`, `item_count`, `checksum`, `created_at`. `location_id = ''` means tenant-wide. That sentinel is deliberately **not** an FK to `locations`; concrete location IDs are validated by the tenant-scoped read path instead.
- `snapshot_pointers` — current and previous version per `(tenant_id, location_id, collection)`. A refresh writes a new snapshot and moves `current → previous`; a rollback swaps them back without deleting either snapshot.
- `parity_reports` — one row per shadow comparison with `difference_count` and a JSON summary.

Rollback SQL lives in `scripts/d1-rollback/0004_published_snapshots_down.sql`, outside `migrations_dir`, and drops only 0004 objects. Migration 0004 is registered in `migrations/manifest.json` and verified by `npm run d1:migrate:check`.

## Typed provider

`worker/content-provider.ts` loads published, tenant-scoped rows for `locations`, `buildings`, `roomTypes`, `amenities`, `addOns`, `events` and `contentItems` through the contract-validated scoped helpers from COW-30. Publication is respected at the query level: draft add-ons and content items are excluded, and only displayed events are read. Collections whose D1 table has no status column (`locations`, `buildings`, `roomTypes`, `amenities`) are published by presence; for every other collection the snapshot requires an explicit published/displayed signal. Mews IDs are carried as references, never resolved into prices.

## Snapshot behavior

- `buildSnapshot()` sorts records by id, canonicalizes JSON (keys sorted recursively), and hashes it. The hash is the version, the ETag, and the checksum.
- `GET /api/content/snapshots/:collection?location=&version=` returns the current or a pinned version. Pinned reads are immutable and carry `X-Snapshot-Pinned: true`.
- Public snapshot responses use `Cache-Control: public, max-age=0, s-maxage=300, stale-while-revalidate=60` and `ETag: "<version>"` — version pinning makes a cached response safe across refreshes.
- Admin endpoints use `Cache-Control: no-store, private` and Cloudflare Access role/tenant checks (`requireAdmin`, `authorizeScopedRequest`). A caller-supplied `?tenant=` is rejected unless it matches the configured scope.
- **Error fallback:** if D1 is unavailable or the snapshot read fails, the route falls back to the Webflow loader and returns `X-Content-Fallback: webflow`. If that also fails it returns a clean `503` — never a 500 that could break the booking flow.

## Refresh, purge and rollback

- `POST /api/content/snapshots/refresh` (admin) rebuilds snapshots from current published D1 rows and repoints. An optional JSON body `{ "collection": "locations" }` limits the refresh. In `shadow` mode the refresh also queues shadow comparisons.
- `POST /api/content/snapshots/rollback` (admin) repoints to the previous version; `skipped` lists collections with no previous version. Optional `{ "collection": ... }` limits it.
- A refresh is the purge: old payloads are no longer pointed to, so edge caches see a new ETag within their `s-maxage`. There is no separate CDN purge API in this change.
- Webflow publishing does **not** yet trigger a refresh automatically; an admin or a future scheduled job must call the refresh endpoint. This is an explicit follow-up.

## Shadow reads and parity semantics

`worker/shadow-read.ts` fetches the published Webflow items for collections whose IDs are configured (`WEBFLOW_LOCATION_COLLECTION_ID`, `WEBFLOW_BUILDING_COLLECTION_ID`, `WEBFLOW_ROOM_TYPE_COLLECTION_ID`, `WEBFLOW_ADD_ON_COLLECTION_ID`, `WEBFLOW_AMENITY_COLLECTION_ID`) and compares them to the D1 records. Collections without a configured Webflow ID are skipped, not assumed equal.

The comparison is on a deliberately small, stable projection — `id`, `slug`, `name`, `published` — because Webflow `fieldData` and D1 relational columns have different shapes. The report records source/target counts, `added` and `removed` IDs, `matched` count, and `changed` fields with both values. Deep field-level parity (descriptions, media, policies) is a follow-up that needs explicit field mappings; it is not silently claimed here.

`GET /api/content/parity?collection=` (admin/no-store) runs the comparison and returns summaries plus current snapshot versions. Each run also writes a `parity_reports` row.

## Verification

```bash
node --test tests/snapshotsParity.test.ts  # snapshots, pinning, rollback, diffs, flags, headers, fallback
npm run d1:migrate:check                    # migration 0004 checksum and idempotency
npm run test:seed                           # seed and FK integrity
npm test
npm run typecheck
```

## Deferred

- Automatic refresh on Webflow publish and scheduled parity jobs.
- Guest-facing endpoints actually switching to `d1` mode; COW-32 provides the flag and snapshot layer, not the cutover of every route.
- Deep field-level parity and hotspot/media parity (COW-33/34).
- Dashboard screenshots for the parity report UI (no admin UI was added in this change).
