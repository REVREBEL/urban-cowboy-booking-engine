export type FocusState = "Default" | "Hover" | "Active";

export interface FocusAmenityCountProps {
  count: number | string;
  state?: FocusState;
  className?: string;
}

const styles: Record<FocusState, string> = {
  Default: "bg-lake-forest text-alpine-linen border-lake-forest group-hover/focus-amenity:bg-lake-forest-fade",
  Hover: "bg-lake-forest-fade text-alpine-linen border-lake-forest-fade",
  Active: "bg-alpine-linen text-lake-forest border-lake-forest",
};

export function FocusAmenityCount({ count, state = "Default", className = "" }: FocusAmenityCountProps) {
  return (
    <span aria-hidden="true" data-state={state}
      className={`grid size-[30px] shrink-0 place-items-center border-2 font-number text-[15px] leading-none tabular-nums transition-colors duration-200 max-sm:size-6 max-sm:text-xs ${styles[state]} ${className}`}>
      {String(count).padStart(2, "0")}
    </span>
  );
}

export default FocusAmenityCount;
