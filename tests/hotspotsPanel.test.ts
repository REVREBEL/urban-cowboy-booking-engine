// COW-84: the hotspot panel uses the centralized client, normalized source
// coordinates and the COW-34 review/publish gates.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");
const panel = read("src/dashboard/RoomHotspotsPanel.tsx");
const api = read("src/dashboard/api.ts");
const nav = read("src/dashboard/navigation.ts");
const app = read("src/dashboard/DashboardApp.tsx");

test("hotspot panel reads rooms, photos and pins through the centralized client", () => {
  assert.match(panel, /api\.getAdminRooms<Room>\(\)/);
  assert.match(panel, /api\.getRoomGallery<GalleryResponse>\(roomId\)/);
  assert.match(panel, /api\.getRoomHotspots<HotspotResponse>\(roomId\)/);
  assert.doesNotMatch(panel, /\bfetch\(/);
  assert.doesNotMatch(panel, /tenant=/);
});

test("hotspot placement uses normalized source coordinates and eligible amenities", () => {
  assert.match(panel, /clamp = \(value: number\) => Math\.min\(1, Math\.max\(0, value\)\)/);
  assert.match(panel, /containedRect\(container, natural\)/);
  assert.match(panel, /pointToSource\(/);
  assert.match(panel, /ResizeObserver/);
  assert.match(panel, /onLoad=\{\(event\) => setNatural/);
  assert.match(panel, /imageRect\.left \+ pin\.sourceX \* imageRect\.width/);
  assert.match(panel, /sourceX: placement\?\.x \?\? 0\.5/);
  assert.match(panel, /sourceY: placement\?\.y \?\? 0\.5/);
  assert.match(panel, /sourceVersionId: photo\.currentVersionId \?\? versionId/);
  assert.match(panel, /hotspots\.data\?\.amenities/);
});

test("hotspot panel exposes review, publish and rollback controls", () => {
  assert.match(panel, /review\("approved"\)/);
  assert.match(panel, /review\("pending"\)/);
  assert.match(panel, /api\.publishRoomHotspots</);
  assert.match(panel, /api\.rollbackRoomHotspots</);
  assert.match(panel, /Publish pins/);
  assert.match(panel, /Rollback/);
  assert.match(panel, /role="status"/);
});

test("room and photo changes reset stale selections", () => {
  assert.match(panel, /setPlacementId\(""\)/);
  assert.match(panel, /setPlacement\(null\)/);
  assert.match(panel, /setVersionId\(""\)/);
  assert.match(panel, /\[roomId\]/);
  assert.match(panel, /!photos\.some\(\(item\) => item\.placementId === placementId\)/);
});

test("publish and rollback always pass the room placement", () => {
  assert.match(panel, /mediaAssetId: photo\.mediaAssetId,\s*placementId: photo\.placementId/);
  assert.match(panel, /toVersionId: versionId/);
});

test("hotspot route is registered and gated with the other dashboard panels", () => {
  assert.match(nav, /\| "hotspots"/);
  assert.match(nav, /id: "hotspots"/);
  assert.match(app, /route === "hotspots" && <RoomHotspotsPanel api=\{api\} \/>/);
});

test("admin client declares the tenant-independent hotspot helpers", () => {
  assert.match(api, /getRoomHotspots<T>\(roomId: string\): Promise<T>/);
  assert.match(api, /createRoomHotspot<T>\(roomId: string, input: unknown\): Promise<T>/);
  assert.match(api, /updateRoomHotspot<T>\(roomId: string, mappingId: string, input: unknown\): Promise<T>/);
  assert.match(api, /publishRoomHotspots<T>\(roomId: string, input: unknown\): Promise<T>/);
  assert.match(api, /rollbackRoomHotspots<T>\(roomId: string, input: unknown\): Promise<T>/);
  assert.match(api, /\/hotspots/);
});
