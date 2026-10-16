import { Button } from "@/components/ui/Button";
import type { TourIcon } from "@/journey/tour";
import { FocusAmenityCount } from "./FocusAmenityCount";
import { FocusAmenityAction } from "./FocusAmenityAction";
import { AmenityIcons } from "./AmenityIcons";

export interface FocusAmenityProps {
  count: number;
  icon: TourIcon;
  iconPath?: string | null;
  title: string;
  active: boolean;
  onSelect: () => void;
  className?: string;
}

/** Self-contained, CMS-backed photo amenity control. */
export function FocusAmenity({ count, icon, iconPath, title, active, onSelect, className = "" }: FocusAmenityProps) {
  const state = active ? "Active" : "Default";
  return (
    <Button type="button" variant="transparent" colorScheme="lake-forest" size="xsmall"
      style={{ padding: 0, backgroundColor: "transparent", borderRadius: 0, display: "block" }}
      className={`group/focus-amenity relative !pointer-events-auto !block !w-[96px] !h-[76px] !overflow-visible !border-0 !bg-transparent !p-0 !rounded-none !min-w-0 transition-[width,height] duration-200 data-[state=Active]:!w-[154px] data-[state=Active]:!h-32 max-sm:!w-[72px] max-sm:!h-14 max-sm:data-[state=Active]:!w-[117px] max-sm:data-[state=Active]:!h-24 ${className}`}
      data-state={state} aria-pressed={active} aria-label={`${String(count).padStart(2, "0")} ${title}`}
      title={title} onClick={onSelect}>
      <span aria-hidden="true" className="absolute left-0 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-[3px]">
        <FocusAmenityCount count={count} state={state}
          className={active ? "!size-10 !text-xl max-sm:!size-8 max-sm:!text-base" : ""} />
        <FocusAmenityAction state={state}
          className={active ? "!size-10 max-sm:!size-8" : ""} />
      </span>
      <AmenityIcons icon={icon} iconPath={iconPath} />
    </Button>
  );
}

export default FocusAmenity;
