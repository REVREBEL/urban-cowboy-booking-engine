import assert from "node:assert/strict";
import test from "node:test";
import { normalizeRoomTypeGalleries } from "../worker/webflow/room-type-reviews.ts";
import { photoGalleryForRoom, photoSourceFromUrl } from "../src/data/photoGalleries.ts";
import { toPhotoTourRoom } from "../src/data/photoTourRooms.ts";
import type { ShapedRoom } from "../src/types/mews.ts";

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

test("Photo image source switches galleries only; Mews room and rate properties are unchanged", () => {
  const room = {
    roomTypeId: "room-a", name: "Room A", imageIds: ["mews-image"],
    normalBedCount: 1, capacity: 2, rates: [{ perNightGross: 320 }],
    description: "Original", merchandising: undefined,
  } as unknown as ShapedRoom;
  const gallery = { roomTypeId: "room-a", images: [first, second] };
  const webflow = toPhotoTourRoom(room, "https://images.mews.com", gallery, "webflow");
  const mews = toPhotoTourRoom(room, "https://images.mews.com", gallery, "mews");
  assert.deepEqual(webflow.images, [first, second]);
  assert.match(mews.images[0], /mews-image\?width=1600/);
  assert.equal(webflow.basePrice, mews.basePrice);
  assert.equal(webflow.id, mews.id);
  assert.equal(webflow.maxGuests, mews.maxGuests);
  assert.equal(webflow.photoSource, "webflow");
  assert.equal(mews.photoSource, "mews");
});

test("Studio demo category aliases are photos only and do not affect production room mappings", () => {
  const galleries = { "9cbb022a-742f-4abe-9586-b10600706caf": {
    roomTypeId: "9cbb022a-742f-4abe-9586-b10600706caf", images: [first],
  }};
  assert.equal(photoGalleryForRoom("demo-alpine", galleries, true)?.images[0], first);
  assert.equal(photoGalleryForRoom("demo-alpine", galleries, false), undefined);
  assert.equal(photoSourceFromUrl(), "webflow");
});
