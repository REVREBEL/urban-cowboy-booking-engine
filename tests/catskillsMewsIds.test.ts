import assert from "node:assert/strict";
import test from "node:test";
import {
  CATSKILLS_MEWS_IDS,
  isSystemFeeProductId,
  knownAddOnKey,
  knownRateGroupKey,
} from "../src/lib/catskillsMewsIds.ts";
import { shapeProducts } from "../src/lib/shaping.ts";
import { propertiesForEnv } from "../worker/mews/_lib.ts";
import type { HotelConfig } from "../src/types/mews.ts";

test("records the confirmed Catskills property and age-category identifiers", () => {
  assert.equal(
    CATSKILLS_MEWS_IDS.configurationId,
    "4725ace3-6b93-439f-a549-b4bc00ae1d10",
  );
  assert.equal(
    CATSKILLS_MEWS_IDS.hotelId,
    "8bd38131-c371-4625-9c29-b10600705d34",
  );
  assert.equal(
    CATSKILLS_MEWS_IDS.ageCategories.adult,
    "8f3ceb39-5c40-417a-b9a5-b106007064f8",
  );
  assert.equal(
    CATSKILLS_MEWS_IDS.ageCategories.child,
    "db093f0b-738e-4afe-9191-b106007065ff",
  );
});

test("derives the active property configuration from deployment env values", () => {
  const [property] = propertiesForEnv({
    MEWS_CONFIG_ID: CATSKILLS_MEWS_IDS.configurationId,
    MEWS_ADULT_AGE_CATEGORY_ID: CATSKILLS_MEWS_IDS.ageCategories.adult,
    MEWS_CHILD_AGE_CATEGORY_ID: CATSKILLS_MEWS_IDS.ageCategories.child,
  } as any);

  assert.equal(property.configId, CATSKILLS_MEWS_IDS.configurationId);
  assert.equal(property.adultAgeCategoryId, CATSKILLS_MEWS_IDS.ageCategories.adult);
  assert.equal(property.childAgeCategoryId, CATSKILLS_MEWS_IDS.ageCategories.child);
});

test("classifies known rate groups and guest add-ons by durable Mews IDs", () => {
  assert.equal(
    knownRateGroupKey(CATSKILLS_MEWS_IDS.rateGroups.FLEXIBLE),
    "FLEXIBLE",
  );
  assert.equal(
    knownRateGroupKey(CATSKILLS_MEWS_IDS.rateGroups.NON_REFUNDABLE),
    "NON_REFUNDABLE",
  );
  assert.equal(
    knownAddOnKey(CATSKILLS_MEWS_IDS.addOns.WELCOME_WINE),
    "WELCOME_WINE",
  );
});

test("system fee products are not exposed as generic guest add-ons", () => {
  const hotel: HotelConfig = {
    ImageBaseUrl: "",
    Id: CATSKILLS_MEWS_IDS.hotelId,
    Name: { "en-US": "Urban Cowboy Lodge Catskills" },
    Description: null,
    DefaultCurrencyCode: "USD",
    RoomCategories: [],
    Products: [
      {
        Id: CATSKILLS_MEWS_IDS.fees.RESORT_FEE,
        Name: { "en-US": "Resort Fee" },
        Description: null,
        CategoryId: null,
        ImageId: null,
        IncludedByDefault: false,
        AlwaysIncluded: false,
        Prices: { USD: 25 },
        ChargingMode: "PerNight",
        Property: "hotel",
      },
      {
        Id: CATSKILLS_MEWS_IDS.addOns.FLOWER_BOUQUET,
        Name: { "en-US": "Flower Bouquet" },
        Description: null,
        CategoryId: null,
        ImageId: null,
        IncludedByDefault: false,
        AlwaysIncluded: false,
        Prices: { USD: 50 },
        ChargingMode: "Once",
        Property: "hotel",
      },
    ],
    PaymentGateway: null,
  };

  const products = shapeProducts(hotel, "en-US");
  assert.deepEqual(products.map((product) => product.id), [
    CATSKILLS_MEWS_IDS.addOns.FLOWER_BOUQUET,
  ]);
  assert.equal(products[0]?.knownAddOn, "FLOWER_BOUQUET");
  assert.equal(isSystemFeeProductId(CATSKILLS_MEWS_IDS.fees.RESORT_FEE), true);
});
