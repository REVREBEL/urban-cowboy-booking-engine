// COW-73: the React amenity editor uses the centralized client, shared
// controls, accessible sorting/toggles, and the dashboard's loading states.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");
const panel = read("src/dashboard/RoomAmenitiesPanel.tsx");
const app = read("src/dashboard/DashboardApp.tsx");
const api = read("src/dashboard/api.ts");
const nav = read("src/dashboard/navigation.ts");

test("panel loads rooms, catalog and assignments through the centralized client", () => {
  assert.match(panel, /api\.getAdminRooms<Room>\(\)/);
  assert.match(panel, /api\.getAdminAmenities<CatalogAmenity>\(\)/);
  assert.match(panel, /api\.getRoomAmenities<RoomAmenitiesResponse>\(roomId\)/);
  assert.match(panel, /useDashboardResource\(loadRooms\)/);
  assert.match(panel, /useDashboardResource\(loadCatalog\)/);
  assert.match(panel, /useDashboardResource\(load\)/);
  assert.doesNotMatch(panel, /\bfetch\(/);
  assert.doesNotMatch(panel, /tenant=/);
});

test("panel exposes loading, error and empty states", () => {
  assert.match(panel, /LoadingPanel label="Loading room amenities"/);
  assert.match(panel, /LoadingPanel label="Loading room assignments"/);
  assert.match(panel, /ErrorPanel message=\{rooms\.error\} onRetry=\{rooms\.reload\}/);
  assert.match(panel, /ErrorPanel message=\{catalog\.error\} onRetry=\{catalog\.reload\}/);
  assert.match(panel, /No room types are available in D1 yet/);
  assert.match(panel, /No amenities are assigned to this room yet/);
  assert.match(panel, /No assignment data for this room/);
});

test("sortable tiles and restriction toggles are accessible", () => {
  assert.match(panel, /aria-label=\{`Move \$\{nameFor\(item\.amenityId\)\} earlier`\}/);
  assert.match(panel, /aria-label=\{`Move \$\{nameFor\(item\.amenityId\)\} later`\}/);
  assert.match(panel, /aria-label=\{`\$\{item\.excluded \? "Unrestrict" : "Restrict"\}/);
  assert.match(panel, /aria-pressed=\{item\.excluded\}/);
  assert.match(panel, /aria-label=\{`Remove \$\{nameFor\(item\.amenityId\)\} from this room`\}/);
  assert.match(panel, /disabled=\{index === 0\}/);
  assert.match(panel, /disabled=\{index === items\.length - 1\}/);
  assert.match(panel, /aria-label=\{`Add \$\{amenity\.name\} to this room`\}/);
  assert.doesNotMatch(panel, /draggable/);
});

test("publish, rollback and feedback are explicit", () => {
  assert.match(panel, /Save draft/);
  assert.match(panel, /Publish/);
  assert.match(panel, /Roll back/);
  assert.match(panel, /api\.publishEditorItem\(room\.data\.itemId\)/);
  assert.match(panel, /api\.rollbackEditorItem\(room\.data\.itemId, rollbackId\)/);
  assert.match(panel, /role=\{feedback\.tone === "error" \? "alert" : "status"\}/);
  assert.match(panel, /hasUnpublishedDraft/);
});

test("content tab validates local icon paths before saving", () => {
  assert.match(panel, /ICON_PATH = \/\^assets\\\/icons/);
  assert.match(panel, /ICON_NAME = \/\^\[a-z0-9_-\]\+\\\.svg/);
  assert.match(panel, /kind: "amenity_content", slug: selectedId, payload/);
  assert.match(panel, /role="tablist"/);
  assert.match(panel, /aria-selected=\{mode === "content"\}/);
});

test("panel is wired into a protected dashboard route", () => {
  assert.match(app, /route === "amenities" && <RoomAmenitiesPanel api=\{api\} \/>/);
  assert.match(nav, /id: "amenities"/);
  assert.ok(app.indexOf("if (!session)") < app.indexOf("<DashboardShell"));
});

test("admin client exposes editor helpers without a tenant parameter", () => {
  for (const signature of [
    /getAdminAmenities<T>\(\): Promise<T\[\]>/,
    /getRoomAmenities<T>\(roomId: string\): Promise<T>/,
    /createEditorItem<T>\(input: \{ kind: string; slug: string; payload: unknown \}\): Promise<T>/,
    /saveEditorDraft<T>\(/,
    /publishEditorItem<T>\(itemId: string\): Promise<T>/,
    /rollbackEditorItem<T>\(itemId: string, revisionId: string\): Promise<T>/,
  ]) assert.match(api, signature);
  assert.match(api, /\/api\/admin\/rooms\/\$\{encodeURIComponent\(roomId\)\}\/amenities/);
  assert.match(api, /\/api\/content\/editor\/items\/\$\{encodeURIComponent\(itemId\)\}\/publish/);
});
