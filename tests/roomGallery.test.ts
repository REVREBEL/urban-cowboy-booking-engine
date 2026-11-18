// COW-67: room-gallery parsing, resolution and import behaviour.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";

import {
  buildImportPlan,
  canonicaliseUrl,
  parseRoomGalleryFeed,
  resolveRoomType,
  splitAssetPath,
  type RoomTypeRecord,
} from "../worker/room-gallery.ts";
import {
  applyRoomGallery,
  buildImportStatements,
  mediaIdForAsset,
  reconcileRoomGallery,
  renderSql,
  summarise,
  type RoomGalleryInput,
  type SqlStatement,
} from "../worker/room-gallery-import.ts";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");
const CLI = new URL("../scripts/sync-room-gallery.mjs", import.meta.url).pathname;

const CDN = "https://images.squarespace-cdn.com/content/v1/688a8a7787f0d24169d34343";

function figure(asset: string, filename: string, extra = ""): string {
  const url = `${CDN}/${asset}/${filename}`;
  return `<figure class="gallery-grid-item"><a href="?itemId=x" class="gallery-grid-lightbox-link"><img data-src="${url}" data-image="${url}" src="${url}" alt="${filename}" ${extra}></a></figure>`;
}

/** Mirrors the live markup: the id is on the section that holds the gallery. */
const FIXTURE = `<html><body>
<section id="image-feed-alpine-bathing-suite" data-section-id="sec-gallery-alpine" data-sqsp-section="gallery">
  <div class="sqs-html-content"><h2>Alpine Bathing Suite</h2></div>
  <div class="gallery-grid-wrapper">
    ${figure("asset-alpine-1", "alpine_bed.jpg", 'data-image-dimensions="1500x1000"')}
    ${figure(
      "asset-alpine-2",
      "alpine_bath.jpg",
      'data-image-dimensions="1200x800" srcset="' +
        CDN +
        '/asset-alpine-1/alpine_bed.jpg?format=100w 100w, ' +
        CDN +
        '/asset-alpine-1/alpine_bed.jpg?format=500w 500w"',
    )}
  </div>
</section>
<section id="image-feed-walden-king" data-section-id="sec-gallery-walden" data-sqsp-section="gallery">
  <div class="sqs-html-content"><h2>Walden King</h2></div>
  <div class="gallery-grid-wrapper">
    ${figure("asset-alpine-1", "alpine_bed.jpg")}
    ${figure("asset-walden-1", "walden_king_bed.jpg")}
  </div>
</section>
<section data-section-id="sec-footer"><img src="https://example.com/logo.png" alt="logo"></section>
</body></html>`;

/** Older markup with no id on the section: pairing must fall back to position. */
const POSITIONAL_FIXTURE = `<html><body>
<section data-section-id="sec-head"><div class="sqs-html-content"><h2>Alpine Bathing Suite</h2></div></section>
<section data-section-id="sec-gallery" data-test="gallery-grid-simple">
  <div class="gallery-grid-wrapper">${figure("asset-alpine-1", "alpine_bed.jpg")}</div>
</section>
</body></html>`;

const ROOM_TYPES: RoomTypeRecord[] = [
  { id: "room-alpine", name: "Alpine Bathing Suite", slug: "alpine-bathing-suite" },
  {
    id: "room-walden-forest",
    name: "Walden Forest Bathing Suite",
    slug: "walden-forest-bathing-suite",
  },
  { id: "room-walden-king", name: "Walden King", slug: "walden-king" },
  {
    id: "room-walden-den",
    name: "Walden Forest Bathing Suite with Den",
    slug: "walden-forest-bathing-suite-with-den",
  },
];

function input(plan = buildImportPlan(parseRoomGalleryFeed(FIXTURE), ROOM_TYPES)): RoomGalleryInput {
  return {
    tenantId: "urban-cowboy",
    locationId: "loc-1",
    plan,
    source: {
      sourcePageUrl: "https://www.urbancowboy.com/catskills/image-feed",
      feedDigest: "fixture-digest",
      fetchedAt: "2026-11-18T00:00:00Z",
    },
  };
}

function makeDb() {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON");
  for (const file of [
    "migrations/0001_init.sql",
    "migrations/0002_module_list_indexes.sql",
    "migrations/0003_property_scoped_contracts.sql",
    "migrations/0004_published_snapshots.sql",
    "migrations/0005_media_registry.sql",
    "tests/fixtures/d1-contracts-fixture.sql",
  ]) {
    db.exec(read(file));
  }
  db.exec(
    `INSERT INTO tenants (id, slug, name) VALUES ('urban-cowboy', 'urban-cowboy', 'Urban Cowboy')
       ON CONFLICT(id) DO NOTHING;
     INSERT INTO locations (id, tenant_id, slug, name, time_zone)
       VALUES ('loc-1', 'urban-cowboy', 'catskills', 'Catskills', 'America/New_York')
       ON CONFLICT(id) DO NOTHING;`,
  );
  return db;
}

/** D1-shaped read handle and write executor over node:sqlite. */
function adapter(db: DatabaseSync) {
  const statement = (sql: string, params: unknown[] = []) => ({
    bind(...values: unknown[]) {
      return statement(sql, values);
    },
    async all<T>() {
      return { results: db.prepare(sql).all(...params) as T[] };
    },
  });
  return {
    read: { prepare: (sql: string) => statement(sql) },
    write: {
      async exec(statements: readonly SqlStatement[]) {
        db.exec("BEGIN");
        try {
          for (const item of statements) db.prepare(item.sql).run(...item.params);
          db.exec("COMMIT");
        } catch (error) {
          db.exec("ROLLBACK");
          throw error;
        }
      },
    },
  };
}

function placements(db: DatabaseSync, roomTypeId: string) {
  return db
    .prepare(
      `SELECT media_asset_id, display_order FROM media_placements
        WHERE target_table = 'room_types' AND target_id = ? ORDER BY display_order`,
    )
    .all(roomTypeId) as { media_asset_id: string; display_order: number }[];
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

test("reads the room slug from id=image-feed-<slug>", () => {
  const parsed = parseRoomGalleryFeed(FIXTURE);
  assert.equal(parsed.galleries.length, 2);
  assert.deepEqual(
    parsed.galleries.map((gallery) => [gallery.slug, gallery.extraction]),
    [
      ["alpine-bathing-suite", "id"],
      ["walden-king", "id"],
    ],
  );
  assert.deepEqual(parsed.galleries.map((gallery) => gallery.images.length), [2, 2]);
});

test("falls back to positional pairing when the section has no id", () => {
  const parsed = parseRoomGalleryFeed(POSITIONAL_FIXTURE);
    assert.equal(parsed.galleries.length, 1);
    assert.equal(parsed.galleries[0].slug, null);
    assert.equal(parsed.galleries[0].extraction, "positional");
    assert.equal(parsed.galleries[0].heading, "Alpine Bathing Suite");
});

test("ignores images that are not inside a gallery figure", () => {
  const urls = parseRoomGalleryFeed(FIXTURE)
    .galleries.flatMap((gallery) => gallery.images.map((image) => image.url));
  assert.ok(!urls.some((url) => url.includes("example.com")));
});

test("strips resize queries so one asset is one URL", () => {
  assert.equal(canonicaliseUrl(`${CDN}/a/b.jpg?format=500w`), `${CDN}/a/b.jpg`);
  assert.equal(canonicaliseUrl(`${CDN}/a/b.jpg`), `${CDN}/a/b.jpg`);
  const alpine = parseRoomGalleryFeed(FIXTURE).galleries[0].images;
  assert.equal(alpine[0].url, `${CDN}/asset-alpine-1/alpine_bed.jpg`);
  assert.deepEqual(alpine[1].srcset, [
    `${CDN}/asset-alpine-1/alpine_bed.jpg`,
    `${CDN}/asset-alpine-1/alpine_bed.jpg`,
  ]);
});

test("keeps source order and position", () => {
  const images = parseRoomGalleryFeed(FIXTURE).galleries[0].images;
  assert.deepEqual(images.map((image) => image.position), [1, 2]);
  assert.ok(images[0].filename.endsWith("alpine_bed.jpg"));
});

test("reads dimensions from data-image-dimensions", () => {
  const images = parseRoomGalleryFeed(FIXTURE).galleries[0].images;
  assert.equal(images[0].width, 1500);
  assert.equal(images[0].height, 1000);
});

test("splits the durable asset id from the CDN path", () => {
  const { assetId, filename } = splitAssetPath(
    `${CDN}/5bfcfa54-d329-49e1-9a49-5b269c1fe1d4/alpine_bed.jpg`,
  );
  assert.equal(assetId, "5bfcfa54-d329-49e1-9a49-5b269c1fe1d4");
  assert.equal(filename, "alpine_bed.jpg");
});

test("warns instead of pairing when a heading has no gallery", () => {
  const html = `<section data-section-id="s1"><h2>Lonely Room</h2></section>`;
  const parsed = parseRoomGalleryFeed(html);
  assert.equal(parsed.galleries.length, 0);
  assert.ok(parsed.warnings.some((warning) => warning.includes("no gallery following it")));
});

test("warns when a positional gallery has no preceding heading", () => {
  const html = `<section data-section-id="s1">${figure("a", "a.jpg")}</section>`;
  const parsed = parseRoomGalleryFeed(html);
  assert.equal(parsed.galleries.length, 1);
  assert.equal(parsed.galleries[0].extraction, "positional");
  assert.ok(parsed.warnings.some((warning) => warning.includes("no preceding heading")));
});

// ---------------------------------------------------------------------------
// Room resolution
// ---------------------------------------------------------------------------

test("prefers the gallery id slug over the heading", () => {
  const result = resolveRoomType("Something Else Entirely", ROOM_TYPES, "alpine-bathing-suite");
  assert.equal(result.status, "matched");
  assert.equal(result.status === "matched" && result.roomType.id, "room-alpine");
  assert.equal(result.status === "matched" && result.matchedBy, "id");
});

test("resolves a gallery id through the slug alias map", () => {
  const result = resolveRoomType("Walden Bathing Suite with Den", ROOM_TYPES, "walden-bathing-suite-den");
  assert.equal(result.status, "matched");
  assert.equal(result.status === "matched" && result.roomType.id, "room-walden-den");
  assert.equal(result.status === "matched" && result.matchedBy, "alias");
});

test("an unknown gallery id is not rescued by its heading", () => {
  const result = resolveRoomType("Alpine Bathing Suite", ROOM_TYPES, "alpine-penthouse");
  assert.equal(result.status, "unmatched");
  assert.match(result.status === "unmatched" ? result.reason : "", /gallery id slug/);
});

test("resolves a heading by name when there is no id", () => {
  const result = resolveRoomType("Walden King", ROOM_TYPES, null);
  assert.equal(result.status, "matched");
  assert.equal(result.status === "matched" && result.matchedBy, "name");
});

test("never creates a room and never fuzzy-matches", () => {
  const result = resolveRoomType("Walden Penthouse", ROOM_TYPES, null);
  assert.equal(result.status, "unmatched");
  assert.equal(ROOM_TYPES.length, 4);
});

test("rejects an ambiguous name instead of guessing", () => {
  const duplicates = [
    ...ROOM_TYPES,
    { id: "room-alpine-2", name: "Alpine Bathing Suite", slug: "alpine-2" },
  ];
  const result = resolveRoomType("Alpine Bathing Suite", duplicates, null);
  assert.equal(result.status, "unmatched");
  assert.match(result.status === "unmatched" ? result.reason : "", /2 room types/);
});

// ---------------------------------------------------------------------------
// Import
// ---------------------------------------------------------------------------

test("an unresolved room contributes no statements", () => {
  const plan = buildImportPlan(parseRoomGalleryFeed(FIXTURE), ROOM_TYPES);
  plan.rooms.push({
    heading: "Mystery Suite",
    sectionId: "sec-mystery",
    slug: "mystery-suite",
    extraction: "id",
    roomTypeId: null,
    roomTypeName: null,
    matchedBy: null,
    unresolvedReason: "no room type matches gallery id slug",
    images: [
      {
        position: 1,
        url: `${CDN}/a/mystery.jpg`,
        assetId: "a",
        filename: "mystery.jpg",
        alt: null,
        width: null,
        height: null,
      },
    ],
  });
  const { statements, skippedRooms, imageCount } = buildImportStatements(input(plan));
  assert.equal(imageCount, 4);
  assert.deepEqual(skippedRooms, ["Mystery Suite"]);
  assert.ok(!statements.some((statement) => statement.sql.includes("mystery")));
});

test("import is idempotent: applying twice yields the same rows", async () => {
  const db = makeDb();
  const { write } = adapter(db);
  const payload = input();

  await applyRoomGallery(write, payload);
  const first = placements(db, "room-alpine");
  const assetsFirst = db.prepare("SELECT COUNT(*) AS n FROM media_assets").get() as { n: number };

  await applyRoomGallery(write, payload);
  const second = placements(db, "room-alpine");
  const assetsSecond = db.prepare("SELECT COUNT(*) AS n FROM media_assets").get() as { n: number };

  assert.deepEqual(second, first);
  assert.equal(assetsSecond.n, assetsFirst.n);
  assert.equal(first.length, 2);
});

test("a shared image keeps one media asset across rooms", async () => {
  const db = makeDb();
  const { write } = adapter(db);
  await applyRoomGallery(write, input());

  const asset = db
    .prepare("SELECT COUNT(*) AS n FROM media_assets WHERE id = ?")
    .get(mediaIdForAsset("asset-alpine-1")) as { n: number };
  const links = db
    .prepare("SELECT COUNT(*) AS n FROM media_placements WHERE media_asset_id = ?")
    .get(mediaIdForAsset("asset-alpine-1")) as { n: number };

  assert.equal(asset.n, 1);
  assert.equal(links.n, 2);
});

test("reordering changes only display_order", async () => {
  const db = makeDb();
  const { write, read } = adapter(db);
  await applyRoomGallery(write, input());

  const reordered = buildImportPlan(parseRoomGalleryFeed(FIXTURE), ROOM_TYPES);
  const alpine = reordered.rooms[0];
  alpine.images.reverse();
  alpine.images.forEach((image, index) => {
    image.position = index + 1;
  });

  const result = await reconcileRoomGallery(read, input(reordered));
  const room = result.rooms[0];
  assert.ok(room.reordered.length > 0);
  assert.equal(room.removed.length, 0);

  await applyRoomGallery(write, input(reordered));
  const order = placements(db, "room-alpine").map((row) => row.media_asset_id);
  assert.deepEqual(order, [mediaIdForAsset("asset-alpine-2"), mediaIdForAsset("asset-alpine-1")]);
});

test("a missing gallery reports removals but never deletes", async () => {
  const db = makeDb();
  const { write, read } = adapter(db);
  await applyRoomGallery(write, input());

  const empty = buildImportPlan(parseRoomGalleryFeed(FIXTURE), ROOM_TYPES);
  empty.rooms = empty.rooms.map((room) => ({ ...room, images: [] }));

  const result = await reconcileRoomGallery(read, input(empty));
  const alpine = result.rooms[0];
  assert.equal(alpine.planned, 0);
  assert.equal(alpine.removed.length, 2);
  assert.deepEqual(alpine.failed, [{ kind: "failed", reason: "no images in gallery" }]);

  await applyRoomGallery(write, input(empty));
  assert.equal(placements(db, "room-alpine").length, 2);
});

test("reconciliation reports new, unchanged and url changes", async () => {
  const db = makeDb();
  const { write, read } = adapter(db);
  await applyRoomGallery(write, input());

  const changed = buildImportPlan(parseRoomGalleryFeed(FIXTURE), ROOM_TYPES);
  changed.rooms[0].images[0].url = `${CDN}/asset-alpine-1/alpine_bed_v2.jpg`;

  const room = (await reconcileRoomGallery(read, input(changed))).rooms[0];
  assert.equal(room.urlChanged.length, 1);
  assert.equal(room.unchanged.length, 1);
});

test("summarise totals match the rooms", async () => {
  const db = makeDb();
  const { read } = adapter(db);
  const result = await reconcileRoomGallery(read, input());
  const { totals } = summarise(result);
  assert.equal(totals.new, 4);
  assert.equal(
    totals.new,
    result.rooms.reduce((total, room) => total + room.new.length, 0),
  );
});

test("renderSql inlines params and wraps in a transaction", () => {
  const { statements } = buildImportStatements(input());
  const sql = renderSql(statements);
  assert.ok(sql.startsWith("-- COW-67"));
  assert.ok(sql.includes("BEGIN;"));
  assert.ok(sql.trimEnd().endsWith("COMMIT;"));
  assert.ok(sql.includes("'urban-cowboy'"));
  assert.ok(!sql.includes("?1"));
});

// ---------------------------------------------------------------------------
// Captured live fixture
// ---------------------------------------------------------------------------

test("parses the captured live feed into four id-addressed rooms and 23 images", () => {
  const parsed = parseRoomGalleryFeed(read("tests/fixtures/room-gallery-image-feed.html"));
  const plan = buildImportPlan(parsed, [
    { id: "room-alpine", name: "Alpine Bathing Suite", slug: "alpine-bathing-suite" },
    {
      id: "room-walden-forest",
      name: "Walden Forest Bathing Suite",
      slug: "walden-forest-bathing-suite",
    },
    { id: "room-walden-king", name: "Walden King", slug: "walden-king" },
    {
      id: "room-walden-den",
      name: "Walden Forest Bathing Suite with Den",
      slug: "walden-forest-bathing-suite-with-den",
    },
  ]);

  assert.deepEqual(
    plan.rooms.map((room) => [room.slug, room.extraction, room.images.length]),
    [
      ["alpine-bathing-suite", "id", 5],
      ["walden-forest-bathing-suite", "id", 4],
      ["walden-king", "id", 9],
      ["walden-bathing-suite-den", "id", 5],
    ],
  );
  assert.equal(plan.rooms.filter((room) => room.roomTypeId).length, 4);
  assert.deepEqual(
    plan.rooms.map((room) => room.matchedBy),
    ["id", "id", "id", "alias"],
  );
  assert.equal(parsed.warnings.length, 0);
});

// ---------------------------------------------------------------------------
// Ordering convention: one-based everywhere
// ---------------------------------------------------------------------------

test("an immediately re-reconciled import reports nothing reordered or removed", async () => {
  const db = makeDb();
  const { write, read } = adapter(db);
  await applyRoomGallery(write, input());

  const result = await reconcileRoomGallery(read, input());
  for (const room of result.rooms) {
    assert.equal(room.reordered.length, 0, `${room.heading} reported a spurious reorder`);
    assert.equal(room.removed.length, 0, `${room.heading} reported a spurious removal`);
    assert.equal(room.urlChanged.length, 0, `${room.heading} reported a spurious url change`);
    assert.equal(room.new.length, 0, `${room.heading} reported a spurious insert`);
    assert.equal(room.unchanged.length, room.planned, `${room.heading} did not report all images as kept`);
  }
});

test("removal reporting uses the stored one-based position", async () => {
  const db = makeDb();
  const { write, read } = adapter(db);
  await applyRoomGallery(write, input());

  const empty = buildImportPlan(parseRoomGalleryFeed(FIXTURE), ROOM_TYPES);
  empty.rooms = empty.rooms.map((room) => ({ ...room, images: [] }));

  const room = (await reconcileRoomGallery(read, input(empty))).rooms[0];
  assert.deepEqual(
    room.removed.map((change) => (change.kind === "removed" ? change.position : null)),
    [1, 2],
  );
});

// ---------------------------------------------------------------------------
// CLI contract
// ---------------------------------------------------------------------------

function runCli(args: string[]) {
  return spawnSync(process.execPath, ["--experimental-strip-types", CLI, ...args], {
    encoding: "utf8",
  });
}

function cliFixture() {
  const dir = mkdtempSync(path.join(tmpdir(), "cow67-"));
  const html = path.join(dir, "feed.html");
  const rooms = path.join(dir, "room-types.json");
  const sql = path.join(dir, "import.sql");
  writeFileSync(html, read("tests/fixtures/room-gallery-image-feed.html"), "utf8");
  writeFileSync(
    rooms,
    JSON.stringify(
      ROOM_TYPES.map((room) => ({ id: room.id, name: room.name, slug: room.slug })),
      null,
      2,
    ),
    "utf8",
  );
  return { dir, html, rooms, sql };
}

test("--sql-out refuses to run without --room-types", () => {
  const { html, sql } = cliFixture();
  const result = runCli(["--file", html, "--sql-out", sql]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /--sql-out requires --room-types/);
  assert.ok(!existsSync(sql), "no SQL should be written when room types are missing");
});

test("--sql-out refuses an empty room-type list", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "cow67-empty-"));
  const html = path.join(dir, "feed.html");
  const rooms = path.join(dir, "empty.json");
  const sql = path.join(dir, "import.sql");
  writeFileSync(html, read("tests/fixtures/room-gallery-image-feed.html"), "utf8");
  writeFileSync(rooms, "[]", "utf8");

  const result = runCli(["--file", html, "--room-types", rooms, "--sql-out", sql]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /no room types/);
});

test("--sql-out writes a reviewable import for the live fixture", () => {
  const { html, rooms, sql } = cliFixture();
  const result = runCli(["--file", html, "--room-types", rooms, "--sql-out", sql]);

  assert.equal(result.status, 0, result.stderr);
  const generated = readFileSync(sql, "utf8");
  assert.match(generated, /BEGIN;/);
  assert.match(generated, /COMMIT;/);
  assert.match(generated, /INSERT INTO media_assets/);
  assert.match(generated, /INSERT INTO media_placements/);
  assert.match(generated, /'room_gallery'/);
  assert.ok(!generated.includes("?1"), "params should be inlined");
});

test("the CLI reports four resolved rooms against the live fixture", () => {
  const { html, rooms } = cliFixture();
  const result = runCli(["--file", html, "--room-types", rooms]);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /galleries   : 4/);
  assert.match(result.stdout, /images      : 23/);
  assert.match(result.stdout, /unresolved  : 0/);
});