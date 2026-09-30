import { cn } from "@/lib/utils";
import type { PreferenceId } from "../types";

type Props = {
  id: PreferenceId;
  label: string;
  description: string;
  selected: boolean;
  onToggle: () => void;
};

const ICON: Record<PreferenceId, string> = {
  "iconic-tub": "/public/assets/icons/amenities/buttons/copper_clawfoot_soaking_tub.svg",
  "bathe-outside": "/public/assets/icons/amenities/buttons/outdoor_cedar_soaking_tub.svg",
  "my-own-place": "/public/assets/icons/amenities/buttons/cabin.svg",
  "near-everything": "/public/assets/icons/amenities/buttons/separate_living_room.svg",
  "simple-cozy": "/public/assets/icons/amenities/buttons/letter_writing_desk.svg",
  "mountain-views": "/public/assets/icons/amenities/buttons/peak_balcony_mountian_view.svg",
};

const ICON_SELECTED: Partial<Record<PreferenceId, string>> = {
  "iconic-tub": "/public/assets/icons/amenities/buttons/copper_clawfoot_soaking_tub.svg",
  "bathe-outside": "/public/assets/icons/amenities/buttons/outdoor_cedar_soaking_tub.svg",
  "my-own-place": "/public/assets/icons/amenities/buttons/cabin.svg",
  "near-everything": "/public/assets/icons/amenities/buttons/separate_living_room.svg",
  "simple-cozy": "/public/assets/icons/amenities/buttons/letter_writing_desk.svg",
  "mountain-views": "/public/assets/icons/amenities/buttons/peak_balcony_mountian_view.svg",
};

const LABEL: Partial<Record<PreferenceId, string>> = {
  "iconic-tub": "/public/assets/labels/copper_clawfoot_soaking_tub.svg",
  "bathe-outside": "/public/assets/labels/soak-outside-label.svg",
  "my-own-place": "/public/assets/labels/my-own-place-label-unselected.svg",
  "near-everything": "/public/assets/labels/spaces-to-gather-label-unselected.svg",
  "simple-cozy": "/public/assets/labels/simple-cozy-label-unselected.svg",
  "mountain-views": "/public/assets/labels/scenic-views-label-unselected.svg",
};

const LABEL_SELECTED: Partial<Record<PreferenceId, string>> = {
  "iconic-tub": "/public/assets/labels/copper_clawfoot_soaking_tub.svg",
  "bathe-outside": "/public/assets/labels/soak-outside-label.svg",
  "my-own-place": "/public/assets/labels/my-own-place-label-unselected.svg",
  "near-everything": "/public/assets/labels/spaces-to-gather-label-unselected.svg",
  "simple-cozy": "/public/assets/labels/simple-cozy-label-unselected.svg",
  "mountain-views": "/public/assets/labels/scenic-views-label-unselected.svg",
};

export function PreferenceIconButton({ id, label, description, selected, onToggle }: Props) {
  const icon = (selected ? ICON_SELECTED[id] : undefined) ?? ICON[id];
  const labelArt = (selected ? LABEL_SELECTED[id] : undefined) ?? LABEL[id];

  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-labelledby={`preference-${id}-label`}
      aria-describedby={`preference-${id}-description`}
      title={`${label}: ${description}`}
      onClick={onToggle}
      className="flex size-52 flex-row items-center border-[0.386px] border-oxblood p-0.5"
    >
      <span
        className={cn(
          "flex flex-1 flex-col items-center justify-center gap-2.5 self-stretch overflow-hidden border-[0.386px] transition-colors",
          selected ? "border-oxblood bg-white/70" : "border-umber/30 bg-white/25",
        )}
      >
        <img
          src={icon}
          alt=""
          aria-hidden="true"
          className={cn(
            "h-24 w-auto object-contain transition-opacity duration-200",
            selected ? "opacity-100" : "opacity-50",
          )}
        />
        {labelArt ? (
          <img
            src={labelArt}
            alt=""
            aria-hidden="true"
            className={cn(
              "h-[45px] w-[120px] object-contain transition-opacity duration-200",
              selected ? "opacity-100" : "opacity-50",
            )}
          />
        ) : (
          <span className={cn("font-label text-[11px] leading-tight", selected ? "text-umber" : "text-umber/40")}>
            {label}
          </span>
        )}
      </span>
      <span id={`preference-${id}-label`} className="sr-only">{label}</span>
      <span id={`preference-${id}-description`} className="sr-only">{description}</span>
    </button>
  );
}
