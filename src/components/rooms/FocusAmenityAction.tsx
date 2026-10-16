import type { FocusState } from "./FocusAmenityCount";

export interface FocusAmenityActionProps {
  state?: FocusState;
  className?: string;
}

// Match the Count's three CMS hotspot states. Named group selectors are
// Tailwind v4 utilities and activate with native button :hover.
const styles: Record<FocusState, string> = {
  Default: "bg-primary-foreground text-primary border-primary-foreground group-hover/focus-amenity:bg-accent group-hover/focus-amenity:text-accent-foreground group-hover/focus-amenity:border-accent",
  Hover: "bg-accent text-accent-foreground border-accent",
  Active: "bg-primary text-accent border-primary",
};

export function FocusAmenityAction({ state = "Default", className = "" }: FocusAmenityActionProps) {
  return (
    <span
      aria-hidden="true"
      data-state={state}
      className={`grid size-10 shrink-0 place-items-center border-2 transition-colors duration-200 max-sm:size-8 ${styles[state]} ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" width="20" height="20" className="size-1/2" focusable="false">
        {state === "Active"
          ? <path d="M5 5 19 19M19 5 5 19" stroke="currentColor" strokeWidth="3.5" strokeLinecap="square" />
          : <path d="M12 3V21M3 12H21" stroke="currentColor" strokeWidth="3.5" strokeLinecap="square" />}
      </svg>
    </span>
  );
}

export default FocusAmenityAction;
