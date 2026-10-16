import type { TourIcon } from "@/journey/tour";
import { CmsAmenityIcon } from "./CmsAmenityIcon";

export interface AmenityIconsProps {
  icon: TourIcon;
  iconPath?: string | null;
  className?: string;
}

/** Figma icon medallion using the existing Webflow SVG resolver and fallback. */
export function AmenityIcons({ icon, iconPath, className = "" }: AmenityIconsProps) {
  return (
    <span aria-hidden="true"
      className={`absolute right-0 top-0 grid size-[76px] place-items-center overflow-hidden rounded-full border-[3px] border-double border-lake-forest bg-alpine-linen shadow-[inset_0_0_0_3px_var(--color-alpine-linen),inset_0_0_0_5px_var(--color-lake-forest),0_8px_22px_#0003] transition-all duration-200 group-hover/focus-amenity:border-lake-forest-fade group-data-[state=Active]/focus-amenity:size-32 group-data-[state=Active]/focus-amenity:bg-paper max-sm:size-14 max-sm:group-data-[state=Active]/focus-amenity:size-24 ${className}`}>
      <CmsAmenityIcon iconPath={iconPath} fallback={icon}
        className="!size-[56%] !max-w-[56%] !max-h-[56%] !object-contain !transform-none !mix-blend-normal" />
    </span>
  );
}

export default AmenityIcons;
