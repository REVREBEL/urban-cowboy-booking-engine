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
      className={`relative grid size-10 shrink-0 place-items-center overflow-hidden transition-colors duration-200 max-sm:size-8 ${styles[state]} ${className}`}
    >
      <img src="/assets/icons/ui/sqaure_single_line.svg" alt="" className="absolute inset-0 size-full object-contain" />
      <img
        src="/assets/icons/ui/ui-plus.svg"
        alt=""
        className={`relative size-1/2 object-contain transition-transform duration-200 ${state === "Active" ? "rotate-45" : ""}`}
      />
    </span>
  );
}

<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M84.43 39.72H60.26V15.56c0-1.01-.82-1.82-1.82-1.82l-16.93-.01c-1.01 0-1.82.81-1.82 1.81l-.01 24.16 -24.16-.01c-.97 0-1.82.85-1.82 1.81v16.92c-.01.48.19.94.53 1.28 .33.33.8.53 1.28.53h24.16v24.16c0 .48.19.94.53 1.28 .34.34.8.53 1.28.53l16.92-.01c.48 0 .94-.2 1.28-.54 .33-.34.52-.8.52-1.28V60.2l24.16-.01c.5 0 .95-.21 1.28-.53 .32-.33.53-.79.53-1.29l0-16.93c0-1.01-.82-1.82-1.82-1.82Z"/></svg>

export default FocusAmenityAction;
