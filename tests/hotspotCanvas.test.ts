// COW-84: pin coordinates must survive object-fit letterboxing for any aspect ratio.
import assert from "node:assert/strict";
import test from "node:test";
import { containedRect, nudgePoint, pointToSource } from "../src/lib/hotspotCanvas.ts";

test("a 16:9 image fills a 16:9 container without offsets", () => {
  const rect = containedRect({ width: 1600, height: 900 }, { width: 1600, height: 900 });
  assert.deepEqual(rect, { left: 0, top: 0, width: 1600, height: 900 });
});

test("a portrait image is centred horizontally inside a wide container", () => {
  const rect = containedRect({ width: 1000, height: 600 }, { width: 600, height: 900 });
  assert.equal(rect.width, 400);
  assert.equal(rect.height, 600);
  assert.equal(rect.left, 300);
  assert.equal(rect.top, 0);
  assert.deepEqual(pointToSource({ x: 500, y: 300 }, rect), { x: 0.5, y: 0.5 });
  assert.equal(pointToSource({ x: 100, y: 300 }, rect), null, "letterbox clicks are ignored");
});

test("a wide image is centred vertically inside a tall container", () => {
  const rect = containedRect({ width: 400, height: 800 }, { width: 1600, height: 800 });
  assert.equal(rect.width, 400);
  assert.equal(rect.height, 200);
  assert.equal(rect.left, 0);
  assert.equal(rect.top, 300);
  assert.deepEqual(pointToSource({ x: 200, y: 400 }, rect), { x: 0.5, y: 0.5 });
  assert.equal(pointToSource({ x: 200, y: 100 }, rect), null);
});

test("empty dimensions never produce a divide-by-zero result", () => {
  const rect = containedRect({ width: 0, height: 0 }, { width: 100, height: 100 });
  assert.equal(pointToSource({ x: 0, y: 0 }, rect), null);
});

test("arrow keys nudge the placement crosshair and clamp at the edges", () => {
  const centre = { x: 0.5, y: 0.5 };
  assert.deepEqual(nudgePoint(centre, "ArrowRight"), { x: 0.51, y: 0.5 });
  assert.deepEqual(nudgePoint(centre, "ArrowLeft"), { x: 0.49, y: 0.5 });
  assert.deepEqual(nudgePoint(centre, "ArrowUp"), { x: 0.5, y: 0.49 });
  assert.deepEqual(nudgePoint(centre, "ArrowDown"), { x: 0.5, y: 0.51 });
  assert.deepEqual(nudgePoint({ x: 0, y: 0 }, "ArrowLeft"), { x: 0, y: 0 });
  assert.deepEqual(nudgePoint({ x: 1, y: 1 }, "ArrowUp"), { x: 1, y: 0.99 });
  assert.equal(nudgePoint(centre, "Enter"), null);
});
