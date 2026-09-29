import { PREFERENCE_ART } from "../assets";
import type { MatchInterest } from "../types";
import { cn } from "../../../lib/utils";

export function PreferenceIconButton({
  id,
  label,
  description,
  selected,
  onToggle,
  disabled = false,
}: {
  id: MatchInterest;
  label: string;
  description: string;
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  const art = PREFERENCE_ART[id];
  const icon = selected ? art.selectedIcon : art.icon;
  const labelArt = selected ? art.selectedLabel : art.label;

  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-labelledby={`preference-${id}-label`}
      aria-describedby={`preference-${id}-description`}
      title={`${label}: ${description}`}
      onClick={onToggle}
      disabled={disabled}
      className="flex size-52 flex-row items-center border-[0.386px] border-oxblood p-0.5 disabled:cursor-not-allowed disabled:opacity-50"
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
          <span className={cn("text-[11px] leading-tight", selected ? "text-umber" : "text-umber/40")}>
            {label}
          </span>
        )}
      </span>
      <span id={`preference-${id}-label`} className="sr-only">{label}</span>
      <span id={`preference-${id}-description`} className="sr-only">{description}</span>
    </button>
  );
}
