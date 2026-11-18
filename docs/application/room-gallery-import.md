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

The page has **no** `id="image-gallery-<slug>"` attributes. Each room is a heading section
immediately followed by its gallery section:

```
6afd6d274cc3371e7615bf21  heading  "Alpine Bathing Suite"
6afd4e854cc3371e7612305d  gallery  5 images
6afd6d3854baec4a10c54b2d  heading  "Walden Forest Bathing Suite"
6afd6d5e8fcd302800118d24  gallery  4 images
6afd6e058cd0d01b251e47c7  heading  "Walden King"
6afd5d4f0000e93adababdd4  gallery  9 images
6afd6e5e7f74df557cb977fa  heading  "Walden Bathing Suite with Den"
6afd6e0f0000e93adabcbbc2  gallery  5 images
```

`parseRoomGalleryFeed` pairs by document order and **warns rather than guessing** when a heading has
no gallery or a gallery has no heading. That makes a markup regression visible instead of silently
mis-assigning images.

The minimal CMS fix, if pairing ever breaks: add `data-room-type="<slug>"` to each gallery section.
That would replace positional pairing with an explicit contract.

## Room resolution

Headings are matched against `room_types` by normalised name, then slug, then an explicit alias map.
**Zero or several matches both fail.** A room that does not resolve to exactly one room type
contributes no statements.

Current mapping:

| Heading | Matched by | Room type |
|---|---|---|
| Alpine Bathing Suite | name | `alpine-bathing-suite` |
| Walden Forest Bathing Suite | name | `walden-forest-bathing-suite` |
| Walden King | name | `walden-king` |
| Walden Bathing Suite with Den | **alias** | `walden-forest-bathing-suite-with-den` |

The alias exists in `ROOM_HEADING_ALIASES` because the feed heading is not a verbatim room-type name.

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

- **Positional pairing.** Association depends on the heading-then-gallery section order. The CMS fix
  above is the durable answer.
- **No content hashing.** Duplicate images uploaded under different asset IDs are not detected — the
  live feed already contains one image shared between two rooms under two asset IDs. Deduplicating
  that needs a content hash, which needs the binary, which v1 deliberately does not fetch.
- **Signed URLs.** None observed; all URLs are stable `images.squarespace-cdn.com` paths.
- **No auto-publish.** Nothing here changes guest-facing content without separate approval.