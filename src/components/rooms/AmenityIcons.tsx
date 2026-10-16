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
      className={`absolute right-0 top-0 grid size-32 place-items-center rounded-full bg-primary shadow-[0_0_0_2px_var(--color-accent),0_0_0_5px_var(--color-primary),0_0_0_7px_var(--color-accent)] transition-[background-color,box-shadow] duration-200 group-hover/focus-amenity:bg-accent-foreground group-data-[state=Active]/focus-amenity:bg-primary group-focus-visible/focus-amenity:shadow-[0_0_0_3px_var(--color-primary-foreground),0_0_0_7px_var(--color-primary),0_0_0_10px_var(--color-primary-foreground)] max-sm:size-24 ${className}`}
    >
      <CmsAmenityIcon
        iconPath={iconPath}
        fallback={icon}
        className="size-[56%] max-h-[56%] max-w-[56%] object-contain mix-blend-normal"
      />
    </span>
  );
}

export default AmenityIcons;
