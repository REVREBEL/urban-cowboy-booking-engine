// Thin D1 helpers for the Urban Cowboy platform. Mews remains source of truth
// for availability/rates/reservations; D1 owns editorial content, settings,
// revisions, media IDs, merchandising, recovery state and reporting read models.

import type { Env } from "./mews/_lib";
import {
  addOnRowSchema,
  amenityEditorialRowSchema,
  amenityRowSchema,
  buildingRowSchema,
  contentItemRowSchema,
  contentProvenanceRowSchema,
  eventRowSchema,
  locationRowSchema,
  mediaAliasRowSchema,
  mediaAssetRowSchema,
  roomTypeRowSchema,
  roomGalleryRowSchema,
  roomAmenityAssignmentRowSchema,
  type AddOnContract,
  type AmenityContract,
  type AmenityEditorialContract,
  type BuildingContract,
  type ContentItemContract,
  type ContentProvenanceContract,
  type EventContract,
  type LocationContract,
  type MediaAliasContract,
  type MediaAssetContract,
  type MediaAliasType,
  type RoomTypeContract,
  type RoomGalleryRow,
  type RoomAmenityAssignmentRow,
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

/** Published current-revision payload for one content item, tenant scoped. */
export async function publishedRevisionPayload(
  db: D1Database,
  scope: TenantScope,
  itemId: string,
): Promise<string | null> {
  const row = await db.prepare(
    `SELECT cr.payload_json
       FROM content_items ci
       JOIN content_revisions cr ON cr.id = ci.current_revision_id
      WHERE ci.tenant_id = ?1 AND ci.id = ?2 AND ci.status = 'published'
        AND (?3 IS NULL OR ci.location_id = ?3)`,
  ).bind(scope.tenantId, itemId, scope.locationId ?? null).first() as { payload_json: string } | null;
  return row?.payload_json ?? null;
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

/** COW-73: published editorial overlay rows for amenities in this tenant. */
export function listScopedAmenityEditorial(
  db: D1Database,
  scope: TenantScope,
): Promise<AmenityEditorialContract[]> {
  return allScoped(
    db,
    "SELECT amenity_id, tenant_id, short_name, short_description, long_description, active, updated_at FROM amenity_editorial WHERE tenant_id = ?1",
    [scope.tenantId],
    amenityEditorialRowSchema,
  );
}

/**
 * COW-73: a room only opts into D1-sourced guest amenities once an editor has
 * published its own `room_amenities` document. Without that explicit per-room
 * decision the guest must keep the Webflow list, even if other rooms migrated.
 */
export async function hasPublishedRoomAmenities(
  db: D1Database,
  tenantId: string,
  roomTypeId: string,
): Promise<boolean> {
  const row = await db.prepare(
    `SELECT 1 FROM content_items
      WHERE tenant_id = ?1 AND kind = 'room_amenities' AND slug = ?2
        AND status = 'published'`,
  ).bind(tenantId, roomTypeId).first();
  return row !== null;
}

/** Ordered gallery rows for one room, with per-photo exclusion and source URL. */
const GALLERY_SQL = `
  SELECT p.id AS placement_id, p.media_asset_id, p.display_order,
         a.original_filename,
         COALESCE(v.squarespace_url, a.squarespace_url) AS source_url,
         a.squarespace_asset_id AS source_asset_id,
         COALESCE(mf.excluded, 0) AS excluded,
         COALESCE(v.width, a.width) AS width,
         COALESCE(v.height, a.height) AS height,
         COALESCE(p.alt_text_override, a.alt_text) AS alt_text,
         COALESCE(p.caption_override, md.caption) AS caption,
         COALESCE(p.description_override, md.description) AS description,
         md.tags, md.current_version_id,
         vf.cloudinary_public_id, vf.cloudinary_version, vf.sha256
    FROM media_placements p
    JOIN room_types rt ON rt.id = p.target_id AND rt.tenant_id = p.tenant_id
    JOIN media_assets a ON a.id = p.media_asset_id AND a.tenant_id = p.tenant_id AND a.kind = 'image'
    LEFT JOIN media_asset_metadata md
      ON md.media_asset_id = a.id AND md.tenant_id = a.tenant_id
    LEFT JOIN media_versions v ON v.id = md.current_version_id
    LEFT JOIN media_version_files vf
      ON vf.version_id = v.id AND vf.tenant_id = a.tenant_id
    LEFT JOIN media_placement_flags mf
      ON mf.placement_id = p.id AND mf.tenant_id = p.tenant_id
   WHERE p.tenant_id = ?1 AND p.target_table = 'room_types'
     AND p.target_id = ?2 AND p.placement_type IN ('room_gallery', 'gallery')
   ORDER BY p.display_order, p.id`;

export async function listRoomGallery(
  db: D1Database,
  tenantId: string,
  roomTypeId: string,
): Promise<RoomGalleryRow[]> {
  const result = await db.prepare(GALLERY_SQL).bind(tenantId, roomTypeId).all();
  const items: RoomGalleryRow[] = [];
  for (const row of result.results ?? []) {
    const parsed = roomGalleryRowSchema.safeParse(row);
    // One malformed registry row must not hide the rest of the room's gallery.
    if (parsed.success) items.push(parsed.data);
  }
  return items;
}

/** Slugs of rooms whose own assignment document has been published. */
export async function listPublishedRoomAmenitySlugs(
  db: D1Database,
  tenantId: string,
): Promise<Set<string>> {
  const result = await db.prepare(
    `SELECT slug FROM content_items
      WHERE tenant_id = ?1 AND kind = 'room_amenities' AND status = 'published'`,
  ).bind(tenantId).all();
  return new Set((result.results ?? []).map((row: any) => row.slug as string));
}

/** Tenant-wide ordered assignments in one query, grouped by the caller. */
export function listRoomAmenityAssignmentsForTenant(
  db: D1Database,
  tenantId: string,
  publishedOnly = false,
): Promise<RoomAmenityAssignmentRow[]> {
  const activeClause = publishedOnly ? " AND (e.active IS NULL OR e.active = 1)" : "";
  return allScoped(
    db,
    `SELECT ra.room_type_id, a.id AS amenity_id, a.name, a.image_name, a.image_path, a.sort_order,
            COALESCE(e.short_name, a.name) AS short_name,
            e.short_description, e.long_description,
            COALESCE(e.active, 1) AS active,
            ra.display_order, ra.excluded
       FROM room_type_amenities ra
       JOIN room_types rt ON rt.id = ra.room_type_id AND rt.tenant_id = ?1
       JOIN amenities a ON a.id = ra.amenity_id AND a.tenant_id = ?1
       LEFT JOIN amenity_editorial e ON e.amenity_id = a.id AND e.tenant_id = ?1
      WHERE 1 = 1${activeClause}
      ORDER BY ra.room_type_id, ra.display_order, a.sort_order, a.id`,
    [tenantId],
    roomAmenityAssignmentRowSchema,
  );
}

/**
 * COW-73: ordered amenities assigned to one room, joined to the published
 * editorial overlay. Tenant ownership is proven by both the room and the
 * amenity rows. `publishedOnly` hides inactive amenities from guest snapshots
 * while the admin keeps seeing them so they can be re-enabled.
 */
export function listRoomAmenityAssignments(
  db: D1Database,
  tenantId: string,
  roomTypeId: string,
  publishedOnly = false,
): Promise<RoomAmenityAssignmentRow[]> {
  const activeClause = publishedOnly ? " AND (e.active IS NULL OR e.active = 1)" : "";
  return allScoped(
    db,
    `SELECT ra.room_type_id, a.id AS amenity_id, a.name, a.image_name, a.image_path, a.sort_order,
            COALESCE(e.short_name, a.name) AS short_name,
            e.short_description, e.long_description,
            COALESCE(e.active, 1) AS active,
            ra.display_order, ra.excluded
       FROM room_type_amenities ra
       JOIN room_types rt ON rt.id = ra.room_type_id AND rt.tenant_id = ?2
       JOIN amenities a ON a.id = ra.amenity_id AND a.tenant_id = ?2
       LEFT JOIN amenity_editorial e ON e.amenity_id = a.id AND e.tenant_id = ?2
      WHERE ra.room_type_id = ?1${activeClause}
      ORDER BY ra.display_order, a.sort_order, a.id`,
    [roomTypeId, tenantId],
    roomAmenityAssignmentRowSchema,
  );
}

export function listScopedAddOns(db: D1Database, scope: TenantScope): Promise<AddOnContract[]> {
  return allScoped(
    db,
    scope.locationId != null
      ? `${ADD_ONS_SELECT} WHERE tenant_id = ?1 AND location_id = ?2 AND status = 'published' ORDER BY sort_order, id`
      : `${ADD_ONS_SELECT} WHERE tenant_id = ?1 AND status = 'published' ORDER BY sort_order, id`,
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