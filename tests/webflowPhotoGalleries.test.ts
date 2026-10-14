import assert from "node:assert/strict";
import test from "node:test";
import { normalizeRoomTypeGalleries } from "../worker/webflow/room-type-reviews.ts";
import { photoGalleryForRoom, photoSourceFromUrl, selectPhotoImages } from "../src/data/photoGalleries.ts";
import { readFileSync } from "node:fs";

const first = "https://cdn.prod.website-files.com/site/hero.webp";
const second = "https://cdn.prod.website-files.com/site/portrait.jpg";

test("published Webflow hero and gallery are combined in order, deduplicated and mapped by Mews ID", () => {
  const galleries = normalizeRoomTypeGalleries([
    { isDraft: false, isArchived: false, fieldData: {
      "mews-room-type-id": "room-a", active: true,
      "hero-image": { url: first },
      images: [{ url: first }, { url: second }, { url: "javascript:invalid" }],
    }},
  ]);
  assert.deepEqual(galleries["room-a"], { roomTypeId: "room-a", images: [first, second] });
});

test("unpublished, archived, inactive or unbound Room Types cannot supply photos", () => {
  const gallery = { "mews-room-type-id": "room-a", images: [{ url: second }] };
  assert.deepEqual(normalizeRoomTypeGalleries([
    { isDraft: true, fieldData: gallery },
    { isArchived: true, fieldData: gallery },
    { fieldData: { ...gallery, active: false } },
    { fieldData: { images: [{ url: first }] } },
  ]), {});
});

test("Photo image selector keeps CMS vs Mews sources isolated", () => {
  const gallery = { roomTypeId: "room-a", images: [first, second] };
  const original = ["https://images.mews.com/mews-image?width=1600"];
  const webflow = selectPhotoImages(original, gallery, "webflow");
  const mews = selectPhotoImages(original, gallery, "mews");
  const fallback = selectPhotoImages(original, undefined, "webflow");
  assert.deepEqual(webflow, { images: [first, second], photoSource: "webflow" });
  assert.deepEqual(mews, { images: original, photoSource: "mews" });
  assert.deepEqual(fallback, { images: original, photoSource: "mews" });
  const mapper = readFileSync(new URL("../src/data/photoTourRooms.ts", import.meta.url), "utf8");
  assert.match(mapper, /selectPhotoImages\(images, gallery, source\)/);
});

test("Studio demo category aliases are photos only and do not affect production room mappings", () => {
  const galleries = { "9cbb022a-742f-4abe-9586-b10600706caf": {
    roomTypeId: "9cbb022a-742f-4abe-9586-b10600706caf", images: [first],
  }};
  assert.equal(photoGalleryForRoom("demo-alpine", galleries, true)?.images[0], first);
  assert.equal(photoGalleryForRoom("demo-alpine", galleries, false), undefined);
  assert.equal(photoSourceFromUrl(), "webflow");
});
