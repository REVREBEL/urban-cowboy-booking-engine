// COW-34: identity, geometry and replacement policy are pure and testable.
import assert from "node:assert/strict";
import test from "node:test";
import {
  AUTO_PUBLISH_DECISIONS,
  classifyDuplicate,
  classifyReplacement,
  extractWebflowAssetIds,
  hammingDistance,
  normalizeDeliveryUrl,
  perceptualHash,
  remapCrop,
  sha256Hex,
  toDisplayPercent,
  transformOrientation,
  type ExifOrientation,
} from "../src/lib/hotspotGeometry.ts";

const SITE_ID = "6abc815b36cbcba74b8b01c4";
const ASSET_ID = "6ac89730346974fa55ed2a44";

test("Webflow wrapper ids resolve to the asset id, never the shared site id", () => {
  const url = `https://cdn.prod.website-files.com/${SITE_ID}/${ASSET_ID}_room.jpg?width=1600`;
  assert.deepEqual(extractWebflowAssetIds(url), [ASSET_ID]);
  assert.deepEqual(extractWebflowAssetIds(ASSET_ID), [ASSET_ID]);
  assert.deepEqual(extractWebflowAssetIds(`file:${SITE_ID}`), [SITE_ID]);
  assert.deepEqual(extractWebflowAssetIds("https://images.squarespace-cdn.com/x/room.jpg"), []);
  assert.deepEqual(extractWebflowAssetIds(null), []);
});

test("delivery URL variants normalize to one reference", () => {
  assert.equal(
    normalizeDeliveryUrl(`https://images.squarespace-cdn.com/content/v1/room.jpg?format=1500w`),
    "https://images.squarespace-cdn.com/content/v1/room.jpg",
  );
  assert.equal(
    normalizeDeliveryUrl("https://images.squarespace-cdn.com/content/v1/room.jpg?format=2500w"),
    normalizeDeliveryUrl("https://images.squarespace-cdn.com/content/v1/room.jpg?format=750w"),
  );
  assert.equal(normalizeDeliveryUrl(undefined), null);
});

test("EXIF orientation transforms round-trip for all eight values", () => {
  const point = { x: 0.2, y: 0.35 };
  for (let orientation = 1; orientation <= 8; orientation++) {
    const o = orientation as ExifOrientation;
    const transformed = transformOrientation(point, o, 1);
    const restored = transformOrientation(transformed, 1, o);
    assert.ok(Math.abs(restored.x - point.x) < 1e-9, `x round-trip for ${o}`);
    assert.ok(Math.abs(restored.y - point.y) < 1e-9, `y round-trip for ${o}`);
  }
  assert.deepEqual(transformOrientation({ x: 0.2, y: 0.3 }, 1, 6), { x: 0.7, y: 0.2 });
});

test("crop remap is source-space so responsive display sizes do not drift pins", () => {
  const source = { width: 2000, height: 1000 };
  const crop = { left: 200, top: 100, width: 1600, height: 800 };
  const point = { x: 0.6, y: 0.5 }; // source pixel (1200, 500)
  const remapped = remapCrop(point, source, crop);
  assert.deepEqual(remapped, { x: 0.625, y: 0.5 });
  // Same normalized result whether the guest renders 400px or 1600px wide.
  assert.deepEqual(toDisplayPercent(remapped!), { x: 62.5, y: 50 });
  assert.deepEqual(toDisplayPercent(remapCrop(point, { width: 400, height: 200 }, {
    left: 40, top: 20, width: 320, height: 160,
  })!), { x: 62.5, y: 50 });
});

test("unknown or out-of-bounds crops return null instead of guessed coordinates", () => {
  const source = { width: 1000, height: 1000 };
  assert.equal(remapCrop({ x: 0.5, y: 0.5 }, source, null), null);
  assert.equal(remapCrop({ x: 0.5, y: 0.5 }, source, { left: 800, top: 0, width: 400, height: 400 }), null);
  assert.equal(remapCrop({ x: 0.1, y: 0.5 }, source, { left: 200, top: 0, width: 400, height: 400 }), null);
});

test("sha256 and perceptual hash classify exact and candidate duplicates", async () => {
  const bytes = new TextEncoder().encode("same photo");
  const a = await sha256Hex(bytes);
  const b = await sha256Hex(new TextEncoder().encode("same photo"));
  const c = await sha256Hex(new TextEncoder().encode("different photo"));
  assert.equal(a, b);
  assert.notEqual(a, c);
  assert.match(a, /^[a-f0-9]{64}$/);

  const grid = Array.from({ length: 64 }, (_, index) => index);
  const shifted = grid.map((value) => value + 1);
  const hash = perceptualHash(grid);
  assert.match(hash, /^[a-f0-9]{16}$/);
  assert.equal(hammingDistance(hash, perceptualHash(grid)), 0);
  assert.equal(classifyDuplicate({ sha256: a, phash: null }, { sha256: b, phash: null }), "exact");
  assert.equal(
    classifyDuplicate({ sha256: a, phash: hash }, { sha256: c, phash: perceptualHash(shifted) }),
    "candidate",
  );
  assert.equal(classifyDuplicate({ sha256: null, phash: null }, { sha256: null, phash: null }), "none");
});

const baseFacts = {
  exactFile: true,
  orientationBefore: 1 as ExifOrientation,
  orientationAfter: 1 as ExifOrientation,
  sizeBefore: { width: 1000, height: 800 },
  sizeAfter: { width: 1000, height: 800 },
  cropBefore: null,
  cropAfter: null,
};

test("replacement decision table keeps unmigrated changes out of guests", () => {
  assert.equal(classifyReplacement({ ...baseFacts, urlOnly: true, exactFile: false }), "url_only");
  assert.equal(classifyReplacement({ ...baseFacts, urlOnly: false }), "exact_reupload");
  assert.equal(classifyReplacement({
    ...baseFacts,
    cropBefore: { left: 0, top: 0, width: 1000, height: 800 },
    cropAfter: { left: 100, top: 0, width: 800, height: 800 },
  }), "crop_remap");
  assert.equal(classifyReplacement({
    ...baseFacts,
    cropAfter: { left: 800, top: 0, width: 500, height: 800 },
  }), "crop_review");
  assert.equal(classifyReplacement({ ...baseFacts, exactFile: false }), "replacement_review");
  assert.equal(classifyReplacement({ ...baseFacts, sizeAfter: { width: 800, height: 800 } }), "crop_review");
  assert.equal(classifyReplacement({
    ...baseFacts, exactDuplicateOnOtherMedia: true,
  }), "duplicate_exact");
  assert.equal(classifyReplacement({
    ...baseFacts, exactFile: false, phashDistance: 2,
  }), "duplicate_candidate");

  assert.deepEqual([...AUTO_PUBLISH_DECISIONS].sort(), ["crop_remap", "exact_reupload", "url_only"]);
});
