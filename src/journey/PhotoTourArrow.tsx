import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";

/** Use existing photo tour arrow assets, with a visible Lucide fallback. */
export function PhotoTourArrow({ direction, size = 18, chevron = false }: { direction: 'up' | 'down' | 'left' | 'right'; size?: number; chevron?: boolean }) {
  const [fallback, setFallback] = useState(false);
  const isUp = direction !== 'down';
  const src = `/assets/icons/ui/ui-arrow-${isUp ? 'up' : 'down'}.svg`;
  const rotation = direction === 'left' ? -90 : direction === 'right' ? 90 : 0;
  const LucideArrow = direction === 'up' ? (chevron ? ChevronUp : ArrowUp)
    : direction === 'down' ? (chevron ? ChevronDown : ArrowDown)
    : direction === 'left' ? ChevronLeft : ChevronRight;

  // No ui-chevron-*.svg files exist. Render a real icon rather than a broken CSS mask.
  if (chevron || fallback) return <LucideArrow size={size} aria-hidden="true" />;

  return (
    <img src={src} width={size} height={size} alt="" aria-hidden="true"
      className="j-tour-arrow"
      style={{ transform: rotation ? `rotate(${rotation}deg)` : undefined }}
      onError={() => setFallback(true)}
    />
  );
}
