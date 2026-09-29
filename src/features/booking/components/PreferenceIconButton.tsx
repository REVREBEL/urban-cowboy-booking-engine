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
  "iconic-tub": "/assets/copper-tub-illustration-unselected.png",
  "bathe-outside": "/assets/soak-outside-illustration-unselected.png",
  "my-own-place": "/assets/my-own-place-illustration-unselected.png",
  "near-everything": "/assets/spaces-to-gather-illustration-unselected.png",
  "simple-cozy": "/assets/simple-cozy-illustration-unselected.png",
  "mountain-views": "/assets/scenic-views-illustration-unselected.png",
  "bringing-my-people": "/assets/party-card-bg-wide.svg",
};

const ICON_SELECTED: Partial<Record<PreferenceId, string>> = {
  "iconic-tub": "/assets/copper-tub-illustration-selected.png",
  "bathe-outside": "/assets/soak-outside-illustration-selected.png",
  "my-own-place": "/assets/my-own-place-illustration-selected.png",
  "near-everything": "/assets/spaces-to-gather-illustration-selected.png",
  "simple-cozy": "/assets/simple-cozy-illustration-selected.png",
  "mountain-views": "/assets/scenic-views-illustration-selected.png",
};

const LABEL: Partial<Record<PreferenceId, string>> = {
  "iconic-tub": "/assets/copper-tub-label-unselected.svg",
  "bathe-outside": "/assets/soak-outside-label.svg",
  "my-own-place": "/assets/my-own-place-label-unselected.svg",
  "near-everything": "/assets/spaces-to-gather-label-unselected.svg",
  "simple-cozy": "/assets/simple-cozy-label-unselected.svg",
  "mountain-views": "/assets/scenic-views-label-unselected.svg",
};

const LABEL_SELECTED: Partial<Record<PreferenceId, string>> = {
  "iconic-tub": "/assets/copper-tub-label-selected.svg",
  "bathe-outside": "/assets/soak-outside-label.svg",
  "my-own-place": "/assets/my-own-place-label-selected.svg",
  "near-everything": "/assets/spaces-to-gather-label-selected.svg",
  "simple-cozy": "/assets/simple-cozy-label-selected.svg",
  "mountain-views": "/assets/scenic-views-label-selected.svg",
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
