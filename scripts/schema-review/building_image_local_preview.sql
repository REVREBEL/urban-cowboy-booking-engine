-- Local review only; apply after building_local_preview.py.
PRAGMA foreign_keys=ON;
BEGIN IMMEDIATE;
ALTER TABLE buildings ADD COLUMN image_media_asset_id TEXT REFERENCES media_assets(id);
CREATE TRIGGER building_image_same_tenant_insert
BEFORE INSERT ON buildings WHEN NEW.image_media_asset_id IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM media_assets WHERE id=NEW.image_media_asset_id AND tenant_id=NEW.tenant_id
)
BEGIN SELECT RAISE(ABORT, 'Building image must belong to the same tenant'); END;
CREATE TRIGGER building_image_same_tenant_update
BEFORE UPDATE OF image_media_asset_id,tenant_id ON buildings WHEN NEW.image_media_asset_id IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM media_assets WHERE id=NEW.image_media_asset_id AND tenant_id=NEW.tenant_id
)
BEGIN SELECT RAISE(ABORT, 'Building image must belong to the same tenant'); END;
CREATE TRIGGER building_image_asset_tenant_update
BEFORE UPDATE OF tenant_id ON media_assets WHEN EXISTS (
  SELECT 1 FROM buildings WHERE image_media_asset_id=OLD.id AND tenant_id<>NEW.tenant_id
)
BEGIN SELECT RAISE(ABORT, 'Building image must belong to the same tenant'); END;
COMMIT;
