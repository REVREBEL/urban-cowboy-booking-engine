import { useEffect, useMemo, useState } from "react";
import { useBooking } from "../state/booking";
import { t } from "../i18n";
import { money } from "../lib/format";
import { api } from "../lib/api";
import { mergeAddOnMerchandising } from "../lib/addOnMerchandising";
import { groupProducts, isHotelIncludedMeal, mandatoryReveillon, isReveillonProduct } from "../lib/shaping";
import { StepLayout } from "@/components/booking/layout/step-layout";
import { AddonCard } from "@/components/booking/extras/AddonCard";
import { AddonCustomizerModal } from "@/components/booking/extras/AddonCustomizerModal";
import type { AddonSchedulePreference } from "@/components/booking/extras/addon-types";
import type { AddOnCmsItem, MerchandisedAddOn } from "@/types/add-on-cms";
import { DataBadge } from "@/components/dev/data-badge";
import { IconArrowRight, IconCheck, IconSparkles } from "@/components/icons/cowboy-icons";

export function Extras() {
  const [customizingProduct, setCustomizingProduct] = useState<MerchandisedAddOn | null>(null);
  const [preferences, setPreferences] = useState<Record<string, AddonSchedulePreference>>({});
  const [cmsAddOns, setCmsAddOns] = useState<AddOnCmsItem[]>([]);
  const [selectedDisplayByProduct, setSelectedDisplayByProduct] = useState<Record<string, string>>({});
  const {
    products,
    productIds,
    toggleProduct,
    airportTransfer,
    setAirportTransfer,
    imageBaseUrl,
    nightsCount,
    guestsCount,
    checkIn,
    checkOut,
    selectedRoom,
    selectedRate,
    grandTotal,
    currency,
    goTo,
  } = useBooking();

  useEffect(() => {
    if (!selectedRoom || !selectedRate) goTo("results");
  }, [selectedRoom, selectedRate, goTo]);

  useEffect(() => {
    let alive = true;
    void api.addOns().then((items) => {
      if (alive) setCmsAddOns(items);
    });
    return () => {
      alive = false;
    };
  }, []);

  const merchandisedProducts = useMemo(
    () => mergeAddOnMerchandising(products, cmsAddOns),
    [products, cmsAddOns],
  );

  // Réveillons OBLIGATOIRES pour ces dates + hébergement (soir du 24/12 = Noël, soir du
  // 31/12 = Saint-Sylvestre) → affichés verrouillés ; les autres réveillons sont masqués.
  const forcedReveillonIds = useMemo(() => {
    const prop = selectedRoom?.property ?? null;
    return new Set(
      [
        mandatoryReveillon(products, prop, "noel", checkIn, checkOut),
        mandatoryReveillon(products, prop, "sylvestre", checkIn, checkOut),
      ]
        .filter((p): p is NonNullable<typeof p> => !!p)
        .map((p) => p.id),
    );
  }, [products, selectedRoom, checkIn, checkOut]);

  // On n'affiche QUE les extras de l'hébergement de la chambre choisie (step 2) :
  // un produit d'une autre config Mews est refusé à la réservation. De plus, à l'Hôtel
  // Hide breakfast/dinner extras when the selected rate already includes meals.
  // — sauf le petit-déjeuner flottant. Culture Créole & Villas montrent tout. Enfin, un
  // réveillon hors de ses dates (24/12 · 31/12) est masqué.
  const groups = useMemo(() => {
    const isHotel = selectedRoom?.property === "hotel";
    const visible = merchandisedProducts.filter(
      (p) =>
        (!p.property || p.property === selectedRoom?.property) &&
        !(isHotel && isHotelIncludedMeal(p)) &&
        (!isReveillonProduct(p) || forcedReveillonIds.has(p.id)),
    );
    return groupProducts(visible);
  }, [merchandisedProducts, selectedRoom, forcedReveillonIds]);

  // Room-upgrade step is disabled for the current demo, so Extras returns to Guest.
  const back = "guest" as const;

  const firstDisplayForProduct = useMemo(() => {
    const map = new Map<string, string>();
    for (const product of merchandisedProducts) {
      if (!map.has(product.id)) map.set(product.id, product.displayId);
    }
    return map;
  }, [merchandisedProducts]);

  const isDisplaySelected = (product: MerchandisedAddOn) =>
    productIds.includes(product.id) &&
    (selectedDisplayByProduct[product.id] ?? firstDisplayForProduct.get(product.id)) === product.displayId;

  const toggleDisplayProduct = (product: MerchandisedAddOn) => {
    const selected = productIds.includes(product.id);
    const selectedDisplay =
      selectedDisplayByProduct[product.id] ?? firstDisplayForProduct.get(product.id);

    if (selected && selectedDisplay === product.displayId) {
      toggleProduct(product.id);
      setSelectedDisplayByProduct((current) => {
        const next = { ...current };
        delete next[product.id];
        return next;
      });
      return;
    }

    setSelectedDisplayByProduct((current) => ({
      ...current,
      [product.id]: product.displayId,
    }));

    // Switching between two Webflow aliases for the same Mews product changes only
    // presentation identity. The Mews product remains selected exactly once.
    if (!selected) toggleProduct(product.id);
  };

  return (
    <StepLayout
      title={t("extras.title")}
      subtitle={t("extras.subtitle")}
      onBack={() => goTo(back)}
      backLabel={t("extras.backLabel")}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="inline-flex items-center gap-2 text-sm text-ink/60">
            <IconSparkles className="h-4 w-4 text-creole" />
            {productIds.length > 0
              ? t("extras.selectedCount", { count: productIds.length })
              : t("extras.optional")}
          </p>
          <DataBadge label="Extras · Webflow + Mews" />
        </div>

        {/* Property service outside Mews: an airport-transfer interest checkbox.
            N'entre pas dans le total ni la résa Mews — booléen envoyé à n8n (relance). */}
        <section>
          <div className="mb-3 flex items-center gap-3">
            <span className="h-5 w-1 rounded-full bg-turquoise" />
            <h2 className="font-display text-lg text-teal-deep">{t("extras.serviceSection")}</h2>
          </div>
          <button
            type="button"
            onClick={() => setAirportTransfer(!airportTransfer)}
            aria-pressed={airportTransfer}
            className={`flex w-full items-start gap-3 rounded-xl2 border p-4 text-left transition ${
              airportTransfer
                ? "border-turquoise bg-turquoise/5 ring-1 ring-turquoise"
                : "border-ink/12 bg-white hover:border-turquoise/60"
            }`}
          >
            <span
              className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition ${
                airportTransfer ? "border-turquoise bg-turquoise text-white" : "border-ink/25 text-transparent"
              }`}
            >
              <IconCheck className="h-3.5 w-3.5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="text-xl leading-none" aria-hidden>
                  ✈️
                </span>
                <span className="font-semibold text-marine">{t("extras.transferTitle")}</span>
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-ink/60">{t("extras.transferDesc")}</span>
            </span>
            <span className="shrink-0 rounded-full bg-cream px-2 py-0.5 text-[11px] font-medium text-teal-deep/70">
              {t("extras.transferBadge")}
            </span>
          </button>
        </section>

        {groups.length > 0 ? (
          <div className="space-y-7">
            {groups.map((g) => (
              <section key={g.key}>
                <div className="mb-3 flex items-center gap-3">
                  <span className="h-5 w-1 rounded-full bg-creole" />
                  <h2 className="font-display text-lg text-teal-deep">{g.label}</h2>
                  <span className="text-xs text-ink/40">
                    {t("extras.optionCount", { count: g.items.length })}
                  </span>
                </div>
                <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
                  {g.items.map((p) => (
                    <AddonCard
                      key={p.displayId}
                      product={p}
                      imageBaseUrl={imageBaseUrl}
                      selected={isDisplaySelected(p)}
                      locked={forcedReveillonIds.has(p.id)}
                      nightsCount={nightsCount}
                      guestsCount={guestsCount}
                      preference={preferences[p.displayId]}
                      onToggle={() => toggleDisplayProduct(p)}
                      onOpenCustomize={forcedReveillonIds.has(p.id) ? undefined : () => setCustomizingProduct(p)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center text-sm text-ink/60">
            {t("extras.none")}
          </div>
        )}

        {/* Barre d'action collante : toujours visible sans scroller */}
        <div className="sticky bottom-0 z-20 mt-2 border-t border-ink/10 bg-cream/95 py-3 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-xs text-ink/55">{t("extras.total")}</span>
              <span className="font-display text-lg text-teal-deep">{money(grandTotal, currency)}</span>
              <span className="ml-1 text-[11px] text-ink/45">{t("extras.taxesIncl")}</span>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => goTo("payment")} className="btn-link hidden sm:inline-flex">
                {t("extras.skip")}
              </button>
              <button type="button" onClick={() => goTo("payment")} className="btn-primary">
                {t("extras.continueToPayment")} <IconArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {customizingProduct && (
        <AddonCustomizerModal
          isOpen
          addon={customizingProduct}
          imageBaseUrl={imageBaseUrl}
          searchCriteria={{ checkIn, checkOut, nights: nightsCount }}
          currentPreference={preferences[customizingProduct.displayId]}
          onSave={(preference) => {
            setPreferences((current) => ({
              ...current,
              [customizingProduct.displayId]: preference,
            }));
            setSelectedDisplayByProduct((current) => ({
              ...current,
              [customizingProduct.id]: customizingProduct.displayId,
            }));
            if (!productIds.includes(customizingProduct.id)) {
              toggleProduct(customizingProduct.id);
            }
          }}
          onClose={() => setCustomizingProduct(null)}
        />
      )}
    </StepLayout>
  );
}
