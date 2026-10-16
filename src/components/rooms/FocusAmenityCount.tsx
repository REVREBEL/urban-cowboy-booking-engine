export type FocusState = "Default" | "Hover" | "Active";

export interface FocusAmenityCountProps {
  count: number | string;
  state?: FocusState;
  className?: string;
}

// Tailwind v4 state variants; Hover can be previewed independently and also
// appears on actual pointer hover through the parent named group.
const styles: Record<FocusState, string> = {
  Default: "bg-primary-foreground text-primary border-primary-foreground group-hover/focus-amenity:bg-accent group-hover/focus-amenity:text-accent-foreground group-hover/focus-amenity:border-accent",
  Hover: "bg-accent text-accent-foreground border-accent",
  Active: "bg-primary text-accent border-primary",
};

export function FocusAmenityCount({ count, state = "Default", className = "" }: FocusAmenityCountProps) {
  return (
    <span
      aria-hidden="true"
      data-state={state}
      className={`grid size-10 shrink-0 place-items-center pb-1.5 pr-0.5 border-2 font-accent text-6xl leading-2 tabular-nums transition-colors duration-200 max-sm:size-8 max-sm:text-base ${styles[state]} ${className}`}
    >
      {String(count).padStart(2, "0")}
    </span>
  );
}

export default FocusAmenityCount;
