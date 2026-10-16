import type { FocusState } from "./FocusAmenityCount";

export interface FocusAmenityActionProps {
  state?: FocusState;
  className?: string;
}

const states: Record<FocusState, string> = {
  Default: "bg-lake-forest text-alpine-linen border-alpine-linen group-hover/focus-amenity:bg-lake-forest-fade",
  Hover: "bg-lake-forest-fade text-alpine-linen border-alpine-linen",
  Active: "bg-alpine-linen text-lake-forest-fade border-lake-forest-fade",
};

/** Action square: plus in Default/Hover, cross in Active. */
export function FocusAmenityAction({ state = "Default", className = "" }: FocusAmenityActionProps) {
  return (
    <span aria-hidden="true" data-state={state}
      className={`grid size-[30px] shrink-0 place-items-center border-[3px] border-double box-border transition-colors duration-200 max-sm:size-6 ${states[state]} ${className}`}>
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" className="size-1/2" focusable="false">
        {state === "Active"
          ? <path d="M5 5 19 19M19 5 5 19" stroke="currentColor" strokeWidth="3.5" strokeLinecap="square" />
          : <path d="M12 3V21M3 12H21" stroke="currentColor" strokeWidth="3.5" strokeLinecap="square" />}
      </svg>
    </span>
  );
}

export default FocusAmenityAction;
