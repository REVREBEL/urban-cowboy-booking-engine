import { ROOM_TYPE_GROUP_PRESENTATION } from "@/data/roomTypeGroupPresentation";
import { roomTypeGroupName } from "@/data/roomTypeGroups";
import type { RoomTypeGroupKey } from "@/types/accommodations";

export interface BuildingIconProps {
  group: RoomTypeGroupKey;
  className?: string;
  alt?: string;
  decorative?: boolean;
  loading?: "eager" | "lazy";
}

/**
 * Figma BuildingIcon (1352:15528).
 *
 * Uses the canonical room-type-group presentation registry so the component
 * always resolves artwork from /assets/icons/buildings without duplicating
 * asset-path logic.
 */
export function BuildingIcon({
  group,
  className = "",
  alt,
  decorative = false,
  loading = "lazy",
}: BuildingIconProps) {
  const artwork = ROOM_TYPE_GROUP_PRESENTATION[group].iconPath;
  const resolvedAlt = decorative
    ? ""
    : alt ?? roomTypeGroupName(group) + " Architectural Illustration";

  return (
    <div
      data-figma-node="1352:15528"
      className={["flex w-full flex-col items-center justify-center", className]
        .filter(Boolean)
        .join(" ")}
    >
      <img
        src={artwork}
        alt={resolvedAlt}
        aria-hidden={decorative || undefined}
        loading={loading}
        className="h-[154.88px] w-[283px] max-w-full shrink-0 select-none object-contain"
      />
    </div>
  );
}

export default BuildingIcon;
