// COW-33: additive media registry schema, immutable IDs and rollback.
// Run with: node --test tests/mediaRegistrySchema.test.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");
const sql = {
  init: read("migrations/0001_init.sql"),
  moduleIndexes: read("migrations/0002_module_list_indexes.sql"),
  contracts: read("migrations/0003_property_scoped_contracts.sql"),
  registry: read("migrations/0004_media_registry.sql"),
  registryDown: read("scripts/d1-rollback/0004_media_registry_down.sql"),
  fixture: read("tests/fixtures/d1-contracts-fixture.sql"),
};

function makeDb() {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON");
  db.exec(sql.init);
  db.exec(sql.moduleIndexes);
  db.exec(sql.contracts);
  db.exec(sql.registry);
  db.exec(sql.fixture);
  db.exec(`
    INSERT INTO media_versions (id, media_asset_id, version, squarespace_asset_id, squarespace_url, width, height)
    VALUES ('fixture-version-1', 'fixture-media', 1, 'legacy-1', 'https://legacy.example/1.png', 1200, 800);
    INSERT INTO media_versions (id, media_asset_id, version, squarespace_asset_id, squarespace_url, width, height)
    VALUES ('fixture-version-2', 'fixture-media', 2, 'legacy-2', 'https://legacy.example/2.png', 1600, 900);
    INSERT INTO media_versions (id, media_asset_id, version, squarespace_asset_id, squarespace_url)
    VALUES ('other-version', 'other-media', 1, 'other-1', 'https://legacy.example/other.png');
  `);
  return db;
}

test("0004 applies to the production baseline with foreign keys on", () => {
  const db = makeDb();
  assert.deepEqual(db.prepare("PRAGMA foreign_key_check").all(), []);
  assert.equal(db.prepare("PRAGMA integrity_check").get().integrity_check, "ok");
  for (const table of [
    "media_asset_metadata", "media_version_files", "media_placements", "media_revisions",
  ]) {
    assert.ok(db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n === 0, `${table} starts empty`);
  }
  db.close();
});

test("media_id and version_id cannot be rewritten", () => {
  const db = makeDb();
  assert.throws(
    () => db.exec("UPDATE media_assets SET id = 'reused-media' WHERE id = 'fixture-media'"),
    /media_id is immutable/,
  );
  assert.throws(
    () => db.exec("UPDATE media_versions SET id = 'reused-version' WHERE id = 'fixture-version-1'"),
    /version_id is immutable/,
  );
  assert.throws(
    () => db.exec("UPDATE media_versions SET media_asset_id = 'other-media' WHERE id = 'fixture-version-1'"),
    /a version cannot change its media_id/,
  );
  assert.equal(db.prepare("SELECT id FROM media_assets WHERE id = 'fixture-media'").get().id, "fixture-media");
  db.close();
});

test("a reupload adds a version without moving the media_id or its placements", () => {
  const db = makeDb();
  db.exec(`
    INSERT INTO media_asset_metadata (media_asset_id, tenant_id, description, caption, tags, attribution, current_version_id)
    VALUES ('fixture-media', 'contracts-fixture', 'Room photo', 'Catskills suite', '["room","suite"]', 'Photographer', 'fixture-version-1');
    INSERT INTO media_placements (id, tenant_id, media_asset_id, target_table, target_id, placement_type, display_order, caption_override)
    VALUES ('placement-1', 'contracts-fixture', 'fixture-media', 'room_types', 'room-1', 'gallery', 0, 'Placement caption');
  `);
  db.exec(`
    INSERT INTO media_versions (id, media_asset_id, version, squarespace_asset_id, squarespace_url)
    VALUES ('fixture-version-3', 'fixture-media', 3, 'legacy-3', 'https://legacy.example/3.png');
    INSERT INTO media_version_files (version_id, tenant_id, media_asset_id, cloudinary_public_id, cloudinary_version, sha256, byte_size, mime_type)
    VALUES ('fixture-version-3', 'contracts-fixture', 'fixture-media', 'urban-cowboy/room-3', 'v3', 'abc123', 204800, 'image/png');
    UPDATE media_asset_metadata SET current_version_id = 'fixture-version-3', updated_at = datetime('now')
      WHERE media_asset_id = 'fixture-media';
    INSERT INTO media_revisions (id, tenant_id, media_asset_id, action, from_version_id, to_version_id, actor)
    VALUES ('revision-1', 'contracts-fixture', 'fixture-media', 'replace', 'fixture-version-2', 'fixture-version-3', 'editor@example.com');
  `);

  const asset = db.prepare("SELECT media_asset_id, current_version_id FROM media_asset_metadata WHERE media_asset_id = 'fixture-media'").get();
  const placement = db.prepare("SELECT media_asset_id, caption_override, display_order FROM media_placements WHERE id = 'placement-1'").get();
  assert.equal(asset.media_asset_id, "fixture-media");
  assert.equal(asset.current_version_id, "fixture-version-3");
  assert.equal(placement.media_asset_id, "fixture-media");
  assert.equal(placement.caption_override, "Placement caption");
  assert.equal(placement.display_order, 0);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM media_versions WHERE media_asset_id = 'fixture-media'").get().n, 3);
  const revision = db.prepare("SELECT action, from_version_id, to_version_id FROM media_revisions WHERE id = 'revision-1'").get();
  assert.deepEqual({ ...revision }, {
    action: "replace",
    from_version_id: "fixture-version-2",
    to_version_id: "fixture-version-3",
  });
  db.close();
});

test("placement order and asset are unique per target, and tenant ownership is enforced", () => {
  const db = makeDb();
  db.exec(`
    INSERT INTO media_placements (id, tenant_id, media_asset_id, target_table, target_id, placement_type, display_order)
    VALUES ('placement-1', 'contracts-fixture', 'fixture-media', 'room_types', 'room-1', 'gallery', 0);
  `);
  assert.throws(() => db.exec(`
    INSERT INTO media_placements (id, tenant_id, media_asset_id, target_table, target_id, placement_type, display_order)
    VALUES ('placement-2', 'contracts-fixture', 'fixture-media', 'room_types', 'room-1', 'gallery', 0)
  `));
  assert.throws(() => db.exec(`
    INSERT INTO media_placements (id, tenant_id, media_asset_id, target_table, target_id, placement_type, display_order)
    VALUES ('placement-3', 'contracts-fixture', 'other-media', 'room_types', 'room-1', 'gallery', 1)
  `), /FOREIGN KEY/);
  assert.throws(() => db.exec(`
    INSERT INTO media_placements (id, tenant_id, media_asset_id, target_table, target_id, placement_type, display_order)
    VALUES ('placement-4', 'other-tenant', 'fixture-media', 'room_types', 'room-1', 'gallery', 1)
  `), /FOREIGN KEY/);
  db.close();
});

test("revision actions and Cloudinary public IDs are bounded", () => {
  const db = makeDb();
  assert.throws(() => db.exec(`
    INSERT INTO media_revisions (id, tenant_id, media_asset_id, action)
    VALUES ('bad-action', 'contracts-fixture', 'fixture-media', 'delete_everything')
  `), /CHECK constraint/);
  db.exec(`
    INSERT INTO media_version_files (version_id, tenant_id, media_asset_id, cloudinary_public_id, cloudinary_version, sha256)
    VALUES ('fixture-version-1', 'contracts-fixture', 'fixture-media', 'urban-cowboy/room-1', 'v1', 'hash-1')
  `);
  assert.throws(() => db.exec(`
    INSERT INTO media_version_files (version_id, tenant_id, media_asset_id, cloudinary_public_id, cloudinary_version, sha256)
    VALUES ('fixture-version-2', 'contracts-fixture', 'fixture-media', 'urban-cowboy/room-1', 'v2', 'hash-2')
  `));
  // The same public ID may exist under a different tenant.
  db.exec(`
    INSERT INTO media_version_files (version_id, tenant_id, media_asset_id, cloudinary_public_id)
    VALUES ('other-version', 'other-tenant', 'other-media', 'urban-cowboy/room-1')
  `);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM media_version_files").get().n, 2);
  db.close();
});

test("rollback removes only the 0004 objects and re-apply is clean", () => {
  const db = makeDb();
  db.exec(sql.registryDown);
  db.exec(sql.registryDown); // safe to repeat
  for (const table of ["media_assets", "media_versions", "media_aliases", "content_provenance"]) {
    assert.ok(db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n >= 0, `${table} survives`);
  }
  for (const table of ["media_asset_metadata", "media_version_files", "media_placements", "media_revisions"]) {
    assert.equal(
      db.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type = 'table' AND name = ?").get(table).n,
      0,
      `${table} dropped`,
    );
  }
  db.exec(sql.registry);
  assert.deepEqual(db.prepare("PRAGMA foreign_key_check").all(), []);
  db.close();
});
