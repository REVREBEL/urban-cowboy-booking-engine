-- Preserve existing image URLs in the media registry for extras.
INSERT OR IGNORE INTO media_assets(id,tenant_id,kind)
SELECT 'extra-image:'||a.id,a.tenant_id,'image'
FROM add_ons a JOIN content_items i ON i.tenant_id=a.tenant_id AND i.kind='add_on' AND i.slug=a.id
JOIN content_revisions r ON r.id=i.current_revision_id AND r.content_item_id=i.id
WHERE json_valid(r.payload_json) AND NULLIF(json_extract(r.payload_json,'$.imageUrl'),'') IS NOT NULL;
INSERT OR IGNORE INTO media_aliases(id,tenant_id,media_asset_id,alias_type,alias_value)
SELECT 'extra-image-url:'||a.id,a.tenant_id,'extra-image:'||a.id,'source_url',json_extract(r.payload_json,'$.imageUrl')
FROM add_ons a JOIN content_items i ON i.tenant_id=a.tenant_id AND i.kind='add_on' AND i.slug=a.id
JOIN content_revisions r ON r.id=i.current_revision_id AND r.content_item_id=i.id
WHERE json_valid(r.payload_json) AND NULLIF(json_extract(r.payload_json,'$.imageUrl'),'') IS NOT NULL;
INSERT OR IGNORE INTO media_placements(id,tenant_id,media_asset_id,target_table,target_id,placement_type,display_order)
SELECT 'extra-image-placement:'||a.id,a.tenant_id,m.media_asset_id,'extras',a.id,'extra_image',0
FROM add_ons a JOIN content_items i ON i.tenant_id=a.tenant_id AND i.kind='add_on' AND i.slug=a.id
JOIN content_revisions r ON r.id=i.current_revision_id AND r.content_item_id=i.id
JOIN media_aliases m ON m.tenant_id=a.tenant_id AND m.alias_type='source_url' AND m.alias_value=json_extract(r.payload_json,'$.imageUrl')
WHERE json_valid(r.payload_json) AND NULLIF(json_extract(r.payload_json,'$.imageUrl'),'') IS NOT NULL;
