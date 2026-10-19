// src/components/FocusAmenity.tsx
import type { TourIcon } from "@/journey/tour";
import { FocusAmenityCount } from "./FocusAmenityCount";
import { FocusAmenityAction } from "./FocusAmenityAction";
import { AmenityIcons } from "./AmenityIcons";

export type FocusAmenityState = "Default" | "Hover" | "Active" | "Inactive" | "Disabled";

export interface FocusAmenityProps {
  count?: number | string;
  icon: TourIcon;
  iconPath?: string | null;
  title: string;
  description?: string;
  state?: FocusAmenityState;
  active?: boolean;
  onSelect?: () => void;
  className?: string;
  tone?: "standard" | "faded";
}

// Map the 4 Figma design states to Tailwind CSS v4 @utility classes
const stateStyles: Record<FocusAmenityState, string> = {
  Default: "focus-default group-hover/focus-amenity:focus-hover",
  Hover: "focus-hover",
  Active: "focus-active",
  Inactive: "focus-disabled",
  Disabled: "focus-disabled",
};

/**
 * Fixed-size, CMS-backed photo amenity control matching Figma node 1199-3106.
 *
 * Supports 4 design states:
 * 1. Default: Cream foreground disc, dark green double rings, dark badge with count & plus.
 * 2. Hover: Sage green foreground disc, cream double rings and icon, cream badge with sage green count/action.
 * 3. Active: Light disc, accent rings, badge with rotated "x" action, plus expanded description card.
 * 4. Inactive/Disabled: Solid dark green disc with cream double rings & icon; badge is hidden.
 */
export function FocusAmenity({
  count = 1,
  icon,
  iconPath,
  title,
  description = "The Cabin keeps the sleeping setup relaxed: a proper king bed anchors the room, while the built-in bunk or lounging nook gives you another place to stretch out, read, or tuck someone in without turning the whole space into a bedroom.",
  state,
  active = false,
  onSelect,
  className = "",
  tone = "standard",
}: FocusAmenityProps) {
  // Resolve active state from explicit prop or boolean toggle
  const currentState: FocusAmenityState =
    state ?? (active ? "Active" : "Default");
  const isInactive = currentState === "Inactive" || currentState === "Disabled";
  const activeUtilityClass =
    tone === "faded"
      ? "focus-hover"
      : stateStyles[currentState] ?? stateStyles.Default;

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={onSelect}
        data-state={currentState}
        aria-pressed={currentState === "Active"}
        aria-label={`${String(count).padStart(2, "0")} ${title}`}
        title={title}
        className={`group/focus-amenity relative inline-block h-32 w-38.5 shrink-0 appearance-none overflow-visible border-0 bg-transparent p-0 text-left align-middle shadow-none outline-none select-none cursor-pointer pointer-events-auto focus-visible:outline-none max-sm:h-24 max-sm:w-29.25 ${activeUtilityClass}`}
        style={{
          ["--svg-primary" as string]: "var(--icon-bg)",
          ["--svg-secondary" as string]: "var(--icon-fg)",
        }}
      >
        {/* Circular Foreground Disc Container */}
        <span
          aria-hidden="true"
        className="absolute bottom-0 left-6.5 flex size-32 shrink-0 items-center justify-center rounded-full transition-colors duration-200 group-focus-visible/focus-amenity:ring-2 group-focus-visible/focus-amenity:ring-(--icon-fg) group-focus-visible/focus-amenity:ring-offset-2 max-sm:left-5 max-sm:size-24"
        >
          {/* Double-Line Circle SVG Background */}
          <svg
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 2000 2000"
            className="pointer-events-none absolute inset-0 size-full"
            xmlns="http://www.w3.org/2000/svg"
          >

            {/* 1. Solid Outer Disc Fill (provides the base fill AND the outer padding rim) */}
            <circle cx="1000" cy="1000" r="1000" className="fill-(--icon-bg) transition-colors duration-200" />

            {/* 2. Concentric Inset Double Rings (both styled identically with --icon-fg) */}
            <circle
              cx="1000"
              cy="1000"
              r="940"
              strokeWidth="20"
              className="fill-none stroke-(--icon-fg) transition-colors duration-200"
            />
            <circle
              cx="1000"
              cy="1000"
              r="885"
              strokeWidth="20"
              className="fill-none stroke-(--icon-fg) transition-colors duration-200"
            />
          </svg>

          {/* Centered Amenity Icon inside Disc */}
          <span className="relative z-10 flex size-full items-center justify-center p-3 text-(--icon-fg) transition-colors duration-200 max-sm:p-2 [&>svg]:size-full [&>svg]:max-h-full [&>svg]:max-w-full">
          <AmenityIcons icon={icon} iconPath={iconPath} />
          </span>
        </span>

        {/* Action/Count Left Badge (Hidden on Inactive/Disabled state) */}
        {!isInactive && (
          <span
            aria-hidden="true"
            className="absolute left-0 top-5 z-20 flex flex-col gap-0.5 max-sm:top-2"
          >
            <FocusAmenityCount count={count} state={currentState} tone={tone} />
            <FocusAmenityAction state={currentState} tone={tone} />
          </span>
        )}
      </button>

      {/* Expanded Active State Card */}
      {currentState === "Active" && (
        <div
          role="region"
          aria-label={title}
          className="ml-4 flex max-w-sm flex-col justify-center rounded-2xl bg-primary p-6 shadow-sm transition-all duration-200 max-sm:ml-2 max-sm:p-4"
        >
          <h3 className="text-base font-bold uppercase tracking-wider text-(--primary-foreground,#1c3f32)">
            {title}
          </h3>
          {description && (
            <p className="mt-2 text-xs leading-relaxed text-accent sm:text-sm">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default FocusAmenity;