import type { FocusState } from "./FocusAmenityCount";

export interface FocusAmenityActionProps {
  state?: FocusState;
  className?: string;
  tone?: "standard" | "faded";
}

// Match the Count's three CMS hotspot states. Named group selectors are
// Tailwind v4 utilities and activate with native button :hover.
const styles: Record<FocusState, string> = {
  Default: "bg-secondary text-secondary-foreground border-secondary-foreground group-hover/focus-amenity:bg-accent group-hover/focus-amenity:text-accent-foreground group-hover/focus-amenity:border-accent",
  Hover: "bg-accent-foreground text-accent border-accent-foreground",
  Active: "bg-accent text-accent-foreground border-accent-foreground",
};

export function FocusAmenityAction({ state = "Default", tone = "standard", className = "" }: FocusAmenityActionProps) {
  return (
    <span
      aria-hidden="true"
      data-state={state}
      className={`relative grid size-10 shrink-0 place-items-center overflow-hidden transition-colors duration-200 max-sm:size-8 [--focus-action-inset:var(--color-secondary-foreground)] [--focus-action-body:var(--color-secondary)] group-hover/focus-amenity:[--focus-action-body:var(--color-accent)] group-hover/focus-amenity:[--focus-action-inset:var(--color-accent-foreground)] ${tone === "faded" ? "bg-accent text-accent-foreground [--focus-action-body:var(--color-accent)] [--focus-action-inset:var(--color-accent-foreground)]" : styles[state]} ${state === "Hover" ? "[--focus-action-body:var(--color-accent-foreground)] [--focus-action-inset:var(--color-accent)]" : state === "Active" ? "[--focus-action-body:var(--color-accent)] [--focus-action-inset:var(--color-accent-foreground)]" : ""} ${className}`}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 655 655"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 size-full"
        style={{
          // Resolve to the current state's CSS background and foreground.
          // These aliases inherit group hover changes without JS event state.
          ["--svg-primary" as string]: "var(--focus-action-body)",
          ["--svg-secondary" as string]: "var(--focus-action-inset)",
        }}
      >
        <g fill="var(--svg-primary)">
          <polygon points="75.09 82.5 74.73 82.5 74.37 82.5 74.37 572.17 579.02 572.17 579.02 82.5 75.09 82.5 75.09 82.5" />
          <path d="M-.27,0v655h655V0H-.27ZM590.48,71.83v511.67H63.98V71.5h526.5v.33Z" />
        </g>
        <path fill="var(--svg-secondary)" d="M63.98,71.5h0v512h526.5V71.5H63.98ZM579.02,572.17H74.37V82.5h504.64v489.67Z" />
      </svg>
      <span
        aria-hidden="true"
        className={`relative block size-1/2 bg-current transition-transform duration-200 ${state === "Active" ? "rotate-45" : ""}`}
        style={{ mask: 'url("/assets/icons/ui/ui-plus.svg") center / contain no-repeat', WebkitMask: 'url("/assets/icons/ui/ui-plus.svg") center / contain no-repeat' }}
      />
    </span>
  );
}

<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M84.43 39.72H60.26V15.56c0-1.01-.82-1.82-1.82-1.82l-16.93-.01c-1.01 0-1.82.81-1.82 1.81l-.01 24.16 -24.16-.01c-.97 0-1.82.85-1.82 1.81v16.92c-.01.48.19.94.53 1.28 .33.33.8.53 1.28.53h24.16v24.16c0 .48.19.94.53 1.28 .34.34.8.53 1.28.53l16.92-.01c.48 0 .94-.2 1.28-.54 .33-.34.52-.8.52-1.28V60.2l24.16-.01c.5 0 .95-.21 1.28-.53 .32-.33.53-.79.53-1.29l0-16.93c0-1.01-.82-1.82-1.82-1.82Z"/></svg>

export default FocusAmenityAction;
