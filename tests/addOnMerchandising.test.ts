import assert from "node:assert/strict";
import test from "node:test";
import { mergeAddOnMerchandising } from "../src/lib/addOnMerchandising.ts";
import type { AddOnCmsItem } from "../src/types/add-on-cms.ts";
import type { ShapedProduct } from "../src/types/mews.ts";

const live = (id: string, name: string): ShapedProduct => ({
  id,
  knownAddOn: null,
  name,
  description: `${name} from Mews`,
  price: 25,
  currency: "USD",
  chargingMode: "Once",
  imageId: null,
  property: "hotel",
});

test("Webflow merchandising overlays matching Mews products without hiding unbound live add-ons", () => {
  const products = [
    live("wine", "Welcome Wine"),
    live("truffles", "Chocolate Truffles"),
  ];

  const cms: AddOnCmsItem[] = [
    {
      id: "wine-card",
      name: "Let's Drink Wine",
      itemName: "Let's Drink Wine",
      shortDescription: null,
      longDescription: "CMS wine copy",
      mewsProductId: "wine",
      imageUrl: "https://example.com/wine.jpg",
    },
  ];

  const merged = mergeAddOnMerchandising(products, cms);

  assert.equal(merged.length, 2);
  assert.equal(merged[0]?.displayId, "wine-card");
  assert.equal(merged[0]?.name, "Let's Drink Wine");
  assert.equal(merged[0]?.contentSource, "webflow");

  const truffles = merged.find((item) => item.id === "truffles");
  assert.ok(truffles);
  assert.equal(truffles.displayId, "mews:truffles");
  assert.equal(truffles.contentSource, "mews");
  assert.equal(truffles.name, "Chocolate Truffles");
});

test("multiple CMS cards may share one Mews product without adding a duplicate native fallback", () => {
  const products = [live("wine", "Welcome Wine")];
  const cms: AddOnCmsItem[] = [
    {
      id: "wine-card",
      name: "Wine",
      itemName: "Let's Drink Wine",
      shortDescription: null,
      longDescription: null,
      mewsProductId: "wine",
      imageUrl: null,
    },
    {
      id: "ritual-card",
      name: "Ritual",
      itemName: "Bathing Ritual Kit",
      shortDescription: null,
      longDescription: null,
      mewsProductId: "wine",
      imageUrl: null,
    },
  ];

  const merged = mergeAddOnMerchandising(products, cms);

  assert.equal(merged.length, 2);
  assert.deepEqual(
    merged.map((item) => item.displayId),
    ["wine-card", "ritual-card"],
  );
});
