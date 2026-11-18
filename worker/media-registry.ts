// COW-33 media registry actions.
//
// A logical photo keeps media_assets.id for its whole life. Replacing a file
// adds a media_versions row with a new version_id, so aliases, placements and
// global metadata keep pointing at the same media_id. Every action writes a
// media_revisions audit row. All validation happens before writes, and each
// action is a single D1 batch so a later failure rolls back earlier statements.

import {
  mediaAssetViewRowSchema,
  type MediaAction,
  type MediaAliasType,
  type MediaAssetView,
  type MediaPlacementType,
} from "../src/types/d1-contracts.ts";

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
  /** Caller tag for the audit row. The row ID itself is always generated. */
  revisionId?: string;
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
  revisionId?: string;
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

function required(value: string | undefined, name: string): string {
  if (!value?.trim()) throw new Error(`${name} is required`);
  return value.trim();
}

function versionIdentity(mediaId: string, version: number, versionId: string): string {
  required(mediaId, "mediaId");
  required(versionId, "versionId");
  if (!Number.isInteger(version) || version < 1) throw new Error("version must be a positive integer");
  const expected = `${mediaId}:v${version}`;
  if (versionId !== expected) throw new Error("versionId must match the media_id and version");
  return versionId;
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
  required(tenantId, "tenantId");
  required(mediaId, "mediaId");
  const row = await db.prepare(
    "SELECT id FROM media_assets WHERE id = ?1 AND tenant_id = ?2",
  ).bind(mediaId, tenantId).first();
  if (!row) throw new Error("media asset not found in tenant");
}

function auditMetadata(input: ActionInput): string | null {
  let base: Record<string, unknown> = {};
  if (input.metadataJson) {
    try {
      const parsed: unknown = JSON.parse(input.metadataJson);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        base = parsed as Record<string, unknown>;
      }
    } catch {
      base = { metadataJson: input.metadataJson };
    }
  }
  const merged = input.revisionId ? { ...base, clientRevisionId: input.revisionId } : base;
  return Object.keys(merged).length ? JSON.stringify(merged) : null;
}

function auditStatement(
  db: D1Database,
  input: ActionInput,
  action: MediaAction,
  tenantId: string,
  mediaId: string,
  fromVersionId: string | null,
  toVersionId: string | null,
  targetTable: string | null = null,
  targetId: string | null = null,
): D1PreparedStatement {
  // Every action gets its own row ID. A caller tag is stored in metadata_json
  // so reusing a revisionId for two updates cannot collide on the primary key.
  return db.prepare(
    `INSERT INTO media_revisions
       (id, tenant_id, media_asset_id, action, from_version_id, to_version_id,
        target_table, target_id, actor, note, metadata_json)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)`,
  ).bind(
    crypto.randomUUID(), tenantId, mediaId, action,
    fromVersionId, toVersionId, targetTable, targetId,
    input.actor ?? null, input.note ?? null, auditMetadata(input),
  );
}

function versionStatements(
  db: D1Database,
  tenantId: string,
  mediaId: string,
  version: number,
  versionId: string,
  width: number | null,
  height: number | null,
  file: MediaFileInput | undefined,
): D1PreparedStatement[] {
  const legacy = legacyAssetIdentity(file, versionId);
  return [
    db.prepare(
      `INSERT INTO media_versions
         (id, media_asset_id, version, squarespace_asset_id, squarespace_url, width, height)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`,
    ).bind(
      versionId, mediaId, version, legacy.squarespaceAssetId,
      legacy.squarespaceUrl, width, height,
    ),
    db.prepare(
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
    ),
  ];
}

function validatePlacement(input: PlacementInput): void {
  required(input.id, "placement id");
  required(input.tenantId, "tenantId");
  required(input.mediaId, "mediaId");
  required(input.targetTable, "targetTable");
  required(input.targetId, "targetId");
  required(input.placementType, "placementType");
  if (!Number.isInteger(input.displayOrder)) throw new Error("displayOrder must be an integer");
}

async function assertPlacementOrderFree(db: D1Database, input: PlacementInput): Promise<void> {
  const occupied = await db.prepare(
    `SELECT id FROM media_placements
      WHERE tenant_id = ?1 AND target_table = ?2 AND target_id = ?3
        AND placement_type = ?4 AND display_order = ?5 AND id <> ?6
      LIMIT 1`,
  ).bind(
    input.tenantId, input.targetTable, input.targetId,
    input.placementType, input.displayOrder, input.id,
  ).first();
  if (occupied) throw new Error("displayOrder is already used by another placement");
}

function placementStatements(
  db: D1Database,
  input: PlacementInput,
): D1PreparedStatement[] {
  validatePlacement(input);
  return [
    db.prepare(
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
    ),
    auditStatement(
      db,
      {
        revisionId: input.revisionId,
        metadataJson: JSON.stringify({
          placementType: input.placementType,
          displayOrder: input.displayOrder,
          altTextOverride: input.altTextOverride ?? null,
          captionOverride: input.captionOverride ?? null,
          descriptionOverride: input.descriptionOverride ?? null,
        }),
      },
      "set_placement",
      input.tenantId, input.mediaId, null, null,
      input.targetTable, input.targetId,
    ),
  ];
}

/** Creates a new logical photo and its first immutable version. */
export async function createMediaAsset(
  db: D1Database,
  input: CreateMediaInput,
): Promise<{ mediaAssetId: string; versionId: string }> {
  const tenantId = required(input.tenantId, "tenantId");
  const mediaId = required(input.mediaId, "mediaId");
  const versionId = versionIdentity(mediaId, input.version, input.versionId);
  const statements: D1PreparedStatement[] = [
    db.prepare(
      `INSERT INTO media_assets
         (id, tenant_id, location_id, kind, original_filename)
       VALUES (?1, ?2, ?3, ?4, ?5)`,
    ).bind(
      mediaId, tenantId, input.locationId ?? null,
      input.kind, input.originalFilename ?? null,
    ),
    ...versionStatements(
      db, tenantId, mediaId, input.version, versionId,
      input.width ?? null, input.height ?? null, input.file,
    ),
    db.prepare(
      `INSERT INTO media_asset_metadata
         (media_asset_id, tenant_id, description, caption, tags, attribution, current_version_id)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`,
    ).bind(
      mediaId, tenantId,
      input.metadata?.description ?? null,
      input.metadata?.caption ?? null,
      tagsJson(input.metadata?.tags),
      input.metadata?.attribution ?? null,
      versionId,
    ),
    auditStatement(db, input, "create_new", tenantId, mediaId, null, versionId),
  ];
  await db.batch(statements);
  return { mediaAssetId: mediaId, versionId };
}

/** Links a legacy ID or placement to an existing media_id without copying metadata. */
export async function linkExistingMedia(
  db: D1Database,
  input: LinkExistingInput,
): Promise<string> {
  const tenantId = required(input.tenantId, "tenantId");
  const mediaId = required(input.mediaId, "mediaId");
  if (Boolean(input.aliasType) !== Boolean(input.aliasValue)) {
    throw new Error("aliasType and aliasValue must be supplied together");
  }
  if (input.placement) {
    validatePlacement(input.placement);
    if (input.placement.tenantId !== tenantId || input.placement.mediaId !== mediaId) {
      throw new Error("placement must target this tenant and media asset");
    }
  }
  await assertOwned(db, tenantId, mediaId);
  if (input.placement) await assertPlacementOrderFree(db, input.placement);

  const statements: D1PreparedStatement[] = [];
  if (input.aliasType && input.aliasValue) {
    statements.push(db.prepare(
      `INSERT INTO media_aliases (id, tenant_id, media_asset_id, alias_type, alias_value)
       VALUES (?1, ?2, ?3, ?4, ?5)`,
    ).bind(
      input.aliasId ?? `${mediaId}:${input.aliasType}`,
      tenantId, mediaId, input.aliasType, input.aliasValue,
    ));
  }
  statements.push(auditStatement(db, input, "link_existing", tenantId, mediaId, null, null));
  if (input.placement) statements.push(...placementStatements(db, input.placement));
  await db.batch(statements);
  return mediaId;
}

/** Adds a new upload version. The media_id, aliases and placements never change. */
export async function replaceMediaVersion(
  db: D1Database,
  input: ReplaceVersionInput,
): Promise<{ mediaAssetId: string; versionId: string }> {
  const tenantId = required(input.tenantId, "tenantId");
  const mediaId = required(input.mediaId, "mediaId");
  const versionId = versionIdentity(mediaId, input.version, input.versionId);
  await assertOwned(db, tenantId, mediaId);

  const current = await db.prepare(
    `SELECT MAX(v.version) AS latest, mmd.current_version_id AS current_version_id
       FROM media_versions v
       JOIN media_assets m ON m.id = v.media_asset_id
       LEFT JOIN media_asset_metadata mmd
         ON mmd.media_asset_id = v.media_asset_id AND mmd.tenant_id = m.tenant_id
      WHERE v.media_asset_id = ?1 AND m.tenant_id = ?2`,
  ).bind(mediaId, tenantId).first() as { latest: number; current_version_id: string | null } | null;
  if (!current || input.version <= current.latest) {
    throw new Error("replacement version must be greater than the latest version");
  }

  await db.batch([
    ...versionStatements(
      db, tenantId, mediaId, input.version, versionId,
      input.width ?? null, input.height ?? null, input.file,
    ),
    db.prepare(
      `UPDATE media_asset_metadata
          SET current_version_id = ?1, updated_at = datetime('now')
        WHERE media_asset_id = ?2 AND tenant_id = ?3`,
    ).bind(versionId, mediaId, tenantId),
    auditStatement(
      db, input, "replace", tenantId, mediaId, current.current_version_id, versionId,
    ),
  ]);
  return { mediaAssetId: mediaId, versionId };
}

/** Adds or updates one placement. Global metadata stays on the media asset. */
export async function setMediaPlacement(
  db: D1Database,
  input: PlacementInput,
): Promise<string> {
  validatePlacement(input);
  await assertOwned(db, input.tenantId, input.mediaId);
  await assertPlacementOrderFree(db, input);
  await db.batch(placementStatements(db, input));
  return input.id;
}

/** Retires a media_id without deleting it, so historical links stay resolvable. */
export async function retireMediaAsset(
  db: D1Database,
  input: RetireInput,
): Promise<void> {
  const tenantId = required(input.tenantId, "tenantId");
  const mediaId = required(input.mediaId, "mediaId");
  await assertOwned(db, tenantId, mediaId);
  await db.batch([
    db.prepare(
      `UPDATE media_asset_metadata
          SET status = 'retired', updated_at = datetime('now')
        WHERE media_asset_id = ?1 AND tenant_id = ?2`,
    ).bind(mediaId, tenantId),
    auditStatement(db, input, "retire", tenantId, mediaId, null, null),
  ]);
}

/** Returns the current version and global metadata for one media_id. */
export async function getMediaAsset(
  db: D1Database,
  tenantId: string,
  mediaId: string,
): Promise<MediaAssetView | null> {
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
  return row ? mediaAssetViewRowSchema.parse(row) : null;
}
