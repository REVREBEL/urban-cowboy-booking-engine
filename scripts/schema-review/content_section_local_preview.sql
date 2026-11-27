-- LOCAL REVIEW ONLY. Not a production D1 migration.
-- The feature toggle remains in the existing site_settings revision JSON.
PRAGMA foreign_keys=ON;
BEGIN IMMEDIATE;
CREATE UNIQUE INDEX IF NOT EXISTS idx_review_content_items_scope_kind
  ON content_items(tenant_id,location_id,id,kind);
CREATE TABLE IF NOT EXISTS content_sections (
  tenant_id TEXT NOT NULL,
  location_id TEXT NOT NULL,
  id TEXT NOT NULL,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  settings_content_id TEXT NOT NULL,
  setting_key TEXT NOT NULL,
  settings_kind TEXT NOT NULL DEFAULT 'site_settings' CHECK(settings_kind='site_settings'),
  PRIMARY KEY (tenant_id,location_id,id),
  UNIQUE (tenant_id,location_id,slug),
  FOREIGN KEY (tenant_id,location_id) REFERENCES locations(tenant_id,id),
  FOREIGN KEY (tenant_id,location_id,settings_content_id,settings_kind)
    REFERENCES content_items(tenant_id,location_id,id,kind)
);
CREATE TABLE IF NOT EXISTS content_section_items (
  tenant_id TEXT NOT NULL,
  location_id TEXT NOT NULL,
  section_id TEXT NOT NULL,
  content_item_id TEXT NOT NULL,
  content_kind TEXT NOT NULL DEFAULT 'location_feature' CHECK(content_kind='location_feature'),
  PRIMARY KEY (tenant_id,location_id,section_id,content_item_id),
  FOREIGN KEY (tenant_id,location_id,section_id)
    REFERENCES content_sections(tenant_id,location_id,id),
  FOREIGN KEY (tenant_id,location_id,content_item_id,content_kind)
    REFERENCES content_items(tenant_id,location_id,id,kind)
);
INSERT OR IGNORE INTO content_sections (tenant_id,location_id,id,slug,name,settings_content_id,setting_key)
  SELECT s.tenant_id,s.location_id,'feature-section:' || s.location_id,'feature-section','Feature Section',s.id,'enableFeatureSection'
  FROM content_items s
  WHERE s.kind='site_settings' AND s.location_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM content_items i WHERE i.tenant_id=s.tenant_id AND i.location_id=s.location_id AND i.kind='location_feature');
INSERT OR IGNORE INTO content_section_items (tenant_id,location_id,section_id,content_item_id)
  SELECT i.tenant_id,i.location_id,s.id,i.id
  FROM content_items i JOIN content_sections s
    ON s.tenant_id=i.tenant_id AND s.location_id=i.location_id AND s.slug='feature-section'
  WHERE i.kind='location_feature';
COMMIT;
