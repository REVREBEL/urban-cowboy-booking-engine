/**
 * Lovable Photo Journey add-on cards adapted to Webflow/Mews merchandised
 * products, with the existing smart customizer retaining its full capabilities.
 */
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { AddonCustomizerModal } from "../components/booking/extras/AddonCustomizerModal";
import { defaultAddOnPreference } from "../components/booking/extras/addon-smart-logic";
import { imgUrl, money } from "../lib/format";
import type { MerchandisedAddOn } from "../types/add-on-cms";
import type { AddonSchedulePreference } from "../components/booking/extras/addon-types";

type Props = {
  products: MerchandisedAddOn[];
  selectedProductIds: string[];
  selectedDisplayByProduct: Record<string, string>;
  lockedProductIds: Set<string>;
  preferences: Record<string, AddonSchedulePreference>;
  imageBaseUrl: string;
  currency: string;
  total: number;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  onToggle: (product: MerchandisedAddOn) => void;
  onSavePreference: (product: MerchandisedAddOn, preference: AddonSchedulePreference) => void;
  onNext: () => void;
  onBack: () => void;
};

const label = "font-j-label text-[11px] uppercase tracking-[0.22em]";
const btnPrimary = "inline-flex items-center justify-center gap-2 rounded-full bg-j-ember px-6 py-3 font-j-label text-xs uppercase tracking-[0.2em] text-j-paper transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-paper";
const timingOptions = [
  { id: "arrival", title: "Waiting on arrival" },
  { id: "during", title: "Delivered during stay" },
] as const;

function timingOf(preference?: AddonSchedulePreference) {
  return preference?.deliveryType === "scheduled-day" ? "during" : "arrival";
}
function unitLabel(mode: string) {
  if (/per.?person/i.test(mode)) return "person";
  if (/per.?night|per.?time.?unit/i.test(mode)) return "night";
  return "stay";
}

export function PhotoExtrasStep(props: Props) {
  const [editing, setEditing] = useState<MerchandisedAddOn | null>(null);
  const criteria = { checkIn: props.checkIn, checkOut: props.checkOut, nights: props.nights };
  const displayedSelected = props.products.filter(product =>
    props.selectedProductIds.includes(product.id) &&
    (props.selectedDisplayByProduct[product.id] ?? props.products.find(p => p.id === product.id)?.displayId) === product.displayId,
  ).length;

  const changeTiming = (product: MerchandisedAddOn, timing: "arrival" | "during") => {
    const current = props.preferences[product.displayId] ?? defaultAddOnPreference(product, criteria);
    props.onSavePreference(product, {
      ...current,
      deliveryType: timing === "arrival" ? "waiting-in-room" : "scheduled-day",
      selectedTime: timing === "arrival" ? "Waiting in room prior to arrival" : "During your stay",
    });
  };

  return (
    <section className="min-h-dvh bg-j-night pb-32 pt-24 text-j-paper" data-photo-extras-step>
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8">
        <p className={`${label} text-j-ember`}>04 — Have it waiting</p>
        <h1 className="mt-2 max-w-[22ch] font-j-display text-4xl leading-tight sm:text-6xl">
          Little things, ready in {props.roomName.split(" ")[0]} when you are.
        </h1>
        <p className="mt-4 max-w-[60ch] text-j-paper/75">
          Make your arrival your own. Everything optional can be added or skipped; customize gifts, scheduling and special requests on each card.
        </p>
      </div>
      <div className="mx-auto mt-12 max-w-[1600px] px-5 sm:px-8">
        <h2 className={`${label} border-b border-j-paper/15 pb-3 text-j-paper/70`}>Available extras</h2>
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {props.products.map(product => {
            const selected = props.selectedProductIds.includes(product.id) &&
              (props.selectedDisplayByProduct[product.id] ?? props.products.find(p => p.id === product.id)?.displayId) === product.displayId;
            const locked = props.lockedProductIds.has(product.id);
            const pref = props.preferences[product.displayId];
            const url = product.imageUrl || imgUrl(props.imageBaseUrl, product.imageId, 900);
            return (
              <li key={product.displayId} className={`overflow-hidden rounded-2xl bg-j-paper text-j-ink ring-4 ${selected ? "ring-j-ember" : "ring-transparent"}`}>
                {url && <img src={url} alt="" className="aspect-[3/2] w-full object-cover" loading="lazy" />}
                <div className="p-5">
                  <h3 className="font-j-display text-2xl leading-tight">{product.name}</h3>
                  {product.description && <p className="mt-1 text-sm text-j-ink/70">{product.description}</p>}
                  <p className="mt-3 tabular-nums">
                    {money(product.price, product.currency)} <span className="text-sm text-j-ink/75">/ {unitLabel(product.chargingMode)}</span>
                  </p>
                  {selected && (
                    <div role="group" aria-label={`Delivery timing for ${product.name}`} className="mt-4 flex flex-wrap gap-2">
                      {timingOptions.map(t => (
                        <button key={t.id} type="button" aria-pressed={timingOf(pref) === t.id} onClick={() => changeTiming(product, t.id)}
                          className={`rounded-full border px-3 py-1 text-xs ${timingOf(pref) === t.id ? "border-j-ink bg-j-ink text-j-paper" : "border-j-ink/30"}`}>
                          {t.title}
                        </button>
                      ))}
                    </div>
                  )}
                  <button type="button" disabled={locked}
                    onClick={() => props.onToggle(product)}
                    className={`mt-4 w-full rounded-full border-2 border-j-ink py-2.5 font-j-label text-xs uppercase tracking-[0.2em] ${selected ? "bg-j-ink text-j-paper" : ""} disabled:cursor-not-allowed disabled:opacity-60`}>
                    {locked ? "Included with stay" : selected ? "Added ✓ — remove" : "Add to stay"}
                  </button>
                  {selected && (
                    <button type="button" onClick={() => setEditing(product)} className="mt-3 w-full text-center text-sm underline underline-offset-4">
                      Customize timing, gift or special requests
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        {!props.products.length && <p className="py-12 text-j-paper/75">There are no additional extras available for this stay.</p>}
      </div>
      <div className="fixed inset-x-0 bottom-0 z-30 bg-j-night/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex flex-wrap items-center gap-4">
            <button type="button" onClick={props.onBack} className="flex items-center gap-1 text-sm text-j-paper/80 underline underline-offset-4 hover:text-j-paper">
              <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Back to rate
            </button>
            <p className="tabular-nums">{displayedSelected} extras · <strong>{money(props.total, props.currency)}</strong></p>
          </div>
          <button type="button" className={btnPrimary} onClick={props.onNext}>
            {displayedSelected ? "Review stay →" : "Skip extras →"}
          </button>
        </div>
      </div>
      {editing && (
        <AddonCustomizerModal
          isOpen
          addon={editing}
          imageBaseUrl={props.imageBaseUrl}
          searchCriteria={criteria}
          currentPreference={props.preferences[editing.displayId]}
          onSave={(value) => { props.onSavePreference(editing, value); setEditing(null); }}
          onClose={() => setEditing(null)}
        />
      )}
    </section>
  );
}
