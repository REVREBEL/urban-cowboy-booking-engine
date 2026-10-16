export type FocusState = "Default" | "Hover" | "Active";

export interface FocusAmenityCountProps {
  count: number | string;
  state?: FocusState;
  className?: string;
}

const states: Record<FocusState, string> = {
  Default: "bg-lake-forest text-alpine-linen border-alpine-linen group-hover/focus-amenity:bg-lake-forest-fade",
  Hover: "bg-lake-forest-fade text-alpine-linen border-alpine-linen",
  Active: "bg-alpine-linen text-lake-forest-fade border-lake-forest-fade",
};

/** Decorative number square. Its three Figma states work independently in Storybook. */
export function FocusAmenityCount({ count, state = "Default", className = "" }: FocusAmenityCountProps) {
  return (
    <span aria-hidden="true" data-state={state}
      className={`grid size-[30px] shrink-0 place-items-center border-[3px] border-double box-border font-number text-[15px] leading-none tabular-nums transition-colors duration-200 max-sm:size-6 max-sm:text-xs ${states[state]} ${className}`}>
      {String(count).padStart(2, "0")}
    </span>
  );
}

export default FocusAmenityCount;
