// COW-72: the React admin's room gallery reads stay tenant-scoped, fail closed,
// and agree with the COW-67 importer's placement contract.
import assert from "node:assert/strict";
import { generateKeyPairSync, sign } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import { listRoomGallery, listRooms, type RoomMediaAuthorize, type RoomMediaCtx } from "../worker/room-media.ts";
import { roomGalleryRowSchema } from "../src/types/d1-contracts.ts";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");
const TENANT = "urban-cowboy";
const OTHER = "other-tenant";

// Real Access JWT harness: exercises the default scoped authorizer, including
// missing tenant config and a caller-supplied ?tenant= scope.
const TEAM = "cow72-scope-test.cloudflareaccess.com";
const AUD = "cow72-scope-aud";
const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const jwk = publicKey.export({ format: "jwk" }) as { n: string; e: string };
const jwks = { keys: [{ kid: "cow72-kid", kty: "RSA", alg: "RS256", use: "sig", n: jwk.n, e: jwk.e }] };
const originalFetch = globalThis.fetch;
globalThis.fetch = (async (input: unknown) => {
  if (String(input) === `https://${TEAM}/cdn-cgi/access/certs`) {
    return new Response(JSON.stringify(jwks), {
      status: 200, headers: { "content-type": "application/json" },
    });
  }
  return new Response("not found", { status: 404 });
}) as typeof fetch;
test.after(() => { globalThis.fetch = originalFetch; });

const b64u = (value: string | Uint8Array) => Buffer.from(value).toString("base64url");
function viewerJwt(): string {
  const header = { alg: "RS256", typ: "JWT", kid: "cow72-kid" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: "viewer-1", email: "viewer@example.test", groups: [],
    iss: `https://${TEAM}`, aud: AUD, exp: now + 600, nbf: now - 60,
  };
  const input = `${b64u(JSON.stringify(header))}.${b64u(JSON.stringify(payload))}`;
  return `${input}.${b64u(sign("RSA-SHA256", Buffer.from(input), privateKey))}`;
}
const jwt = viewerJwt();

function makeDb() {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON");
  for (const file of [
    "migrations/0001_init.sql",
    "migrations/0002_module_list_indexes.sql",
    "migrations/0003_property_scoped_contracts.sql",
    "migrations/0004_published_snapshots.sql",
    "migrations/0005_media_registry.sql",
    "migrations/0008_durable_hotspots.sql",
    "migrations/0009_media_placement_flags.sql",
  ]) db.exec(read(file));

  db.exec(`
    INSERT INTO tenants (id, slug, name) VALUES
      ('${TENANT}','${TENANT}','Urban Cowboy'),
      ('${OTHER}','${OTHER}','Other Tenant');
    INSERT INTO locations (id, tenant_id, slug, name) VALUES
      ('catskills','${TENANT}','catskills','Catskills'),
      ('other-loc','${OTHER}','other','Other');
    INSERT INTO room_types (id, tenant_id, mews_room_category_id, name, slug, sort_order) VALUES
      ('room-a','${TENANT}','mews-a','Suite A','suite-a',2),
      ('room-b','${TENANT}','mews-b','Suite B','suite-b',1),
      ('room-other','${OTHER}','mews-other','Other Suite','other-suite',1);
    INSERT INTO media_assets (id, tenant_id, location_id, kind, original_filename, width, height, alt_text) VALUES
      ('media-1','${TENANT}','catskills','image','one.png',1200,800,'First photo'),
      ('media-2','${TENANT}','catskills','image','two.png',900,600,NULL),
      ('media-import','${TENANT}','catskills','image','imported.png',640,480,'Imported asset alt'),
      ('media-video','${TENANT}','catskills','video','clip.mp4',0,0,NULL),
      ('media-bad','${TENANT}','catskills','image','broken.png',100,100,NULL),
      ('media-other','${OTHER}','other-loc','image','other.png',100,100,'Other');
    INSERT INTO media_versions (id, media_asset_id, version, squarespace_asset_id, squarespace_url, width, height) VALUES
      ('v-1','media-1',1,'sq-1','https://cdn/1',NULL,NULL),
      ('v-2','media-2',1,'sq-2','https://cdn/2',NULL,NULL),
      ('v-import','media-import',1,'sqsp-imp','https://cdn/import',1920,1080),
      ('v-bad','media-bad',1,'sqsp-bad','https://cdn/bad',NULL,NULL);
    INSERT INTO media_asset_metadata (media_asset_id, tenant_id, description, caption, tags, current_version_id) VALUES
      ('media-1','${TENANT}','Desc one','Caption one','["room","suite"]','v-1'),
      ('media-2','${TENANT}',NULL,NULL,NULL,'v-2'),
      ('media-import','${TENANT}','Imported asset description','Imported asset caption','["import"]','v-import'),
      ('media-bad','${TENANT}',NULL,NULL,'not-json','v-bad');
    INSERT INTO media_version_files (version_id, tenant_id, media_asset_id, cloudinary_public_id, cloudinary_version, sha256) VALUES
      ('v-1','${TENANT}','media-1','urban-cowboy/one','v1','hash-1'),
      ('v-2','${TENANT}','media-2','urban-cowboy/two','v2','hash-2');
    INSERT INTO media_placements
      (id, tenant_id, media_asset_id, target_table, target_id, placement_type, alt_text_override, caption_override, description_override, display_order) VALUES
      ('place-g2','${TENANT}','media-2','room_types','room-a','gallery',NULL,NULL,NULL,2),
      ('place-g1','${TENANT}','media-1','room_types','room-a','gallery',NULL,NULL,NULL,1),
      ('place-cover','${TENANT}','media-1','room_types','room-a','cover',NULL,NULL,NULL,0),
      ('place-imp','${TENANT}','media-import','room_types','room-a','room_gallery','Room-specific alt','Room-specific caption','Room-specific description',1),
      ('place-video','${TENANT}','media-video','room_types','room-b','room_gallery',NULL,NULL,NULL,1),
      ('place-bad','${TENANT}','media-bad','room_types','room-a','room_gallery',NULL,NULL,NULL,8),
      ('place-cross','${OTHER}','media-other','room_types','room-a','room_gallery',NULL,NULL,NULL,9),
      ('place-other','${OTHER}','media-other','room_types','room-other','room_gallery',NULL,NULL,NULL,1);
  `);
  return db;
}

/** D1-shaped adapter over node:sqlite. */
function d1(db: DatabaseSync): any {
  return {
    prepare(sql: string) {
      let params: unknown[] = [];
      return {
        bind(...values: unknown[]) { params = values; return this; },
        async all() { return { results: db.prepare(sql).all(...params) }; },
        async first() { return db.prepare(sql).get(...params) ?? null; },
        async run() { return db.prepare(sql).run(...params); },
      };
    },
  };
}

const principal = {
  sub: "viewer-1", email: "viewer@example.test", groups: [],
  roles: ["viewer" as const], tenantId: TENANT,
};
const allowViewer: RoomMediaAuthorize = async () => principal;
const deny: RoomMediaAuthorize = async () =>
  new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });

function envFor(db: DatabaseSync | null, tenant = TENANT) {
  return {
    DB: db ? d1(db) : undefined,
    TENANT_ID: tenant,
    CF_ACCESS_TEAM_DOMAIN: TEAM,
    CF_ACCESS_AUD: AUD,
  } as any;
}

function ctx(db: DatabaseSync | null, tenant = TENANT, path = "/api/admin/rooms", token?: string): RoomMediaCtx {
  const headers: Record<string, string> = {};
  if (token) headers["cf-access-jwt-assertion"] = token;
  return {
    request: new Request(`https://example.test${path}`, { headers }),
    env: envFor(db, tenant),
    waitUntil: () => {},
  };
}

const jsonBody = (res: Response) => res.json() as Promise<any>;

test("listRooms returns only rooms in the Worker-bound tenant, ordered", async () => {
  const res = await listRooms(ctx(makeDb()), allowViewer);
  assert.equal(res.status, 200);
  const body = await jsonBody(res);
  assert.deepEqual(body.items, [
    { id: "room-b", name: "Suite B", slug: "suite-b" },
    { id: "room-a", name: "Suite A", slug: "suite-a" },
  ]);
  assert.equal(body.items.some((room: any) => room.id === "room-other"), false);
});

test("listRooms fails closed when tenant configuration is missing or blank", async () => {
  const blankPrincipal = { ...principal, tenantId: "   " };
  const res = await listRooms(ctx(makeDb()), async () => blankPrincipal);
  assert.equal(res.status, 503);
  assert.deepEqual(await jsonBody(res), { error: "tenant_scope_not_configured" });

  // The real scoped authorizer rejects a missing TENANT_ID too.
  const configured = await listRooms(ctx(makeDb(), "", "/api/admin/rooms", jwt), undefined);
  assert.equal(configured.status, 503);
});

test("listRooms denies unauthenticated callers through the default authorizer", async () => {
  const res = await listRooms(ctx(null), undefined);
  assert.equal(res.status, 401);
  assert.deepEqual(await jsonBody(res), { error: "unauthorized" });
});

test("listRoomGallery includes COW-67 importer placements, overrides and current version dimensions", async () => {
  const res = await listRoomGallery(ctx(makeDb()), "room-a", allowViewer);
  assert.equal(res.status, 200);
  const body = await jsonBody(res);
  const imported = body.items.find((item: any) => item.mediaAssetId === "media-import");
  assert.ok(imported, "room_gallery placements from the importer are visible to the admin");
  assert.equal(imported.altText, "Room-specific alt");
  assert.equal(imported.caption, "Room-specific caption");
  assert.equal(imported.description, "Room-specific description");
  assert.equal(imported.width, 1920, "current version dimensions replace asset-level dimensions");
  assert.equal(imported.height, 1080);
  assert.equal(imported.cloudinaryPublicId, null, "un-ingested imports show no CDN id");
});

test("listRoomGallery orders by display_order, parses rows and excludes non-gallery placements", async () => {
  const res = await listRoomGallery(ctx(makeDb()), "room-a", allowViewer);
  const body = await jsonBody(res);
  assert.deepEqual(body.items.map((item: any) => item.mediaAssetId), ["media-1", "media-import", "media-2"]);
  assert.deepEqual(body.items.map((item: any) => item.displayOrder), [1, 1, 2]);

  const first = body.items[0];
  assert.equal(first.placementId, "place-g1");
  assert.equal(first.altText, "First photo", "asset-level text is used without an override");
  assert.equal(first.caption, "Caption one");
  assert.deepEqual(first.tags, ["room", "suite"]);
  assert.equal(first.currentVersionId, "v-1");
  assert.equal(first.cloudinaryPublicId, "urban-cowboy/one");
  assert.equal(first.sha256, "hash-1");
  assert.equal(body.items[2].tags, null);
  assert.equal(body.items.some((item: any) => item.placementId === "place-cover"), false);
  assert.equal(body.items.some((item: any) => item.placementId === "place-cross"), false, "cross-tenant placement excluded");
});

test("listRoomGallery skips a malformed registry row instead of failing the endpoint", async () => {
  const res = await listRoomGallery(ctx(makeDb()), "room-a", allowViewer);
  assert.equal(res.status, 200);
  const items = (await jsonBody(res)).items;
  assert.equal(items.some((item: any) => item.mediaAssetId === "media-bad"), false);
  assert.equal(items.length, 3, "one corrupt row does not hide the rest of the gallery");
});

test("listRoomGallery excludes non-image assets from the photo gallery", async () => {
  const res = await listRoomGallery(ctx(makeDb()), "room-b", allowViewer);
  assert.equal(res.status, 200);
  assert.deepEqual((await jsonBody(res)).items, [], "a video placement is not a room photo");
});

test("listRoomGallery rejects a room from another tenant", async () => {
  const res = await listRoomGallery(ctx(makeDb()), "room-other", allowViewer);
  assert.equal(res.status, 404);
  assert.deepEqual(await jsonBody(res), { error: "room_not_found" });
});

test("default authorizer rejects a caller-supplied tenant scope", async () => {
  const res = await listRoomGallery(
    ctx(makeDb(), TENANT, `/api/admin/rooms/room-a/photos?tenant=${OTHER}`, jwt),
    "room-a",
    undefined,
  );
  assert.equal(res.status, 403);
  assert.deepEqual(await jsonBody(res), { error: "forbidden" });
});

test("listRoomGallery denies unauthenticated callers through the default authorizer", async () => {
  const res = await listRoomGallery(ctx(null), "room-a", undefined);
  assert.equal(res.status, 401);
  assert.deepEqual(await jsonBody(res), { error: "unauthorized" });
});

test("listRoomGallery reports missing D1 as unavailable", async () => {
  const res = await listRoomGallery(ctx(null), "room-a", allowViewer);
  assert.equal(res.status, 503);
});

test("worker admin routes guard malformed ids and never scope from the query", () => {
  const source = read("worker/index.ts");
  const adminBlock = source.slice(
    source.indexOf("const adminCtx"),
    source.indexOf("// Specific paths first"),
  );
  assert.match(adminBlock, /admin\\\/rooms/);
  assert.match(adminBlock, /\\\/photos/);
  assert.match(adminBlock, /decodeURIComponent\(roomPhotos\[1\]\)/);
  assert.match(adminBlock, /catch \{\s*return json\(\{ error: "invalid_room_id" \}, 400/);
  assert.match(adminBlock, /if \(!roomId\) return json\(\{ error: "invalid_room_id" \}, 400\)/);
  assert.doesNotMatch(adminBlock, /searchParams\.get\("tenant"\)/);
  assert.match(adminBlock, /listRooms\(adminCtx\)/);
  assert.match(adminBlock, /listRoomGallery\(adminCtx/);
});

test("roomGalleryRowSchema transforms a stored row and rejects malformed tags", () => {
  const row = {
    placement_id: "p1", media_asset_id: "m1", display_order: 0,
    original_filename: "photo.png",
    source_url: "https://images.squarespace-cdn.com/room.jpg",
    source_asset_id: "sqsp-1", excluded: 0,
    width: 100, height: 80, alt_text: "A room",
    caption: null, description: null, tags: '["room"]', current_version_id: "v1",
    cloudinary_public_id: "cld/photo", cloudinary_version: "v1", sha256: "h",
  };
  assert.deepEqual(roomGalleryRowSchema.parse(row).tags, ["room"]);
  assert.equal(roomGalleryRowSchema.parse(row).displayOrder, 0);
  assert.equal(roomGalleryRowSchema.safeParse({ ...row, tags: "not-json" }).success, false);
});
