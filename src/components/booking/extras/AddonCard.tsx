import { Check, Clock, Edit2, Minus } from "lucide-react";
import { imgUrl, money } from "@/lib/format";
import { chargingLabel } from "@/lib/shaping";
import { productLineTotal } from "@/state/booking";
import type { MerchandisedAddOn } from "@/types/add-on-cms";
import { Photo } from "@/components/media/photo";
import type { AddonSchedulePreference } from "./addon-types";
import { addOnPreferenceSummary } from "./addon-smart-logic";

export interface AddonCardProps {
  product: MerchandisedAddOn;
  imageBaseUrl: string;
  selected: boolean;
  locked?: boolean;
  nightsCount: number;
  guestsCount: number;
  preference?: AddonSchedulePreference;
  onToggle: () => void;
  onOpenCustomize?: () => void;
  className?: string;
}

export function AddonCard({
  product,
  imageBaseUrl,
  selected,
  locked = false,
  nightsCount,
  guestsCount,
  preference,
  onToggle,
  onOpenCustomize,
  className = "",
}: AddonCardProps) {
  const lineTotal = productLineTotal(product, nightsCount, guestsCount);
  const mode = chargingLabel(product.chargingMode);

  const add = () => {
    if (!selected && !locked) onToggle();
    onOpenCustomize?.();
  };

  return (
    <article
      className={`group flex min-h-[449px] w-full max-w-[461px] flex-col rounded-card-media bg-alpine-linen p-[17px_20px] transition-all duration-300 ${
        selected || locked ? "ring-2 ring-cowboy-umber" : "hover:-translate-y-0.5 hover:shadow-lg"
      } ${className}`}
    >
      <div className="flex flex-1 flex-col gap-3">
        <div className="relative h-[237px] overflow-hidden rounded-2xl">
          <Photo
            src={product.imageUrl ?? imgUrl(imageBaseUrl, product.imageId, 900)}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            gradient="from-creole via-creole-soft to-turquoise-vivid"
          />
          <div className="absolute right-7 top-7 bg-white px-3 py-1.5 shadow-sm">
            <span className="whitespace-nowrap text-2xl font-bold tracking-tight text-smoke">
              {money(product.price, product.currency)}
            </span>
          </div>
        </div>

        <div className="px-2">
          <h3 className="truncate font-label text-[28px] font-normal uppercase leading-none tracking-[-0.45px] text-smoke" title={product.name}>
            {product.name}
          </h3>
          <p className="mt-3 line-clamp-3 min-h-[51px] font-body text-sm leading-[17px] tracking-[-0.15px] text-ash-900">
            {product.description}
          </p>
          {(mode || lineTotal !== product.price) && (
            <p className="mt-1 text-[11px] text-smoke-fade">
              {mode}
              {mode && lineTotal !== product.price ? " · " : ""}
              {lineTotal !== product.price ? `${money(lineTotal, product.currency)} stay total` : ""}
            </p>
          )}
        </div>
      </div>

      <div className={`mt-4 flex min-h-12 items-center gap-3 ${selected || locked ? "justify-between" : "justify-end"}`}>
        {(selected || locked) && onOpenCustomize && !locked && (
          <button type="button" onClick={onOpenCustomize} className="flex min-w-0 items-center gap-2 text-left text-xs text-smoke-fade hover:text-cowboy-umber">
            <Clock className="h-4 w-4 shrink-0 text-copper" />
            <span className="min-w-0">
              <span className="block max-w-[210px] truncate font-bold text-cowboy-umber">{addOnPreferenceSummary(preference)}</span>
              <span className="inline-flex items-center gap-1 text-copper underline">Customize <Edit2 className="h-3 w-3" /></span>
            </span>
          </button>
        )}

        {!selected && !locked ? (
          <button type="button" onClick={add} className="h-12 w-[151px] rounded-full bg-cowboy-umber px-5 pt-0.5 font-button text-sm uppercase tracking-[0.05em] text-white transition hover:brightness-110 active:scale-[0.98]">
            Add to stay
          </button>
        ) : locked ? (
          <span className="inline-flex h-12 min-w-[151px] items-center justify-center gap-2 rounded-full bg-lake-forest px-5 font-button text-sm uppercase tracking-[0.05em] text-white">
            <Check className="h-4 w-4 text-nude-ember" /> Included
          </span>
        ) : (
          <button type="button" onClick={onToggle} className="inline-flex h-12 min-w-[151px] items-center justify-center gap-2 rounded-full bg-lake-forest px-4 font-button text-sm uppercase tracking-[0.05em] text-white transition hover:brightness-110" aria-label={`Remove ${product.name} from stay`}>
            <Minus className="h-4 w-4" /> Added
          </button>
        )}
      </div>
    </article>
  );
}
