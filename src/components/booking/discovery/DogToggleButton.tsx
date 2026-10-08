import { cn } from "@/lib/utils";

type Props = {
  selected: boolean;
  onToggle: () => void;
  className?: string;
};

const DETAILED_DOG_ICON = "/assets/icons/amenities/detailed/dog_friendly.svg";
const SIMPLE_DOG_ICON = "/assets/badges/features/dog_friendly.svg";

export function DogToggleButton({ selected, onToggle, className = "" }: Props) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      title="Bringing the dog: only show places that welcome dogs"
      onClick={onToggle}
      className={cn(
        "group flex min-h-32 w-full items-center justify-center border border-oxblood/50 bg-white/25 p-4 transition-colors hover:border-oxblood sm:min-h-52",
        selected && "border-oxblood bg-white/70",
        className,
      )}
    >
      <img
        src={SIMPLE_DOG_ICON}
        alt=""
        aria-hidden="true"
        className={cn(
          "h-20 w-20 object-contain transition-opacity sm:hidden",
          selected ? "opacity-100" : "opacity-55 group-hover:opacity-75",
        )}
      />

      <img
        src={DETAILED_DOG_ICON}
        alt=""
        aria-hidden="true"
        className={cn(
          "hidden h-40 w-40 object-contain transition-opacity sm:block md:h-44 md:w-44",
          selected ? "opacity-100" : "opacity-45 group-hover:opacity-70",
        )}
      />

      <span className="sr-only">Bringing the dog</span>
    </button>
  );
}
