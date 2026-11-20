// COW-72/COW-84: the React gallery panel reuses dashboard states and the
// centralized client, and exposes editing, previews and publish feedback.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");
const panel = read("src/dashboard/RoomPhotosPanel.tsx");
const app = read("src/dashboard/DashboardApp.tsx");
const api = read("src/dashboard/api.ts");

test("panel loads rooms, media catalog and gallery through the centralized client", () => {
  assert.match(panel, /api\.getAdminRooms<Room>\(\)/);
  assert.match(panel, /api\.getAdminMedia<MediaItem>\(\)/);
  assert.match(panel, /api\.getRoomGallery<GalleryResponse>\(roomId\)/);
  assert.match(panel, /useDashboardResource\(loadRooms\)/);
  assert.match(panel, /useDashboardResource\(loadMedia\)/);
  assert.match(panel, /useDashboardResource\(load\)/);
  assert.doesNotMatch(panel, /\bfetch\(/);
  assert.doesNotMatch(panel, /tenant=/);
});

test("panel exposes loading, error and empty states for every resource", () => {
  assert.match(panel, /LoadingPanel label="Loading room gallery"/);
  assert.match(panel, /LoadingPanel label="Loading gallery"/);
  assert.match(panel, /ErrorPanel message=\{rooms\.error\} onRetry=\{rooms\.reload\}/);
  assert.match(panel, /ErrorPanel message=\{media\.error\} onRetry=\{media\.reload\}/);
  assert.match(panel, /ErrorPanel message=\{gallery\.error\} onRetry=\{gallery\.reload\}/);
  assert.match(panel, /No room types are available in D1 yet/);
  assert.match(panel, /No photos are linked to this room yet/);
});

test("panel remounts on room change and never reuses another room's gallery", () => {
  assert.match(panel, /<RoomGallery[\s\S]*?key=\{roomId\}[\s\S]*?roomId=\{roomId\}[\s\S]*?catalog=\{media\.data \?\? \[\]\}/);
  assert.match(panel, /still see the published version/);
  assert.match(panel, /You have unsaved edits\. Save the draft before publishing/);
});

test("previews fall back cleanly and source URLs come from the registry", () => {
  assert.match(panel, /<img\s+src=\{url\}/);
  assert.match(panel, /onError=\{\(\) => setFailedImages/);
  assert.match(panel, /Image unavailable/);
  assert.match(panel, /No preview URL in the registry/);
  assert.match(panel, /Squarespace URL registry/);
});

test("reorder, exclusion, unlink, metadata and linking are accessible", () => {
  assert.match(panel, /aria-label=\{`Move \$\{item\.mediaAssetId\} earlier`\}/);
  assert.match(panel, /aria-label=\{`Move \$\{item\.mediaAssetId\} later`\}/);
  assert.match(panel, /aria-label=\{`\$\{item\.excluded \? "Include" : "Exclude"\} \$\{item\.mediaAssetId\}`\}/);
  assert.match(panel, /aria-pressed=\{item\.excluded\}/);
  assert.match(panel, /aria-label=\{`Unlink \$\{item\.mediaAssetId\}`\}/);
  assert.match(panel, /Link a photo/);
  assert.match(panel, /Alt text/);
  assert.match(panel, /Caption/);
  assert.match(panel, /Description/);
});

test("save, publish, rollback and refresh failure feedback are explicit", () => {
  assert.match(panel, /Save draft/);
  assert.match(panel, /Publish/);
  assert.match(panel, /Roll back/);
  assert.match(panel, /api\.publishEditorItem<[\s\S]*?>\(gallery\.data\.itemId\)/);
  assert.match(panel, /api\.rollbackEditorItem\(gallery\.data\.itemId, rollbackId\)/);
  assert.match(panel, /snapshot refresh failed/);
  assert.match(panel, /role=\{feedback\.tone === "error" \? "alert" : "status"\}/);
});

test("panel is wired into the rooms dashboard route behind the session gate", () => {
  assert.match(app, /route === "rooms" && <RoomPhotosPanel api=\{api\} \/>/);
  assert.ok(app.indexOf("if (!session)") < app.indexOf("<DashboardShell"));
});

test("admin client declares tenant-independent gallery helpers", () => {
  assert.match(api, /getAdminRooms<T>\(\): Promise<T\[\]>/);
  assert.match(api, /getRoomGallery<T>\(roomId: string\): Promise<T>/);
  assert.match(api, /getAdminMedia<T>\(\): Promise<T\[\]>/);
  assert.match(api, /encodeURIComponent\(roomId\)/);
  assert.match(api, /\/api\/admin\/media/);
});
