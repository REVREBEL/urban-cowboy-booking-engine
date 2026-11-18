// COW-33 media registry actions.
//
// A logical photo keeps media_assets.id for its whole life. Replacing a file
// adds a media_versions row with a new version_id, so aliases, placements and
// global metadata keep pointing at the same media_id. Every action writes a
// media_revisions audit row. All reads and writes are tenant scoped.

import type { MediaAction, MediaAliasType, MediaPlacementType } from "../src/types/d1-contracts.ts";

export interface MediaFileInput {
  cloudinaryPublicId?: string | null;
  cloudinaryVersion?: string | null;
  sha256?: string | null;
  byteSize?: number | null;
  mimeType?: string | null;
}

export interface MediaMetadataInput {
  description?: string | null;
  caption?: string | null;
  tags?: string[];
  attribution?: string | null;
}

interface ActionInput {
  revisionId: string;
  actor?: string | null;
  note?: string | null;
  metadataJson?: string | null;
}

export interface CreateMediaInput extends ActionInput {
  tenantId: string;
  locationId?: string | null;
  kind: "image" | "video" | "document";
  mediaId: string;
  versionId: string;
  originalFilename?: string | null;
  version: number;
  width?: number | null;
  height?: number | null;
  file?: MediaFileInput;
  metadata?: MediaMetadataInput;
}

export interface LinkExistingInput extends ActionInput {
  tenantId: string;
  mediaId: string;
  aliasType?: MediaAliasType;
  aliasValue?: string;
  aliasId?: string;
  placement?: PlacementInput;
}

export interface PlacementInput {
  id: string;
  tenantId: string;
  mediaId: string;
  targetTable: string;
  targetId: string;
  placementType: MediaPlacementType;
  displayOrder: number;
  altTextOverride?: string | null;
  captionOverride?: string | null;
  descriptionOverride?: string | null;
}

export interface ReplaceVersionInput extends ActionInput {
  tenantId: string;
  mediaId: string;
  versionId: string;
  version: number;
  width?: number | null;
  height?: number | null;
  file?: MediaFileInput;
}

export interface RetireInput extends ActionInput {
  tenantId: string;
  mediaId: string;
}

function tagsJson(tags: string[] | undefined): string | null {
  return tags ? JSON.stringify(tags) : null;
}

/** Legacy NOT NULL columns keep deterministic values until a future migration drops them. */
function legacyAssetIdentity(file: MediaFileInput | undefined, fallback: string): {
  squarespaceAssetId: string;
  squarespaceUrl: string;
} {
  const publicId = file?.cloudinaryPublicId?.trim();
  return {
    squarespaceAssetId: publicId || fallback,
    squarespaceUrl: publicId ? `cloudinary:${publicId}` : `urn:media:${fallback}`,
  };
}

async function assertOwned(db: D1Database, tenantId: string, mediaId: string): Promise<void> {
  const row = await db.prepare(
    "SELECT id FROM media_assets WHERE id = ?1 AND tenant_id = ?2",
  ).bind(mediaId, tenantId).first();
  if (!row) throw new Error("media asset not found in tenant");
}

async function audit(
  db: D1Database,
  input: ActionInput,
  action: MediaAction,
  tenantId: string,
  mediaId: string,
  fromVersionId: string | null,
  toVersionId: string | null,
  targetTable: string | null = null,
  targetId: string | null = null,
): Promise<void> {
  await db.prepare(
    `INSERT INTO media_revisions
       (id, tenant_id, media_asset_id, action, from_version_id, to_version_id,
        target_table, target_id, actor, note, metadata_json)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)`,
  ).bind(
    input.revisionId, tenantId, mediaId, action, fromVersionId, toVersionId,
    targetTable, targetId, input.actor ?? null, input.note ?? null,
    input.metadataJson ?? null,
  ).run();
}

async function insertVersionFile(
  db: D1Database,
  tenantId: string,
  mediaId: string,
  version: number,
  width: number | null,
  height: number | null,
  file: MediaFileInput | undefined,
): Promise<string> {
  const versionId = `${mediaId}:v${version}`;
  const legacy = legacyAssetIdentity(file, versionId);
  await db.prepare(
    `INSERT INTO media_versions
       (id, media_asset_id, version, squarespace_asset_id, squarespace_url, width, height)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`,
  ).bind(versionId, mediaId, version, legacy.squarespaceAssetId, legacy.squarespaceUrl, width, height).run();
  await db.prepare(
    `INSERT INTO media_version_files
       (version_id, tenant_id, media_asset_id, cloudinary_public_id, cloudinary_version,
        sha256, byte_size, mime_type)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)`,
  ).bind(
    versionId, tenantId, mediaId,
    file?.cloudinaryPublicId ?? null,
    file?.cloudinaryVersion ?? null,
    file?.sha256 ?? null,
    file?.byteSize ?? null,
    file?.mimeType ?? null,
  ).run();
  return versionId;
}

/** Creates a new logical photo and its first immutable version. */
export async function createMediaAsset(
  db: D1Database,
  input: CreateMediaInput,
): Promise<{ mediaAssetId: string; versionId: string }> {
  await db.prepare(
    `INSERT INTO media_assets
       (id, tenant_id, location_id, kind, original_filename)
     VALUES (?1, ?2, ?3, ?4, ?5)`,
  ).bind(
    input.mediaId, input.tenantId, input.locationId ?? null,
    input.kind, input.originalFilename ?? null,
  ).run();

  const versionId = await insertVersionFile(
    db, input.tenantId, input.mediaId, input.version,
    input.width ?? null, input.height ?? null, input.file,
  );
  if (versionId !== input.versionId) {
    throw new Error("versionId must match the media_id and version");
  }

  await db.prepare(
    `INSERT INTO media_asset_metadata
       (media_asset_id, tenant_id, description, caption, tags, attribution, current_version_id)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`,
  ).bind(
    input.mediaId, input.tenantId,
    input.metadata?.description ?? null,
    input.metadata?.caption ?? null,
    tagsJson(input.metadata?.tags),
    input.metadata?.attribution ?? null,
    versionId,
  ).run();

  await audit(db, input, "create_new", input.tenantId, input.mediaId, null, versionId);
  return { mediaAssetId: input.mediaId, versionId };
}

/** Links a legacy ID or placement to an existing media_id without copying metadata. */
export async function linkExistingMedia(
  db: D1Database,
  input: LinkExistingInput,
): Promise<string> {
  await assertOwned(db, input.tenantId, input.mediaId);
  if (input.aliasType && input.aliasValue) {
    await db.prepare(
      `INSERT INTO media_aliases (id, tenant_id, media_asset_id, alias_type, alias_value)
       VALUES (?1, ?2, ?3, ?4, ?5)`,
    ).bind(
      input.aliasId ?? `${input.mediaId}:${input.aliasType}`,
      input.tenantId, input.mediaId, input.aliasType, input.aliasValue,
    ).run();
  }
  await audit(db, input, "link_existing", input.tenantId, input.mediaId, null, null);
  if (input.placement) await setMediaPlacement(db, input.placement);
  return input.mediaId;
}

/** Adds a new upload version. The media_id, aliases and placements never change. */
export async function replaceMediaVersion(
  db: D1Database,
  input: ReplaceVersionInput,
): Promise<{ mediaAssetId: string; versionId: string }> {
  await assertOwned(db, input.tenantId, input.mediaId);
  const current = await db.prepare(
    `SELECT MAX(v.version) AS latest, mmd.current_version_id AS current_version_id
       FROM media_versions v
       JOIN media_assets m ON m.id = v.media_asset_id
       LEFT JOIN media_asset_metadata mmd ON mmd.media_asset_id = v.media_asset_id
      WHERE v.media_asset_id = ?1 AND m.tenant_id = ?2`,
  ).bind(input.mediaId, input.tenantId).first() as { latest: number; current_version_id: string | null } | null;
  if (!current || input.version <= current.latest) {
    throw new Error("replacement version must be greater than the latest version");
  }

  const versionId = await insertVersionFile(
    db, input.tenantId, input.mediaId, input.version,
    input.width ?? null, input.height ?? null, input.file,
  );
  if (versionId !== input.versionId) {
    throw new Error("versionId must match the media_id and version");
  }
  await db.prepare(
    `UPDATE media_asset_metadata
        SET current_version_id = ?1, updated_at = datetime('now')
      WHERE media_asset_id = ?2 AND tenant_id = ?3`,
  ).bind(versionId, input.mediaId, input.tenantId).run();
  await audit(
    db, input, "replace", input.tenantId, input.mediaId,
    current.current_version_id, versionId,
  );
  return { mediaAssetId: input.mediaId, versionId };
}

/** Adds or updates one placement. Global metadata stays on the media asset. */
export async function setMediaPlacement(
  db: D1Database,
  input: PlacementInput,
): Promise<string> {
  await assertOwned(db, input.tenantId, input.mediaId);
  await db.prepare(
    `INSERT INTO media_placements
       (id, tenant_id, media_asset_id, target_table, target_id, placement_type,
        alt_text_override, caption_override, description_override, display_order)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
     ON CONFLICT (tenant_id, target_table, target_id, placement_type, media_asset_id)
     DO UPDATE SET
       alt_text_override = excluded.alt_text_override,
       caption_override = excluded.caption_override,
       description_override = excluded.description_override,
       display_order = excluded.display_order,
       updated_at = datetime('now')`,
  ).bind(
    input.id, input.tenantId, input.mediaId,
    input.targetTable, input.targetId, input.placementType,
    input.altTextOverride ?? null, input.captionOverride ?? null,
    input.descriptionOverride ?? null, input.displayOrder,
  ).run();
  await db.prepare(
    `INSERT INTO media_revisions
       (id, tenant_id, media_asset_id, action, target_table, target_id, metadata_json)
     VALUES (?1, ?2, ?3, 'set_placement', ?4, ?5, ?6)`,
  ).bind(
    `placement:${input.id}`, input.tenantId, input.mediaId,
    input.targetTable, input.targetId,
    JSON.stringify({ placementType: input.placementType, displayOrder: input.displayOrder }),
  ).run();
  return input.id;
}

/** Retires a media_id without deleting it, so historical links stay resolvable. */
export async function retireMediaAsset(
  db: D1Database,
  input: RetireInput,
): Promise<void> {
  await assertOwned(db, input.tenantId, input.mediaId);
  await db.prepare(
    `UPDATE media_asset_metadata
        SET status = 'retired', updated_at = datetime('now')
      WHERE media_asset_id = ?1 AND tenant_id = ?2`,
  ).bind(input.mediaId, input.tenantId).run();
  await audit(db, input, "retire", input.tenantId, input.mediaId, null, null);
}

/** Returns the current version and global metadata for one media_id. */
export async function getMediaAsset(
  db: D1Database,
  tenantId: string,
  mediaId: string,
): Promise<Record<string, unknown> | null> {
  const row = await db.prepare(
    `SELECT m.id AS media_id, m.tenant_id, m.location_id, m.kind, m.original_filename,
            md.description, md.caption, md.tags, md.attribution, md.status,
            md.current_version_id, v.version, vf.cloudinary_public_id,
            vf.cloudinary_version, vf.sha256, vf.byte_size, vf.mime_type
       FROM media_assets m
       LEFT JOIN media_asset_metadata md ON md.media_asset_id = m.id AND md.tenant_id = m.tenant_id
       LEFT JOIN media_versions v ON v.id = md.current_version_id
       LEFT JOIN media_version_files vf ON vf.version_id = v.id AND vf.tenant_id = m.tenant_id
      WHERE m.id = ?1 AND m.tenant_id = ?2`,
  ).bind(mediaId, tenantId).first();
  return (row as Record<string, unknown> | null) ?? null;
}
