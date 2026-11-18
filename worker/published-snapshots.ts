/**
 * Immutable published snapshots plus a mutable pointer per tenant/location/
 * collection (COW-32). A refresh writes a new version and repoints; a rollback
 * repoints to the previous version without deleting either snapshot.
 */
import type { TenantScope } from "./d1.ts";
import type { BuiltSnapshot, ContentCollection } from "./content-provider.ts";

export interface StoredSnapshot extends BuiltSnapshot {
  collection: ContentCollection;
  createdAt: string;
}

export interface SnapshotPointer {
  currentVersion: string;
  previousVersion: string | null;
}

export interface ParitySummary {
  collection: string;
  sourceCount: number;
  targetCount: number;
  matched: number;
  added: string[];
  removed: string[];
  changed: Array<{ id: string; fields: Array<{ field: string; source: unknown; target: unknown }> }>;
}

/** Empty string is the tenant-wide key; it keeps the composite PK total. */
const loc = (scope: TenantScope) => scope.locationId ?? "";

export async function getSnapshotPointer(
  db: D1Database,
  scope: TenantScope,
  collection: ContentCollection,
): Promise<SnapshotPointer | null> {
  const row = await db.prepare(
    "SELECT current_version, previous_version FROM snapshot_pointers WHERE tenant_id = ?1 AND location_id = ?2 AND collection = ?3",
  ).bind(scope.tenantId, loc(scope), collection).first() as
    | { current_version: string; previous_version: string | null }
    | null;
  return row
    ? { currentVersion: row.current_version, previousVersion: row.previous_version }
    : null;
}

export async function saveSnapshot(
  db: D1Database,
  scope: TenantScope,
  collection: ContentCollection,
  built: BuiltSnapshot,
): Promise<SnapshotPointer> {
  const before = await getSnapshotPointer(db, scope, collection);
  // Content-addressed versions are immutable: insert once, then verify that a
  // pre-existing row at the same version has exactly the same bytes. A mismatch
  // is a corrupted or colliding version and must fail loudly, never overwrite.
  await db.prepare(
    "INSERT INTO published_snapshots (tenant_id, location_id, collection, version, payload_json, item_count, checksum) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7) ON CONFLICT (tenant_id, location_id, collection, version) DO NOTHING",
  ).bind(scope.tenantId, loc(scope), collection, built.version, built.payloadJson, built.itemCount, built.checksum).run();
  const stored = await db.prepare(
    "SELECT payload_json, item_count, checksum FROM published_snapshots WHERE tenant_id = ?1 AND location_id = ?2 AND collection = ?3 AND version = ?4",
  ).bind(scope.tenantId, loc(scope), collection, built.version).first() as
    | { payload_json: string; item_count: number; checksum: string }
    | null;
  if (!stored || stored.payload_json !== built.payloadJson ||
      stored.item_count !== built.itemCount || stored.checksum !== built.checksum) {
    throw new Error("snapshot_version_conflict");
  }

  const pointer: SnapshotPointer = {
    currentVersion: built.version,
    previousVersion: before && before.currentVersion !== built.version
      ? before.currentVersion
      : before?.previousVersion ?? null,
  };
  await db.prepare(
    "INSERT INTO snapshot_pointers (tenant_id, location_id, collection, current_version, previous_version) VALUES (?1, ?2, ?3, ?4, ?5) ON CONFLICT (tenant_id, location_id, collection) DO UPDATE SET current_version = excluded.current_version, previous_version = excluded.previous_version, updated_at = datetime('now')",
  ).bind(scope.tenantId, loc(scope), collection, pointer.currentVersion, pointer.previousVersion).run();
  return pointer;
}

export async function getSnapshot(
  db: D1Database,
  scope: TenantScope,
  collection: ContentCollection,
  pinnedVersion?: string | null,
): Promise<StoredSnapshot | null> {
  const version = pinnedVersion ?? (await getSnapshotPointer(db, scope, collection))?.currentVersion;
  if (!version) return null;
  const row = await db.prepare(
    "SELECT collection, version, payload_json, item_count, checksum, created_at FROM published_snapshots WHERE tenant_id = ?1 AND location_id = ?2 AND collection = ?3 AND version = ?4",
  ).bind(scope.tenantId, loc(scope), collection, version).first() as
    | { collection: string; version: string; payload_json: string; item_count: number; checksum: string; created_at: string }
    | null;
  if (!row) return null;
  return {
    collection: row.collection as ContentCollection,
    version: row.version,
    checksum: row.checksum,
    itemCount: row.item_count,
    payloadJson: row.payload_json,
    createdAt: row.created_at,
  };
}

/** Repoints to the previous version; returns null when there is nothing to roll back to. */
export async function rollbackSnapshot(
  db: D1Database,
  scope: TenantScope,
  collection: ContentCollection,
): Promise<SnapshotPointer | null> {
  const before = await getSnapshotPointer(db, scope, collection);
  if (!before?.previousVersion) return null;
  const after: SnapshotPointer = {
    currentVersion: before.previousVersion,
    previousVersion: before.currentVersion,
  };
  await db.prepare(
    "UPDATE snapshot_pointers SET current_version = ?1, previous_version = ?2, updated_at = datetime('now') WHERE tenant_id = ?3 AND location_id = ?4 AND collection = ?5",
  ).bind(after.currentVersion, after.previousVersion, scope.tenantId, loc(scope), collection).run();
  return after;
}

export async function recordParityReport(
  db: D1Database,
  scope: TenantScope,
  collection: ContentCollection,
  version: string | null,
  summary: ParitySummary,
): Promise<string> {
  const id = crypto.randomUUID();
  await db.prepare(
    "INSERT INTO parity_reports (id, tenant_id, location_id, collection, version, difference_count, summary_json) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
  ).bind(id, scope.tenantId, loc(scope), collection, version, summary.added.length + summary.removed.length + summary.changed.length, JSON.stringify(summary)).run();
  return id;
}

/** Latest stored parity report for a collection (admin/no-store reads). */
export async function latestParityReport(
  db: D1Database,
  scope: TenantScope,
  collection: ContentCollection,
): Promise<{ id: string; summary: ParitySummary; createdAt: string } | null> {
  const row = await db.prepare(
    "SELECT id, summary_json, created_at FROM parity_reports WHERE tenant_id = ?1 AND location_id = ?2 AND collection = ?3 ORDER BY created_at DESC, id DESC LIMIT 1",
  ).bind(scope.tenantId, loc(scope), collection).first() as
    | { id: string; summary_json: string; created_at: string }
    | null;
  return row ? { id: row.id, summary: JSON.parse(row.summary_json) as ParitySummary, createdAt: row.created_at } : null;
}
