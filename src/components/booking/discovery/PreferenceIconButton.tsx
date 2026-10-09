import { cn } from "@/lib/utils";
import type { PreferenceId } from "@/types/booking-ui";
import { PREFERENCE_BY_ID } from "@/data/findYourStayPreferences";

type Props = {
  id: PreferenceId;
  label: string;
  description: string;
  selected: boolean;
  onToggle: () => void;
};

const ARTWORK_ROOT = "/assets/illustrations/interaction/find-your-stay";

function preferenceArtwork(id: PreferenceId): string {
  const filename = PREFERENCE_BY_ID.get(id)?.artwork;
  return `${ARTWORK_ROOT}/${filename ?? ""}`;
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
      className="group flex size-52 items-center border-[0.386px] border-oxblood p-0.5"
    >
      <span
        className={cn(
          "flex flex-1 items-center justify-center self-stretch overflow-hidden border-[0.386px] transition-colors",
          selected
            ? "border-oxblood bg-white/70"
            : "border-umber/30 bg-white/25 group-hover:border-umber/50",
        )}
      >
        <img
          src={artwork}
          alt=""
          aria-hidden="true"
          className={cn(
            "h-[188px] w-[188px] object-contain transition-opacity duration-200",
            selected ? "opacity-100" : "opacity-55 group-hover:opacity-75",
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
