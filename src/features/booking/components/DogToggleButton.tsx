import { cn } from "@/lib/utils";

type Props = {
  selected: boolean;
  onToggle: () => void;
};

const DOG_ICON = "/assets/icons/amenities/detailed/dog_friendly.svg";

export function DogToggleButton({ selected, onToggle }: Props) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      title="Bringing the dog: only show places that welcome dogs"
      onClick={onToggle}
      className="group flex size-36 flex-row items-center border-[0.386px] border-oxblood p-0.5 md:size-40"
    >
      <span
        className={cn(
          "flex flex-1 flex-col items-center justify-center self-stretch overflow-hidden border-[0.386px] transition-colors",
          selected
            ? "border-oxblood bg-white/70"
            : "border-umber/30 bg-white/25 group-hover:border-umber/50",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "block size-24 rotate-180 bg-current transition-all duration-200 md:size-28",
            selected
              ? "text-oxblood opacity-100"
              : "text-umber opacity-30 group-hover:opacity-50",
          )}
          style={{
            WebkitMaskImage: `url("${DOG_ICON}")`,
            maskImage: `url("${DOG_ICON}")`,
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
            WebkitMaskSize: "contain",
            maskSize: "contain",
          }}
        />
      </span>

      <span className="sr-only">Bringing the dog</span>
    </button>
  );
}
