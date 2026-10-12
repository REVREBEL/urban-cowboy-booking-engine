import assert from "node:assert/strict";
import test from "node:test";
import {
  analyzeImageContrast,
  contrastTokenForTone,
  imageContrastColor,
} from "../src/lib/imageContrast.ts";

test("contrastTokenForTone returns correct CSS variable for dark and light tones", () => {
  assert.equal(contrastTokenForTone("dark"), "var(--icon-color-light)");
  assert.equal(contrastTokenForTone("light"), "var(--icon-color-dark)");
});

test("analyzeImageContrast falls back safely when image natural dimensions are zero or uninitialized", () => {
  const mockImage = {
    naturalWidth: 0,
    naturalHeight: 0,
  } as unknown as HTMLImageElement;

  const result = analyzeImageContrast(mockImage);
  assert.deepEqual(result, { tone: "dark", luminance: 0 });

  const token = imageContrastColor(mockImage);
  assert.equal(token, "var(--icon-color-light)");
});
