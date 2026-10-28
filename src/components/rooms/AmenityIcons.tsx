// src/components/rooms/AmenityIcons.tsx
import type { TourIcon } from "@/journey/tour";
import { CmsAmenityIcon } from "./CmsAmenityIcon";

export interface AmenityIconsProps {
  icon: TourIcon;
  iconPath?: string | null;
  imageUrl?: string | null;
  className?: string;
}

/**
 * Renders CMS-driven icon asset with local TourIcon fallback.
 * Fills its parent container fluidly and inherits text color.
 */
export function AmenityIcons({ icon, iconPath, imageUrl, className = "" }: AmenityIconsProps) {
  return (
    <span
      aria-hidden="true"
      className={`relative grid size-full place-items-center overflow-hidden bg-transparent ${className}`}
    >
      <CmsAmenityIcon
        monochrome
        iconPath={iconPath}
        imageUrl={imageUrl}
        fallback={icon}
        className="block size-[85%] object-contain mix-blend-normal"
      />
    </span>
  );
}

export default AmenityIcons;
