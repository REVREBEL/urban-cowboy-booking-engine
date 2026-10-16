import type { FocusState } from "./FocusAmenityCount";

export interface FocusAmenityActionProps {
  state?: FocusState;
  className?: string;
}

const styles: Record<FocusState, string> = {
  Default: "bg-lake-forest text-alpine-linen border-lake-forest group-hover/focus-amenity:bg-lake-forest-fade",
  Hover: "bg-lake-forest-fade text-alpine-linen border-lake-forest-fade",
  Active: "bg-alpine-linen text-lake-forest border-lake-forest",
};

export function FocusAmenityAction({ state = "Default", className = "" }: FocusAmenityActionProps) {
  return (
    <span aria-hidden="true" data-state={state}
      className={`grid size-[30px] shrink-0 place-items-center border-2 transition-colors duration-200 max-sm:size-6 ${styles[state]} ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" width="16" height="16" className="size-1/2" focusable="false">
        {state === "Active"
          ? <path d="M5 5 19 19M19 5 5 19" stroke="currentColor" strokeWidth="3.5" strokeLinecap="square" />
          : <path d="M12 3V21M3 12H21" stroke="currentColor" strokeWidth="3.5" strokeLinecap="square" />}
      </svg>
    </span>
  );
}

export default FocusAmenityAction;
