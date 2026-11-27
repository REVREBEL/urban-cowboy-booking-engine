-- Import reviewed feature copy as drafts; retain existing revisions.
INSERT OR IGNORE INTO content_items(id,tenant_id,location_id,kind,slug,status,current_revision_id) SELECT 'preview-location-feature-6abc9142d98b325b2821ca23-1',tenant_id,id,'location_feature','feature-1','draft',NULL FROM locations WHERE id='6abc9142d98b325b2821ca23';
INSERT OR IGNORE INTO content_revisions(id,content_item_id,revision,payload_json,created_by) SELECT 'preview-location-feature-6abc9142d98b325b2821ca23-1-r1',id,1,'{"headline": "Disappear for a While", "paragraph": "Trade pavement for mountain air and the kind of quiet that makes you forget what day it is.", "displayOrder": 1}','webflow-import' FROM content_items WHERE id='preview-location-feature-6abc9142d98b325b2821ca23-1' AND kind='location_feature';
INSERT OR IGNORE INTO content_item_pointers(tenant_id,content_item_id,working_revision_id) SELECT tenant_id,id,'preview-location-feature-6abc9142d98b325b2821ca23-1-r1' FROM content_items WHERE id='preview-location-feature-6abc9142d98b325b2821ca23-1' AND EXISTS(SELECT 1 FROM content_revisions WHERE id='preview-location-feature-6abc9142d98b325b2821ca23-1-r1' AND content_item_id='preview-location-feature-6abc9142d98b325b2821ca23-1');
INSERT OR IGNORE INTO content_provenance(tenant_id,location_id,target_table,target_id,source_system,source_collection,source_id,source_snapshot_date,source_hash) SELECT tenant_id,location_id,'content_items',id,'webflow_cms','locations',location_id,'2026-11-15','f576d9acf31924c2088c57859d40a33ea669623d6ecc51dabf8e456dcc9ecec0' FROM content_items WHERE id='preview-location-feature-6abc9142d98b325b2821ca23-1';
INSERT OR IGNORE INTO content_items(id,tenant_id,location_id,kind,slug,status,current_revision_id) SELECT 'preview-location-feature-6abc9142d98b325b2821ca23-2',tenant_id,id,'location_feature','feature-2','draft',NULL FROM locations WHERE id='6abc9142d98b325b2821ca23';
INSERT OR IGNORE INTO content_revisions(id,content_item_id,revision,payload_json,created_by) SELECT 'preview-location-feature-6abc9142d98b325b2821ca23-2-r1',id,1,'{"headline": "Soak It All In", "paragraph": "Sauna, outdoor hangs, long baths and plenty of ways to slow the whole operation down.", "displayOrder": 2}','webflow-import' FROM content_items WHERE id='preview-location-feature-6abc9142d98b325b2821ca23-2' AND kind='location_feature';
INSERT OR IGNORE INTO content_item_pointers(tenant_id,content_item_id,working_revision_id) SELECT tenant_id,id,'preview-location-feature-6abc9142d98b325b2821ca23-2-r1' FROM content_items WHERE id='preview-location-feature-6abc9142d98b325b2821ca23-2' AND EXISTS(SELECT 1 FROM content_revisions WHERE id='preview-location-feature-6abc9142d98b325b2821ca23-2-r1' AND content_item_id='preview-location-feature-6abc9142d98b325b2821ca23-2');
INSERT OR IGNORE INTO content_provenance(tenant_id,location_id,target_table,target_id,source_system,source_collection,source_id,source_snapshot_date,source_hash) SELECT tenant_id,location_id,'content_items',id,'webflow_cms','locations',location_id,'2026-11-15','f576d9acf31924c2088c57859d40a33ea669623d6ecc51dabf8e456dcc9ecec0' FROM content_items WHERE id='preview-location-feature-6abc9142d98b325b2821ca23-2';
INSERT OR IGNORE INTO content_items(id,tenant_id,location_id,kind,slug,status,current_revision_id) SELECT 'preview-location-feature-6abc9142d98b325b2821ca23-3',tenant_id,id,'location_feature','feature-3','draft',NULL FROM locations WHERE id='6abc9142d98b325b2821ca23';
INSERT OR IGNORE INTO content_revisions(id,content_item_id,revision,payload_json,created_by) SELECT 'preview-location-feature-6abc9142d98b325b2821ca23-3-r1',id,1,'{"headline": "Better Together", "paragraph": "Dinner, drinks, fireside nights and whatever happens next. Cowboy is made for gathering.", "displayOrder": 3}','webflow-import' FROM content_items WHERE id='preview-location-feature-6abc9142d98b325b2821ca23-3' AND kind='location_feature';
INSERT OR IGNORE INTO content_item_pointers(tenant_id,content_item_id,working_revision_id) SELECT tenant_id,id,'preview-location-feature-6abc9142d98b325b2821ca23-3-r1' FROM content_items WHERE id='preview-location-feature-6abc9142d98b325b2821ca23-3' AND EXISTS(SELECT 1 FROM content_revisions WHERE id='preview-location-feature-6abc9142d98b325b2821ca23-3-r1' AND content_item_id='preview-location-feature-6abc9142d98b325b2821ca23-3');
INSERT OR IGNORE INTO content_provenance(tenant_id,location_id,target_table,target_id,source_system,source_collection,source_id,source_snapshot_date,source_hash) SELECT tenant_id,location_id,'content_items',id,'webflow_cms','locations',location_id,'2026-11-15','f576d9acf31924c2088c57859d40a33ea669623d6ecc51dabf8e456dcc9ecec0' FROM content_items WHERE id='preview-location-feature-6abc9142d98b325b2821ca23-3';
-- The feature toggle is linked through its existing settings revision.
-- The feature toggle remains in the existing site_settings revision JSON.


CREATE UNIQUE INDEX IF NOT EXISTS idx_content_items_scope_kind_link
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

