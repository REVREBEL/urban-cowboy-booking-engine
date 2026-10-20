import { useState } from "react";

// Chevron SVG paths derived from custom icon assets
const CHEVRON_PATHS = {
  right:
    "M3342 14660c2-5 1146-1504 2543-3330s2540-3325 2540-3330 -1143-1504-2540-3330C4488 2844 3344 1345 3342 1340c-3-7 703-10 2076-10h2080l2581 3330c1420 1832 2581 3335 2581 3340 0 6-1161 1509-2581 3340l-2581 3330H5418c-1369 0-2079-3-2076-10Z",
  left:
    "M5921 11340C4501 9509 3340 8006 3340 8000c0-6 1161-1509 2581-3340l2581-3330h2080c1369 0 2079 3 2076 10 -2 5-1146 1504-2543 3330C8718 6496 7575 7995 7575 8000c0 5 1143 1504 2540 3330s2542 3325 2543 3330c3 7-706 10-2076 10H8502l-2581-3330Z",
};

// Rotation angle mapping for directional orientation
const CHEVRON_ROTATION: Record<"up" | "down" | "left" | "right", number> = {
  right: 0,
  left: 0, // Uses explicit left path
  up: -90, // Rotates right path up
  down: 90, // Rotates right path down
};

function InlineChevron({
  direction,
  size,
  className = "",
}: {
  direction: "up" | "down" | "left" | "right";
  size: number;
  className?: string;
}) {
  const path = direction === "left" ? CHEVRON_PATHS.left : CHEVRON_PATHS.right;
  const rotation = CHEVRON_ROTATION[direction];

  return (
    <svg
      width={size}
      height={size}
      viewBox="-.01 -.01 1600 1600"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      style={{ transform: rotation ? `rotate(${rotation}deg)` : undefined }}
    >
      <path
        fill="currentColor"
        d={path}
        transform="matrix(.1 0 0-.1 0 1600)"
      />
    </svg>
  );
}

export interface PhotoTourArrowProps {
  direction: "up" | "down" | "left" | "right";
  size?: number;
  chevron?: boolean;
}

/** Use existing photo tour arrow assets, with an inline custom SVG chevron fallback. */
export function PhotoTourArrow({
  direction,
  size = 18,
  chevron = false,
}: PhotoTourArrowProps) {
  const [fallback, setFallback] = useState(false);
  const isUp = direction !== "down";
  const src = `/assets/icons/ui/ui-arrow-${isUp ? "up" : "down"}.svg`;
  const rotation = direction === "left" ? -90 : direction === "right" ? 90 : 0;

  // Render inline custom SVG chevron if chevron mode is active or img fails to load
  if (chevron || fallback) {
    return (
      <InlineChevron
        direction={direction}
        size={size}
        className="j-tour-arrow"
      />
    );
  }

  return (
    <img
      src={src}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      className="j-tour-arrow"
      style={{ transform: rotation ? `rotate(${rotation}deg)` : undefined }}
      onError={() => setFallback(true)}
    />
  );
}

export default PhotoTourArrow;