// COW-72: the React room gallery panel reuses dashboard states and the centralized client.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");
const panel = read("src/dashboard/RoomPhotosPanel.tsx");
const app = read("src/dashboard/DashboardApp.tsx");
const api = read("src/dashboard/api.ts");

test("panel loads rooms and gallery through the centralized admin client", () => {
  assert.match(panel, /api\.getAdminRooms<Room>\(\)/);
  assert.match(panel, /api\.getRoomGallery<GalleryItem>\(roomId\)/);
  assert.match(panel, /useDashboardResource\(loadRooms\)/);
  assert.match(panel, /useDashboardResource\(loadGallery\)/);
  assert.doesNotMatch(panel, /\bfetch\(/);
  assert.doesNotMatch(panel, /tenant=/);
});

test("panel exposes loading, error and empty states for both resources", () => {
  assert.match(panel, /LoadingPanel label="Loading room types"/);
  assert.match(panel, /LoadingPanel label="Loading gallery"/);
  assert.match(panel, /ErrorPanel message=\{rooms\.error\} onRetry=\{rooms\.reload\}/);
  assert.match(panel, /ErrorPanel message=\{gallery\.error\} onRetry=\{gallery\.reload\}/);
  assert.match(panel, /No room types are published in D1 yet/);
  assert.match(panel, /No media placements are linked to this room yet/);
});

test("panel offers an accessible room picker and registry metadata", () => {
  assert.match(panel, /<label[^>]*>[\s\S]*?Room type/);
  assert.match(panel, /<select[\s\S]*?aria-label|<label/);
  assert.match(panel, /onChange=\{\(event\) => setRoomId\(event\.target\.value\)\}/);
  assert.match(panel, /displayOrder/);
  assert.match(panel, /mediaAssetId/);
  assert.match(panel, /cloudinaryPublicId/);
});

test("panel is wired into the rooms dashboard route behind the session gate", () => {
  assert.match(app, /route === "rooms" && <RoomPhotosPanel api=\{api\} \/>/);
  assert.ok(app.indexOf("if (!session)") < app.indexOf("<DashboardShell"));
  assert.doesNotMatch(app, /route !== "rooms"[\s\S]*?route !== "rooms"/);
});

test("admin client declares tenant-independent gallery helpers", () => {
  assert.match(api, /getAdminRooms<T>\(\): Promise<T\[\]>/);
  assert.match(api, /getRoomGallery<T>\(roomId: string\): Promise<T\[\]>/);
  assert.match(api, /get<\{ items\?: T\[\] \}>\("\/api\/admin\/rooms"\)/);
  assert.match(api, /encodeURIComponent\(roomId\)/);
});
