// COW-30: property-scoped schema, Zod contracts, provenance and rollback.
// Run with: node --test tests/d1SchemaContracts.test.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import {
  addOnRowSchema,
  contentItemRowSchema,
  contentProvenanceRowSchema,
  contentRevisionRowSchema,
  eventRowSchema,
  mediaAliasTypeSchema,
  mediaAliasRowSchema,
} from "../src/types/d1-contracts.ts";
import {
  EXCLUDED_SOURCE_COLLECTIONS,
  WEBFLOW_MAPPINGS,
  WEBFLOW_SNAPSHOT_DATE,
  assertSourceCoverage,
  findMapping,
  provenanceSeed,
} from "../src/lib/content-provenance.ts";
import {
  contentItemsQuery,
  eventsQuery,
  getProvenance,
  listScopedContentItems,
  listScopedEvents,
  listScopedLocations,
  listScopedMediaAssets,
  mediaAliasQuery,
  mediaAssetsQuery,
  provenanceQuery,
  resolveMediaAlias,
  type ScopedQuery,
} from "../worker/d1.ts";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");
const sql = {
  init: read("migrations/0001_init.sql"),
  moduleIndexes: read("migrations/0002_module_list_indexes.sql"),
  moduleIndexesDown: read("scripts/d1-rollback/0002_module_list_indexes_down.sql"),
  contracts: read("migrations/0003_property_scoped_contracts.sql"),
  contractsDown: read("scripts/d1-rollback/0003_property_scoped_contracts_down.sql"),
  fixture: read("tests/fixtures/d1-contracts-fixture.sql"),
};

function makeDb(applyContracts = true) {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON");
  db.exec(sql.init);
  db.exec(sql.moduleIndexes);
  if (applyContracts) db.exec(sql.contracts);
  db.exec(sql.fixture);
  return db;
}

/** Minimal D1-shaped adapter over node:sqlite for the query-helper tests. */
function d1(db: DatabaseSync): any {
  return {
    prepare(query: string) {
      return {
        bind(...params: unknown[]) {
          return {
            async all() {
              return { results: db.prepare(query).all(...params) };
            },
          };
        },
        async all() {
          return { results: db.prepare(query).all() };
        },
      };
    },
  };
}

/** Plans are asserted against the exact SQL and bindings the helpers use. */
const planFor = (db: DatabaseSync, query: ScopedQuery) =>
  db.prepare(`EXPLAIN QUERY PLAN ${query.sql}`)
    .all(...query.bindings)
    .map((row: any) => String(row.detail))
    .join(" | ");

test("0003 applies to the production schema baseline with foreign keys on", () => {
  const db = makeDb();
  assert.deepEqual(db.prepare("PRAGMA foreign_key_check").all(), []);
  assert.equal(db.prepare("PRAGMA integrity_check").get().integrity_check, "ok");
  for (const table of ["media_aliases", "content_provenance"]) {
    assert.ok(db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n > 0, `${table} has fixture rows`);
  }
  db.close();
});

test("alias values may be reused across tenants but not within one", () => {
  const db = makeDb();
  assert.throws(() => db.exec(
    "INSERT INTO media_aliases (id, tenant_id, media_asset_id, alias_type, alias_value) VALUES ('dup', 'contracts-fixture', 'fixture-media', 'webflow_file_id', 'abcdef0123456789abcdef01')",
  ));
  // New providers need no migration: the database is permissive, the Zod contract is the boundary.
  assert.equal(mediaAliasTypeSchema.safeParse("future_provider_id").success, false);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM media_aliases WHERE alias_type='future_provider_id'").get().n, 1);
  db.close();
});

test("an alias cannot claim one tenant while referencing another tenant's asset", async () => {
  const db = makeDb();
  // Schema guard: the composite FK rejects the mismatched row outright.
  assert.throws(() => db.exec(
    "INSERT INTO media_aliases (id, tenant_id, media_asset_id, alias_type, alias_value) VALUES ('mismatch', 'contracts-fixture', 'other-media', 'webflow_file_id', 'mismatched-value')",
  ));
  db.close();

  // Read-path guard: even if a legacy row slipped through with FK checks off,
  // neither scoped nor tenant-wide alias resolution may return that asset.
  const legacy = makeDb();
  legacy.exec("PRAGMA foreign_keys = OFF");
  legacy.exec(
    "INSERT INTO media_aliases (id, tenant_id, media_asset_id, alias_type, alias_value) VALUES ('mismatch', 'contracts-fixture', 'other-media', 'webflow_file_id', 'mismatched-value')",
  );
  legacy.exec("PRAGMA foreign_keys = ON");
  const api = d1(legacy);
  assert.equal(await resolveMediaAlias(api, { tenantId: "contracts-fixture" }, "webflow_file_id", "mismatched-value"), null);
  assert.equal(await resolveMediaAlias(api, { tenantId: "contracts-fixture", locationId: "fixture-location" }, "webflow_file_id", "mismatched-value"), null);
  assert.equal(await resolveMediaAlias(api, { tenantId: "other-tenant" }, "webflow_file_id", "mismatched-value"), null);
  legacy.close();
});

test("every scoped helper query uses its index without a temp sort", () => {
  const db = makeDb();
  const scope = { tenantId: "contracts-fixture" };
  const scoped = { ...scope, locationId: "fixture-location" };
  const cases: Array<[string, ScopedQuery]> = [
    ["idx_content_items_scope_kind_status_updated", contentItemsQuery(scope, "instagram")],
    ["idx_content_items_scope_location_kind_status_updated", contentItemsQuery(scoped, "instagram")],
    ["idx_content_items_tenant_status_updated", contentItemsQuery(scope)],
    ["idx_content_items_loc_status_updated", contentItemsQuery(scoped)],
    ["idx_events_tenant_display_starts", eventsQuery(scope)],
    ["idx_events_scope_display_starts", eventsQuery(scoped)],
    ["idx_media_assets_tenant_id", mediaAssetsQuery(scope)],
    ["idx_media_assets_tenant_kind", mediaAssetsQuery(scope, "image")],
    ["idx_media_assets_scope_id", mediaAssetsQuery(scoped)],
    ["idx_media_assets_scope_kind", mediaAssetsQuery(scoped, "image")],
  ];
  for (const [index, query] of cases) {
    const plan = planFor(db, query);
    const table = query.sql.match(/FROM (\w+)/)?.[1] ?? "";
    assert.match(plan, new RegExp(`USING (COVERING )?INDEX ${index}`), `${table} plan: ${plan}`);
    assert.doesNotMatch(plan, new RegExp(`SCAN ${table}`), `${table} plan: ${plan}`);
    assert.doesNotMatch(plan, /TEMP B-TREE FOR ORDER BY/, `${table} plan: ${plan}`);
  }
  db.close();
});

test("rollback 0003 removes only its own objects and is idempotent", () => {
  const db = makeDb();
  const before = db.prepare("SELECT COUNT(*) AS n FROM content_items").get().n;
  db.exec(sql.contractsDown);
  for (const table of ["media_aliases", "content_provenance"]) {
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table' AND name=?").get(table).n, 0);
  }
  for (const index of ["idx_media_assets_scope_kind", "idx_content_items_scope_kind_status_updated"]) {
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type='index' AND name=?").get(index).n, 0);
  }
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM content_items").get().n, before);
  // Foundational indexes from 0001/0002 must survive a 0003 rollback.
  for (const index of ["idx_content_items_tenant_kind", "idx_add_ons_tenant_status_created", "idx_events_tenant_display_created"]) {
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type='index' AND name=?").get(index).n, 1, `${index} survives`);
  }
  assert.deepEqual(db.prepare("PRAGMA foreign_key_check").all(), []);
  db.exec(sql.contractsDown); // idempotent
  db.exec(sql.contracts); // re-applies cleanly
  db.close();
});

test("rollback 0002 drops only the module indexes and preserves rows", () => {
  const db = makeDb();
  const before = db.prepare("SELECT COUNT(*) AS n FROM events").get().n;
  db.exec(sql.moduleIndexesDown);
  for (const index of ["idx_events_tenant_display_created", "idx_add_ons_tenant_status_created"]) {
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type='index' AND name=?").get(index).n, 0);
  }
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM events").get().n, before);
  for (const index of ["idx_content_items_tenant_kind", "idx_media_assets_tenant", "idx_content_revisions_item"]) {
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type='index' AND name=?").get(index).n, 1, `${index} survives`);
  }
  db.exec(sql.moduleIndexesDown); // idempotent
  db.exec(sql.moduleIndexes);
  db.close();
});

test("Zod contracts transform fixture rows into camelCase domain shapes", () => {
  const db = makeDb();
  const item = contentItemRowSchema.parse(db.prepare("SELECT * FROM content_items WHERE id='fixture-item-pub'").get());
  assert.equal(item.tenantId, "contracts-fixture");
  assert.equal(item.currentRevisionId, "fixture-revision");
  assert.equal(item.status, "published");

  const event = eventRowSchema.parse(db.prepare("SELECT * FROM events WHERE id='fixture-event'").get());
  assert.equal(event.displayFlag, true);
  assert.equal(event.timeZone, "America/New_York");

  const alias = mediaAliasRowSchema.parse(db.prepare("SELECT * FROM media_aliases WHERE id='alias-webflow-file'").get());
  assert.equal(alias.aliasType, "webflow_file_id");
  assert.equal(alias.mediaAssetId, "fixture-media");

  const provenance = contentProvenanceRowSchema.parse(db.prepare("SELECT * FROM content_provenance WHERE target_table='events'").get());
  assert.equal(provenance.sourceSystem, "webflow_cms");
  assert.equal(provenance.sourceCollection, "Events");
  db.close();
});

test("Zod contracts reject invalid publication state and non-0/1 flags", () => {
  assert.throws(() => contentItemRowSchema.parse({
    id: "x", tenant_id: "t", location_id: null, kind: "event", slug: "x",
    status: "maybe", current_revision_id: null, created_at: "now", updated_at: "now",
  }));
  const event = {
    id: "x", tenant_id: "t", location_id: null, title: "x", description: null,
    venue: null, time_zone: "America/New_York", starts_at: "now", ends_at: null,
    recurrence_rule: null, capacity: null, display_flag: 7, media_asset_id: null,
    created_at: "now", updated_at: "now",
  };
  assert.throws(() => eventRowSchema.parse(event));
  const revision = {
    id: "r", content_item_id: "fixture-item-pub", revision: 1,
    payload_json: "{not json", published_at: null, created_by: null, created_at: "now",
  };
  assert.throws(() => contentRevisionRowSchema.parse(revision), /valid JSON/);
  assert.equal(addOnRowSchema.parse({
    id: "a", tenant_id: "t", location_id: null, name: "A", description: null,
    mews_product_id: null, icon_media_asset_id: null, quantity_cap: null,
    sort_order: 0, status: "draft", created_at: "now", updated_at: "now",
  }).status, "draft");
});

test("source mappings cover every reconciliation collection or exclude it", () => {
  const report = JSON.parse(read("docs/generated/d1-reconciliation.json"));
  const collections = Object.keys(report.sourceCounts);
  assertSourceCoverage(collections);
  for (const name of collections) {
    assert.ok(findMapping(name) || EXCLUDED_SOURCE_COLLECTIONS.some((item) => item.sourceCollection === name), name);
  }
  assert.deepEqual(EXCLUDED_SOURCE_COLLECTIONS.map((item) => item.sourceCollection).sort(), ["menuItems", "photoHotspots"]);
  const roomTypes = findMapping("roomTypes");
  assert.deepEqual(roomTypes?.targets.map((target) => target.table), ["room_types", "room_type_amenities"]);
  assert.equal(findMapping("instagrams")?.targets[0]?.contentKind, "instagram");
  assert.throws(() => assertSourceCoverage([...collections, "unmappedCollection"]), /unmappedCollection/);
});

test("provenance seed is contract-shaped and keeps the snapshot date", () => {
  const seed = provenanceSeed({
    tenantId: "urban-cowboy",
    targetTable: "room_types",
    targetId: "room-1",
    sourceSystem: "webflow_cms",
    sourceCollection: "Room Types",
    sourceId: "source-1",
  });
  assert.equal(seed.sourceSnapshotDate, null);
  assert.equal(seed.locationId, null);
  assert.equal(provenanceSeed({
    tenantId: "urban-cowboy",
    locationId: "catskills",
    targetTable: "room_types",
    targetId: "room-1",
    sourceSystem: "webflow_cms",
    snapshotDate: WEBFLOW_SNAPSHOT_DATE,
  }).sourceSnapshotDate, WEBFLOW_SNAPSHOT_DATE);
  assert.equal(provenanceSeed({
    tenantId: "urban-cowboy",
    locationId: "catskills",
    targetTable: "room_types",
    targetId: "room-1",
    sourceSystem: "webflow_cms",
  }).locationId, "catskills");
  assert.equal(seed.tenantId, "urban-cowboy");
});

test("scoped query helpers return contract-shaped rows and respect scope", async () => {
  const db = makeDb();
  const api = d1(db);
  const scope = { tenantId: "contracts-fixture" };

  const items = await listScopedContentItems(api, scope, "instagram");
  assert.deepEqual(items.map((item) => item.id), ["fixture-item-pub"]);
  assert.equal(items[0].status, "published");

  // Draft content is never returned by the public scoped helper.
  const allItems = await listScopedContentItems(api, scope);
  assert.equal(allItems.length, 1);
  assert.equal((await listScopedContentItems(api, { ...scope, locationId: "other-location" })).length, 0);

  assert.equal((await listScopedLocations(api, { ...scope, locationId: "fixture-location" })).length, 1);
  assert.equal((await listScopedEvents(api, scope)).length, 1);
  assert.equal((await listScopedMediaAssets(api, scope, "image")).length, 1);
  db.close();
});

test("legacy aliases resolve only inside their tenant and location", async () => {
  const db = makeDb();
  const api = d1(db);
  const alias = await resolveMediaAlias(api, { tenantId: "contracts-fixture" }, "webflow_file_id", "abcdef0123456789abcdef01");
  assert.equal(alias?.mediaAssetId, "fixture-media");
  assert.equal((await resolveMediaAlias(api, { tenantId: "contracts-fixture", locationId: "fixture-location" }, "webflow_file_id", "abcdef0123456789abcdef01"))?.mediaAssetId, "fixture-media");
  assert.equal(await resolveMediaAlias(api, { tenantId: "contracts-fixture", locationId: "second-location" }, "webflow_file_id", "abcdef0123456789abcdef01"), null);
  const crossTenant = await resolveMediaAlias(api, { tenantId: "other-tenant" }, "webflow_file_id", "abcdef0123456789abcdef01");
  assert.equal(crossTenant, null);
  assert.equal((await resolveMediaAlias(api, { tenantId: "other-tenant" }, "webflow_file_id", "111111111111111111111111"))?.mediaAssetId, "other-media");
  db.close();
});

test("provenance lookup is scoped by tenant, location, table and id", async () => {
  const db = makeDb();
  const api = d1(db);
  const row = await getProvenance(api, { tenantId: "contracts-fixture" }, "events", "fixture-event");
  assert.equal(row?.sourceId, "fixture-source-event");
  assert.equal(row?.sourceCollection, "Events");
  assert.equal(await getProvenance(api, { tenantId: "other-tenant" }, "events", "fixture-event"), null);

  // A location-scoped caller cannot read another location's provenance.
  assert.equal(
    await getProvenance(api, { tenantId: "contracts-fixture", locationId: "fixture-location" }, "content_items", "fixture-item-second"),
    null,
  );
  const inScope = await getProvenance(api, { tenantId: "contracts-fixture", locationId: "second-location" }, "content_items", "fixture-item-second");
  assert.equal(inScope?.locationId, "second-location");
  db.close();
});
