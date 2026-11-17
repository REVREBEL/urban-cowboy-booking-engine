#!/usr/bin/env node
/**
 * Webflow CMS CSV export -> D1 seed generator (Urban Cowboy / REVREBEL).
 *
 * This replaces the previous Events-only example. It reads the dated CSV export,
 * maps every in-scope collection to the D1 schema in migrations/0001_init.sql,
 * parents before children, and emits idempotent SQL plus a reconciliation report.
 *
 * Usage:
 *   node scripts/seed-d1-from-webflow.mjs [export-dir] \
 *     [--out seed.sql] [--report docs/generated/d1-reconciliation.json] [--write]
 *
 * Without --write it is a dry run: nothing is written, and the summary is printed.
 * With --write it writes the SQL and report files. It never contacts D1 directly;
 * apply the SQL with the normal Wrangler migration/seed workflow after review.
 *
 * Source of truth: Webflow CMS for editorial content; Mews for availability,
 * rates and reservations. IDs from the CMS are preserved as stable D1 IDs.
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";

const argv = process.argv.slice(2);
const positional = argv.filter((a) => !a.startsWith("--"));
const dir = positional[0] || "webflow_cms_export";
const option = (name, fallback) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : fallback;
};
const WRITE = argv.includes("--write");
const outPath = option("--out", "seed.sql");
const reportPath = option("--report", "docs/generated/d1-reconciliation.json");

const TENANT_ID = "urban-cowboy";
const CATSKILLS_ID = "6abc9142d98b325b2821ca23";
// Explicit per-property IANA zones. Never apply Catskills' zone to Denver/Nashville.
const LOCATION_TIME_ZONES = Object.freeze({
  catskills: "America/New_York",
  denver: "America/Denver",
  "nashville-east": "America/Chicago",
  "nashville-downtown": "America/Chicago",
});
function locationTimeZone(slug) {
  const zone = LOCATION_TIME_ZONES[slug];
  if (!zone) throw new Error("Unknown location time zone for " + JSON.stringify(slug));
  return zone;
}
const LOCATION_ZONE_BY_ID = new Map();
const IMPORT_ACTOR = "webflow-cms-import";

// ---------------------------------------------------------------------------
// CSV parsing
// ---------------------------------------------------------------------------

/** Strict RFC 4180-style parser: quoted commas, escaped quotes and embedded
 * newlines are supported. Malformed rows raise instead of being silently
 * dropped (the old parser filtered them out and lost records). */
function parseCsv(text) {
  const source = text.replace(/^\uFEFF/, "");
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  let line = 1;
  let rowLine = 1;
  let normalizedValues = 0;

  for (let i = 0; i < source.length; i++) {
    const c = source[i];
    if (inQuotes) {
      if (c === '"') {
        if (source[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else {
        field += c;
      }
    } else if (c === '"' && field.length === 0) {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push({ cells: row, line: rowLine });
      row = [];
      field = "";
      rowLine = ++line;
    } else if (c !== "\r") {
      field += c;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push({ cells: row, line: rowLine });
  }

  const header = (rows.shift()?.cells ?? []).map((h) => h.trim());
  if (!header.length) throw new Error("CSV has no header row");
  const records = [];
  for (const { cells, line: lineNo } of rows) {
    if (cells.length === 1 && cells[0].trim() === "") continue; // blank line
    if (cells.length !== header.length) {
      throw new Error(
        `Malformed CSV row at line ${lineNo}: expected ${header.length} columns, got ${cells.length}`,
      );
    }
    const record = {};
    header.forEach((h, i) => {
      const trimmed = cells[i].trim();
      if (trimmed !== cells[i]) normalizedValues++;
      record[h] = trimmed;
    });
    records.push(record);
  }
  return { header, records, normalizedValues };
}

/** Resolve a collection export, preferring the canonical file over a numeric
 * duplicate (e.g. "Buildings 2.csv"). Divergent duplicates are a hard error. */
function loadCollection(collection, label = collection) {
  const files = readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".csv"));
  const canonicalName = (f) =>
    f.replace(/^\d{4}-\d{2}-\d{2}\s*-\s*/, "").replace(/\.csv$/i, "");
  const matches = files.filter((f) => {
    const name = canonicalName(f);
    return name === label || name === `${label} 2`;
  });
  if (!matches.length) throw new Error(`Missing export file for ${collection}`);
  const canonical = matches.find((f) => canonicalName(f) === label) ?? matches[0];
  const duplicates = matches.filter((f) => f !== canonical);

  const hash = (f) => createHash("sha256")
    .update(readFileSync(join(dir, f)).toString().replace(/^\uFEFF/, ""))
    .digest("hex");
  for (const dupe of duplicates) {
    if (hash(dupe) !== hash(canonical)) {
      throw new Error(
        `Divergent duplicate exports for ${collection}: ${canonical} and ${dupe}. ` +
        "Resolve manually before importing.",
      );
    }
  }

  const parsed = parseCsv(readFileSync(join(dir, canonical), "utf8"));
  return {
    collection,
    file: canonical,
    rows: parsed.records,
    header: parsed.header,
    normalizedValues: parsed.normalizedValues,
    duplicatesSkipped: duplicates,
  };
}

// ---------------------------------------------------------------------------
// Field helpers
// ---------------------------------------------------------------------------

const val = (row, key) => (row?.[key] ?? "").trim();
const isTrue = (row, key) => val(row, key).toLowerCase() === "true";
const integer = (row, key, fallback = 0) => {
  const raw = val(row, key);
  if (raw === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
};
const published = (row) =>
  !isTrue(row, "isDraft") && !isTrue(row, "isArchived") && val(row, "lastPublished") !== "";

function lit(value) {
  if (value === null || value === undefined || value === "") return "NULL";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function buildInsert(table, columns, rows, conflict = ["id"], updates) {
  const updateCols = updates ?? columns.filter((c) => !conflict.includes(c));
  const clause = updateCols.length
    ? ` ON CONFLICT (${conflict.join(", ")}) DO UPDATE SET ` +
      updateCols.map((c) => `${c} = excluded.${c}`).join(", ")
    : " ON CONFLICT DO NOTHING";
  return rows.map(
    (values) =>
      `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${values.map(lit).join(", ")})${clause};`,
  );
}

// ---------------------------------------------------------------------------
// Load all in-scope collections
// ---------------------------------------------------------------------------

const collections = {
  locations: loadCollection("locations", "Locations"),
  buildings: loadCollection("buildings", "Buildings"),
  roomTypes: loadCollection("roomTypes", "Room Types"),
  amenities: loadCollection("amenities", "Amenities"),
  events: loadCollection("events", "Events"),
  offers: loadCollection("offers", "Offers"),
  addOns: loadCollection("addOns", "Add Ons"),
  photoHotspots: loadCollection("photoHotspots", "Photo Hotspots"),
  instagrams: loadCollection("instagrams", "Instagrams"),
  outlets: loadCollection("outlets", "Outlets"),
  contentSettings: loadCollection("contentSettings", "Content Settings"),
  menuItems: loadCollection("menuItems", "Menu Items"),
};

const locationIds = new Set(collections.locations.rows.map((r) => val(r, "id")));
const amenityIds = new Set(collections.amenities.rows.map((r) => val(r, "id")));

const findings = [];
const unresolved = {};
const samples = [];
const note = (message) => findings.push(message);

/** Location scope: validate source ID; never silently invent a location. */
function scopedLocation(row, field) {
  const id = val(row, field);
  if (!id) return null;
  if (!locationIds.has(id)) {
    (unresolved.unknownLocationIds ??= []).push({ id, sourceId: val(row, "id") });
    return null;
  }
  return id;
}

// ---------------------------------------------------------------------------
// Generate SQL sections, parents before children
// ---------------------------------------------------------------------------

const sections = [];
const destCounts = {};
const addSection = (title, lines) => {
  if (!lines.length) return;
  sections.push(`-- === ${title} (${lines.length} rows) ===\n${lines.join("\n")}`);
  destCounts[title] = lines.length;
};

// 1. Tenant parent. The original seed inserted child rows with tenant_id
// 'urban-cowboy' but never created the parent row.
addSection("tenants", buildInsert(
  "tenants",
  ["id", "slug", "name"],
  [[TENANT_ID, TENANT_ID, "Urban Cowboy"]],
));

// Derive event zones from their source property-location IDs, not a global default.
for (const location of collections.locations.rows) {
  LOCATION_ZONE_BY_ID.set(val(location, "id"), locationTimeZone(val(location, "slug")));
}
// 2. Locations. Source has no Mews hotel ID field; leave NULL with a decision.
addSection("locations", buildInsert(
  "locations",
  ["id", "tenant_id", "slug", "name", "time_zone", "mews_hotel_id"],
  collections.locations.rows.map((r) => [
    val(r, "id"), TENANT_ID, val(r, "slug"), val(r, "name"), locationTimeZone(val(r, "slug")), null,
  ]),
));
note(`${collections.locations.rows.length} locations have no Mews hotel ID in the export; ` +
  "mews_hotel_id remains NULL pending an explicit per-location Mews mapping.");

// 3. Buildings. The old seed left location_id NULL for all 9 even though the
// export carries a `location` multi-reference field.
const buildingRows = collections.buildings.rows.map((r) => [
  val(r, "id"), TENANT_ID, scopedLocation(r, "location"),
  val(r, "name"), val(r, "slug"), integer(r, "sort", 0),
]);
addSection("buildings", buildInsert(
  "buildings",
  ["id", "tenant_id", "location_id", "name", "slug", "sort_order"],
  buildingRows,
));

// 4. Amenities. The export has no image-name/image-path columns; the old seed
// fabricated image_name from the CMS display `name`, which is not an icon
// filename. Store NULL and let the runtime fall back to its generic icon.
addSection("amenities", buildInsert(
  "amenities",
  ["id", "tenant_id", "name", "image_name", "image_path", "sort_order"],
  collections.amenities.rows.map((r) => [
    val(r, "id"), TENANT_ID, val(r, "name") || val(r, "short-name"), null, null, 0,
  ]),
));
note(`${collections.amenities.rows.length} amenities have no image-name/image-path columns in ` +
  "this export; image_name/image_path are NULL (no fabricated icon filenames).");

// 5. Room types. All 22 source rows carry property-location = Catskills and a
// non-empty Mews category ID; assert rather than assume.
const roomIds = new Set(collections.roomTypes.rows.map((r) => val(r, "id")));
const roomTypeRows = [];
const roomTypeAmenityRows = [];
let amenityRefCount = 0;
let restrictedRefCount = 0;
let draftRoomTypes = 0;

for (const r of collections.roomTypes.rows) {
  const id = val(r, "id");
  const mewsId = val(r, "mews-room-type-id");
  if (!mewsId) (unresolved.missingMewsRoomCategoryId ??= []).push(id);
  if (!published(r)) draftRoomTypes++;
  roomTypeRows.push([
    id, TENANT_ID, scopedLocation(r, "property-location"), mewsId,
    val(r, "name") || val(r, "short-name"), val(r, "slug"), integer(r, "sort", 0),
  ]);

  let assigned = [];
  try {
    const parsed = JSON.parse(val(r, "features-amenities") || "[]");
    if (Array.isArray(parsed)) assigned = [...new Set(parsed.map((x) => String(x).trim()).filter(Boolean))];
  } catch {
    (unresolved.invalidFeaturesJson ??= []).push(id);
  }
  const order = [...new Set(val(r, "amenity-display-order").split(",").map((x) => x.trim()).filter(Boolean))];
  const position = new Map(order.map((aid, i) => [aid, i]));
  const restricted = new Set(val(r, "restricted-amenity-ids").split(",").map((x) => x.trim()).filter(Boolean));
  restrictedRefCount += restricted.size;

  assigned.forEach((aid, i) => {
    amenityRefCount++;
    if (!amenityIds.has(aid)) {
      (unresolved.unknownAmenityRefs ??= []).push({ roomTypeId: id, amenityId: aid });
      return;
    }
    const displayOrder = position.has(aid) ? position.get(aid) : i;
    roomTypeAmenityRows.push([id, aid, displayOrder, restricted.has(aid) ? 1 : 0]);
  });
}
addSection("room_types", buildInsert(
  "room_types",
  ["id", "tenant_id", "location_id", "mews_room_category_id", "name", "slug", "sort_order"],
  roomTypeRows,
));
addSection("room_type_amenities", buildInsert(
  "room_type_amenities",
  ["room_type_id", "amenity_id", "display_order", "excluded"],
  roomTypeAmenityRows,
  ["room_type_id", "amenity_id"],
  ["display_order", "excluded"],
));
note(`${amenityRefCount} room-to-amenity references resolved into ${roomTypeAmenityRows.length} ` +
  `relationship rows (${restrictedRefCount} restricted-amenity flags, all subsets of features-amenities).`);
if (draftRoomTypes) {
  note(`${draftRoomTypes} of ${collections.roomTypes.rows.length} room types are drafts in the ` +
    "export. room_types has no status column, so D1 cannot filter them; record IDs for editorial review.");
  unresolved.draftRoomTypes = collections.roomTypes.rows
    .filter((r) => !published(r)).map((r) => ({ id: val(r, "id"), name: val(r, "name") }));
}

// 6. Events. Five of eight are recurring: `datetime` is empty and only
// `recurring-start` is populated. The old example emitted NULL starts_at, which
// violates events.starts_at NOT NULL. Fall back to recurring-start explicitly.
const eventRows = [];
let eventStartFallback = 0;
for (const r of collections.events.rows) {
  const start = val(r, "datetime") || val(r, "recurring-start");
  if (!val(r, "datetime")) eventStartFallback++;
  const venue = val(r, "onsite-event-location") || val(r, "onsite-custom-location") ||
    (isTrue(r, "offsite-event") ? val(r, "offsite-event-location") : "");
  const eventLocationId = scopedLocation(r, "property-location");
  const eventTimeZone = LOCATION_ZONE_BY_ID.get(eventLocationId);
  if (!eventTimeZone) throw new Error("Missing location time zone for event " + val(r, "id"));
  eventRows.push([
    val(r, "id"), TENANT_ID, eventLocationId,
    val(r, "name"), val(r, "short-description") || val(r, "long-description") || null,
    venue || null, eventTimeZone, start || null,
    val(r, "datetime-end") || null, val(r, "recurrence-type") || null,
    null, published(r) ? 1 : 0, null,
  ]);
}
addSection("events", buildInsert(
  "events",
  ["id", "tenant_id", "location_id", "title", "description", "venue", "time_zone",
    "starts_at", "ends_at", "recurrence_rule", "capacity", "display_flag", "media_asset_id"],
  eventRows,
));
note(`${eventStartFallback} of ${collections.events.rows.length} events are recurring and used ` +
  "recurring-start as starts_at. Times are stored verbatim (source Z suffix); confirm the " +
  "America/New_York interpretation before cutover.");

// 7. Offers. The old seed published all 8; 3 have active=false and no Mews
// rate product, i.e. editorial/nonbookable. Respect both signals.
const offerRows = [];
const merchandisingRows = [];
let offersWithoutRate = 0;
for (const r of collections.offers.rows) {
  const rateId = val(r, "mews-rate-id") || null;
  const isPublished = published(r) && isTrue(r, "active");
  if (!rateId) offersWithoutRate++;
  offerRows.push([
    val(r, "id"), TENANT_ID, scopedLocation(r, "location"), val(r, "name"),
    val(r, "headline") || null, val(r, "description") || val(r, "long-description") || null,
    rateId, val(r, "call-to-action") || null, null, null,
    isTrue(r, "member-only") ? 1 : 0, isPublished ? "published" : "draft",
  ]);
  if (rateId && isPublished) {
    merchandisingRows.push([
      val(r, "id"), TENANT_ID, scopedLocation(r, "location"), rateId,
      integer(r, "sort-order", 0), null, null, null,
    ]);
  }
}
addSection("offers", buildInsert(
  "offers",
  ["id", "tenant_id", "location_id", "name", "headline", "description", "rate_product_id",
    "cta_label", "starts_at", "ends_at", "member_only", "status"],
  offerRows,
));
addSection("rate_merchandising", buildInsert(
  "rate_merchandising",
  ["id", "tenant_id", "location_id", "rate_product_id", "position", "styling", "geo_targeting", "cancellation_rules"],
  merchandisingRows,
));
note(`${offersWithoutRate} of ${collections.offers.rows.length} offers have no Mews rate product ID; ` +
  "they are imported as draft/editorial-only (not bookable) and should be confirmed with Mews.");

// 8. Add-ons. The old seed used short-description; two rows contain an empty
// string or a raw Mews UUID there. The editorial copy lives in long-description.
const addOnRows = [];
for (const r of collections.addOns.rows) {
  addOnRows.push([
    val(r, "id"), TENANT_ID, null, val(r, "name"),
    val(r, "long-description") || val(r, "short-description") || null,
    val(r, "mews-product-id") || null, null,
    isTrue(r, "enable-quantity") ? integer(r, "max-quantity-per-stay", 0) : null,
    integer(r, "sort", 0), published(r) ? "published" : "draft",
  ]);
}
addSection("add_ons", buildInsert(
  "add_ons",
  ["id", "tenant_id", "location_id", "name", "description", "mews_product_id",
    "icon_media_asset_id", "quantity_cap", "sort_order", "status"],
  addOnRows,
));
note(`${collections.addOns.rows.length} add-ons retained their non-empty Mews product IDs; ` +
  "validate them against Mews as the system of record.");

// 9. Versioned content model for collections with no dedicated D1 table:
// Instagrams, Outlets and Content Settings. Full CMS rows are stored as
// revision payloads so future typed readers can consume them.
const contentRows = [];
const revisionRows = [];
const versioned = [
  { source: collections.instagrams, kind: "instagram" },
  { source: collections.outlets, kind: "outlet" },
  { source: collections.contentSettings, kind: "policy", fallbackSlug: "content-settings" },
];
for (const { source, kind, fallbackSlug } of versioned) {
  for (const r of source.rows) {
    const id = val(r, "id");
    const revisionId = `${id}-r1`;
    const payload = JSON.stringify(r);
    const status = published(r) ? "published" : "draft";
    contentRows.push([
      id, TENANT_ID, scopedLocation(r, "location"), kind,
      val(r, "slug") || fallbackSlug || id, status, revisionId,
    ]);
    revisionRows.push([
      revisionId, id, 1, payload, val(r, "lastPublished") || null, IMPORT_ACTOR,
    ]);
  }
}
addSection("content_items", buildInsert(
  "content_items",
  ["id", "tenant_id", "location_id", "kind", "slug", "status", "current_revision_id"],
  contentRows,
));
addSection("content_revisions", buildInsert(
  "content_revisions",
  ["id", "content_item_id", "revision", "payload_json", "published_at", "created_by"],
  revisionRows,
));

// 10. Photo hotspots / media: intentionally NOT generated from this export.
// The Webflow CMS API contract (worker/webflow/photo-hotspots.ts) requires
// photo-file-id or photo-url; this CSV export has neither. Deriving media IDs
// from slugs or inserting 'placeholder-media' would create fake foreign keys.
unresolved.hotspotsBlocked = {
  sourceRecords: collections.photoHotspots.rows.length,
  reason: "CSV export lacks photo-file-id / photo-url columns required to resolve media_assets IDs",
  requiredBeforeImport: [
    "stable media_asset_id per photo (Webflow fileId or validated CDN asset)",
    "media version per asset",
    "room/photo association and exact x/y coordinates (source percentages are present)",
    "amenity references (all 238 validate against the Amenities export)",
  ],
};
note(`${collections.photoHotspots.rows.length} photo hotspots were NOT imported: the export has no ` +
  "photo-file-id/photo-url, so there is no legitimate media_asset_id. No placeholder FKs or " +
  "FK-disabling were used. Re-export with media identity, then import hotspots and media_assets.");
note("photo_hotspots.display-order has no column in the current D1 schema; add it in a migration " +
  "before importing hotspots so editorial medallion order is preserved.");

// ---------------------------------------------------------------------------
// Reconciliation report
// ---------------------------------------------------------------------------

const sourceCounts = Object.fromEntries(
  Object.entries(collections).map(([key, value]) => [key, value.rows.length]),
);
const totalSource = Object.values(sourceCounts).reduce((a, b) => a + b, 0);
const represented = Object.values(sourceCounts)
  .filter((_, i) => i < 7).reduce((a, b) => a + b, 0); // 7 structured core collections

for (const [key, value] of Object.entries(collections)) {
  if (value.duplicatesSkipped.length) {
    note(`Duplicate export(s) skipped for ${key}: ${value.duplicatesSkipped.join(", ")} ` +
      "(byte-identical after BOM normalization).");
  }
}
if (collections.menuItems.rows.length === 0) {
  note("Menu Items export is empty; no import required.");
}
for (const { key, kind } of [
  { key: "instagrams", kind: "instagram" },
  { key: "outlets", kind: "outlet" },
  { key: "contentSettings", kind: "policy" },
]) {
  note(`${key}: no dedicated D1 table; imported into content_items/content_revisions ` +
    `as a versioned content model (kind = ${kind}).`);
}
note("content_settings is a draft in the export (isDraft=true, no lastPublished); " +
  "its content_item status is 'draft' and will not appear in published APIs until approved.");

samples.push({
  collection: "add_ons",
  sourceId: "6ac3657002f7d9d8f917db42",
  oldSeedDescription: "cad13cb9-752d-49e8-b5d3-b124016d3aa8",
  newSeedDescription: "Mark a birthday, anniversary, or just a very good reason to ...",
  reason: "description now comes from long-description, not the Mews UUID in short-description",
});
samples.push({
  collection: "offers",
  sourceId: "6ac1cf91f851c777cc3c9b68",
  oldSeedStatus: "published",
  newSeedStatus: "draft",
  reason: "active=false and no Mews rate product ID",
});
samples.push({
  collection: "events",
  sourceId: "6abe630cb8d821676cbd1b55",
  oldSeedStartsAt: null,
  newSeedStartsAt: "2027-02-01T13:40:00.000Z",
  reason: "recurring event: recurring-start used when datetime is empty (NOT NULL requirement)",
});
samples.push({
  collection: "room_types",
  sourceId: "6abd50f0e0589519e89a7f10",
  oldSeedLocationId: null,
  newSeedLocationId: CATSKILLS_ID,
  reason: "property-location mapped to location_id",
});

const report = {
  generatedAt: new Date().toISOString(),
  sourceDirectory: dir,
  tenantId: TENANT_ID,
  policy: {
    mews: "Source of truth for availability, pricing and reservations; only IDs are imported/validated here.",
    cutover: "This seed does not enable public D1 reads; keep Webflow path and feature flag for rollback.",
  },
  files: Object.values(collections).map((c) => ({
    collection: c.collection,
    file: c.file,
    rows: c.rows.length,
    normalizedValues: c.normalizedValues,
    duplicatesSkipped: c.duplicatesSkipped,
  })),
  sourceCounts,
  totalSourceRecords: totalSource,
  structurallyRepresentedSourceRecords: represented,
  destinationRows: destCounts,
  tablesWithNoRows: [
    "media_assets", "media_versions", "photo_hotspots",
    "audit_log", "guest_sessions", "email_captures", "saved_room_matches", "cart_abandonments",
    "recovery_campaigns", "analytics_events", "analytics_daily", "upgrades",
  ],
  unresolvedReferences: unresolved,
  publication: {
    offersWithoutRateProductId: offersWithoutRate,
    draftRoomTypes,
    contentSettingsDraft: true,
    eventsUsingRecurringStart: eventStartFallback,
  },
  relationships: {
    roomAmenityReferences: amenityRefCount,
    roomAmenityRows: roomTypeAmenityRows.length,
    hotspotsExcluded: collections.photoHotspots.rows.length,
  },
  findings: findings.map((message, i) => ({ id: `F-${String(i + 1).padStart(2, "0")}`, message })),
  samplePayloadComparisons: samples,
};

const sql = [
  "-- Generated by scripts/seed-d1-from-webflow.mjs. Review before applying.",
  `-- Source: ${dir} | tenant: ${TENANT_ID}`,
  "-- Idempotent: all inserts use ON CONFLICT DO UPDATE; safe to re-run.",
  "-- FK enforcement: apply with PRAGMA foreign_keys=ON and run PRAGMA foreign_key_check afterwards.",
  "",
  ...sections,
  "",
].join("\n");

if (WRITE) {
  mkdirSync(dirname(outPath), { recursive: true });
  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(outPath, sql, "utf8");
  writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n", "utf8");
}

console.log(`Webflow -> D1 seed ${WRITE ? "written" : "dry run"}`);
console.log(`  source records: ${totalSource} across ${Object.keys(sourceCounts).length} collections`);
console.log(`  SQL rows: ${Object.values(destCounts).reduce((a, b) => a + b, 0)} across ${Object.keys(destCounts).length} tables`);
console.table(destCounts);
console.log(`  findings: ${findings.length}`);
for (const finding of findings) console.log(`  - ${finding}`);
if (WRITE) {
  console.log(`  wrote ${outPath}`);
  console.log(`  wrote ${reportPath}`);
} else {
  console.log("  (pass --write to emit seed.sql and the reconciliation report)");
}
