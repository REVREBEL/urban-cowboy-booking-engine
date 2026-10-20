// src/components/FocusAmenityCount.tsx
export type FocusState = "Default" | "Hover" | "Active";

export interface FocusAmenityCountProps {
  count: number | string;
  state?: FocusState;
  className?: string;
  tone?: "standard" | "faded";
}

const stateStyles: Record<FocusState, string> = {
  Default: "focus-default group-hover/focus-amenity:focus-hover",
  Hover: "focus-hover",
  Active: "focus-active",
};

export function FocusAmenityCount({
  count,
  state = "Default",
  tone = "standard",
  className = "",
}: FocusAmenityCountProps) {
  const activeUtilityClass =
    tone === "faded" ? "focus-hover" : stateStyles[state] ?? stateStyles.Default;

  // Format the count with a leading zero (e.g., 1 -> "01")
  const formattedCount = String(count).padStart(2, "0");

  return (
    <span
      data-state={state}
      className={`relative grid size-10 shrink-0 place-items-center overflow-hidden text-[2.625rem]/tight font-accent tabular-nums text-(--button-fg) transition-colors duration-200 max-sm:size-8 max-sm:text-xs ${activeUtilityClass} ${className}`}
    >
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

      {/* Number rendered above the background with z-10 and centered */}
      <span className="relative  pb-1.5 pr-0.5 z-10 select-none leading-1.5">
        {formattedCount}
      </span>
    </span>
  );
}

export default FocusAmenityCount;