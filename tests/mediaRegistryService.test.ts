// COW-33: link/new/replace actions keep media identity and metadata intact.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import {
  createMediaAsset,
  getMediaAsset,
  linkExistingMedia,
  replaceMediaVersion,
  retireMediaAsset,
  setMediaPlacement,
} from "../worker/media-registry.ts";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");

function makeDb() {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON");
  for (const file of [
    "migrations/0001_init.sql",
    "migrations/0002_module_list_indexes.sql",
    "migrations/0003_property_scoped_contracts.sql",
    "migrations/0004_media_registry.sql",
    "tests/fixtures/d1-contracts-fixture.sql",
  ]) {
    db.exec(read(file));
  }
  return db;
}

/** D1-shaped adapter over node:sqlite. batch() is atomic, like D1. */
function d1(db: DatabaseSync, options: { failBatch?: boolean } = {}): any {
  const statement = (sql: string, params: unknown[] = []): any => ({
    bind(...values: unknown[]) { return statement(sql, values); },
    async run() { return db.prepare(sql).run(...params); },
    async all() { return { results: db.prepare(sql).all(...params) }; },
    async first() { return db.prepare(sql).get(...params) ?? null; },
  });
  return {
    prepare: (sql: string) => statement(sql),
    async batch(statements: any[]) {
      db.exec("BEGIN");
      try {
        if (options.failBatch) {
          await statements[0].run();
          throw new Error("simulated batch failure");
        }
        for (const stmt of statements) await stmt.run();
        db.exec("COMMIT");
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    },
  };
}

const TENANT = "contracts-fixture";
const base = {
  tenantId: TENANT,
  locationId: "fixture-location",
  kind: "image" as const,
  mediaId: "photo-1",
  versionId: "photo-1:v1",
  originalFilename: "room.png",
  version: 1,
  revisionId: "rev-create",
  file: {
    cloudinaryPublicId: "urban-cowboy/room-1",
    cloudinaryVersion: "v1",
    sha256: "hash-1",
    byteSize: 1024,
    mimeType: "image/png",
  },
  metadata: {
    description: "Room photo",
    caption: "Catskills suite",
    tags: ["room", "suite"],
    attribution: "Photographer",
  },
};

async function seed(db: DatabaseSync) {
  const client = d1(db);
  const created = await createMediaAsset(client, base);
  await linkExistingMedia(client, {
    tenantId: TENANT,
    mediaId: created.mediaAssetId,
    aliasType: "webflow_file_id",
    aliasValue: "webflow-file-1",
    aliasId: "alias-1",
    revisionId: "rev-link",
    actor: "editor@example.com",
    placement: {
      id: "placement-1",
      revisionId: "rev-placement",
      tenantId: TENANT,
      mediaId: created.mediaAssetId,
      targetTable: "room_types",
      targetId: "room-1",
      placementType: "gallery",
      displayOrder: 0,
      captionOverride: "Gallery caption",
    },
  });
  return { client, created };
}

test("create, link and replace preserve media_id, aliases, placements and metadata", async () => {
  const db = makeDb();
  try {
    const { client, created } = await seed(db);
    const before = await getMediaAsset(client, TENANT, created.mediaAssetId);
    assert.equal(before?.mediaId, "photo-1");
    assert.equal(before?.currentVersionId, "photo-1:v1");

    const replaced = await replaceMediaVersion(client, {
      tenantId: TENANT,
      mediaId: created.mediaAssetId,
      versionId: "photo-1:v2",
      version: 2,
      width: 1600,
      height: 900,
      revisionId: "rev-replace",
      actor: "editor@example.com",
      note: "Reuploaded crop",
      file: {
        // Cloudinary keeps public_id stable across uploads and advances version.
        cloudinaryPublicId: "urban-cowboy/room-1",
        cloudinaryVersion: "v2",
        sha256: "hash-2",
        byteSize: 2048,
        mimeType: "image/png",
      },
    });
    assert.equal(replaced.mediaAssetId, "photo-1");
    assert.equal(replaced.versionId, "photo-1:v2");

    const after = await getMediaAsset(client, TENANT, created.mediaAssetId);
    assert.equal(after?.mediaId, "photo-1");
    assert.equal(after?.currentVersionId, "photo-1:v2");
    assert.equal(after?.description, "Room photo");
    assert.equal(after?.caption, "Catskills suite");
    assert.deepEqual(after?.tags, ["room", "suite"]);
    assert.equal(after?.attribution, "Photographer");
    assert.equal(after?.cloudinaryPublicId, "urban-cowboy/room-1");
    assert.equal(after?.cloudinaryVersion, "v2");
    assert.equal(after?.sha256, "hash-2");

    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM media_aliases WHERE media_asset_id = 'photo-1'").get().n, 1);
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM media_placements WHERE media_asset_id = 'photo-1'").get().n, 1);
    assert.equal(db.prepare("SELECT caption_override FROM media_placements WHERE id = 'placement-1'").get().caption_override, "Gallery caption");
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM media_versions WHERE media_asset_id = 'photo-1'").get().n, 2);

    const actions = db.prepare("SELECT action FROM media_revisions ORDER BY rowid").all().map((row: any) => row.action);
    assert.deepEqual(actions, ["create_new", "link_existing", "set_placement", "replace"]);
    const revision = db.prepare(
      "SELECT from_version_id, to_version_id, note, metadata_json FROM media_revisions WHERE action = 'replace'",
    ).get();
    assert.equal(revision.from_version_id, "photo-1:v1");
    assert.equal(revision.to_version_id, "photo-1:v2");
    assert.equal(revision.note, "Reuploaded crop");
    assert.equal(JSON.parse(revision.metadata_json).clientRevisionId, "rev-replace");
  } finally {
    db.close();
  }
});

test("cross-tenant actions are rejected before touching another tenant's media", async () => {
  const db = makeDb();
  try {
    const { client } = await seed(db);
    await assert.rejects(
      () => replaceMediaVersion(client, {
        tenantId: "other-tenant", mediaId: "photo-1", versionId: "photo-1:v2",
        version: 2, revisionId: "bad-replace",
      }),
      /media asset not found in tenant/,
    );
    await assert.rejects(
      () => linkExistingMedia(client, {
        tenantId: "other-tenant", mediaId: "photo-1",
        aliasType: "webflow_file_id", aliasValue: "stolen", revisionId: "bad-link",
      }),
      /media asset not found in tenant/,
    );
    await assert.rejects(
      () => setMediaPlacement(client, {
        id: "bad-placement", revisionId: "bad-placement-rev", tenantId: "other-tenant",
        mediaId: "photo-1", targetTable: "room_types", targetId: "room-1",
        placementType: "gallery", displayOrder: 1,
      }),
      /media asset not found in tenant/,
    );
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM media_versions WHERE media_asset_id = 'photo-1'").get().n, 1);
  } finally {
    db.close();
  }
});

test("replacement versions must advance and a retired asset stays resolvable", async () => {
  const db = makeDb();
  try {
    const { client, created } = await seed(db);
    await assert.rejects(
      () => replaceMediaVersion(client, {
        tenantId: TENANT, mediaId: created.mediaAssetId, versionId: "photo-1:v1",
        version: 1, revisionId: "bad-version",
      }),
      /must be greater than the latest version/,
    );
    await retireMediaAsset(client, { tenantId: TENANT, mediaId: created.mediaAssetId, revisionId: "rev-retire" });
    const asset = await getMediaAsset(client, TENANT, created.mediaAssetId);
    assert.equal(asset?.status, "retired");
    assert.equal(asset?.mediaId, "photo-1");
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM media_revisions WHERE action = 'retire'").get().n, 1);
  } finally {
    db.close();
  }
});

test("validation runs before writes and a failed batch leaves no partial mutation", async () => {
  const db = makeDb();
  try {
    const client = d1(db);
    await assert.rejects(
      () => createMediaAsset(client, { ...base, versionId: "wrong-id" }),
      /versionId must match/,
    );
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM media_assets WHERE id = 'photo-1'").get().n, 0);

    const failing = d1(db, { failBatch: true });
    await assert.rejects(
      () => createMediaAsset(failing, {
        ...base, mediaId: "atomic-1", versionId: "atomic-1:v1", revisionId: "rev-atomic",
      }),
      /simulated batch failure/,
    );
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM media_assets WHERE id = 'atomic-1'").get().n, 0);
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM media_versions WHERE media_asset_id = 'atomic-1'").get().n, 0);
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM media_asset_metadata WHERE media_asset_id = 'atomic-1'").get().n, 0);
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM media_revisions WHERE media_asset_id = 'atomic-1'").get().n, 0);

    await seed(db);
    const before = await getMediaAsset(client, TENANT, "photo-1");
    await assert.rejects(
      () => replaceMediaVersion(failing, {
        tenantId: TENANT, mediaId: "photo-1", versionId: "photo-1:v2",
        version: 2, revisionId: "rev-failed-replace",
      }),
      /simulated batch failure/,
    );
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM media_versions WHERE media_asset_id = 'photo-1'").get().n, 1);
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM media_revisions WHERE action = 'replace'").get().n, 0);
    const after = await getMediaAsset(client, TENANT, "photo-1");
    assert.equal(after?.currentVersionId, before?.currentVersionId);
  } finally {
    db.close();
  }
});

test("repeated placement updates get unique revision rows and full override audit", async () => {
  const db = makeDb();
  try {
    const { client } = await seed(db);
    const placement = {
      id: "placement-1",
      revisionId: "same-tag",
      tenantId: TENANT,
      mediaId: "photo-1",
      targetTable: "room_types",
      targetId: "room-1",
      placementType: "gallery" as const,
      displayOrder: 0,
      captionOverride: "First",
    };
    await setMediaPlacement(client, placement);
    await setMediaPlacement(client, { ...placement, captionOverride: "Second" });

    const rows = db.prepare(
      "SELECT id, metadata_json FROM media_revisions WHERE action = 'set_placement' ORDER BY rowid",
    ).all() as Array<{ id: string; metadata_json: string }>;
    assert.equal(rows.length, 3);
    assert.equal(new Set(rows.map((row) => row.id)).size, 3);
    const latest = JSON.parse(rows[2].metadata_json);
    assert.equal(latest.clientRevisionId, "same-tag");
    assert.equal(latest.captionOverride, "Second");
    assert.equal(latest.displayOrder, 0);
  } finally {
    db.close();
  }
});

test("a display_order already used in the same target is rejected before writes", async () => {
  const db = makeDb();
  try {
    const { client } = await seed(db);
    await setMediaPlacement(client, {
      id: "placement-2",
      revisionId: "rev-placement-2",
      tenantId: TENANT,
      mediaId: "fixture-media",
      targetTable: "room_types",
      targetId: "room-1",
      placementType: "gallery",
      displayOrder: 1,
    });
    await assert.rejects(
      () => setMediaPlacement(client, {
        id: "placement-1",
        revisionId: "rev-reorder",
        tenantId: TENANT,
        mediaId: "photo-1",
        targetTable: "room_types",
        targetId: "room-1",
        placementType: "gallery",
        displayOrder: 1,
      }),
      /displayOrder is already used/,
    );
    assert.equal(
      db.prepare("SELECT display_order FROM media_placements WHERE id = 'placement-1'").get().display_order,
      0,
    );
    assert.equal(
      db.prepare("SELECT COUNT(*) AS n FROM media_revisions WHERE action = 'set_placement'").get().n,
      2,
    );
  } finally {
    db.close();
  }
});
