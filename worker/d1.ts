// Thin D1 helpers for the Urban Cowboy platform. Mews remains source of truth
// for availability/rates/reservations; D1 owns editorial content, settings,
// revisions, media IDs, merchandising, recovery state and reporting read models.

import type { Env } from "./mews/_lib";

export interface TenantScope {
  tenantId: string;
  locationId?: string | null;
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
): Promise<unknown | null> {
  const row = await db
    .prepare(
      "SELECT id, tenant_id, location_id, kind, slug, status, current_revision_id, created_at, updated_at FROM content_items WHERE id = ?1",
    )
    .bind(id)
    .first();
  return row ?? null;
}