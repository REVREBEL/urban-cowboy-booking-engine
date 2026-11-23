/**
 * COW-34 replacement/re-crop service.
 *
 * Pin identity is media_assets.id (+ placement) and amenity_id. URLs, file ids
 * and resize parameters are never written here. A version change produces a
 * classification first; only safe classifications may publish. Every carry,
 * remap and review writes a snapshot so a prior version can be restored.
 */
import {
  photoHotspotMappingRevisionRowSchema,
  photoHotspotMappingRowSchema,
  photoHotspotMappingSnapshotSchema,
  type PhotoHotspotMappingRow,
} from "../src/types/d1-contracts.ts";
import {
  AUTO_PUBLISH_DECISIONS,
  classifyReplacement,
  remapCrop,
  transformOrientation,
  type CropRect,
  type ExifOrientation,
  type ReplacementDecision,
} from "../src/lib/hotspotGeometry.ts";

export interface Fingerprint {
  sha256: string | null;
  phash: string | null;
  width: number | null;
  height: number | null;
  exifOrientation: ExifOrientation;
}

export interface ReplacementPlan {
  decision: ReplacementDecision;
  reviewRequired: boolean;
  /** Proposed rows for the target version, not yet written. */
  mappings: PhotoHotspotMappingRow[];
}

export interface PlanInput {
  tenantId: string;
  mediaAssetId: string;
  placementId?: string | null;
  fromVersionId: string;
  toVersionId: string;
  urlOnly?: boolean;
  cropBefore?: CropRect | null;
  cropAfter?: CropRect | null;
  fromFingerprint?: Fingerprint | null;
  toFingerprint?: Fingerprint | null;
  sameHashOnOtherMedia?: boolean;
  duplicateOfMediaId?: string | null;
  phashDistance?: number | null;
  /** Explicit operator approval is required to clear an existing pending review. */
  approveReview?: boolean;
}

async function loadMappings(
  db: D1Database,
  tenantId: string,
  mediaAssetId: string,
  placementId?: string | null,
): Promise<PhotoHotspotMappingRow[]> {
  const result = await db.prepare(
    `SELECT * FROM photo_hotspot_mappings
      WHERE tenant_id = ?1 AND media_asset_id = ?2 AND (?3 IS NULL OR placement_id IS ?3)
      ORDER BY display_order, id`,
  ).bind(tenantId, mediaAssetId, placementId ?? null).all();
  return (result.results ?? []).flatMap((row) => {
    const parsed = photoHotspotMappingRowSchema.safeParse(row);
    // Soft-deleted pins are retained only for audit; never plan, publish or
    // roll them back into the guest-visible set.
    return parsed.success && parsed.data.reviewReason !== "deleted" ? [parsed.data] : [];
  });
}

/** Classifies a version change and computes the proposed mapping state. Pure D1 reads only. */
export async function planReplacement(
  db: D1Database,
  input: PlanInput,
): Promise<ReplacementPlan> {
  const current = await loadMappings(db, input.tenantId, input.mediaAssetId, input.placementId);
  const from = input.fromFingerprint ?? null;
  const to = input.toFingerprint ?? null;
  const decision = classifyReplacement({
    urlOnly: input.urlOnly === true,
    exactFile: Boolean(from?.sha256 && to?.sha256 && from.sha256 === to.sha256),
    orientationBefore: from?.exifOrientation ?? 1,
    orientationAfter: to?.exifOrientation ?? 1,
    sizeBefore: from?.width && from.height ? { width: from.width, height: from.height } : null,
    sizeAfter: to?.width && to.height ? { width: to.width, height: to.height } : null,
    cropBefore: input.cropBefore ?? null,
    cropAfter: input.cropAfter ?? null,
    exactDuplicateOnOtherMedia: input.sameHashOnOtherMedia === true,
    phashDistance: input.phashDistance ?? null,
  });

  if (decision === "url_only") {
    return { decision, reviewRequired: false, mappings: current };
  }

  const reviewRequired = !AUTO_PUBLISH_DECISIONS.has(decision);
  const reviewReason = reviewRequired ? decision : null;
  // A pending review is sticky: only an explicit approval may clear it, and no
  // safely-classified follow-up (e.g. an exact reupload) may launder it.
  const locked = (mapping: PhotoHotspotMappingRow) =>
    mapping.reviewState === "pending" && input.approveReview !== true;
  const nextState = (mapping: PhotoHotspotMappingRow, safe: "none" | "pending") =>
    locked(mapping) ? "pending" as const : safe;
  const nextReason = (mapping: PhotoHotspotMappingRow, safe: string | null) =>
    locked(mapping) ? (mapping.reviewReason ?? "pending_override") : safe;
  // Unverified geometry must not be readable as a published row.
  const nextStatus = (mapping: PhotoHotspotMappingRow) =>
    locked(mapping) || reviewRequired ? "draft" as const : mapping.status;

  const mappings = current.map((mapping) => {
    const base = {
      ...mapping,
      tenantId: input.tenantId,
      sourceVersionId: input.toVersionId,
      derivedFrom: mapping.derivedFrom ?? mapping.id,
      duplicateOf: decision.startsWith("duplicate")
        ? (input.duplicateOfMediaId ?? null) : mapping.duplicateOf,
      status: nextStatus(mapping),
      updatedAt: new Date().toISOString(),
    };
    if (decision === "crop_remap" && input.cropAfter && to?.width && to.height) {
      // Source coordinates stay canonical; validate each point against the NEW
      // crop. A pin excluded by the new crop needs review even though the
      // overall decision is otherwise auto-publishable.
      const remapped = remapCrop(
        { x: mapping.sourceX, y: mapping.sourceY },
        { width: to.width, height: to.height },
        input.cropAfter,
      );
      const cropped = {
        ...base,
        cropLeft: input.cropAfter.left,
        cropTop: input.cropAfter.top,
        cropWidth: input.cropAfter.width,
        cropHeight: input.cropAfter.height,
        sourceWidth: to.width,
        sourceHeight: to.height,
      };
      if (remapped) {
        return {
          ...cropped,
          reviewState: nextState(mapping, "none"),
          reviewReason: nextReason(mapping, null),
        };
      }
      return {
        ...cropped,
        status: "draft" as const,
        reviewState: "pending" as const,
        reviewReason: "crop_point_outside",
      };
    }
    if (decision === "exact_reupload") {
      return {
        ...base,
        sourceWidth: to?.width ?? mapping.sourceWidth,
        sourceHeight: to?.height ?? mapping.sourceHeight,
        exifOrientation: to?.exifOrientation ?? mapping.exifOrientation,
        reviewState: nextState(mapping, "none"),
        reviewReason: nextReason(mapping, null),
      };
    }
    if (decision === "crop_review" && from && to && from.exifOrientation !== to.exifOrientation) {
      const point = transformOrientation(
        { x: mapping.sourceX, y: mapping.sourceY },
        from.exifOrientation,
        to.exifOrientation,
      );
      return {
        ...base,
        sourceX: point.x,
        sourceY: point.y,
        exifOrientation: to.exifOrientation,
        reviewState: "pending" as const,
        reviewReason: nextReason(mapping, reviewReason),
      };
    }
    return {
      ...base,
      sourceWidth: to?.width ?? mapping.sourceWidth,
      sourceHeight: to?.height ?? mapping.sourceHeight,
      exifOrientation: to?.exifOrientation ?? mapping.exifOrientation,
      reviewState: nextState(mapping, reviewRequired ? "pending" : "none"),
      reviewReason: nextReason(mapping, reviewReason),
    };
  });
  return { decision, reviewRequired, mappings };
}

function upsertStatement(db: D1Database, mapping: PhotoHotspotMappingRow): D1PreparedStatement {
  return db.prepare(
    `INSERT INTO photo_hotspot_mappings
      (id, tenant_id, media_asset_id, placement_id, target_table, target_id, amenity_id,
       source_x, source_y, source_version_id, source_width, source_height, exif_orientation,
       crop_left, crop_top, crop_width, crop_height, display_order, status, review_state,
       review_reason, derived_from, duplicate_of, created_at, updated_at)
     VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19,?20,?21,?22,?23,?24,?25)
     ON CONFLICT (id) DO UPDATE SET
       source_x=excluded.source_x, source_y=excluded.source_y,
       source_version_id=excluded.source_version_id,
       source_width=excluded.source_width, source_height=excluded.source_height,
       exif_orientation=excluded.exif_orientation,
       crop_left=excluded.crop_left, crop_top=excluded.crop_top,
       crop_width=excluded.crop_width, crop_height=excluded.crop_height,
       display_order=excluded.display_order, status=excluded.status,
       review_state=excluded.review_state, review_reason=excluded.review_reason,
       derived_from=excluded.derived_from, duplicate_of=excluded.duplicate_of,
       updated_at=excluded.updated_at`,
  ).bind(
    mapping.id, mapping.tenantId, mapping.mediaAssetId, mapping.placementId,
    mapping.targetTable, mapping.targetId, mapping.amenityId,
    mapping.sourceX, mapping.sourceY, mapping.sourceVersionId,
    mapping.sourceWidth, mapping.sourceHeight, mapping.exifOrientation,
    mapping.cropLeft, mapping.cropTop, mapping.cropWidth, mapping.cropHeight,
    mapping.displayOrder, mapping.status, mapping.reviewState, mapping.reviewReason,
    mapping.derivedFrom, mapping.duplicateOf, mapping.createdAt, mapping.updatedAt,
  );
}

function revisionStatement(
  db: D1Database,
  mapping: PhotoHotspotMappingRow,
  fromVersionId: string | null,
  action: "create" | "carry" | "remap" | "review" | "publish" | "rollback",
  actor: string | null,
  note: string | null,
  previous: PhotoHotspotMappingRow | null = null,
): D1PreparedStatement {
  return db.prepare(
    `INSERT INTO photo_hotspot_mapping_revisions
      (id, tenant_id, mapping_id, media_asset_id, from_version_id, to_version_id,
       action, snapshot_json, actor, note)
     VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10)`,
  ).bind(
    crypto.randomUUID(), mapping.tenantId, mapping.id, mapping.mediaAssetId,
    fromVersionId, mapping.sourceVersionId, action,
    JSON.stringify(previous ?? mapping), actor, note,
  );
}

const REVISION_ACTION: Record<ReplacementDecision, "carry" | "remap" | "review"> = {
  url_only: "carry",
  exact_reupload: "carry",
  crop_remap: "remap",
  crop_review: "review",
  replacement_review: "review",
  duplicate_exact: "review",
  duplicate_candidate: "review",
};

/** Commits a plan. URL-only changes write nothing at all. */
export async function applyReplacement(
  db: D1Database,
  plan: ReplacementPlan,
  previous: PhotoHotspotMappingRow[],
  options: { fromVersionId: string; actor?: string | null } = { fromVersionId: "" },
): Promise<{ written: number; decision: ReplacementDecision }> {
  if (plan.decision === "url_only") return { written: 0, decision: plan.decision };
  const actor = options.actor ?? null;
  const previousById = new Map(previous.map((row) => [row.id, row]));
  const statements: D1PreparedStatement[] = [];
  for (const mapping of plan.mappings) {
    statements.push(upsertStatement(db, mapping));
    statements.push(revisionStatement(
      db, mapping, options.fromVersionId || null,
      REVISION_ACTION[plan.decision], actor, plan.decision,
      previousById.get(mapping.id) ?? null,
    ));
  }
  await db.batch(statements);
  return { written: plan.mappings.length, decision: plan.decision };
}

export type PublishResult =
  | { ok: true; published: number }
  | { ok: false; error: "no_mappings" | "review_pending"; pending: number };

/** Guests never see a mapping whose geometry an editor has not approved. */
export async function publishMappings(
  db: D1Database,
  tenantId: string,
  mediaAssetId: string,
  placementId?: string | null,
  actor?: string | null,
): Promise<PublishResult> {
  const rows = await loadMappings(db, tenantId, mediaAssetId, placementId);
  if (!rows.length) return { ok: false, error: "no_mappings", pending: 0 };
  const pending = rows.filter((row) => row.reviewState === "pending").length;
  if (pending) return { ok: false, error: "review_pending", pending };

  const statements: D1PreparedStatement[] = [];
  for (const row of rows) {
    const published: PhotoHotspotMappingRow = {
      ...row, status: "published", reviewState: "approved", updatedAt: new Date().toISOString(),
    };
    statements.push(upsertStatement(db, published));
    statements.push(revisionStatement(db, published, row.sourceVersionId, "publish", actor ?? null, null, row));
  }
  await db.batch(statements);
  return { ok: true, published: rows.length };
}

export type RollbackResult =
  | { ok: true; restored: number }
  | { ok: false; error: "no_snapshot" | "review_pending" };

/** Restores the geometry that was in force when a version was current. */
export async function rollbackMappings(
  db: D1Database,
  tenantId: string,
  mediaAssetId: string,
  toVersionId: string,
  actor?: string | null,
  placementId?: string | null,
): Promise<RollbackResult> {
  const [result, deletedRows] = await Promise.all([
    db.prepare(
      `SELECT * FROM photo_hotspot_mapping_revisions
        WHERE tenant_id = ?1 AND media_asset_id = ?2 AND to_version_id = ?3
          AND action IN ('create','carry','remap','review')
        ORDER BY created_at DESC, rowid DESC`,
    ).bind(tenantId, mediaAssetId, toVersionId).all(),
    db.prepare(
      `SELECT id FROM photo_hotspot_mappings
        WHERE tenant_id = ?1 AND media_asset_id = ?2 AND review_reason = 'deleted'`,
    ).bind(tenantId, mediaAssetId).all(),
  ]);
  // Published deletions are terminal in this phase: never let a historical
  // snapshot resurrect a pin the editor removed.
  const deletedIds = new Set((deletedRows.results ?? []).map((row: any) => row.id));
  const snapshots = new Map<string, PhotoHotspotMappingRow>();
  for (const row of result.results ?? []) {
    const parsed = photoHotspotMappingRevisionRowSchema.safeParse(row);
    if (!parsed.success || snapshots.has(parsed.data.mappingId)) continue;
    try {
      const restored = photoHotspotMappingSnapshotSchema.parse(JSON.parse(parsed.data.snapshotJson));
      // A shared media asset can be placed in several rooms. Never restore a
      // pin that belongs to a different placement than the requested one.
      if (placementId && restored.placementId !== placementId) continue;
      if (deletedIds.has(parsed.data.mappingId)) continue;
      snapshots.set(parsed.data.mappingId, restored);
    } catch { /* an unreadable snapshot is skipped, never applied */ }
  }
  if (!snapshots.size) return { ok: false, error: "no_snapshot" };
  const rows = [...snapshots.values()];
  if (rows.some((row) => row.reviewState === "pending")) return { ok: false, error: "review_pending" };

  const current = new Map((await loadMappings(db, tenantId, mediaAssetId)).map((row) => [row.id, row]));
  const statements: D1PreparedStatement[] = [];
  for (const row of rows) {
    // The snapshot already carries the geometry and version it was authored on.
    const restored: PhotoHotspotMappingRow = {
      ...row, tenantId, mediaAssetId, updatedAt: new Date().toISOString(),
    };
    statements.push(upsertStatement(db, restored));
    const before = current.get(row.id) ?? null;
    statements.push(revisionStatement(
      db, restored, before?.sourceVersionId ?? null, "rollback", actor ?? null, toVersionId, before,
    ));
  }
  await db.batch(statements);
  return { ok: true, restored: rows.length };
}
