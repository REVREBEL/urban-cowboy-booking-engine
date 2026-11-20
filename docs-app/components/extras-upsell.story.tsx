"use client";

import { useState } from "react";
import { InlineUpsell } from "../../src/components/booking/extras/upsell-card";
import type { ShapedProduct } from "../../src/types/mews";
import { defineStory } from "../lib/story";

const breakfast: ShapedProduct = {
  id: "extra-breakfast",
  knownAddOn: null,
  name: "Breakfast for two",
  description: "Fresh pastries, coffee and a view of the trees.",
  price: 48,
  currency: "USD",
  chargingMode: "per_stay",
  imageId: null,
  property: null,
};

function InlineUpsellDemo() {
  const [added, setAdded] = useState(false);
  return (
    <div className="w-full rounded-xl bg-paper p-4 sm:p-6">
      <InlineUpsell product={breakfast} added={added} onToggle={() => setAdded((value) => !value)} />
      <p className="sr-only" role="status">{added ? "Extra added" : "Extra not added"}</p>
    </div>
  );
}

export const inlineUpsellStory = defineStory({
  Component: InlineUpsellDemo,
  args: { initial: {} },
});
