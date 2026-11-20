# Durable hotspot mapping and replacement/re-crop safety policy (COW-34)

Source-of-truth constraint: room photos originate as **URL references** in the Squarespace
`image-feed` and are imported into the COW-33 media registry by COW-67 (see
[room-gallery-import.md](room-gallery-import.md)). No binary is fetched and no Cloudinary ingestion
is required. Hotspot identity therefore never depends on a URL, a Webflow/Squarespace file ID, or a
resize parameter.

## 1. Identity contract

| Concept | Field | Rule |
| --- | --- | --- |
| Pin identity | `photo_hotspot_mappings.id` | Never reused; survives every version change of the same logical photo. |
| Photo identity | `media_asset_id` | The immutable COW-33 `media_assets.id`. |
| Room context | `placement_id` / `target_table` / `target_id` | The COW-33 `media_placements` row, so one photo used by two rooms keeps separate room-scoped pins. |
| Amenity identity | `amenity_id` | The canonical D1 amenity id; pins are only eligible when the amenity is assigned to that room (COW-73). |
| Geometry | `source_x`, `source_y` | Normalized `0..1` coordinates in the **source image** coordinate space of `source_version_id`. Not display pixels and not crop percentages. |
| Source facts | `source_width`, `source_height`, `exif_orientation` | Intrinsic pixels and display orientation of the version the pin was authored on. |
| Crop context | `crop_left`, `crop_top`, `crop_width`, `crop_height` | Optional source-pixel rectangle actually displayed; `NULL` means "full source, unknown crop". |
| Verification | `review_state`, `review_reason` | `none` (safe to publish), `pending` (needs a human), `approved`. Geometry changes never auto-publish while pending. |
| Lineage | `derived_from`, `media_version_fingerprints` | Each carried mapping records its predecessor; hash facts are stored per version, never merged silently. |

Legacy Webflow `photo-file-id` / `photo-url` values are **aliases only**, resolved at import through
all 24-hex ids in the value with the shared site id discarded (the bug fixed in `cowboy-dashboard`
`extractAssetIds`). A wrapper id, a Squarespace `?format=` / `?width=` variant, or a CDN host change
is a URL-only change and cannot create, move or delete a pin.

## 2. Duplicate detection

- **Exact**: `sha256` equality on `media_version_files` / `media_version_fingerprints`.
- **Candidate near-duplicate**: Hamming distance on a 64-bit difference hash (`dHash`) computed from
  a caller-supplied luminance grid. There is no decoder for URL-only imports, so `phash` is `NULL`
  there and no near-duplicate inference is attempted.
- Neither signal merges records. A match produces a `duplicate_exact` / `duplicate_candidate`
  finding for review; `link_existing` stays an explicit operator action in COW-33.

## 3. Replacement decision table

| Change | Classification | Pin behavior | Publish |
| --- | --- | --- | --- |
| URL / resize parameter only, same media + placement | `url_only` | No-op; pins untouched | allowed |
| New version, identical `sha256`, same dimensions and EXIF | `exact_reupload` | Carry pins unchanged onto the new version | allowed |
| Same file with a known crop rectangle change | `crop_remap` | Affine remap source→crop; coordinates stay normalized | allowed when the crop is complete and in bounds, else `pending` |
| Crop rectangle unknown, ambiguous, or out of bounds | `crop_review` | Carry original coordinates, flag review | **blocked** until approved |
| New version, different file, same/related photo (different hash, changed angle/aspect/EXIF) | `replacement_review` | Carry edits in draft/lineage; geometry is unverified | **blocked** until approved |
| Same hash or near hash on a different media id | `duplicate_exact` / `duplicate_candidate` | No merge, no carry | blocked |
| Rollback to a prior `from_version_id` | `rollback` | Restore the stored geometry snapshot for that version | allowed only if the restored set has no pending review |

Publishing is gated: `publishMappings` rejects any set containing a `pending` review state, and the
Worker never auto-approves a geometry change. Guest reads remain on Webflow (`CONTENT_SOURCE`
defaults to `webflow`); the D1 hotspot path is behind a separate flag that defaults off.

## 4. Geometry rules

- Coordinates are stored in source space; crop and responsive display scaling are applied at read
  time, so a responsive re-crop cannot drift pins.
- EXIF orientation is normalized once at authored time; a change of orientation between versions is
  a geometry change and goes through the decision table.
- All transforms are pure functions with no network or DOM access, so they are unit-testable.

## 5. Acceptance mapping

| Requirement | Mechanism | Test |
| --- | --- | --- |
| Exact-file reupload preserves positions | `exact_reupload` carry | `tests/hotspotMapping.test.ts` |
| Crop remaps or prompts review | `crop_remap` / `crop_review` | geometry + service tests |
| Different-angle replacement preserves edits, cannot auto-publish | `replacement_review` + publish gate | service test |
| Webflow wrapper ids | `extractWebflowAssetIds` drops site id | geometry test |
| Responsive crop | normalized source coords + crop transform | geometry test |
| EXIF orientation | orientation transform table | geometry test |
| Revision rollback | `photo_hotspot_mapping_revisions` snapshots | service test |

## 6. Delivery guardrails

No Mews booking/pricing/availability code is touched. No production flag is flipped by this work;
`PHOTO_HOTSPOT_SOURCE` defaults to `webflow`. Admin schema/write paths are tenant-scoped and
Cloudflare-Access gated by the same authorizer contract as COW-72/COW-73. No guest cutover until
published D1 hotspots pass parity, auth/RBAC and rollback checks.
