import { DOG_ICON, DOG_ICON_SELECTED } from "../assets";
import { cn } from "../../../lib/utils";

export function DogToggleButton({
  selected,
  onToggle,
  disabled = false,
}: {
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label="Bringing the dog"
      title="Bringing the dog: only show places that welcome dogs"
      onClick={onToggle}
      disabled={disabled}
      className="flex size-36 flex-row items-center border-[0.386px] border-oxblood p-0.5 disabled:cursor-not-allowed disabled:opacity-50 md:size-40"
    >
      <span
        className={cn(
          "flex flex-1 flex-col items-center justify-center self-stretch overflow-hidden border-[0.386px] transition-colors",
          selected ? "border-oxblood bg-white/70" : "border-umber/30 bg-white/25",
        )}
      >
        <img
          src={selected ? DOG_ICON_SELECTED : DOG_ICON}
          alt=""
          aria-hidden="true"
          className={cn(
            "size-24 rotate-180 object-contain transition-opacity duration-200 md:size-28",
            selected ? "opacity-100" : "opacity-30",
          )}
        />
      </span>
    </button>
  );
}
