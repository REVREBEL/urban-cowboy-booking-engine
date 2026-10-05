import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeWebflowRateCard,
  normalizeWebflowRateCards,
  webflowOptionNames,
} from "../worker/webflow/rate-cards.ts";

const options = webflowOptionNames({
  fields: [
    {
      slug: "card-fill",
      validations: { options: [{ id: "filled-id", name: "Filled" }, { id: "outline-id", name: "Outline" }] },
    },
    {
      slug: "theme",
      validations: { options: [{ id: "green-id", name: "Green" }] },
    },
  ],
});

test("normalizes the current Webflow Offers slugs", () => {
  const card = normalizeWebflowRateCard({
    id: "cms-card-1",
    isArchived: false,
    isDraft: false,
    fieldData: {
      name: "Ride Easy",
      "mews-rate-id": "mews-rate-123",
      active: true,
      "default-card": true,
      "sort-order": 4,
      "full-card": { url: "https://cdn.example/full.jpg" },
      "compact-card": { url: "https://cdn.example/compact.jpg" },
      "card-fill": "outline-id",
      theme: "green-id",
      headline: "Ride Easy",
      description: "Keep your options open.",
      eyebrow: "Best flexible rate",
    },
  }, options);

  assert.deepEqual(card, {
    id: "cms-card-1",
    name: "Ride Easy",
    mewsRateId: "mews-rate-123",
    isDefault: true,
    active: true,
    sortOrder: 4,
    desktopArtworkUrl: "https://cdn.example/full.jpg",
    mobileArtworkUrl: "https://cdn.example/compact.jpg",
    desktopOverlayPosition: "normal",
    mobileOverlayPosition: "normal",
    buttonStyle: "outline",
    theme: "green",
    fontPair: "brothers-bianco",
    eyebrow: "Best flexible rate",
    headline: "Ride Easy",
    description: "Keep your options open.",
    supportingText: null,
  });
});

test("marks draft and archived cards inactive", () => {
  const cards = normalizeWebflowRateCards([
    { id: "draft", isDraft: true, fieldData: { name: "Draft", active: true, headline: "H", description: "D" } },
    { id: "archived", isArchived: true, fieldData: { name: "Archived", active: true, headline: "H", description: "D" } },
  ]);

  assert.deepEqual(cards.map((card) => card.active), [false, false]);
});

test("skips structurally invalid Webflow items", () => {
  const cards = normalizeWebflowRateCards([
    { id: "missing-name", fieldData: { active: true } },
    { id: "valid", fieldData: { name: "Valid", active: true, headline: "Headline", description: "Description" } },
  ]);

  assert.equal(cards.length, 1);
  assert.equal(cards[0]?.id, "valid");
});
