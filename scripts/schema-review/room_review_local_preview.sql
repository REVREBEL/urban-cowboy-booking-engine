-- LOCAL DBGate REVIEW ONLY: not a production D1 migration. Run once.
-- Preserve source metadata in a separate provenance table pending a final
-- retention decision. Keep policy references until mapped and verified.
PRAGMA foreign_keys=ON;
BEGIN IMMEDIATE;
CREATE TABLE room_type_reviews (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  room_type_id TEXT NOT NULL,
  review TEXT,
  review_source TEXT,
  review_url TEXT,
  review_date TEXT,
  reviewer_name_or_handle TEXT,
  status TEXT CHECK(status IN ('draft','published','archived')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  FOREIGN KEY (tenant_id,room_type_id) REFERENCES room_types(tenant_id,id)
);
INSERT INTO room_type_reviews (id,tenant_id,room_type_id,review,review_source,review_url,review_date,reviewer_name_or_handle)
SELECT 'webflow-room-review:' || id,tenant_id,id,review,review_source,review_url,review_date,reviewer_name_or_handle
FROM room_types
WHERE review IS NOT NULL OR review_source IS NOT NULL OR review_url IS NOT NULL OR review_date IS NOT NULL OR reviewer_name_or_handle IS NOT NULL;
CREATE INDEX idx_room_type_reviews_room ON room_type_reviews(tenant_id,room_type_id);
CREATE TABLE room_type_source_metadata (
  tenant_id TEXT NOT NULL,
  room_type_id TEXT NOT NULL,
  source_system TEXT NOT NULL,
  cms_locale_id TEXT,
  source_created_on TEXT,
  source_last_updated TEXT,
  source_last_published TEXT,
  source_is_archived INTEGER CHECK(source_is_archived IN (0,1)),
  source_is_draft INTEGER CHECK(source_is_draft IN (0,1)),
  PRIMARY KEY (tenant_id,room_type_id,source_system),
  FOREIGN KEY (tenant_id,room_type_id) REFERENCES room_types(tenant_id,id)
);
INSERT INTO room_type_source_metadata (tenant_id,room_type_id,source_system,cms_locale_id,source_created_on,source_last_updated,source_last_published,source_is_archived,source_is_draft)
SELECT tenant_id,id,'webflow_cms',webflow_cms_locale_id,webflow_created_on,webflow_last_updated,webflow_last_published,webflow_is_archived,webflow_is_draft FROM room_types;
ALTER TABLE room_types DROP COLUMN review;
ALTER TABLE room_types DROP COLUMN review_source;
ALTER TABLE room_types DROP COLUMN review_url;
ALTER TABLE room_types DROP COLUMN review_date;
ALTER TABLE room_types DROP COLUMN reviewer_name_or_handle;
ALTER TABLE room_types DROP COLUMN webflow_cms_locale_id;
ALTER TABLE room_types DROP COLUMN webflow_created_on;
ALTER TABLE room_types DROP COLUMN webflow_last_updated;
ALTER TABLE room_types DROP COLUMN webflow_last_published;
ALTER TABLE room_types DROP COLUMN webflow_is_archived;
ALTER TABLE room_types DROP COLUMN webflow_is_draft;
COMMIT;
