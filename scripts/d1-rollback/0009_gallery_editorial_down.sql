-- COW-84 rollback: remove gallery author state. Importer-owned placements and
-- the media registry are left intact; no Mews data is affected.
DROP INDEX IF EXISTS idx_gallery_editorial_tenant_excluded;
DROP TABLE IF EXISTS gallery_editorial;
