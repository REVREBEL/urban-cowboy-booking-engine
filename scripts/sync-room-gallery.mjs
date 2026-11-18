#!/usr/bin/env node
// COW-67: fetch, parse and plan the Urban Cowboy room-gallery import.
//
// Default mode is read-only: it fetches the feed, resolves room types and prints
// a reconciliation plan. It never writes to D1.
//
//   node scripts/sync-room-gallery.mjs
//   node scripts/sync-room-gallery.mjs --file fixture.html --room-types rooms.json
//   node scripts/sync-room-gallery.mjs --sql-out /tmp/room-gallery.sql
//
// Applying is a separate, explicit step:
//   wrangler d1 execute urban-cowboy-content --local  --file /tmp/room-gallery.sql
//   wrangler d1 execute urban-cowboy-content --remote --file /tmp/room-gallery.sql

import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const { parseRoomGalleryFeed, buildImportPlan } = await import("../worker/room-gallery.ts");
const { buildImportStatements, renderSql } = await import("../worker/room-gallery-import.ts");

const DEFAULT_FEED_URL = "https://www.urbancowboy.com/catskills/image-feed";
const DEFAULT_TENANT = "urban-cowboy";
const DEFAULT_LOCATION = "6abc9142d98b325b2821ca23";

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

async function loadRoomTypes(path) {
  if (!path) return [];
  const raw = JSON.parse(await readFile(path, "utf8"));
  const list = Array.isArray(raw) ? raw : raw.roomTypes;
  if (!Array.isArray(list)) throw new Error("room types file must be an array or { roomTypes: [] }");
  return list.map((room) => ({
    id: String(room.id),
    name: String(room.name ?? ""),
    slug: room.slug == null ? null : String(room.slug),
  }));
}

async function fetchFeed(url) {
  const response = await fetch(url, {
    headers: { accept: "text/html", "user-agent": "urban-cowboy-room-gallery-importer/1.0" },
  });
  const html = await response.text();
  return {
    html,
    status: response.status,
    contentType: response.headers.get("content-type") ?? "",
    finalUrl: response.url || url,
  };
}

async function main() {
  const file = argValue("--file");
  const roomTypesPath = argValue("--room-types");
  const sqlOut = argValue("--sql-out");
  const tenantId = argValue("--tenant") ?? process.env.TENANT_ID ?? DEFAULT_TENANT;
  const locationId = argValue("--location") ?? process.env.WEBFLOW_LOCATION_ITEM_ID ?? DEFAULT_LOCATION;
  const feedUrl = argValue("--feed") ?? DEFAULT_FEED_URL;

  // Room types cannot be derived from the feed: the page carries gallery ids, not
  // room-type records. Generating SQL without them would silently produce nothing.
  if (sqlOut && !roomTypesPath) {
    console.error(
      "--sql-out requires --room-types <file>.\n" +
        "Room types come from D1 (table room_types), not from the feed, so they must be supplied.\n" +
        "Export them first, for example:\n" +
        "  wrangler d1 execute urban-cowboy-content --remote --json " +
        "--command \"SELECT id, name, slug FROM room_types\" > room-types.json",
    );
    process.exit(1);
  }

  let html;
  let sourceUrl = feedUrl;
  if (file) {
    html = await readFile(file, "utf8");
    sourceUrl = file;
  } else {
    const response = await fetchFeed(feedUrl);
    if (response.status !== 200) {
      console.error(`fetch failed: ${response.status} ${response.contentType}`);
      process.exit(1);
    }
    html = response.html;
    sourceUrl = response.finalUrl;
  }

  if (!html.trim()) {
    console.error("empty response; refusing to plan an import");
    process.exit(1);
  }

  const digest = createHash("sha256").update(html).digest("hex").slice(0, 16);
  const parsed = parseRoomGalleryFeed(html);
  const roomTypes = await loadRoomTypes(roomTypesPath);
  if (sqlOut && roomTypes.length === 0) {
    console.error("--room-types produced no room types; refusing to generate an empty import");
    process.exit(1);
  }
  const plan = buildImportPlan(parsed, roomTypes);

  const images = plan.rooms.reduce((total, room) => total + room.images.length, 0);
  const unresolved = plan.rooms.filter((room) => !room.roomTypeId);

  console.log(`source      : ${sourceUrl}`);
  console.log(`sha256/16   : ${digest}`);
  console.log(`galleries   : ${plan.rooms.length}`);
  console.log(`images      : ${images}`);
  console.log(`unresolved  : ${unresolved.length}`);

  if (parsed.warnings.length > 0) {
    console.log("\nwarnings:");
    for (const warning of parsed.warnings) console.log(`  - ${warning}`);
  }

  console.log("\nroom mapping:");
  for (const room of plan.rooms) {
    const target = room.roomTypeId
      ? `${room.roomTypeId} (${room.matchedBy})`
      : `UNRESOLVED — ${room.unresolvedReason}`;
    console.log(`  ${room.heading.padEnd(34)} ${String(room.images.length).padStart(2)} imgs  section=${room.sectionId}  -> ${target}`);
  }

  if (sqlOut) {
    const { statements, skippedRooms } = buildImportStatements({
      tenantId,
      locationId,
      plan,
      source: { sourcePageUrl: sourceUrl, feedDigest: digest, fetchedAt: new Date().toISOString() },
    });
    await writeFile(sqlOut, renderSql(statements), "utf8");
    console.log(`\nwrote ${statements.length} statements to ${sqlOut}`);
    if (skippedRooms.length > 0) {
      console.log(`skipped unresolved rooms: ${skippedRooms.join(", ")}`);
    }
    console.log("\napply with:");
    console.log(`  wrangler d1 execute urban-cowboy-content --local  --file ${sqlOut}`);
  } else {
    console.log("\nread-only: pass --sql-out <path> to emit the import script");
  }
}

main().catch((error) => {
  console.error(error?.stack ?? String(error));
  process.exit(1);
});