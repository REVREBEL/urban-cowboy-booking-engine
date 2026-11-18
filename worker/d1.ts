// Thin D1 helpers for the Urban Cowboy platform. Mews remains source of truth
// for availability/rates/reservations; D1 owns editorial content, settings,
// revisions, media IDs, merchandising, recovery state and reporting read models.

import type { Env } from "./mews/_lib";
import {
  addOnRowSchema,
  amenityRowSchema,
  buildingRowSchema,
  contentItemRowSchema,
  contentProvenanceRowSchema,
  eventRowSchema,
  locationRowSchema,
  mediaAliasRowSchema,
  mediaAssetRowSchema,
  roomTypeRowSchema,
  type AddOnContract,
  type AmenityContract,
  type BuildingContract,
  type ContentItemContract,
  type ContentProvenanceContract,
  type EventContract,
  type LocationContract,
  type MediaAliasContract,
  type MediaAssetContract,
  type MediaAliasType,
  type RoomTypeContract,
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
//
// Each supported combination (location present/absent, optional filter
// present/absent) has its own SQL with explicit predicates instead of an
// "(? IS NULL OR column = ?) OR" pattern. This lets SQLite use the location-
// prefixed index and honour the ORDER BY without a temporary sort. The query
// builders are exported so tests exercise the exact production SQL.
// ---------------------------------------------------------------------------

export interface ScopedQuery {
  sql: string;
  bindings: unknown[];
}

const CONTENT_ITEMS_SELECT =
  "SELECT id, tenant_id, location_id, kind, slug, status, current_revision_id, created_at, updated_at FROM content_items";

export function contentItemsQuery(scope: TenantScope, kind?: string): ScopedQuery {
  if (scope.locationId != null && kind) {
    return {
      sql: `${CONTENT_ITEMS_SELECT} WHERE tenant_id = ?1 AND location_id = ?2 AND kind = ?3 AND status = 'published' ORDER BY updated_at DESC, id`,
      bindings: [scope.tenantId, scope.locationId, kind],
    };
  }
  if (scope.locationId != null) {
    return {
      sql: `${CONTENT_ITEMS_SELECT} WHERE tenant_id = ?1 AND location_id = ?2 AND status = 'published' ORDER BY updated_at DESC, id`,
      bindings: [scope.tenantId, scope.locationId],
    };
  }
  if (kind) {
    return {
      sql: `${CONTENT_ITEMS_SELECT} WHERE tenant_id = ?1 AND kind = ?2 AND status = 'published' ORDER BY updated_at DESC, id`,
      bindings: [scope.tenantId, kind],
    };
  }
  return {
    sql: `${CONTENT_ITEMS_SELECT} WHERE tenant_id = ?1 AND status = 'published' ORDER BY updated_at DESC, id`,
    bindings: [scope.tenantId],
  };
}

const EVENTS_SELECT =
  "SELECT id, tenant_id, location_id, title, description, venue, time_zone, starts_at, ends_at, recurrence_rule, capacity, display_flag, media_asset_id, created_at, updated_at FROM events";

export function eventsQuery(scope: TenantScope): ScopedQuery {
  if (scope.locationId != null) {
    return {
      sql: `${EVENTS_SELECT} WHERE tenant_id = ?1 AND location_id = ?2 AND display_flag = 1 ORDER BY starts_at, id`,
      bindings: [scope.tenantId, scope.locationId],
    };
  }
  return {
    sql: `${EVENTS_SELECT} WHERE tenant_id = ?1 AND display_flag = 1 ORDER BY starts_at, id`,
    bindings: [scope.tenantId],
  };
}

const MEDIA_SELECT =
  "SELECT id, tenant_id, location_id, kind, original_filename, created_at, updated_at FROM media_assets";

export function mediaAssetsQuery(
  scope: TenantScope,
  kind?: "image" | "video" | "document",
): ScopedQuery {
  if (scope.locationId != null && kind) {
    return {
      sql: `${MEDIA_SELECT} WHERE tenant_id = ?1 AND location_id = ?2 AND kind = ?3 ORDER BY id`,
      bindings: [scope.tenantId, scope.locationId, kind],
    };
  }
  if (scope.locationId != null) {
    return {
      sql: `${MEDIA_SELECT} WHERE tenant_id = ?1 AND location_id = ?2 ORDER BY id`,
      bindings: [scope.tenantId, scope.locationId],
    };
  }
  if (kind) {
    return {
      sql: `${MEDIA_SELECT} WHERE tenant_id = ?1 AND kind = ?2 ORDER BY id`,
      bindings: [scope.tenantId, kind],
    };
  }
  return {
    sql: `${MEDIA_SELECT} WHERE tenant_id = ?1 ORDER BY id`,
    bindings: [scope.tenantId],
  };
}

const LOCATIONS_SELECT =
  "SELECT id, tenant_id, slug, name, time_zone, mews_hotel_id, created_at FROM locations";

export function locationsQuery(scope: TenantScope): ScopedQuery {
  if (scope.locationId != null) {
    return {
      sql: `${LOCATIONS_SELECT} WHERE tenant_id = ?1 AND id = ?2 ORDER BY slug`,
      bindings: [scope.tenantId, scope.locationId],
    };
  }
  return {
    sql: `${LOCATIONS_SELECT} WHERE tenant_id = ?1 ORDER BY slug`,
    bindings: [scope.tenantId],
  };
}

const ALIAS_SELECT =
  "SELECT a.id, a.tenant_id, a.media_asset_id, a.alias_type, a.alias_value, a.created_at FROM media_aliases a";

// Always join the owning asset and require both tenant IDs to match. The
// composite FK in 0003 prevents mismatched rows in a conforming database, but
// the read path does not rely on that alone (legacy/imported data may predate
// the constraint). Neither query may return another tenant's media ID.
const ALIAS_JOIN = "JOIN media_assets m ON m.id = a.media_asset_id AND m.tenant_id = a.tenant_id";

export function mediaAliasQuery(
  scope: TenantScope,
  aliasType: MediaAliasType,
  aliasValue: string,
): ScopedQuery {
  if (scope.locationId != null) {
    return {
      sql: `${ALIAS_SELECT} ${ALIAS_JOIN} WHERE a.tenant_id = ?1 AND m.location_id = ?2 AND a.alias_type = ?3 AND a.alias_value = ?4`,
      bindings: [scope.tenantId, scope.locationId, aliasType, aliasValue],
    };
  }
  return {
    sql: `${ALIAS_SELECT} ${ALIAS_JOIN} WHERE a.tenant_id = ?1 AND a.alias_type = ?2 AND a.alias_value = ?3`,
    bindings: [scope.tenantId, aliasType, aliasValue],
  };
}

const PROVENANCE_SELECT =
  "SELECT tenant_id, location_id, target_table, target_id, source_system, source_collection, source_id, source_snapshot_date, source_hash, imported_at FROM content_provenance";

export function provenanceQuery(
  scope: TenantScope,
  targetTable: string,
  targetId: string,
): ScopedQuery {
  if (scope.locationId != null) {
    return {
      sql: `${PROVENANCE_SELECT} WHERE tenant_id = ?1 AND location_id = ?2 AND target_table = ?3 AND target_id = ?4`,
      bindings: [scope.tenantId, scope.locationId, targetTable, targetId],
    };
  }
  return {
    sql: `${PROVENANCE_SELECT} WHERE tenant_id = ?1 AND target_table = ?2 AND target_id = ?3`,
    bindings: [scope.tenantId, targetTable, targetId],
  };
}

export function listScopedContentItems(
  db: D1Database,
  scope: TenantScope,
  kind?: string,
): Promise<ContentItemContract[]> {
  const query = contentItemsQuery(scope, kind);
  return allScoped(db, query.sql, query.bindings, contentItemRowSchema);
}

const ROOM_TYPES_SELECT =
  "SELECT id, tenant_id, location_id, mews_room_category_id, name, slug, sort_order, created_at FROM room_types";
const BUILDINGS_SELECT =
  "SELECT id, tenant_id, location_id, name, slug, sort_order, created_at FROM buildings";
const AMENITIES_SELECT =
  "SELECT id, tenant_id, name, image_name, image_path, sort_order, created_at FROM amenities";
const ADD_ONS_SELECT =
  "SELECT id, tenant_id, location_id, name, description, mews_product_id, icon_media_asset_id, quantity_cap, sort_order, status, created_at, updated_at FROM add_ons";

/** Tenant-wide or location-scoped reads for the structured editorial tables. */
export function listScopedRoomTypes(db: D1Database, scope: TenantScope): Promise<RoomTypeContract[]> {
  return allScoped(
    db,
    scope.locationId != null
      ? `${ROOM_TYPES_SELECT} WHERE tenant_id = ?1 AND location_id = ?2 ORDER BY sort_order, id`
      : `${ROOM_TYPES_SELECT} WHERE tenant_id = ?1 ORDER BY sort_order, id`,
    scope.locationId != null ? [scope.tenantId, scope.locationId] : [scope.tenantId],
    roomTypeRowSchema,
  );
}

export function listScopedBuildings(db: D1Database, scope: TenantScope): Promise<BuildingContract[]> {
  return allScoped(
    db,
    scope.locationId != null
      ? `${BUILDINGS_SELECT} WHERE tenant_id = ?1 AND location_id = ?2 ORDER BY sort_order, id`
      : `${BUILDINGS_SELECT} WHERE tenant_id = ?1 ORDER BY sort_order, id`,
    scope.locationId != null ? [scope.tenantId, scope.locationId] : [scope.tenantId],
    buildingRowSchema,
  );
}

export function listScopedAmenities(db: D1Database, scope: TenantScope): Promise<AmenityContract[]> {
  return allScoped(
    db,
    `${AMENITIES_SELECT} WHERE tenant_id = ?1 ORDER BY sort_order, id`,
    [scope.tenantId],
    amenityRowSchema,
  );
}

export function listScopedAddOns(db: D1Database, scope: TenantScope): Promise<AddOnContract[]> {
  return allScoped(
    db,
    scope.locationId != null
      ? `${ADD_ONS_SELECT} WHERE tenant_id = ?1 AND location_id = ?2 ORDER BY sort_order, id`
      : `${ADD_ONS_SELECT} WHERE tenant_id = ?1 ORDER BY sort_order, id`,
    scope.locationId != null ? [scope.tenantId, scope.locationId] : [scope.tenantId],
    addOnRowSchema,
  );
}

export function listScopedLocations(
  db: D1Database,
  scope: TenantScope,
): Promise<LocationContract[]> {
  const query = locationsQuery(scope);
  return allScoped(db, query.sql, query.bindings, locationRowSchema);
}

export function listScopedEvents(
  db: D1Database,
  scope: TenantScope,
): Promise<EventContract[]> {
  const query = eventsQuery(scope);
  return allScoped(db, query.sql, query.bindings, eventRowSchema);
}

export function listScopedMediaAssets(
  db: D1Database,
  scope: TenantScope,
  kind?: "image" | "video" | "document",
): Promise<MediaAssetContract[]> {
  const query = mediaAssetsQuery(scope, kind);
  return allScoped(db, query.sql, query.bindings, mediaAssetRowSchema);
}

/** Resolves a legacy ID/CDN URL to its stable media asset within the tenant. */
export async function resolveMediaAlias(
  db: D1Database,
  scope: TenantScope,
  aliasType: MediaAliasType,
  aliasValue: string,
): Promise<MediaAliasContract | null> {
  const query = mediaAliasQuery(scope, aliasType, aliasValue);
  const rows = await allScoped(db, query.sql, query.bindings, mediaAliasRowSchema);
  return rows[0] ?? null;
}

export async function getProvenance(
  db: D1Database,
  scope: TenantScope,
  targetTable: string,
  targetId: string,
): Promise<ContentProvenanceContract | null> {
  const query = provenanceQuery(scope, targetTable, targetId);
  const rows = await allScoped(db, query.sql, query.bindings, contentProvenanceRowSchema);
  return rows[0] ?? null;
}