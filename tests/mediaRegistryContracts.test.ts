// COW-33: Zod contracts for the media registry extension.
import assert from "node:assert/strict";
import test from "node:test";
import {
  mediaActionSchema,
  mediaAssetMetadataRowSchema,
  mediaPlacementRowSchema,
  mediaRevisionRowSchema,
  mediaVersionFileRowSchema,
} from "../src/types/d1-contracts.ts";

const stamp = "2026-11-17T00:00:00Z";

const metadata = {
  media_asset_id: "media-1",
  tenant_id: "urban-cowboy",
  description: "Room photo",
  caption: "Catskills suite",
  tags: '["room","suite"]',
  attribution: "Photographer",
  status: "active",
  current_version_id: "media-1:v2",
  created_at: stamp,
  updated_at: stamp,
};

test("media metadata rows transform global metadata and tag JSON", () => {
  const parsed = mediaAssetMetadataRowSchema.parse(metadata);
  assert.equal(parsed.mediaAssetId, "media-1");
  assert.equal(parsed.currentVersionId, "media-1:v2");
  assert.deepEqual(parsed.tags, ["room", "suite"]);
  assert.equal(parsed.status, "active");
  assert.equal(mediaAssetMetadataRowSchema.parse({ ...metadata, tags: null }).tags, null);
});

test("media metadata rejects malformed tags and unknown status", () => {
  assert.equal(mediaAssetMetadataRowSchema.safeParse({ ...metadata, tags: "room,suite" }).success, false);
  assert.equal(mediaAssetMetadataRowSchema.safeParse({ ...metadata, tags: '["room",7]' }).success, false);
  assert.equal(mediaAssetMetadataRowSchema.safeParse({ ...metadata, status: "deleted" }).success, false);
});

test("version file, placement and revision rows transform to camelCase", () => {
  const file = mediaVersionFileRowSchema.parse({
    version_id: "media-1:v2",
    tenant_id: "urban-cowboy",
    media_asset_id: "media-1",
    cloudinary_public_id: "urban-cowboy/room-v2",
    cloudinary_version: "v2",
    sha256: "hash-2",
    byte_size: 2048,
    mime_type: "image/png",
    created_at: stamp,
  });
  assert.equal(file.versionId, "media-1:v2");
  assert.equal(file.cloudinaryPublicId, "urban-cowboy/room-v2");
  assert.equal(file.byteSize, 2048);

  const placement = mediaPlacementRowSchema.parse({
    id: "placement-1",
    tenant_id: "urban-cowboy",
    media_asset_id: "media-1",
    target_table: "room_types",
    target_id: "room-1",
    placement_type: "gallery",
    alt_text_override: null,
    caption_override: "Suite",
    description_override: null,
    display_order: 0,
    created_at: stamp,
    updated_at: stamp,
  });
  assert.equal(placement.targetTable, "room_types");
  assert.equal(placement.captionOverride, "Suite");
  assert.equal(placement.displayOrder, 0);

  const revision = mediaRevisionRowSchema.parse({
    id: "rev-1",
    tenant_id: "urban-cowboy",
    media_asset_id: "media-1",
    action: "replace",
    from_version_id: "media-1:v1",
    to_version_id: "media-1:v2",
    target_table: null,
    target_id: null,
    actor: "editor@example.com",
    note: null,
    metadata_json: null,
    created_at: stamp,
  });
  assert.equal(revision.fromVersionId, "media-1:v1");
  assert.equal(revision.toVersionId, "media-1:v2");
  assert.equal(revision.actor, "editor@example.com");
});

test("media actions and placement types reject unknown values", () => {
  assert.equal(mediaActionSchema.safeParse("replace").success, true);
  assert.equal(mediaActionSchema.safeParse("delete_everything").success, false);
  const placement = {
    id: "placement-1",
    tenant_id: "urban-cowboy",
    media_asset_id: "media-1",
    target_table: "room_types",
    target_id: "room-1",
    alt_text_override: null,
    caption_override: null,
    description_override: null,
    display_order: 0,
    created_at: stamp,
    updated_at: stamp,
  };
  assert.equal(mediaPlacementRowSchema.safeParse({ ...placement, placement_type: "gallery" }).success, true);
  assert.equal(mediaPlacementRowSchema.safeParse({ ...placement, placement_type: "unknown" }).success, false);
});
