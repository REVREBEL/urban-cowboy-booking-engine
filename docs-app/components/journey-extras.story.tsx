"use client";

import { useState } from "react";
import { PhotoExtrasStep } from "../../src/journey/PhotoExtrasStep";
import type { MerchandisedAddOn } from "../../src/types/add-on-cms";
import type { AddonSchedulePreference } from "../../src/components/booking/extras/addon-types";
import { defineStory } from "../lib/story";

const imageBaseUrl = process.env.NEXT_PUBLIC_DOCS_BASE_PATH ?? "";

const sauna: MerchandisedAddOn = {
  id: "docs-sauna",
  displayId: "docs-sauna",
  cmsItemId: "docs-sauna",
  name: "Estonian Sauna Session",
  description: "A wood-fired sauna session.",
  price: 45,
  currency: "USD",
  chargingMode: "perPerson",
  imageId: "sauna",
  imageUrl: `${imageBaseUrl}/assets/icons/buildings/estonian_sauna.svg`,
  contentSource: "webflow",
  knownAddOn: null,
  property: "Urban Cowboy Catskills",
};

interface ExtrasDemoProps {
  initialSelected: string[];
  products: MerchandisedAddOn[];
}

/** Docs-only selection harness; totals are local and no reservation is created. */
function ExtrasDemo({ initialSelected, products }: ExtrasDemoProps) {
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(initialSelected);
  const [selectedDisplayByProduct, setSelectedDisplayByProduct] = useState<Record<string, string>>({});
  const [preferences, setPreferences] = useState<Record<string, AddonSchedulePreference>>({});
  const [action, setAction] = useState<string | null>(null);

  const onToggle = (product: MerchandisedAddOn) => {
    setSelectedProductIds((current) =>
      current.includes(product.id) ? current.filter((id) => id !== product.id) : [...current, product.id],
    );
    setSelectedDisplayByProduct((current) => ({ ...current, [product.id]: product.displayId }));
  };
  const onSavePreference = (product: MerchandisedAddOn, preference: AddonSchedulePreference) => {
    setPreferences((current) => ({ ...current, [product.displayId]: preference }));
    if (!selectedProductIds.includes(product.id)) onToggle(product);
  };
  const extrasTotal = products
    .filter((product) => selectedProductIds.includes(product.id))
    .reduce((sum, product) => sum + product.price * (product.chargingMode === "perPerson" ? 2 : 1), 0);

  return (
    <div className="w-full">
      <PhotoExtrasStep
        products={products}
        selectedProductIds={selectedProductIds}
        selectedDisplayByProduct={selectedDisplayByProduct}
        lockedProductIds={new Set()}
        preferences={preferences}
        total={750 + extrasTotal}
        imageBaseUrl={imageBaseUrl}
        currency="USD"
        roomName="Alpine Bathing Suite"
        checkIn="2026-11-12"
        checkOut="2026-11-15"
        nights={3}
        guestsCount={2}
        onToggle={onToggle}
        onSavePreference={onSavePreference}
        onNext={() => setAction("Continue to review")}
        onBack={() => setAction("Back to rooms")}
      />
      <p className="sr-only" role="status">{action ?? "No action taken"}</p>
    </div>
  );
}

export const extrasAvailableStory = defineStory({
  Component: ExtrasDemo,
  args: { initial: { initialSelected: [], products: [sauna] } },
});

export const extrasSelectedStory = defineStory({
  Component: ExtrasDemo,
  args: { initial: { initialSelected: [sauna.id], products: [sauna] } },
});

export const extrasEmptyStory = defineStory({
  Component: ExtrasDemo,
  args: { initial: { initialSelected: [], products: [] } },
});
