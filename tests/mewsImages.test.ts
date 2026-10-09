import assert from "node:assert/strict";
import test from "node:test";
import { orderedCategoryImageIds } from "../src/lib/mewsImages.ts";

test("uses Mews category assignment ordering instead of legacy ImageIds order", () => {
  assert.deepEqual(
    orderedCategoryImageIds(
      "room-a",
      [
        { CategoryId: "room-a", ImageId: "third", Ordering: 30 },
        { CategoryId: "another-room", ImageId: "ignored", Ordering: 0 },
        { CategoryId: "room-a", ImageId: "first", Ordering: 10 },
        { CategoryId: "room-a", ImageId: "second", Ordering: 20 },
      ],
      ["legacy-first", "legacy-second"],
    ),
    ["first", "second", "third"],
  );
});

test("falls back to legacy ImageIds when assignments are absent", () => {
  assert.deepEqual(
    orderedCategoryImageIds("room-a", [], ["legacy-first", "legacy-second"]),
    ["legacy-first", "legacy-second"],
  );
});
