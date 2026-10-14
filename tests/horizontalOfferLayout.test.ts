import assert from "node:assert/strict";
import test from "node:test";
import {
  HORIZONTAL_OFFER_BASE_HEIGHT,
  HORIZONTAL_OFFER_BASE_WIDTH,
  horizontalOfferLayoutForWidth,
} from "../src/components/rates/useHorizontalOfferLayout.ts";

const CROP_THRESHOLD = HORIZONTAL_OFFER_BASE_WIDTH * (1 - (0.66 - 0.51));

test("horizontal offer keeps full scale while cropping from the right", () => {
  const full = horizontalOfferLayoutForWidth(HORIZONTAL_OFFER_BASE_WIDTH);
  assert.equal(full.scale, 1);
  assert.equal(full.overlayShift, 0);
  assert.equal(full.logicalViewportWidth, HORIZONTAL_OFFER_BASE_WIDTH);
  assert.equal(full.renderedHeight, HORIZONTAL_OFFER_BASE_HEIGHT);

  const cropped = horizontalOfferLayoutForWidth(1350);
  assert.equal(cropped.scale, 1);
  assert.equal(cropped.overlayShift, 125);
  assert.equal(cropped.logicalViewportWidth, 1350);
  assert.equal(cropped.renderedHeight, HORIZONTAL_OFFER_BASE_HEIGHT);
});

test("horizontal offer stops moving the overlay at 51% before scaling", () => {
  const atThreshold = horizontalOfferLayoutForWidth(CROP_THRESHOLD);
  const expectedMaxShift = HORIZONTAL_OFFER_BASE_WIDTH * (0.66 - 0.51);

  assert.ok(Math.abs(atThreshold.overlayShift - expectedMaxShift) < 0.001);
  assert.equal(atThreshold.scale, 1);

  const smaller = horizontalOfferLayoutForWidth(1000);
  assert.ok(Math.abs(smaller.logicalViewportWidth - CROP_THRESHOLD) < 0.001);
  assert.ok(Math.abs(smaller.overlayShift - expectedMaxShift) < 0.001);
  assert.ok(smaller.scale < 1);
  assert.ok(
    Math.abs(smaller.renderedHeight - HORIZONTAL_OFFER_BASE_HEIGHT * smaller.scale) <
      0.001,
  );
});
