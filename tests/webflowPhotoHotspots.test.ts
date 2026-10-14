import assert from "node:assert/strict";
import test from "node:test";
import { cmsIconUrl, cmsPhotoKey } from "../src/lib/cmsPhotoHotspots.ts";
import { cmsHighlightsForPhoto } from "../src/journey/cmsTour.ts";
import {
  normalizePublishedAmenities,
  normalizeRoomAmenityMap,
  normalizePhotoHotspots,
} from "../worker/webflow/photo-hotspots.ts";

const fileId = "6ac89730346974fa55ed2a44";
const photo = "https://cdn.prod.website-files.com/site/" + fileId + "_room.jpg?width=1600";
const amenityItem = {
  id: "amenity-tub",
  isDraft: false,
  fieldData: {
    name: "Copper Clawfoot Soaking Tub",
    "short-name": "Copper Tub",
    "short-description": "Soak overlooking the mountains.",
    "long-description": "Hand-finished copper with a view into the trees.",
    "image-path": "assets/icons/icons-simple/copper_clawfoot_tub.svg",
    active: true,
  },
};
const roomItem = {
  id: "webflow-room",
  isDraft: false,
  fieldData: { name: "Alpine Suite", "mews-room-type-id": "mews-room", "features-amenities": ["amenity-tub"] },
};
const pinItem = {
  id: "pin-1",
  isDraft: false,
  fieldData: { amenity: "amenity-tub", "photo-file-id": fileId, "x-percent": 38, "y-percent": 58, "display-order": 1, active: true },
};

test("CMS icon URL allows only the checked-in public SVG directory", () => {
  assert.equal(cmsIconUrl("assets/icons/icons-simple/copper_clawfoot_tub.svg"), "/assets/icons/icons-simple/copper_clawfoot_tub.svg");
  assert.equal(cmsIconUrl("/public/assets/icons/icons-simple/copper_clawfoot_tub.svg"), "/assets/icons/icons-simple/copper_clawfoot_tub.svg");
  assert.equal(cmsIconUrl("https://malicious.example/icon.svg"), null);
  assert.equal(cmsIconUrl("assets/icons/../../private.svg"), null);
  assert.equal(cmsIconUrl("javascript:alert(1)"), null);
});

test("Webflow photo identity remains stable across query parameters", () => {
  assert.equal(cmsPhotoKey(photo), "file:" + fileId);
  assert.equal(cmsPhotoKey(fileId), "file:" + fileId);
  assert.equal(cmsPhotoKey(photo.replace("?width=1600", "?width=900")), "file:" + fileId);
});

test("Published room references and photo coordinates join to CMS descriptions", () => {
  const amenities = normalizePublishedAmenities([amenityItem]);
  const byRoom = normalizeRoomAmenityMap([roomItem], amenities);
  const byPhoto = normalizePhotoHotspots([pinItem], amenities);
  assert.equal(byRoom["mews-room"].length, 1);
  assert.equal(byRoom["mews-room"][0].shortName, "Copper Tub");
  assert.equal(byRoom["mews-room"][0].longDescription, "Hand-finished copper with a view into the trees.");
  assert.equal(byPhoto["file:" + fileId][0].x, 38);
  const pins = cmsHighlightsForPhoto(photo, byRoom["mews-room"], byPhoto);
  assert.equal(pins.length, 1);
  assert.equal(pins[0].title, "Copper Tub");
  assert.equal(pins[0].longNote, "Hand-finished copper with a view into the trees.");
  assert.equal(pins[0].iconPath, "/assets/icons/icons-simple/copper_clawfoot_tub.svg");
  assert.deepEqual(cmsHighlightsForPhoto(photo, [], byPhoto), [], "a room without the amenity must not inherit a reused photograph's pin");
  assert.deepEqual(cmsHighlightsForPhoto("https://elsewhere.com/photo.jpg", byRoom["mews-room"], byPhoto), []);
});

test("Drafts, inactive records and invalid coordinates are never published to the engine", () => {
  const draftAmenity = { ...amenityItem, isDraft: true };
  assert.equal(normalizePublishedAmenities([draftAmenity]).size, 0);
  const amenities = normalizePublishedAmenities([amenityItem]);
  assert.deepEqual(normalizeRoomAmenityMap([{ ...roomItem, isDraft: true }], amenities), {});
  assert.deepEqual(normalizePhotoHotspots([
    { ...pinItem, isDraft: true },
    { ...pinItem, id: "outside", fieldData: { ...pinItem.fieldData, "x-percent": 101 } },
    { ...pinItem, id: "missing", fieldData: { ...pinItem.fieldData, amenity: "not-real" } },
    { ...pinItem, id: "no-position", fieldData: { ...pinItem.fieldData, "y-percent": null } },
  ], amenities), {});
});
