import type { FocusState } from "./FocusAmenityCount";

export interface FocusAmenityActionProps {
  state?: FocusState;
  className?: string;
}

/** Plus for Default/Hover, close for Active. SVG scales with the marker. */
export function FocusAmenityAction({ state = "Default", className = "" }: FocusAmenityActionProps) {
  const active = state === "Active";
  return (
    <span aria-hidden="true" data-state={state} className={["focus-amenity-action", className].filter(Boolean).join(" ")}>
      <svg viewBox="0 0 24 24" fill="none" width="24" height="24" focusable="false">
        {active
          ? <path d="M5 5 19 19M19 5 5 19" stroke="currentColor" strokeWidth="3.5" strokeLinecap="square"/>
          : <path d="M12 3V21M3 12H21" stroke="currentColor" strokeWidth="3.5" strokeLinecap="square"/>}
      </svg>
    </span>
  );
}

export default FocusAmenityAction;