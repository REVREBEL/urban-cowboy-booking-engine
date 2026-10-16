/**
 * Photo Journey layout uses the canonical AddonCard and the shared smart customizer.
 * Product selection, Mews pricing and preferences still flow through Extras.
 */
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "../components/ui/Button";
import { AddonCustomizerModal } from "../components/booking/extras/AddonCustomizerModal";
import { AddonCard } from "../components/booking/extras/AddonCard";
import { money } from "../lib/format";
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
  guestsCount: number;
  onToggle: (product: MerchandisedAddOn) => void;
  onSavePreference: (product: MerchandisedAddOn, preference: AddonSchedulePreference) => void;
  onNext: () => void;
  onBack: () => void;
};

const label = "font-label text-[11px] uppercase tracking-[0.22em]";
export function PhotoExtrasStep(props: Props) {
  const [editing, setEditing] = useState<MerchandisedAddOn | null>(null);
  const criteria = { checkIn: props.checkIn, checkOut: props.checkOut, nights: props.nights };
  const displayedSelected = props.products.filter(product =>
    props.selectedProductIds.includes(product.id) &&
    (props.selectedDisplayByProduct[product.id] ?? props.products.find(p => p.id === product.id)?.displayId) === product.displayId,
  ).length;

  return (
    <section className="min-h-dvh bg-smoke pb-32 pt-24 text-paper" data-photo-extras-step>
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8">
        <p className={`${label} text-alpine-linen`}>04 — Have it waiting</p>
        <h1 className="mt-2 max-w-[22ch] font-heading text-4xl leading-none sm:text-6xl">
          Little things, ready in {props.roomName.split(" ")[0]} when you are.
        </h1>
        <p className="mt-4 max-w-[60ch] text-paper/75">
          Make your arrival your own. Everything optional can be added or skipped; customize gifts, scheduling and special requests on each card.
        </p>
      </div>
      <div className="mx-auto mt-12 max-w-[1600px] px-5 sm:px-8">
        <h2 className={`${label} border-b border-paper/15 pb-3 leading-none text-paper/70`}>Available extras</h2>
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {props.products.map(product => {
            const selected = props.selectedProductIds.includes(product.id) &&
              (props.selectedDisplayByProduct[product.id] ?? props.products.find(p => p.id === product.id)?.displayId) === product.displayId;
            const locked = props.lockedProductIds.has(product.id);
            return (
              <li key={product.displayId} className="flex min-w-0">
                <AddonCard
                  product={product}
                  imageBaseUrl={props.imageBaseUrl}
                  selected={selected}
                  locked={locked}
                  nightsCount={props.nights}
                  guestsCount={props.guestsCount}
                  preference={props.preferences[product.displayId]}
                  onToggle={() => props.onToggle(product)}
                  onOpenCustomize={locked ? undefined : () => setEditing(product)}
                  className="max-w-none"
                />
              </li>
            );
          })}
        </ul>
        {!props.products.length && <p className="py-12 text-paper/75">There are no additional extras available for this stay.</p>}
      </div>
      <div className="fixed inset-x-0 bottom-0 z-30 bg-smoke/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex flex-wrap items-center gap-4">
            <Button type="button" onClick={props.onBack} variant="transparent" colorScheme="paper" size="xsmall" className="gap-1 underline underline-offset-4" style={{padding:0}}>
              <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Back to rate
            </Button>
            <p className="tabular-nums">{displayedSelected} extras · <strong>{money(props.total, props.currency)}</strong></p>
          </div>
          <Button type="button" variant="filled" colorScheme="alpine-linen" size="small" className="rounded-full uppercase tracking-[0.2em]" onClick={props.onNext}>
            {displayedSelected ? "Review stay →" : "Skip extras →"}
          </Button>
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
