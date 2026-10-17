import type { TourIcon } from "@/journey/tour";
import { CmsAmenityIcon } from "./CmsAmenityIcon";

export interface AmenityIconsProps {
  icon: TourIcon;
  iconPath?: string | null;
  className?: string;
}

/**
 * Constant-diameter medallion with exactly two rings OUTSIDE the disc.
 * No inset ring, border or separate rectangular frame. The icon remains
 * CMS-driven; the local TourIcon is only the final asset fallback.
 */
export function AmenityIcons({ icon, iconPath, className = "" }: AmenityIconsProps) {
  return (
    <span
      aria-hidden="true"
      className={`absolute right-0 top-0 grid size-32 place-items-center overflow-hidden rounded-full bg-alpine-linen-300 shadow-[0_0_0_2px_var(--lake-forest),0_0_0_5px_var(--alpine-linen-300),0_0_0_7px_var(--lake-forest-fade)] transition-[background-color,box-shadow] duration-200 group-hover/focus-amenity:bg-accent-foreground group-data-[state=Active]/focus-amenity:bg-alpine-linen-50 group-focus-visible/focus-amenity:shadow-[0_0_0_3px_var(--lake-forest-fade),0_0_0_7px_var(--paper-50),0_0_0_10px_var(--lake-forest-fade)] max-sm:size-24 ${className}`}
    >
      <CmsAmenityIcon
        iconPath={iconPath}
        fallback={icon}
        className="absolute left-1/2 top-1/2 block size-[68%] -translate-x-1/2 -translate-y-1/2 object-contain mix-blend-normal"
      />
    </span>
  );
}

export default AmenityIcons;
