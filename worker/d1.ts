// Thin D1 helpers for the Urban Cowboy platform. Mews remains source of truth
// for availability/rates/reservations; D1 owns editorial content, settings,
// revisions, media IDs, merchandising, recovery state and reporting read models.

import type { Env } from "./mews/_lib";
import {
  contentItemRowSchema,
  contentProvenanceRowSchema,
  eventRowSchema,
  locationRowSchema,
  mediaAliasRowSchema,
  mediaAssetRowSchema,
  type ContentItemContract,
  type ContentProvenanceContract,
  type EventContract,
  type LocationContract,
  type MediaAliasContract,
  type MediaAssetContract,
  type MediaAliasType,
} from "../src/types/d1-contracts.ts";

export interface TenantScope {
  tenantId: string;
  locationId?: string | null;
}

/** Parses D1 rows through a Zod contract so callers never see raw snake_case rows. */
async function allScoped<T>(
  db: D1Database,
  sql: string,
  bindings: unknown[],
  schema: { parse(value: unknown): T },
): Promise<T[]> {
  const result = await db.prepare(sql).bind(...bindings).all();
  return (result.results ?? []).map((row) => schema.parse(row));
}

export function getDb(env: Env): D1Database | null {
  return env.DB ?? null;
}

export async function listContentItems(
  db: D1Database,
  scope: TenantScope,
  kind?: string,
  publishedOnly = true,
): Promise<unknown[]> {
  const statusClause = publishedOnly ? " AND status = 'published'" : "";
  const stmt = kind
    ? db.prepare(
        `SELECT id, tenant_id, location_id, kind, slug, status, current_revision_id, created_at, updated_at FROM content_items WHERE tenant_id = ?1 AND (?2 IS NULL OR location_id = ?2) AND kind = ?3${statusClause} ORDER BY updated_at DESC`,
      ).bind(scope.tenantId, scope.locationId ?? null, kind)
    : db.prepare(
        `SELECT id, tenant_id, location_id, kind, slug, status, current_revision_id, created_at, updated_at FROM content_items WHERE tenant_id = ?1 AND (?2 IS NULL OR location_id = ?2)${statusClause} ORDER BY updated_at DESC`,
      ).bind(scope.tenantId, scope.locationId ?? null);
  const result = await stmt.all();
  return result.results ?? [];
}

export async function getContentItem(
  db: D1Database,
  id: string,
  tenantId: string,
  locationId?: string | null,
): Promise<unknown | null> {
  const row = await db
    .prepare(
      "SELECT id, tenant_id, location_id, kind, slug, status, current_revision_id, created_at, updated_at FROM content_items WHERE id = ?1 AND tenant_id = ?2 AND (?3 IS NULL OR location_id = ?3)",
    )
    .bind(id, tenantId, locationId ?? null)
    .first();
  return row ?? null;
}

// ---------------------------------------------------------------------------
// Property-scoped, contract-validated queries (COW-30).
// Every read binds both tenant_id and the optional location_id. A null
// location scope deliberately means "all locations in this tenant".
// ---------------------------------------------------------------------------

export function listScopedContentItems(
  db: D1Database,
  scope: TenantScope,
  kind?: string,
  publishedOnly = true,
): Promise<ContentItemContract[]> {
  const status = publishedOnly ? " AND status = 'published'" : "";
  const select =
    "SELECT id, tenant_id, location_id, kind, slug, status, current_revision_id, created_at, updated_at FROM content_items";
  if (kind) {
    return allScoped(
      db,
      `${select} WHERE tenant_id = ?1 AND (?2 IS NULL OR location_id = ?2) AND kind = ?3${status} ORDER BY updated_at DESC, id`,
      [scope.tenantId, scope.locationId ?? null, kind],
      contentItemRowSchema,
    );
  }
  return allScoped(
    db,
    `${select} WHERE tenant_id = ?1 AND (?2 IS NULL OR location_id = ?2)${status} ORDER BY updated_at DESC, id`,
    [scope.tenantId, scope.locationId ?? null],
    contentItemRowSchema,
  );
}

export function listScopedLocations(
  db: D1Database,
  scope: TenantScope,
): Promise<LocationContract[]> {
  return allScoped(
    db,
    "SELECT id, tenant_id, slug, name, time_zone, mews_hotel_id, created_at FROM locations WHERE tenant_id = ?1 AND (?2 IS NULL OR id = ?2) ORDER BY slug",
    [scope.tenantId, scope.locationId ?? null],
    locationRowSchema,
  );
}

export function listScopedEvents(
  db: D1Database,
  scope: TenantScope,
): Promise<EventContract[]> {
  return allScoped(
    db,
    "SELECT id, tenant_id, location_id, title, description, venue, time_zone, starts_at, ends_at, recurrence_rule, capacity, display_flag, media_asset_id, created_at, updated_at FROM events WHERE tenant_id = ?1 AND (?2 IS NULL OR location_id = ?2) AND display_flag = 1 ORDER BY starts_at, id",
    [scope.tenantId, scope.locationId ?? null],
    eventRowSchema,
  );
}

export function listScopedMediaAssets(
  db: D1Database,
  scope: TenantScope,
  kind?: "image" | "video" | "document",
): Promise<MediaAssetContract[]> {
  return allScoped(
    db,
    "SELECT id, tenant_id, location_id, kind, original_filename, created_at, updated_at FROM media_assets WHERE tenant_id = ?1 AND (?2 IS NULL OR location_id = ?2) AND (?3 IS NULL OR kind = ?3) ORDER BY id",
    [scope.tenantId, scope.locationId ?? null, kind ?? null],
    mediaAssetRowSchema,
  );
}

/** Resolves a legacy ID/CDN URL to its stable media asset, scoped to a tenant. */
export async function resolveMediaAlias(
  db: D1Database,
  scope: TenantScope,
  aliasType: MediaAliasType,
  aliasValue: string,
): Promise<MediaAliasContract | null> {
  const rows = await allScoped(
    db,
    "SELECT a.id, a.media_asset_id, a.alias_type, a.alias_value, a.created_at FROM media_aliases a JOIN media_assets m ON m.id = a.media_asset_id WHERE m.tenant_id = ?1 AND (?2 IS NULL OR m.location_id = ?2) AND a.alias_type = ?3 AND a.alias_value = ?4",
    [scope.tenantId, scope.locationId ?? null, aliasType, aliasValue],
    mediaAliasRowSchema,
  );
  return rows[0] ?? null;
}

export async function getProvenance(
  db: D1Database,
  scope: TenantScope,
  targetTable: string,
  targetId: string,
): Promise<ContentProvenanceContract | null> {
  const rows = await allScoped(
    db,
    "SELECT tenant_id, target_table, target_id, source_system, source_collection, source_id, source_snapshot_date, source_hash, imported_at FROM content_provenance WHERE tenant_id = ?1 AND target_table = ?2 AND target_id = ?3",
    [scope.tenantId, targetTable, targetId],
    contentProvenanceRowSchema,
  );
  return rows[0] ?? null;
}