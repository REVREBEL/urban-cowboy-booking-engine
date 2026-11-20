"use client";

import { useState } from "react";
import { InlineUpsell, UpsellCard } from "../../src/components/booking/extras/upsell-card";
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

function UpsellCardDemo() {
  const [selected, setSelected] = useState(false);
  const [detail, setDetail] = useState("closed");
  return (
    <div className="w-full rounded-xl bg-paper p-4 sm:p-6">
      <UpsellCard
        product={breakfast}
        imageBaseUrl={process.env.NEXT_PUBLIC_DOCS_BASE_PATH ?? ""}
        selected={selected}
        nightsCount={3}
        guestsCount={2}
        onToggle={() => setSelected((value) => !value)}
      />
      <button type="button" className="sr-only" onClick={() => setDetail("toggled")}>
        Card action
      </button>
      <p className="sr-only" role="status">{`${selected ? "Selected" : "Not selected"} · ${detail}`}</p>
    </div>
  );
}

export const upsellCardStory = defineStory({
  Component: UpsellCardDemo,
  args: { initial: {} },
});
