import type { ShapedProduct } from "./mews";

export interface AddOnCmsItem {
  id: string;
  name: string;
  itemName: string | null;
  shortDescription: string | null;
  longDescription: string | null;
  mewsProductId: string | null;
  imageUrl: string | null;
}

export interface MerchandisedAddOn extends ShapedProduct {
  /** Unique presentation identity. Different CMS cards may share one Mews product. */
  displayId: string;
  cmsItemId: string | null;
  imageUrl: string | null;
  contentSource: "webflow" | "mews";
}
