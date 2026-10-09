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
    city: "Big Indian",
    state: "NY",
    privacyPolicyUrl: "https://example.com/privacy",
    termsConditionsUrl: "https://example.com/terms",
    accessibilityUrl: "https://example.com/accessibility",
  });
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
