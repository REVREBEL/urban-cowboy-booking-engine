-- COW-73: canonical D1 storage for published amenity editorial content.
--
-- The Webflow Amenities collection owns short/long descriptions, the short
-- name and the active flag; until now those values were never imported into D1
-- (the CMS export has no image columns and seed.sql stores id/name/icon only).
-- This table is an additive, tenant-scoped overlay on `amenities`: identity,
-- icon paths and global sort order remain in `amenities`, while the editable,
-- published editorial values live here. Keeping a separate table means this
-- migration is idempotent (plain ALTER TABLE ADD COLUMN is not), which the
-- migration runner's twice-applied integrity check requires.
--
-- Write path: the COW-38 content editor drafts these values in content_revisions;
-- publish writes through to this table and refreshes the roomAmenities snapshot.
-- Guest reads are tenant-scoped and published-only; drafts never reach here.
--
-- Rollback: scripts/d1-rollback/0007_amenity_editorial_down.sql

CREATE TABLE IF NOT EXISTS amenity_editorial (
  amenity_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  short_name TEXT,
  short_description TEXT,
  long_description TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (amenity_id) REFERENCES amenities (id),
  FOREIGN KEY (tenant_id) REFERENCES tenants (id)
);

CREATE INDEX IF NOT EXISTS idx_amenity_editorial_tenant_active
  ON amenity_editorial (tenant_id, active);
