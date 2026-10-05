import type { AddOnCmsItem, MerchandisedAddOn } from "../types/add-on-cms";
import type { ShapedProduct } from "../types/mews";

const fallbackAddOn = (product: ShapedProduct): MerchandisedAddOn => ({
  ...product,
  displayId: `mews:${product.id}`,
  cmsItemId: null,
  imageUrl: null,
  contentSource: "mews",
});

export function mergeAddOnMerchandising(
  liveProducts: readonly ShapedProduct[],
  cmsItems: readonly AddOnCmsItem[],
): MerchandisedAddOn[] {
  if (!cmsItems.length) return liveProducts.map(fallbackAddOn);

  const liveById = new Map(liveProducts.map((product) => [product.id, product]));

  return cmsItems.flatMap((item) => {
    if (!item.mewsProductId) return [];
    const live = liveById.get(item.mewsProductId);
    if (!live) return [];

    return [{
      ...live,
      displayId: item.id,
      cmsItemId: item.id,
      name: item.itemName || item.name || live.name,
      description:
        item.longDescription ||
        item.shortDescription ||
        live.description,
      imageUrl: item.imageUrl,
      contentSource: "webflow" as const,
    }];
  });
}
