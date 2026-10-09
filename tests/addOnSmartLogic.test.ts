import assert from "node:assert/strict";
import test from "node:test";
import {
  addOnKind,
  addOnStayDates,
  defaultAddOnPreference,
  deliveryTimeOptions,
  formatAddOnPreferenceNote,
} from "../src/components/booking/extras/addon-smart-logic.ts";
import type { MerchandisedAddOn } from "../src/types/add-on-cms.ts";

const base: MerchandisedAddOn = {
  id: "mews-product-1",
  displayId: "cms-1",
  cmsItemId: "cms-1",
  knownAddOn: "FLOWER_BOUQUET",
  name: "Fresh Cut Flowers",
  description: "Flowers in your room.",
  price: 50,
  currency: "USD",
  chargingMode: "Once",
  imageId: null,
  imageUrl: null,
  property: "hotel",
  contentSource: "webflow",
};

test("Webflow content determines smart behavior even when it borrows another Mews product", () => {
  const cake: MerchandisedAddOn = {
    ...base,
    displayId: "cms-cake",
    name: "Celebration Cake",
    description: "Birthday and anniversary cake.",
  };

  assert.equal(addOnKind(cake), "celebration-cake");

  const preference = defaultAddOnPreference(cake, {
    checkIn: "2026-10-15",
    checkOut: "2026-10-17",
    nights: 2,
  });

  assert.equal(preference.isGift, true);
  assert.equal(preference.includeCard, true);
  assert.equal(preference.selectedTime, "Evening service (post-dinner, 8:00 PM)");
});

test("known Mews add-on identity remains a fallback when no Webflow alias is present", () => {
  const mewsFlower: MerchandisedAddOn = {
    ...base,
    displayId: "mews:mews-product-1",
    cmsItemId: null,
    contentSource: "mews",
    name: "Anything",
    description: "",
  };

  assert.equal(addOnKind(mewsFlower), "fresh-cut-flowers");
});

test("wine gets a useful default selection and arrival delivery", () => {
  const wine: MerchandisedAddOn = {
    ...base,
    knownAddOn: "WELCOME_WINE",
    displayId: "cms-wine",
    name: "Let's Drink Wine",
    description: "Bottle waiting in your room.",
  };

  const preference = defaultAddOnPreference(wine, {
    checkIn: "2026-10-15",
    checkOut: "2026-10-16",
    nights: 1,
  });

  assert.equal(preference.itemCustomization, "Natural Red (Earth & Fruit)");
  assert.equal(preference.selectedDateIso, "2026-10-15");
  assert.equal(preference.selectedTime, "Chilled & waiting in room upon check-in");
});

test("multi-night stays produce one scheduling choice per night", () => {
  const dates = addOnStayDates({
    checkIn: "2026-10-15",
    checkOut: "2026-10-18",
    nights: 3,
  });

  assert.deepEqual(dates.map((date) => date.isoDate), [
    "2026-10-15",
    "2026-10-16",
    "2026-10-17",
  ]);
  assert.equal(dates[0]?.isArrival, true);
  assert.equal(dates[2]?.isDepartureNight, true);
  assert.match(deliveryTimeOptions(dates[0]!)[0]!, /check-in/);
  assert.match(deliveryTimeOptions(dates[1]!)[0]!, /Morning/);
});

test("reservation note formatter preserves operational smart-form instructions", () => {
  const line = formatAddOnPreferenceNote("Celebration Cake", {
    selectedDate: "Friday, 10/16",
    selectedTime: "Evening service (post-dinner, 8:00 PM)",
    itemCustomization: "Happy Birthday Alex!",
    dietaryNote: "Nut allergy",
    isGift: true,
    giftRecipient: "Alex",
    includeCard: true,
    cardMessage: "See you by the fire.",
  });

  assert.match(line ?? "", /Celebration Cake/);
  assert.match(line ?? "", /Happy Birthday Alex!/);
  assert.match(line ?? "", /Nut allergy/);
  assert.match(line ?? "", /recipient: Alex/);
  assert.match(line ?? "", /See you by the fire/);
});
