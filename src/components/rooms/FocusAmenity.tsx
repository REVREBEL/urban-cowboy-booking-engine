import { Button } from "@/components/ui/Button";
import type { TourIcon } from "@/journey/tour";
import { FocusAmenityCount } from "./FocusAmenityCount";
import { FocusAmenityAction } from "./FocusAmenityAction";
import { AmenityIcons } from "./AmenityIcons";

/** Single accessible hotspot. Visual pieces follow the Figma FocusAmenity system. */
export interface FocusAmenityProps {
  count: number;
  icon: TourIcon;
  iconPath?: string | null;
  title: string;
  active: boolean;
  onSelect: () => void;
  className?: string;
}
export function FocusAmenity({ count, icon, iconPath, title, active, onSelect, className = "" }: FocusAmenityProps) {
  const state = active ? "Active" : "Default";
  return (
    <Button type="button" variant="transparent" colorScheme="lake-forest" size="xsmall"
      className={["focus-amenity", className].filter(Boolean).join(" ")}
      data-state={state} aria-pressed={active} aria-label={`${String(count).padStart(2, "0")} ${title}`}
      title={title} onClick={onSelect}>
      <span className="focus-amenity-controls">
        <FocusAmenityCount count={count} state={state}/>
        <FocusAmenityAction state={state}/>
      </span>
      <AmenityIcons icon={icon} iconPath={iconPath}/>
    </Button>
  );
}
export default FocusAmenity;
