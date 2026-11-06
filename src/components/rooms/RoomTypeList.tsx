import type { ReactNode } from "react";

export interface RoomTypeListProps {
  className?: string;
  buildingGroup1: ReactNode;
  buildingGroup2: ReactNode;
  buildingGroup3: ReactNode;
}

/**
 * Figma RoomTypeList component (1352:14825).
 *
 * The component is a three-slot composition. Each slot accepts a complete
 * RoomListItem instance so its Figma-level nested overrides remain explicit.
 */
export function RoomTypeList({
  className = "",
  buildingGroup1,
  buildingGroup2,
  buildingGroup3,
}: RoomTypeListProps) {
  return (
    <div
      data-figma-node="1352:14825"
      data-name="RoomTypeList"
      className={[
        "flex min-h-[1038px] w-[2175px] flex-col items-center gap-[60px] bg-primary-foreground",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        data-name="BuildingGroup1"
        className="flex w-full shrink-0 flex-col items-start overflow-clip"
      >
        {buildingGroup1}
      </div>
      <div
        data-name="BuildingGroup2"
        className="flex w-full shrink-0 flex-col items-start overflow-clip"
      >
        {buildingGroup2}
      </div>
      <div
        data-name="BuildingGroup3"
        className="flex w-full shrink-0 flex-col items-start overflow-clip"
      >
        {buildingGroup3}
      </div>
    </div>
  );
}

export default RoomTypeList;
