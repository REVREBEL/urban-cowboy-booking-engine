// COW-97: publication state extension tables, typed contracts, scoped reads and
// the explicit boundary for selectively mirrored Mews reference data.
// Run with: node --test tests/editorialPublicationState.test.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import {
  editorialStatusSchema,
  locationPublicationRowSchema,
  mewsReferenceSyncRowSchema,
  mewsReferenceTypeSchema,
  roomTypePublicationRowSchema,
} from "../src/types/d1-contracts.ts";
import {
  listLocationPublications,
  listMewsReferenceSync,
  listPublishedLocations,
  listPublishedRoomTypes,
  listRoomTypePublications,
  publishedLocationIds,
  publishedRoomTypeIds,
} from "../worker/d1.ts";
import { loadPublishedCollection } from "../worker/content-provider.ts";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");
const sql = {
  init: read("migrations/0001_init.sql"),
  publication: read("migrations/0012_editorial_publication_state.sql"),
  down: read("scripts/d1-rollback/0012_editorial_publication_state_down.sql"),
  fixture: read("tests/fixtures/editorial-publication-fixture.sql"),
};

function makeDb(applyMigration = true) {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON");
  db.exec(sql.init);
  if (applyMigration) db.exec(sql.publication);
  db.exec(sql.fixture);
  return db;
}

/** Minimal D1-shaped adapter: publication readers only need bind/all. */
function d1(db: DatabaseSync): any {
  return {
    prepare(query: string) {
      let params: unknown[] = [];
      return {
        bind(...values: unknown[]) { params = values; return this; },
        async all() { return { results: db.prepare(query).all(...params) }; },
      };
    },
  };
}

const scope = { tenantId: "pub-fixture", locationId: "pub-location" };

test("0012 applies twice idempotently and backfills existing rows as published", () => {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON");
  db.exec(sql.init);
  db.exec(`
    INSERT INTO tenants (id, slug, name) VALUES ('t', 't', 'T');
    INSERT INTO locations (id, tenant_id, slug, name, time_zone) VALUES ('l', 't', 'l', 'L', 'UTC');
    INSERT INTO room_types (id, tenant_id, location_id, mews_room_category_id, name, slug, sort_order)
      VALUES ('rt', 't', 'l', 'mews', 'R', 'r', 1);
  `);
  db.exec(sql.publication);
  db.exec(sql.publication);
  assert.equal(db.prepare("SELECT status FROM room_type_publication WHERE room_type_id='rt'").get().status, "published");
  assert.equal(db.prepare("SELECT status FROM location_publication WHERE location_id='l'").get().status, "published");
  assert.deepEqual(db.prepare("PRAGMA foreign_key_check").all(), []);
  assert.equal(db.prepare("PRAGMA integrity_check").get().integrity_check, "ok");
  db.close();
});

test("publication rows reject invalid status and cross-tenant ownership", () => {
  const db = makeDb();
  assert.throws(() => db.exec(
    "INSERT INTO room_type_publication (tenant_id, room_type_id, status) VALUES ('pub-fixture','pub-room-live','live')",
  ), /CHECK constraint failed/);
  assert.throws(() => db.exec(
    "INSERT INTO room_type_publication (tenant_id, room_type_id, status) VALUES ('other-tenant','pub-room-live','published')",
  ), /FOREIGN KEY constraint failed/);
  assert.throws(() => db.exec(
    "UPDATE room_type_publication SET status = 'hidden' WHERE room_type_id = 'pub-room-live'",
  ), /CHECK constraint failed/);
  db.close();
});

test("mews_reference_sync accepts only stable reference types owned by Mews", () => {
  const db = makeDb();
  assert.throws(() => db.exec(
    `INSERT INTO mews_reference_sync (id, tenant_id, reference_type, reference_id, source_system, synced_at)
     VALUES ('bad-ari', 'pub-fixture', 'availability', 'x', 'mews', '2026-11-20T00:00:00Z')`,
  ), /CHECK constraint failed/);
  assert.throws(() => db.exec(
    `INSERT INTO mews_reference_sync (id, tenant_id, reference_type, reference_id, source_system, synced_at)
     VALUES ('bad-source', 'pub-fixture', 'product', 'x', 'webflow_cms', '2026-11-20T00:00:00Z')`,
  ), /CHECK constraint failed/);
  assert.throws(() => db.exec(
    `INSERT INTO mews_reference_sync (id, tenant_id, reference_type, reference_id, source_system, synced_at)
     VALUES ('dup', 'pub-fixture', 'hotel', 'mews-hotel-1', 'mews', '2026-11-20T00:00:00Z')`,
  ), /UNIQUE constraint failed/);
  db.close();
});

test("typed contracts transform stored rows and reject non-ARI violations", () => {
  const db = makeDb();
  const room = roomTypePublicationRowSchema.parse(db.prepare(
    "SELECT * FROM room_type_publication WHERE room_type_id='pub-room-draft'",
  ).get());
  assert.equal(room.roomTypeId, "pub-room-draft");
  assert.equal(room.status, "draft");
  assert.equal(room.sourceSnapshotDate, "2026-11-15");
  const location = locationPublicationRowSchema.parse(db.prepare(
    "SELECT * FROM location_publication WHERE location_id='pub-location-2'",
  ).get());
  assert.equal(location.locationId, "pub-location-2");
  const sync = mewsReferenceSyncRowSchema.parse(db.prepare(
    "SELECT * FROM mews_reference_sync WHERE id='sync-hotel'",
  ).get());
  assert.equal(sync.referenceType, "hotel");
  assert.equal(sync.sourceSystem, "mews");
  assert.equal(sync.reconciledAt, "2026-11-21T00:00:00Z");
  assert.throws(() => editorialStatusSchema.parse("live"));
  assert.throws(() => mewsReferenceTypeSchema.parse("restriction"));
  assert.throws(() => mewsReferenceSyncRowSchema.parse({
    ...db.prepare("SELECT * FROM mews_reference_sync WHERE id='sync-hotel'").get(),
    source_system: "webflow_cms",
  }));
  db.close();
});

test("published helpers exclude draft/archived and respect tenant and location scope", async () => {
  const db = makeDb();
  const api = d1(db);
  assert.deepEqual([...(await publishedRoomTypeIds(api, scope))], ["pub-room-live"]);
  assert.deepEqual(
    (await listPublishedRoomTypes(api, scope)).map((row) => row.id),
    ["pub-room-live"],
  );
  assert.deepEqual([...(await publishedRoomTypeIds(api, { tenantId: "pub-fixture", locationId: "pub-location-2" }))], []);
  assert.deepEqual(
    (await publishedRoomTypeIds(api, { tenantId: "other-tenant" })).size,
    1,
  );
  assert.deepEqual([...(await publishedLocationIds(api, { tenantId: "pub-fixture", locationId: "pub-location" }))], ["pub-location"]);
  assert.deepEqual([...(await publishedLocationIds(api, { tenantId: "pub-fixture", locationId: "pub-location-2" }))], []);
  assert.deepEqual(
    (await listPublishedLocations(api, { tenantId: "pub-fixture" })).map((row) => row.id),
    ["pub-location"],
  );
  db.close();
});

test("admin reads return contract-shaped publication rows; guest reads use them", async () => {
  const db = makeDb();
  const api = d1(db);
  const rooms = await listRoomTypePublications(api, { tenantId: "pub-fixture" });
  assert.equal(rooms.length, 3);
  assert.ok(rooms.every((row) => row.tenantId === "pub-fixture" && typeof row.status === "string"));
  const locations = await listLocationPublications(api, { tenantId: "pub-fixture" });
  assert.equal(locations.length, 2);
  const sync = await listMewsReferenceSync(api, { tenantId: "pub-fixture" }, "hotel");
  assert.deepEqual(sync.map((row) => row.referenceId), ["mews-hotel-1"]);

  // W3 guest snapshots: only the published room/location are served.
  const guestRooms = await loadPublishedCollection(api, { tenantId: "pub-fixture" }, "roomTypes");
  assert.deepEqual(guestRooms.map((row) => row.id), ["pub-room-live"]);
  const guestLocations = await loadPublishedCollection(api, { tenantId: "pub-fixture" }, "locations");
  assert.deepEqual(guestLocations.map((row) => row.id), ["pub-location"]);
  db.close();
});

test("rollback 0012 is idempotent and preserves base rows", () => {
  const db = makeDb();
  db.exec(sql.down);
  db.exec(sql.down);
  for (const table of ["room_type_publication", "location_publication", "mews_reference_sync"]) {
    assert.equal(db.prepare(
      "SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table' AND name=?",
    ).get(table).n, 0, `${table} dropped`);
  }
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM room_types").get().n, 4);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM locations").get().n, 3);
  assert.deepEqual(db.prepare("PRAGMA foreign_key_check").all(), []);
  db.close();
});
