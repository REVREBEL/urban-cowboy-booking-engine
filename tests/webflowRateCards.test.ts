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
      validations: {
        options: [
          { id: "4d69ebd51289a1a63bcb4aa47427cb43", name: "Filled" },
          { id: "7988397e27407c562257584fc4666cc6", name: "Outline" },
        ],
      },
    },
    {
      slug: "button-color",
      validations: {
        options: [
          { id: "06fad834bc888d6ccf15c26432c8c6ab", name: "Smoke" },
        ],
      },
    },
    {
      slug: "text-color",
      validations: {
        options: [
          { id: "7c79e1dcd65dee16f6d56d5a0e1559a0", name: "Smoke" },
        ],
      },
    },
    {
      slug: "rate-font",
      validations: {
        options: [
          { id: "8cf8fa0bae9e4ba30984524d4a42c215", name: "Noto Serif Tibetan & Lato" },
        ],
      },
    },
    {
      slug: "cancellation-penalty-window-period",
      validations: {
        options: [
          { id: "96d9f63af466d3052a7b0ab42fc1132d", name: "Hours" },
          { id: "a9907e83d9c4b7a0dd29301f0f99eaeb", name: "Days" },
        ],
      },
    },
  ],
});

test("normalizes the current Webflow Offers fields using real option IDs", () => {
  const card = normalizeWebflowRateCard({
    id: "6ac1c479ba0bd3fffaec54df",
    isArchived: false,
    isDraft: false,
    fieldData: {
      name: "Ride Easy",
      "mews-rate-id": "49941fcd-164b-418c-8b7d-b1060070665c",
      active: true,
      "member-only": false,
      "cancellation-penalty-window": 14,
      "cancellation-penalty-window-period": "a9907e83d9c4b7a0dd29301f0f99eaeb",
      "full-card": { url: "https://cdn.example/full.jpg" },
      "compact-card": { url: "https://cdn.example/compact.jpg" },
      "button-color": "06fad834bc888d6ccf15c26432c8c6ab",
      "text-color": "7c79e1dcd65dee16f6d56d5a0e1559a0",
      "card-fill": "7988397e27407c562257584fc4666cc6",
      "rate-font": "8cf8fa0bae9e4ba30984524d4a42c215",
      "call-to-action": "Book Now",
      headline: "Ride Easy",
      description: "Our standard rate for guests who want a little more freedom around their plans.",
      eyebrow: "Keep Your Options Open",
    },
  }, options);

  assert.deepEqual(card, {
    id: "6ac1c479ba0bd3fffaec54df",
    name: "Ride Easy",
    mewsRateId: "49941fcd-164b-418c-8b7d-b1060070665c",
    isDefault: false,
    active: true,
    sortOrder: 0,
    memberOnly: false,
    desktopArtworkUrl: "https://cdn.example/full.jpg",
    mobileArtworkUrl: "https://cdn.example/compact.jpg",
    desktopOverlayPosition: "normal",
    mobileOverlayPosition: "normal",
    buttonStyle: "outline",
    buttonColor: "smoke",
    textColor: "smoke",
    fontPair: "noto-serif-tibetan-lato",
    ctaLabel: "Book Now",
    cancellationPenaltyWindow: 14,
    cancellationPenaltyWindowPeriod: "days",
    eyebrow: "Keep Your Options Open",
    headline: "Ride Easy",
    description: "Our standard rate for guests who want a little more freedom around their plans.",
    supportingText: null,
  });
});

test("maps current CMS member-only and specialty font options", () => {
  const localOptions = webflowOptionNames({
    fields: [
      {
        slug: "rate-font",
        validations: {
          options: [
            { id: "d0c50f4d6598a380c116b3839b2d2a76", name: "Filicudi & Special Elite" },
          ],
        },
      },
      {
        slug: "button-color",
        validations: {
          options: [{ id: "3d5c6eeaef47677bd42a3651e81b2602", name: "Nude Ember" }],
        },
      },
      {
        slug: "text-color",
        validations: {
          options: [{ id: "6e885b2e73caec02a8e2c440c2cf5449", name: "Paper" }],
        },
      },
    ],
  });

  const card = normalizeWebflowRateCard({
    id: "member",
    fieldData: {
      name: "Welcome to the Outfit",
      active: true,
      "member-only": true,
      "rate-font": "d0c50f4d6598a380c116b3839b2d2a76",
      "button-color": "3d5c6eeaef47677bd42a3651e81b2602",
      "text-color": "6e885b2e73caec02a8e2c440c2cf5449",
      headline: "Welcome to the Outfit",
      description: "Share your email and unlock our direct-only member rate.",
    },
  }, localOptions);

  assert.equal(card?.memberOnly, true);
  assert.equal(card?.fontPair, "filicudi-special-elite");
  assert.equal(card?.buttonColor, "nude-ember");
  assert.equal(card?.textColor, "paper");
});

test("archived or editor-disabled cards are inactive", () => {
  const cards = normalizeWebflowRateCards([
    { id: "archived", isArchived: true, fieldData: { name: "Archived", active: true, headline: "H", description: "D" } },
    { id: "disabled", isArchived: false, fieldData: { name: "Disabled", active: false, headline: "H", description: "D" } },
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
