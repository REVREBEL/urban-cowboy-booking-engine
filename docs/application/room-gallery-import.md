# Room Gallery Import (COW-67)

Imports room-type gallery image URLs from the Urban Cowboy Squarespace site into the
COW-33 media registry. URL references and associations only — image binaries are not downloaded or
rehosted.

## Source

`https://www.urbancowboy.com/catskills/image-feed`

Verified 2026-11-18 against the live site:

| Request | Status | Content type | Result |
|---|---|---|---|
| `GET /catskills/image-feed` | 200 | `text/html` | Galleries present in server HTML |
| `GET /catskills/image-feed?format=json` | 200 | `application/json` | **`mainContent` is empty** — no gallery content |
| `GET /catskills/image-feed?format=rss` | 400 | — | `Unknown response format for page type` |

**HTML is the only method that works.** The JSON path is a Squarespace page envelope with an empty
body, and RSS is not supported for this page type.

## How association works

Each gallery is a `<section>` carrying an explicit id:

```html
<section id="image-feed-alpine-bathing-suite"
         data-section-id="6afd4e854cc3371e7612305d"
         data-sqsp-section="gallery">
```

The slug in `id="image-feed-<slug>"` **is** the room identity. The parser reads it directly — no
positional guessing, no dependence on heading order.

A positional fallback (heading section followed by gallery section) remains for older markup with no
id. Galleries resolved that way are tagged `extraction: "positional"` in the plan so a caller can
tell which contract was in play, and a heading without a gallery produces a warning rather than a
silent mismatch.

## Room resolution

The gallery id slug is tried first, then the heading by normalised name, then slug, then an explicit
alias map. **Zero or several matches both fail.** A room that does not resolve to exactly one room
type contributes no statements.

An unknown id is **not** rescued by its heading — the publisher named the gallery after something the
catalogue does not have, and guessing would mask that.

Current mapping:

| Gallery id slug | Matched by | Room type |
|---|---|---|
| `alpine-bathing-suite` | id | `alpine-bathing-suite` |
| `walden-forest-bathing-suite` | id | `walden-forest-bathing-suite` |
| `walden-king` | id | `walden-king` |
| `walden-bathing-suite-den` | **alias** | `walden-forest-bathing-suite-with-den` |

The alias exists in `ROOM_SLUG_ALIASES` because the feed's id is shorter than the catalogue slug.
It is an explicit mapping, not a fuzzy match.

## Commands

Read-only plan (default):

```bash
node scripts/sync-room-gallery.mjs
```

Emit a reviewable import script:

```bash
node scripts/sync-room-gallery.mjs --sql-out /tmp/room-gallery.sql
```

Apply to local D1:

```bash
wrangler d1 execute urban-cowboy-content --local --file /tmp/room-gallery.sql
```

Apply to production (**explicit, separate approval**):

```bash
wrangler d1 execute urban-cowboy-content --remote --file /tmp/room-gallery.sql
```

Offline replay against a captured page:

```bash
node scripts/sync-room-gallery.mjs \
  --file tests/fixtures/room-gallery-image-feed.html \
  --room-types /tmp/room-types.json
```

## What it writes

Three COW-33 tables, no new schema:

- `media_assets` — one row per Squarespace asset, keyed `sqsp-<assetId>`, carrying the canonical
  URL (resize query stripped), dimensions and alt text.
- `media_versions` — version 1 of each asset.
- `media_placements` — `target_table='room_types'`, `placement_type='room_gallery'`, ordered by source position.

`media_asset_metadata` gets a `current_version_id` row so the registry read path stays consistent.

One image referenced by two rooms produces **one** `media_assets` row and **two** placements.

### Ordering and removals

Each room's existing placements are moved above `PARK_OFFSET` (1,000,000) before the new set is
written. That frees the 1..N range so positions can be rewritten without colliding with the
`(room, display_order)` unique constraint.

An image that disappears from the feed is **parked, not deleted**. It keeps its media asset and
association, appears in the reconciliation report as `removed`, and waits for an explicit policy.
An empty or failed fetch writes nothing at all.

## Reconciliation

Every run reports per room: `new`, `unchanged`, `reordered`, `url-changed`, `removed`, `failed`,
plus any unresolved room. This is the dry-run artifact to diff between two successive snapshots.

## Schedule

Not scheduled yet. The intended shape is a Cloudflare Worker cron entry that runs daily, fetches with
`ETag`/`Last-Modified` where available, and logs per-run counts. It must not overlap itself, must not
retry-storm, and must not purge on failure.

## Rollback

```bash
npx wrangler d1 execute urban-cowboy-content --remote \
  --command "DELETE FROM media_placements WHERE placement_type = 'room_gallery'"
```

That detaches room galleries without deleting the underlying media assets. To also retire the assets:

```bash
npx wrangler d1 execute urban-cowboy-content --remote \
  --command "DELETE FROM media_assets WHERE id LIKE 'sqsp-%'"
```

Both are destructive and should only run with explicit approval.

## Known limitations

- **The id is the contract, but nothing enforces it.** If a future edit drops `id="image-feed-…"` from
  a gallery section, the parser silently falls back to positional pairing. Adding a CI check that
  asserts every `data-sqsp-section="gallery"` has a feed id would close that.
- **No content hashing.** Duplicate images uploaded under different asset IDs are not detected — the
  live feed already contains one image shared between two rooms under two asset IDs. Deduplicating
  that needs a content hash, which needs the binary, which v1 deliberately does not fetch.
- **Signed URLs.** None observed; all URLs are stable `images.squarespace-cdn.com` paths.
- **No auto-publish.** Nothing here changes guest-facing content without separate approval.