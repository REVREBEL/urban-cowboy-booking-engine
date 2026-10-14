import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight } from "lucide-react";

/** Use the photo tour SVGs from public/assets/icons/ui, falling back to Lucide if an asset cannot load. */
export function PhotoTourArrow({ direction, size = 18 }: { direction: 'up' | 'down' | 'left' | 'right'; size?: number }) {
  const [fallback, setFallback] = useState(false);
  const isUp = direction !== 'down';
  const src = `/assets/icons/ui/ui-arrow-${isUp ? 'up' : 'down'}.svg`;
  const rotation = direction === 'left' ? -90 : direction === 'right' ? 90 : 0;
  const LucideArrow = direction === 'up' ? ArrowUp : direction === 'down' ? ArrowDown : direction === 'left' ? ChevronLeft : ChevronRight;
  return fallback ? (
    <LucideArrow size={size} aria-hidden="true" />
  ) : (
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
