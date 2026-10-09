import React, { useMemo, useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import type { MerchandisedAddOn } from "@/types/add-on-cms";
import type { AddonSchedulePreference } from "./addon-types";
import { addOnKind } from "./addon-smart-logic";
import { AddonCard } from "./AddonCard";
import { AddonCustomizerModal } from "./AddonCustomizerModal";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/format";
import { t } from "@/i18n";

type ExtrasFilter = "all" | "dining" | "wellness" | "celebration" | "pets";

interface ExtrasStepProps {
  products: MerchandisedAddOn[];
  imageBaseUrl: string;
  selectedProductIds: string[];
  selectedDisplayByProduct: Record<string, string>;
  preferences: Record<string, AddonSchedulePreference>;
  lockedProductIds: ReadonlySet<string>;
  nightsCount: number;
  guestsCount: number;
  checkIn: string;
  checkOut: string;
  roomName?: string | null;
  rateName?: string | null;
  extrasTotal: number;
  currency: string;
  airportTransfer: boolean;
  showAirportTransfer?: boolean;
  onToggleAirportTransfer: () => void;
  onToggle: (product: MerchandisedAddOn) => void;
  onSavePreference: (
    product: MerchandisedAddOn,
    preference: AddonSchedulePreference,
  ) => void;
  onProceedToPay: () => void;
  onBack: () => void;
}

const FILTERS: { id: ExtrasFilter; label: string }[] = [
  { id: "all", label: "All Add-ons" },
  { id: "dining", label: "Food & Drink" },
  { id: "wellness", label: "Bathing & Spa" },
  { id: "celebration", label: "Celebrations" },
  { id: "pets", label: "Dogs" },
];

function filterFor(addon: MerchandisedAddOn): Exclude<ExtrasFilter, "all"> | "other" {
  const kind = addOnKind(addon);
  if (kind === "pup-stay") return "pets";
  if (kind === "fresh-cut-flowers" || kind === "celebration-cake") return "celebration";
  if (
    kind === "wine-bottle" ||
    kind === "hummus-crudites" ||
    kind === "chocolate-truffles"
  ) {
    return "dining";
  }

  const hay = `${addon.name} ${addon.description}`.toLowerCase();
  if (/bath|soak|spa|sauna|massage|wellness|ritual|steam/.test(hay)) return "wellness";
  if (/dog|pup|pet/.test(hay)) return "pets";
  if (/flower|bouquet|cake|birthday|anniversary|celebrat|romance/.test(hay)) {
    return "celebration";
  }
  if (/wine|drink|beverage|food|snack|breakfast|dinner|dessert|truffle|hummus|s'more|smore/.test(hay)) {
    return "dining";
  }
  return "other";
}

export const ExtrasStep: React.FC<ExtrasStepProps> = ({
  products,
  imageBaseUrl,
  selectedProductIds,
  selectedDisplayByProduct,
  preferences,
  lockedProductIds,
  nightsCount,
  guestsCount,
  checkIn,
  checkOut,
  roomName,
  rateName,
  extrasTotal,
  currency,
  airportTransfer,
  showAirportTransfer = false,
  onToggleAirportTransfer,
  onToggle,
  onSavePreference,
  onProceedToPay,
  onBack,
}) => {
  const [activeFilter, setActiveFilter] = useState<ExtrasFilter>("all");
  const [customizingAddon, setCustomizingAddon] =
    useState<MerchandisedAddOn | null>(null);

  const firstDisplayForProduct = useMemo(() => {
    const map = new Map<string, string>();
    for (const product of products) {
      if (!map.has(product.id)) map.set(product.id, product.displayId);
    }
    return map;
  }, [products]);

  const isSelected = (product: MerchandisedAddOn) =>
    selectedProductIds.includes(product.id) &&
    (selectedDisplayByProduct[product.id] ?? firstDisplayForProduct.get(product.id)) ===
      product.displayId;

  const filteredProducts = useMemo(
    () =>
      activeFilter === "all"
        ? products
        : products.filter((product) => filterFor(product) === activeFilter),
    [activeFilter, products],
  );

  const totalSelectedCount = selectedProductIds.length;
  const customizedSelectedCount = selectedProductIds.filter((productId) => {
    const displayId =
      selectedDisplayByProduct[productId] ?? firstDisplayForProduct.get(productId);
    return Boolean(displayId && preferences[displayId]);
  }).length;

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        type="button"
        onClick={onBack}
        className="group mb-6 inline-flex items-center gap-2 font-button text-xs uppercase tracking-widest text-[#73716D] transition-colors hover:text-[#4E332D]"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        <span>Back to Guest Details</span>
      </button>

      <div className="mb-8 flex flex-col gap-6 border-b border-[#D1C9BE] pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="mb-1 block font-button text-xs font-bold uppercase tracking-widest text-[#9A5636]">
            STEP 4 OF 5 · CURATED ADD-ONS & EXPERIENCES
          </span>
          <h1 className="font-display text-3xl uppercase tracking-tight text-[#221C18] sm:text-4xl lg:text-5xl">
            Add-ons & Personal Touches
          </h1>
          <p className="mt-2 max-w-2xl font-body text-sm text-[#6B6259] sm:text-base">
            From fresh Catskill bouquets waiting in your room to celebration cakes and fireside s&apos;mores, schedule every detail and add custom notes for our front desk.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter add-ons">
          {FILTERS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              aria-pressed={activeFilter === tab.id}
              className={`rounded-[10px] px-3.5 py-1.5 font-button text-xs uppercase tracking-wider transition-all ${
                activeFilter === tab.id
                  ? "bg-[#4E332D] font-bold text-[#EBE8E0] shadow-xs"
                  : "border border-[#D1C9BE]/60 bg-white/70 text-[#73716D] hover:bg-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {showAirportTransfer && (
        <section className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <span className="h-5 w-1 rounded-full bg-[#236B7D]" />
          <h2 className="font-display text-lg uppercase text-[#221C18]">
            {t("extras.serviceSection")}
          </h2>
        </div>
        <button
          type="button"
          onClick={onToggleAirportTransfer}
          aria-pressed={airportTransfer}
          className={`flex w-full items-start gap-3 rounded-[17px] border p-4 text-left transition ${
            airportTransfer
              ? "border-[#236B7D] bg-[#236B7D]/5 ring-1 ring-[#236B7D]"
              : "border-[#D1C9BE] bg-[#FAF9F9] hover:border-[#236B7D]/60"
          }`}
        >
          <span
            className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition ${
              airportTransfer
                ? "border-[#236B7D] bg-[#236B7D] text-white"
                : "border-[#4E332D]/25 text-transparent"
            }`}
          >
            <Check className="h-3.5 w-3.5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2 font-button text-sm uppercase text-[#221C18]">
              <span
                className="font-emoji-mono text-lg leading-none"
                aria-hidden="true"
              >
                ✈
              </span>
              <span>{t("extras.transferTitle")}</span>
            </span>
            <span className="mt-1 block font-body text-sm leading-relaxed text-[#6B6259]">
              {t("extras.transferDesc")}
            </span>
          </span>
          <span className="shrink-0 rounded-full bg-[#EBE8E0] px-2 py-0.5 font-body text-[11px] text-[#4E332D]/70">
            {t("extras.transferBadge")}
          </span>
        </button>
        </section>
      )}

      {filteredProducts.length ? (
        <div className="mb-24 grid grid-cols-1 justify-items-center gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((addon) => {
            const selected = isSelected(addon);
            const locked = lockedProductIds.has(addon.id);
            return (
              <AddonCard
                key={addon.displayId}
                product={addon}
                imageBaseUrl={imageBaseUrl}
                selected={selected}
                locked={locked}
                nightsCount={nightsCount}
                guestsCount={guestsCount}
                preference={preferences[addon.displayId]}
                onToggle={() => onToggle(addon)}
                onOpenCustomize={
                  locked ? undefined : () => setCustomizingAddon(addon)
                }
              />
            );
          })}
        </div>
      ) : (
        <div className="mb-24 rounded-[17px] border border-[#D1C9BE] bg-[#FAF9F9] p-10 text-center font-body text-sm text-[#73716D]">
          No add-ons in this category yet.
        </div>
      )}

      <div className="sticky bottom-6 z-40 mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-4 rounded-[19px] border border-white/10 bg-[#221C18] p-4 text-white shadow-2xl sm:flex-row sm:p-5">
        <div className="text-center sm:text-left">
          <span className="block font-button text-[11px] uppercase tracking-widest text-[#D1C9BE]">
            RESERVATION SUMMARY
          </span>
          <div className="mt-0.5 font-body text-sm text-white">
            <span className="font-bold">{roomName || "Selected Room"}</span>
            {rateName ? (
              <>
                {" · "}
                <span className="text-[#F2AAA9]">{rateName}</span>
              </>
            ) : null}
            {" · "}
            {nightsCount} {nightsCount === 1 ? "night" : "nights"}
          </div>

          {extrasTotal > 0 && (
            <div className="mt-1 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="rounded-full bg-white/10 px-2 py-0.5 font-numbers text-xs font-bold text-[#F2AAA9]">
                +{money(extrasTotal, currency)} in add-ons
              </span>
              <span className="font-body text-xs text-[#EBE8E0]/70">
                ({totalSelectedCount} {totalSelectedCount === 1 ? "item" : "items"} selected)
              </span>
              {customizedSelectedCount > 0 && (
                <span className="flex items-center gap-1 font-body text-[11px] text-[#D1C9BE]">
                  <Check className="h-3 w-3 text-[#F2AAA9]" />
                  <span>{customizedSelectedCount} personalized</span>
                </span>
              )}
            </div>
          )}
        </div>

        <Button
          type="button"
          onClick={onProceedToPay}
          variant="filled"
          color="copper"
          size="large"
          hasIcon
          className="w-full sm:w-auto"
        >
          Continue to Payment
        </Button>
      </div>

      {customizingAddon && (
        <AddonCustomizerModal
          isOpen
          addon={customizingAddon}
          imageBaseUrl={imageBaseUrl}
          searchCriteria={{ checkIn, checkOut, nights: nightsCount }}
          currentPreference={preferences[customizingAddon.displayId]}
          onSave={(preference) => onSavePreference(customizingAddon, preference)}
          onClose={() => setCustomizingAddon(null)}
        />
      )}
    </div>
  );
};

export default ExtrasStep;
