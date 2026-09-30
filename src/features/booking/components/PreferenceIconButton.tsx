import { cn } from "@/lib/utils";
import type { PreferenceId } from "../types";

type Props = {
  id: PreferenceId;
  label: string;
  description: string;
  selected: boolean;
  onToggle: () => void;
};

type MaskedArtworkProps = {
  src: string;
  selected: boolean;
  className?: string;
};

const ICON: Record<PreferenceId, string> = {
  "iconic-tub": "/assets/icons/amenities/buttons/copper_clawfoot_soaking_tub.svg",
  "bathe-outside": "/assets/icons/amenities/buttons/outdoor_cedar_soaking_tub.svg",
  "my-own-place": "/assets/icons/amenities/buttons/cabin.svg",
  "near-everything": "/assets/icons/amenities/buttons/separate_living_room.svg",
  "simple-cozy": "/assets/icons/amenities/buttons/letter_writing_desk.svg",
  "mountain-views": "/assets/icons/amenities/buttons/peak_balcony_mountian_view.svg",
  "bringing-my-people": "/assets/icons/amenities/buttons/separate_living_room.svg",
};

const LABEL: Partial<Record<PreferenceId, string>> = {
  "iconic-tub": "/assets/labels/copper_clawfoot_soaking_tub.svg",
  "bathe-outside": "/assets/labels/soak-outside-label.svg",
  "my-own-place": "/assets/labels/my-own-place-label-unselected.svg",
  "near-everything": "/assets/labels/spaces-to-gather-label-unselected.svg",
  "simple-cozy": "/assets/labels/simple-cozy-label-unselected.svg",
  "mountain-views": "/assets/labels/scenic-views-label-unselected.svg",
  "bringing-my-people": "/assets/labels/spaces-to-gather-label-unselected.svg",
};

function MaskedArtwork({ src, selected, className }: MaskedArtworkProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "block shrink-0 bg-current transition-all duration-200",
        selected ? "text-oxblood opacity-100" : "text-umber opacity-45",
        className,
      )}
      style={{
        WebkitMaskImage: `url("${src}")`,
        maskImage: `url("${src}")`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}

export function PreferenceIconButton({ id, label, description, selected, onToggle }: Props) {
  const icon = ICON[id];
  const labelArt = LABEL[id];

  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-labelledby={`preference-${id}-label`}
      aria-describedby={`preference-${id}-description`}
      title={`${label}: ${description}`}
      onClick={onToggle}
      className="group flex size-52 flex-row items-center border-[0.386px] border-oxblood p-0.5"
    >
      <span
        className={cn(
          "flex flex-1 flex-col items-center justify-center gap-2.5 self-stretch overflow-hidden border-[0.386px] transition-colors",
          selected
            ? "border-oxblood bg-white/70"
            : "border-umber/30 bg-white/25 group-hover:border-umber/50",
        )}
      >
        <MaskedArtwork
          src={icon}
          selected={selected}
          className={cn(
            "h-24 w-32",
            !selected && "group-hover:opacity-65",
          )}
        />

        {labelArt ? (
          <MaskedArtwork
            src={labelArt}
            selected={selected}
            className={cn(
              "h-[45px] w-[120px]",
              !selected && "group-hover:opacity-65",
            )}
          />
        ) : (
          <span
            className={cn(
              "font-label text-[11px] leading-tight transition-colors",
              selected
                ? "text-oxblood"
                : "text-umber/45 group-hover:text-umber/65",
            )}
          >
            {label}
          </span>
        )}
      </span>

      <span id={`preference-${id}-label`} className="sr-only">
        {label}
      </span>
      <span id={`preference-${id}-description`} className="sr-only">
        {description}
      </span>
    </button>
  );
}
