import assert from "node:assert/strict";
import test from "node:test";
import { cmsIconUrl, cmsPhotoKey, cmsPhotoKeys } from "../src/lib/cmsPhotoHotspots.ts";
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

test("wrapped Webflow gallery filenames retain every embedded file identity", () => {
  const wrapperId = "6ad658aa4a59edc8f0bb6c42";
  const sourceId = "6acfd9c115bb4e953736bd1c";
  const uploadId = "6acf99a70c36d6a9b4936dac";
  const wrappedPhoto = `https://cdn.prod.website-files.com/site/${wrapperId}_${sourceId}_${uploadId}_Alpine.jpeg`;
  assert.deepEqual(cmsPhotoKeys(wrappedPhoto), [
    `file:${wrapperId}`,
    `file:${sourceId}`,
    `file:${uploadId}`,
  ]);

  const amenities = normalizePublishedAmenities([amenityItem]);
  const pins = cmsHighlightsForPhoto(wrappedPhoto, [...amenities.values()], {
    [`file:${sourceId}`]: [{ id: "wrapped-pin", amenityId: "amenity-tub", photoKey: `file:${sourceId}`, x: 38, y: 58, order: 1 }],
  });
  assert.equal(pins.length, 1);
  assert.equal(pins[0].id, "wrapped-pin");
});

test("hotspots are indexed under explicit, wrapper and source photo identities", () => {
  const wrapperId = "6ad211bfd95b31afcc5628a5";
  const sourceId = "6ac88d47a6a679fb6f3c75b1";
  const amenities = normalizePublishedAmenities([amenityItem]);
  const byPhoto = normalizePhotoHotspots([{
    ...pinItem,
    fieldData: {
      ...pinItem.fieldData,
      "photo-file-id": wrapperId,
      "photo-url": `https://cdn.prod.website-files.com/site/${wrapperId}_${sourceId}_room.jpeg`,
    },
  }], amenities);

  assert.equal(byPhoto[`file:${wrapperId}`][0].id, "pin-1");
  assert.equal(byPhoto[`file:${sourceId}`][0].id, "pin-1");
});

test("gallery aliases merge distinct hotspots and deduplicate the same CMS record", () => {
  const wrapperId = "6ad211bfd95b31afcc5628a5";
  const sourceId = "6ac88d47a6a679fb6f3c75b1";
  const wrappedPhoto = `https://cdn.prod.website-files.com/site/${wrapperId}_${sourceId}_room.jpeg`;
  const amenities = normalizePublishedAmenities([amenityItem]);
  const sharedPin = { id: "shared", amenityId: "amenity-tub", photoKey: `file:${wrapperId}`, x: 38, y: 58, order: 1 };
  const sourceOnlyPin = { id: "source-only", amenityId: "amenity-tub", photoKey: `file:${sourceId}`, x: 62, y: 42, order: 2 };

  const pins = cmsHighlightsForPhoto(wrappedPhoto, [...amenities.values()], {
    [`file:${wrapperId}`]: [sharedPin],
    [`file:${sourceId}`]: [{ ...sharedPin, photoKey: `file:${sourceId}` }, sourceOnlyPin],
  });

  assert.deepEqual(pins.map((pin) => pin.id), ["shared", "source-only"]);
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

test("Room Type amenity order is optional, room-specific and cannot add or duplicate amenities", () => {
  const amenityItems = ["a", "b", "c", "d"].map((id) => ({
    id, isDraft: false, fieldData: { name: "Amenity " + id, active: true },
  }));
  const amenities = normalizePublishedAmenities(amenityItems);
  const room = (id: string, order?: string) => ({
    id, isDraft: false,
    fieldData: {
      "mews-room-type-id": id,
      "features-amenities": ["a", "b", "c", "c"],
      "amenity-display-order": order,
    },
  });
  const result = normalizeRoomAmenityMap([
    room("default"),
    room("custom", "c, missing, a, c"),
    room("other", "b, a"),
  ], amenities);
  assert.deepEqual(result.default.map((item) => item.id), ["a", "b", "c"]);
  assert.deepEqual(result.custom.map((item) => item.id), ["c", "a", "b"]);
  assert.deepEqual(result.other.map((item) => item.id), ["b", "a", "c"]);
  assert.ok(!result.custom.some((item) => item.id === "d" || item.id === "missing"));
});
