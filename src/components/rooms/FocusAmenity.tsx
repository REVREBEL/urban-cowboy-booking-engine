import type { TourIcon } from "@/journey/tour";
import { FocusAmenityCount } from "./FocusAmenityCount";
import { FocusAmenityAction } from "./FocusAmenityAction";
import { AmenityIcons } from "./AmenityIcons";

export interface FocusAmenityProps {
  count: number;
  icon: TourIcon;
  iconPath?: string | null;
  title: string;
  active: boolean;
  onSelect: () => void;
  className?: string;
}

/**
 * Fixed-size, CMS-backed photo amenity control.
 * Native button avoids the shared Button's rectangular focus ring, hover
 * opacity and pressed scale. Keyboard focus is shown on the circular icon.
 */
export function FocusAmenity({
  count, icon, iconPath, title, active, onSelect, className = "",
}: FocusAmenityProps) {
  const state = active ? "Active" : "Default";
  return (
    <button
      type="button"
      onClick={onSelect}
      data-state={state}
      aria-pressed={active}
      aria-label={`${String(count).padStart(2, "0")} ${title}`}
      title={title}
      className={`group/focus-amenity relative inline-block h-32 w-38.5 shrink-0 appearance-none overflow-visible border-0 bg-transparent p-0 text-left align-middle shadow-none outline-none select-none cursor-pointer pointer-events-auto focus-visible:outline-none max-sm:h-24 max-sm:w-29.25 ${className}`}
    >
      <span aria-hidden="true" className="absolute left-0 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-0.75">
        <FocusAmenityCount count={count} state={state} />
        <FocusAmenityAction state={state} />
      </span>
      <AmenityIcons icon={icon} iconPath={iconPath} />
    </button>
  );
}

export default FocusAmenity;
