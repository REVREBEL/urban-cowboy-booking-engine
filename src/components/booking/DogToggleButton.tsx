import { DOG_ICON, DOG_ICON_SELECTED } from "@/lib/booking/cowboy";
import { cn } from "@/lib/utils";

type Props = {
  selected: boolean;
  onToggle: () => void;
};

export function DogToggleButton({ selected, onToggle }: Props) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      title="Bringing the dog: only show places that welcome dogs"
      onClick={onToggle}
      className="flex size-36 flex-row items-center border-[0.386px] border-oxblood p-0.5 md:size-40"
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
            "size-24 object-contain transition-opacity duration-200 md:size-28",
            selected ? "opacity-100" : "opacity-30",
          )}
        />
      </span>
      <span className="sr-only">Bringing the dog</span>
    </button>
  );
}
