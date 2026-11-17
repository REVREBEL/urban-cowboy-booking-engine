/**
 * Source → D1 provenance mapping (COW-30).
 *
 * The Webflow CMS export is the source of truth for editorial content only.
 * Mews remains authoritative for rates, availability, reservations and
 * settlement. This module records where each imported Webflow collection
 * lands in D1 and which collections are deliberately excluded, so imported
 * rows can carry a stable provenance record (migrations/0003).
 */
import type { ContentProvenanceContract, SourceSystem } from "../types/d1-contracts.ts";

export const WEBFLOW_SNAPSHOT_DATE = "2026-11-15";

export interface SourceTarget {
  table: string;
  /** content_items.kind for versioned content targets. */
  contentKind?: string;
  note?: string;
}

export interface SourceMapping {
  sourceCollection: string;
  sourceSystem: SourceSystem;
  snapshotDate: string;
  /** Source CSV field carrying the location reference, when present. */
  locationField?: string;
  targets: SourceTarget[];
}

export interface ExcludedSource {
  sourceCollection: string;
  reason: string;
}

/** A provenance row before the database supplies imported_at. */
export type ProvenanceSeed = Omit<ContentProvenanceContract, "importedAt">;

export const WEBFLOW_MAPPINGS: readonly SourceMapping[] = [
  { sourceCollection: "locations", sourceSystem: "webflow_cms", snapshotDate: WEBFLOW_SNAPSHOT_DATE, locationField: "id", targets: [{ table: "locations" }] },
  { sourceCollection: "buildings", sourceSystem: "webflow_cms", snapshotDate: WEBFLOW_SNAPSHOT_DATE, locationField: "location", targets: [{ table: "buildings" }] },
  { sourceCollection: "roomTypes", sourceSystem: "webflow_cms", snapshotDate: WEBFLOW_SNAPSHOT_DATE, locationField: "property-location", targets: [{ table: "room_types" }, { table: "room_type_amenities", note: "derived from features-amenities / display-order / restricted-amenity-ids; no provenance row (no single row ID)" }] },
  { sourceCollection: "amenities", sourceSystem: "webflow_cms", snapshotDate: WEBFLOW_SNAPSHOT_DATE, targets: [{ table: "amenities" }] },
  { sourceCollection: "events", sourceSystem: "webflow_cms", snapshotDate: WEBFLOW_SNAPSHOT_DATE, locationField: "property-location", targets: [{ table: "events" }] },
  { sourceCollection: "offers", sourceSystem: "webflow_cms", snapshotDate: WEBFLOW_SNAPSHOT_DATE, locationField: "location", targets: [{ table: "offers" }, { table: "rate_merchandising", note: "published offers with a Mews rate product only" }] },
  { sourceCollection: "addOns", sourceSystem: "webflow_cms", snapshotDate: WEBFLOW_SNAPSHOT_DATE, targets: [{ table: "add_ons" }] },
  { sourceCollection: "instagrams", sourceSystem: "webflow_cms", snapshotDate: WEBFLOW_SNAPSHOT_DATE, locationField: "location", targets: [{ table: "content_items", contentKind: "instagram" }, { table: "content_revisions", contentKind: "instagram" }] },
  { sourceCollection: "outlets", sourceSystem: "webflow_cms", snapshotDate: WEBFLOW_SNAPSHOT_DATE, locationField: "location", targets: [{ table: "content_items", contentKind: "outlet" }, { table: "content_revisions", contentKind: "outlet" }] },
  { sourceCollection: "contentSettings", sourceSystem: "webflow_cms", snapshotDate: WEBFLOW_SNAPSHOT_DATE, locationField: "location", targets: [{ table: "content_items", contentKind: "policy" }, { table: "content_revisions", contentKind: "policy" }] },
];

export const EXCLUDED_SOURCE_COLLECTIONS: readonly ExcludedSource[] = [
  {
    sourceCollection: "photoHotspots",
    reason: "CSV export has no photo-file-id/photo-url; no stable media asset ID. Re-export with media identity and import media_aliases first (COW-33/34).",
  },
  {
    sourceCollection: "menuItems",
    reason: "Source collection is empty; nothing to import.",
  },
];

export function findMapping(sourceCollection: string): SourceMapping | undefined {
  return WEBFLOW_MAPPINGS.find((mapping) => mapping.sourceCollection === sourceCollection);
}

export function exclusionFor(sourceCollection: string): ExcludedSource | undefined {
  return EXCLUDED_SOURCE_COLLECTIONS.find((item) => item.sourceCollection === sourceCollection);
}

/**
 * Fails fast when a source collection is neither mapped nor explicitly
 * excluded. Used by the importer and by tests against the reconciliation
 * report so new Webflow collections cannot be silently dropped.
 */
export function assertSourceCoverage(sourceCollections: readonly string[]): void {
  const missing = sourceCollections.filter((name) => !findMapping(name) && !exclusionFor(name));
  if (missing.length) {
    throw new Error(`Unmapped source collections: ${missing.join(", ")}`);
  }
}

/** Builds a provenance row for one imported record. */
export function provenanceSeed(input: {
  tenantId: string;
  targetTable: string;
  targetId: string;
  sourceSystem: SourceSystem;
  locationId?: string | null;
  sourceCollection?: string | null;
  sourceId?: string | null;
  sourceHash?: string | null;
  snapshotDate?: string | null;
}): ProvenanceSeed {
  return {
    tenantId: input.tenantId,
    locationId: input.locationId ?? null,
    targetTable: input.targetTable,
    targetId: input.targetId,
    sourceSystem: input.sourceSystem,
    sourceCollection: input.sourceCollection ?? null,
    sourceId: input.sourceId ?? null,
    sourceSnapshotDate: input.snapshotDate ?? null,
    sourceHash: input.sourceHash ?? null,
  };
}
