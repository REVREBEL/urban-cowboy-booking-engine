import type { TourIcon } from "@/journey/tour";
import { CmsAmenityIcon } from "./CmsAmenityIcon";

/** Figma AmenityIcons slot, resolved using existing Webflow CMS SVG asset mapping. */
export interface AmenityIconsProps {
  icon: TourIcon;
  iconPath?: string | null;
  className?: string;
}
export function AmenityIcons({ icon, iconPath, className = "" }: AmenityIconsProps) {
  return <span className={["focus-amenity-icon", className].filter(Boolean).join(" ")} aria-hidden="true">
    <CmsAmenityIcon iconPath={iconPath} fallback={icon} className="focus-amenity-icon-svg" />
  </span>;
}
export default AmenityIcons;
