import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeConfiguredLocations,
  normalizeLocationItem,
} from "../worker/webflow/locations.ts";

test("normalizes footer content from the published Locations CMS item", () => {
  const location = normalizeLocationItem({
    id: "catskills-item",
    isArchived: false,
    isDraft: false,
    fieldData: {
      "full-location-name": "Urban Cowboy Lodge & Resort",
      city: "Big Indian",
      state: "NY",
      "privacy-policy": "https://example.com/privacy",
      "terms-conditions": "https://example.com/terms",
      accessibility: "https://example.com/accessibility",
    },
  });

  assert.deepEqual(location, {
    id: "catskills-item",
    fullLocationName: "Urban Cowboy Lodge & Resort",
    productionLayout: "card",
    demoLayout: "card",
    enableDemoEngine: false,
    featureSectionEnabled: false,
    features: [],
    city: "Big Indian",
    state: "NY",
    privacyPolicyUrl: "https://example.com/privacy",
    termsConditionsUrl: "https://example.com/terms",
    accessibilityUrl: "https://example.com/accessibility",
  });
});


test("normalizes PhotoArrival feature stories and Webflow image URLs", () => {
  const location = normalizeLocationItem({
    id: "catskills-item",
    isArchived: false,
    isDraft: false,
    fieldData: {
      "full-location-name": "Urban Cowboy Lodge & Resort",
      "enable-feature-section": true,
      "feature-icon-1": { url: "https://cdn.example.com/hammock.svg" },
      "feature-headline-1": "Disappear for a While",
      "feature-paragraph-1": "Trade pavement for mountain air.",
      "feature-icon-2": { url: "https://cdn.example.com/sauna.svg" },
      "feature-headline-2": "Soak It All In",
      "feature-paragraph-2": "Slow the whole operation down.",
    },
  });

  assert.equal(location?.featureSectionEnabled, true);
  assert.deepEqual(location?.features, [
    {
      iconUrl: "https://cdn.example.com/hammock.svg",
      headline: "Disappear for a While",
      paragraph: "Trade pavement for mountain air.",
    },
    {
      iconUrl: "https://cdn.example.com/sauna.svg",
      headline: "Soak It All In",
      paragraph: "Slow the whole operation down.",
    },
  ]);
});

test("blank legal URLs normalize to null so footer labels can be hidden", () => {
  const location = normalizeLocationItem({
    id: "catskills-item",
    isArchived: false,
    isDraft: false,
    fieldData: {
      "full-location-name": "Urban Cowboy Lodge & Resort",
      city: "Big Indian",
      state: "NY",
      "privacy-policy": null,
      "terms-conditions": "   ",
      accessibility: null,
    },
  });

  assert.equal(location?.privacyPolicyUrl, null);
  assert.equal(location?.termsConditionsUrl, null);
  assert.equal(location?.accessibilityUrl, null);
});

test("configured Mews property keys map to their Webflow Location item IDs", () => {
  const locations = normalizeConfiguredLocations(
    [
      {
        id: "catskills-item",
        isArchived: false,
        isDraft: false,
        fieldData: {
          "full-location-name": "Urban Cowboy Lodge & Resort",
          city: "Big Indian",
          state: "NY",
        },
      },
      {
        id: "nashville-item",
        isArchived: false,
        isDraft: false,
        fieldData: {
          "full-location-name": "Urban Cowboy Hotel Nashville East",
          city: "Nashville",
          state: "TN",
        },
      },
    ],
    [
      { key: "hotel", locationCmsItemId: "catskills-item" },
      { key: "future-location", locationCmsItemId: "nashville-item" },
    ],
  );

  assert.equal(locations.hotel?.fullLocationName, "Urban Cowboy Lodge & Resort");
  assert.equal(locations["future-location"]?.city, "Nashville");
});

test("draft, archived, or unbound CMS locations are not exposed", () => {
  const locations = normalizeConfiguredLocations(
    [
      {
        id: "draft-item",
        isDraft: true,
        fieldData: { "full-location-name": "Draft Location" },
      },
      {
        id: "archived-item",
        isArchived: true,
        fieldData: { "full-location-name": "Archived Location" },
      },
      {
        id: "unbound-item",
        isArchived: false,
        isDraft: false,
        fieldData: { "full-location-name": "Unbound Location" },
      },
    ],
    [
      { key: "draft", locationCmsItemId: "draft-item" },
      { key: "archived", locationCmsItemId: "archived-item" },
    ],
  );

  assert.deepEqual(locations, {});
});

test("Locations layout option IDs map independently for production and demo", () => {
  const make = (production: unknown, demo: unknown) => normalizeLocationItem({
    id: "catskills-item",
    isArchived: false,
    isDraft: false,
    fieldData: {
      "full-location-name": "Urban Cowboy Lodge & Resort",
      "production-layout": production,
      "demo-layout": demo,
    },
  });
  assert.equal(make("f4859a16a8556038b0f026679aaa6a02", "b5074dbc31924c6f9feb79f1a6bdfd2c")?.productionLayout, "photo");
  assert.equal(make("f4859a16a8556038b0f026679aaa6a02", "b5074dbc31924c6f9feb79f1a6bdfd2c")?.demoLayout, "card");
  assert.equal(make("97075d405111e533c78daa0afa48bef5", "2142905a00c88401810632b026107cf2")?.productionLayout, "card");
  assert.equal(make("97075d405111e533c78daa0afa48bef5", "2142905a00c88401810632b026107cf2")?.demoLayout, "photo");
  assert.equal(make(null, null)?.productionLayout, "card");
  assert.equal(make("Photo Layout", "Photo Layout")?.demoLayout, "card");
});
