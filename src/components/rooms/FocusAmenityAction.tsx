// src/components/FocusAmenityAction.tsx
export type FocusState = "Default" | "Hover" | "Active";

export interface FocusAmenityActionProps {
  state?: FocusState;
  className?: string;
  tone?: "standard" | "faded";
}

// Map hotspot state to Tailwind CSS v4 @utility classes.
// The group variant 'group-hover/focus-amenity:focus-hover' updates CSS variables
// dynamically on parent hover without needing extra React state.
const stateStyles: Record<FocusState, string> = {
  Default: "focus-default group-hover/focus-amenity:focus-hover",
  Hover: "focus-hover",
  Active: "focus-active",
};

export function FocusAmenityAction({
  state = "Default",
  tone = "standard",
  className = "",
}: FocusAmenityActionProps) {
  const activeUtilityClass =
    tone === "faded" ? "focus-hover" : stateStyles[state] ?? stateStyles.Default;

  return (
    <span
      aria-hidden="true"
      data-state={state}
      className={`relative grid size-10 shrink-0 place-items-center overflow-hidden transition-colors duration-200 max-sm:size-8 ${activeUtilityClass} ${className}`}
    >
      {}
      {/* Background & Inset Border Frame SVG */}
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 655 655"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 size-full"
      >
        {/* Background polygon fills with --button-bg */}
        <g fill="var(--button-bg)">
          <polygon points="75.09 82.5 74.73 82.5 74.37 82.5 74.37 572.17 579.02 572.17 579.02 82.5 75.09 82.5 75.09 82.5" />
          <path d="M-.27,0v655h655V0H-.27ZM590.48,71.83v511.67H63.98V71.5h526.5v.33Z" />
        </g>
        {/* Inset border path fills with --button-fg */}
        <path
          fill="var(--button-fg)"
          d="M63.98,71.5h0v512h526.5V71.5H63.98ZM579.02,572.17H74.37V82.5h504.64v489.67Z"
        />
      </svg>

      {}
      {/* Embedded Action Icon (Plus rotates 45 deg to an 'X' on Active) */}
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        fill="var(--button-fg)"
        className={`relative z-10 size-1/2 transition-transform duration-200 ${
          state === "Active" ? "rotate-45" : ""
        }`}
      >
        <path d="M84.43 39.72H60.26V15.56c0-1.01-.82-1.82-1.82-1.82l-16.93-.01c-1.01 0-1.82.81-1.82 1.81l-.01 24.16 -24.16-.01c-.97 0-1.82.85-1.82 1.81v16.92c-.01.48.19.94.53 1.28 .33.33.8.53 1.28.53h24.16v24.16c0 .48.19.94.53 1.28 .34.34.8.53 1.28.53l16.92-.01c.48 0 .94-.2 1.28-.54 .33-.34.52-.8.52-1.28V60.2l24.16-.01c.5 0 .95-.21 1.28-.53 .32-.33.53-.79.53-1.29l0-16.93c0-1.01-.82-1.82-1.82-1.82Z" />
      </svg>
    </span>
  );
}

export default FocusAmenityAction;