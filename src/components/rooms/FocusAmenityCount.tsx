export type FocusState = "Default" | "Hover" | "Active";

export interface FocusAmenityCountProps {
  count: number | string;
  state?: FocusState;
  className?: string;
}

/** Decorative two-digit amenity number. Interaction belongs to FocusAmenity. */
export function FocusAmenityCount({ count, state = "Default", className = "" }: FocusAmenityCountProps) {
  const value = String(count).padStart(2, "0");
  return <span aria-hidden="true" data-state={state} className={["focus-amenity-count", className].filter(Boolean).join(" ")}>{value}</span>;
}

export default FocusAmenityCount;