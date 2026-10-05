import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeWebflowAddOn,
  normalizeWebflowAddOns,
  onRequestGet,
} from "../worker/webflow/add-ons.ts";
import { mergeAddOnMerchandising } from "../src/lib/addOnMerchandising.ts";
import type { ShapedProduct } from "../src/types/mews.ts";

const liveProduct: ShapedProduct = {
  id: "mews-product-1",
  knownAddOn: null,
  name: "Mews Product",
  description: "Mews description",
  price: 42,
  currency: "USD",
  chargingMode: "Once",
  imageId: "mews-image-1",
  property: "hotel",
};

test("normalizes published Webflow add-on merchandising fields", () => {
  const item = normalizeWebflowAddOn({
    id: "cms-1",
    isArchived: false,
    fieldData: {
      name: "Fresh Cut Flowers",
      "item-name": "Fresh Cut Flowers",
      "short-description": "Short",
      "long-description": "Long editorial description",
      "mews-product-id": "mews-product-1",
      image: { url: "https://cdn.example/flowers.jpg" },
    },
  });

  assert.deepEqual(item, {
    id: "cms-1",
    name: "Fresh Cut Flowers",
    itemName: "Fresh Cut Flowers",
    shortDescription: "Short",
    longDescription: "Long editorial description",
    mewsProductId: "mews-product-1",
    imageUrl: "https://cdn.example/flowers.jpg",
  });
});

test("allows multiple CMS cards to share one Mews Product ID without duplicating booking identity", () => {
  const merged = mergeAddOnMerchandising(
    [liveProduct],
    [
      {
        id: "cms-cake",
        name: "Celebration Cake",
        itemName: "Celebration Cake",
        shortDescription: null,
        longDescription: "Cake copy",
        mewsProductId: "mews-product-1",
        imageUrl: "https://cdn.example/cake.jpg",
      },
      {
        id: "cms-bath",
        name: "Bathing Ritual Kit",
        itemName: "Bathing Ritual Kit",
        shortDescription: null,
        longDescription: "Bath copy",
        mewsProductId: "mews-product-1",
        imageUrl: "https://cdn.example/bath.jpg",
      },
    ],
  );

  assert.equal(merged.length, 2);
  assert.deepEqual(merged.map((item) => item.displayId), ["cms-cake", "cms-bath"]);
  assert.deepEqual(merged.map((item) => item.id), ["mews-product-1", "mews-product-1"]);
  assert.deepEqual(merged.map((item) => item.price), [42, 42]);
  assert.deepEqual(merged.map((item) => item.name), ["Celebration Cake", "Bathing Ritual Kit"]);
});

test("skips CMS add-ons that are not bound to a live Mews product", () => {
  const merged = mergeAddOnMerchandising(
    [liveProduct],
    [
      {
        id: "cms-unbound",
        name: "Future Add On",
        itemName: "Future Add On",
        shortDescription: null,
        longDescription: "Not live yet",
        mewsProductId: null,
        imageUrl: "https://cdn.example/future.jpg",
      },
    ],
  );

  assert.deepEqual(merged, []);
});

test("falls back to Mews presentation when Webflow content is unavailable", () => {
  const merged = mergeAddOnMerchandising([liveProduct], []);
  assert.equal(merged.length, 1);
  assert.equal(merged[0]?.displayId, "mews:mews-product-1");
  assert.equal(merged[0]?.contentSource, "mews");
  assert.equal(merged[0]?.price, 42);
});

test("fetches only published Webflow add-on items and never exposes the CMS token", async () => {
  const originalFetch = globalThis.fetch;
  const requested: string[] = [];

  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = String(input);
    requested.push(url);

    if (url.includes("/collections/add-ons-123/items/live?limit=100")) {
      return new Response(JSON.stringify({
        items: [
          {
            id: "cms-live",
            isArchived: false,
            fieldData: {
              name: "Live Add On",
              "mews-product-id": "mews-product-1",
            },
          },
        ],
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("not found", { status: 404 });
  }) as typeof fetch;

  try {
    const response = await onRequestGet({
      env: {
        WEBFLOW_CMS_API_TOKEN: "secret-token",
        WEBFLOW_ADD_ON_COLLECTION_ID: "add-ons-123",
      } as never,
    });

    const body = await response.json() as { addOns: unknown[] };

    assert.equal(response.status, 200);
    assert.equal(body.addOns.length, 1);
    assert.equal(requested.some((url) => url.includes("/items/live?limit=100")), true);
    assert.equal(JSON.stringify(body).includes("secret-token"), false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("archived and structurally invalid Webflow add-ons are ignored", () => {
  const items = normalizeWebflowAddOns([
    { id: "archived", isArchived: true, fieldData: { name: "Archived" } },
    { id: "missing-name", isArchived: false, fieldData: {} },
    { id: "valid", isArchived: false, fieldData: { name: "Valid" } },
  ]);

  assert.deepEqual(items.map((item) => item.id), ["valid"]);
});
