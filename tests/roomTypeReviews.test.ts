import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeRoomTypeDescription,
  normalizeRoomTypeDescriptions,
  normalizeRoomTypeReview,
  normalizeRoomTypeReviews,
  webflowGetAllItems,
} from "../worker/webflow/room-type-reviews.ts";

const optionNames = new Map([
  ["google-id", "Google"],
  ["direct-id", "Direct"],
]);

test("published Webflow room review is keyed by Mews Room Type ID", () => {
  const reviews = normalizeRoomTypeReviews(
    [
      {
        id: "webflow-item",
        isArchived: false,
        isDraft: false,
        fieldData: {
          name: "Alpine Bathing Suite",
          "mews-room-type-id": "mews-room-type-123",
          review: "A wonderful stay.",
          "review-source": "google-id",
          "review-url": "https://example.com/review",
          "review-date": "2026-02-09T00:00:00.000Z",
          "reviewer-name-or-handle": "Tiffany",
        },
      },
    ],
    optionNames,
  );

  assert.deepEqual(reviews["mews-room-type-123"], {
    roomTypeId: "mews-room-type-123",
    quote: "A wonderful stay.",
    reviewer: "Tiffany",
    source: "Google",
    sourceUrl: "https://example.com/review",
    reviewDate: "2026-02-09T00:00:00.000Z",
  });
});

test("blank CMS review does not create a review fallback", () => {
  const review = normalizeRoomTypeReview(
    {
      id: "webflow-item",
      isArchived: false,
      isDraft: false,
      fieldData: {
        name: "Walden King",
        "mews-room-type-id": "mews-room-type-456",
        review: "   ",
        "review-source": "direct-id",
      },
    },
    optionNames,
  );

  assert.equal(review, null);
});

test("draft or archived room type reviews are not exposed", () => {
  const draft = normalizeRoomTypeReview({
    isDraft: true,
    fieldData: {
      "mews-room-type-id": "draft-room",
      review: "Draft review",
    },
  });

  const archived = normalizeRoomTypeReview({
    isArchived: true,
    fieldData: {
      "mews-room-type-id": "archived-room",
      review: "Archived review",
    },
  });

  assert.equal(draft, null);
  assert.equal(archived, null);
});

test("unknown review source metadata is omitted instead of leaking a Webflow option ID", () => {
  const review = normalizeRoomTypeReview({
    isArchived: false,
    isDraft: false,
    fieldData: {
      "mews-room-type-id": "mews-room-type-789",
      review: "The room was great.",
      "review-source": "internal-webflow-option-id",
    },
  });

  assert.equal(review?.source, null);
  assert.equal(review?.quote, "The room was great.");
});


test("normalizes published Webflow short and long descriptions by Mews Room Type ID", () => {
  const description = normalizeRoomTypeDescription({
    id: "cms-room",
    isArchived: false,
    isDraft: false,
    fieldData: {
      "mews-room-type-id": "mews-room-type-123",
      "short-description": "Concise card copy.",
      "long-description": "Long-form detail copy for the room experience.",
    },
  });

  assert.deepEqual(description, {
    roomTypeId: "mews-room-type-123",
    shortDescription: "Concise card copy.",
    longDescription: "Long-form detail copy for the room experience.",
  });
});

test("room descriptions are optional per field and ignore unpublished CMS items", () => {
  const descriptions = normalizeRoomTypeDescriptions([
    {
      id: "short-only",
      isArchived: false,
      isDraft: false,
      fieldData: {
        "mews-room-type-id": "short-room",
        "short-description": "Short only.",
        "long-description": "   ",
      },
    },
    {
      id: "draft-room",
      isArchived: false,
      isDraft: true,
      fieldData: {
        "mews-room-type-id": "draft-room",
        "short-description": "Should not leak.",
        "long-description": "Should not leak.",
      },
    },
  ]);

  assert.deepEqual(descriptions, {
    "short-room": {
      roomTypeId: "short-room",
      shortDescription: "Short only.",
      longDescription: null,
    },
  });
});

test("Webflow item pagination loads records beyond the first 100", async () => {
  const originalFetch = globalThis.fetch;
  const requestedOffsets: string[] = [];
  globalThis.fetch = async (input) => {
    const url = new URL(typeof input === "string" ? input : input.url);
    const offset = url.searchParams.get("offset") ?? "0";
    requestedOffsets.push(offset);
    const firstPage = Array.from({ length: 100 }, (_, index) => ({ id: `item-${index}` }));
    const items = offset === "0" ? firstPage : [{ id: "item-100" }, { id: "item-101" }];
    return new Response(JSON.stringify({ items, pagination: { limit: 100, offset: Number(offset), total: 102 } }));
  };

  try {
    const result = await webflowGetAllItems(
      { WEBFLOW_CMS_API_TOKEN: "test-token" } as never,
      "https://api.webflow.test/v2",
      "/collections/hotspots/items/live",
    );
    assert.equal(result.items?.length, 102);
    assert.deepEqual(requestedOffsets, ["0", "100"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
