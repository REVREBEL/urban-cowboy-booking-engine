export type FocusState = "Default" | "Hover" | "Active";

export interface FocusAmenityCountProps {
  count: number | string;
  state?: FocusState;
  className?: string;
}

const styles: Record<FocusState, string> = {
  Default: "bg-primary-foreground  text-primary border-primary-foreground group-hover/focus-amenity:bg-lake-forest-fade",
  Hover: "bg-accent text-accent-foreground  border-accent",
  Active: "bg-primary text-accent border-primary",
};

export function FocusAmenityCount({ count, state = "Default", className = "" }: FocusAmenityCountProps) {
  return (
    <span aria-hidden="true" data-state={state}
      className={`grid size-7.5 shrink-0 place-items-center border-2 font-number text-[15px] leading-none tabular-nums transition-colors duration-200 max-sm:size-6 max-sm:text-xs ${styles[state]} ${className}`}>
      {String(count).padStart(2, "0")}
    </span>
  );
}

export default FocusAmenityCount;
