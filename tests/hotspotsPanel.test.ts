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
  const publish = panel.indexOf("api.publishRoomHotspots");
  const rollback = panel.indexOf("api.rollbackRoomHotspots");
  assert.ok(publish >= 0 && rollback > publish);
  for (const call of [panel.slice(publish, rollback), panel.slice(rollback, rollback + 600)]) {
    assert.match(call, /mediaAssetId: photo\.mediaAssetId/);
    assert.match(call, /placementId: photo\.placementId/);
  }
  assert.match(panel.slice(rollback, rollback + 600), /toVersionId: versionId/);
});

test("pin placement is keyboard and pointer accessible", () => {
  assert.match(panel, /role="button"/);
  assert.match(panel, /tabIndex=\{0\}/);
  assert.match(panel, /aria-label="Photo pin placement/);
  assert.match(panel, /onKeyDown=\{onKeyDown\}/);
  assert.match(panel, /event\.key === "Enter" \|\| event\.key === " "/);
  assert.match(panel, /nudgePoint\(preview \?\? \{ x: 0\.5, y: 0\.5 \}, event\.key\)/);
  assert.match(panel, /New pin source X/);
  assert.match(panel, /New pin source Y/);
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

test("admin client declares replacement and deletion helpers", () => {
  assert.match(api, /deleteRoomHotspot<T>\(roomId: string, mappingId: string\): Promise<T>/);
  assert.match(api, /planHotspotReplacement<T>\(roomId: string, input: unknown\): Promise<T>/);
  assert.match(api, /applyHotspotReplacement<T>\(roomId: string, input: unknown\): Promise<T>/);
  assert.match(api, /method: "DELETE"/);
  assert.match(api, /hotspots\/(plan|apply)/);
});

test("panel exposes staged deletion and reviewed replacement planning", () => {
  assert.match(panel, /api\.deleteRoomHotspot\(roomId, hotspot\.id\)/);
  assert.match(panel, /Confirm delete/);
  assert.match(panel, /Pending deletion/);
  assert.match(panel, /api\.planHotspotReplacement</);
  assert.match(panel, /api\.applyHotspotReplacement</);
  assert.match(panel, /review required/);
  assert.match(panel, /Source replacement and crop review/);
  assert.match(panel, /approveReview/);
});

test("replacement source version is independent of the rollback target", () => {
  assert.match(panel, /const \[fromVersionId, setFromVersionId\] = useState\(""\)/);
  assert.match(panel, /fromVersionId,[\s\S]{0,120}toVersionId,[\s\S]{0,80}urlOnly,/);
  assert.match(panel, /value=\{fromVersionId\} onChange=\{\(event\) => setFromVersionId/);
  assert.match(panel, /value=\{versionId\} onChange=\{\(event\) => setVersionId/);
  assert.match(panel, /setFromVersionId\(photo\.currentVersionId\)/);
});
