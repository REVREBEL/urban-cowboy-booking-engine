import { cn } from "@/lib/utils";
import type { PreferenceId } from "@/types/booking-ui";

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

const ARTWORK_ROOT = "/assets/illustrations/interaction/find-your-stay";

function preferenceArtwork(id: PreferenceId): string {
  return `${ARTWORK_ROOT}/${id}.svg`;
}

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
  const artwork = preferenceArtwork(id);

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
          "flex flex-1 items-center justify-center self-stretch overflow-hidden border-[0.386px] transition-colors",
          selected
            ? "border-oxblood bg-white/70"
            : "border-umber/30 bg-white/25 group-hover:border-umber/50",
        )}
      >
        <MaskedArtwork
          src={artwork}
          selected={selected}
          className={cn(
            "h-[188px] w-[188px]",
            !selected && "group-hover:opacity-65",
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
