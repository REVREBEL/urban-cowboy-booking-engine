import {
  PREFERENCE_ICON,
  PREFERENCE_ICON_SELECTED,
  PREFERENCE_LABEL,
  PREFERENCE_LABEL_SELECTED,
} from "../assets";
import type { MatchInterest } from "../types";
import { cn } from "@/lib/utils";

type Props = {
  id: MatchInterest;
  label: string;
  description: string;
  selected: boolean;
  onToggle: () => void;
  className?: string;
};

export function PreferenceIconButton({
  id,
  label,
  description,
  selected,
  onToggle,
  className,
}: Props) {
  const icon = selected ? PREFERENCE_ICON_SELECTED[id] : PREFERENCE_ICON[id];
  const labelArt = selected ? PREFERENCE_LABEL_SELECTED[id] : PREFERENCE_LABEL[id];

  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-labelledby={`preference-${id}-label`}
      aria-describedby={`preference-${id}-description`}
      title={`${label}: ${description}`}
      onClick={onToggle}
      className={cn(
        "flex size-52 flex-row items-center border-[0.386px] border-oxblood p-0.5",
        className,
      )}
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
        <img
          src={labelArt}
          alt=""
          aria-hidden="true"
          className={cn(
            "h-[45px] w-[120px] object-contain transition-opacity duration-200",
            selected ? "opacity-100" : "opacity-50",
          )}
        />
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
