import { ROOM_TYPE_GROUPS } from "@/data/roomTypeGroups";
import { RoomListItem, type RoomListItemBuilding, type RoomTypeCardData } from "./RoomListItem";

export interface RoomTypeListGroup {
  id: string;
  roomTypes: readonly RoomTypeCardData[];
  building?: RoomListItemBuilding | null;
  displayBuilding?: boolean;
}

export interface RoomTypeListProps {
  groups: readonly RoomTypeListGroup[];
  className?: string;
}

const groupOrder = new Map(
  ROOM_TYPE_GROUPS.map((group, index) => [group.key, index]),
);

const orderGroups = (
  groups: readonly RoomTypeListGroup[],
): RoomTypeListGroup[] =>
  [...groups].sort((a, b) => {
    const aIndex = a.building ? groupOrder.get(a.building.group) : undefined;
    const bIndex = b.building ? groupOrder.get(b.building.group) : undefined;

    if (aIndex == null && bIndex == null) return 0;
    if (aIndex == null) return 1;
    if (bIndex == null) return -1;
    return aIndex - bIndex;
  });

/**
 * Figma RoomTypeList (1352:14825).
 *
 * Building groups and cards are collection-driven so the component can render
 * the real booking-engine inventory rather than the illustrative slot count
 * shown in Figma. Known building groups use the canonical guest-facing order.
 */
export function RoomTypeList({
  groups,
  className = "",
}: RoomTypeListProps) {
  const orderedGroups = orderGroups(groups);

  return (
    <div
      data-figma-node="1352:14825"
      className={[
        "flex min-h-[1038px] w-full max-w-[2175px] flex-col items-center gap-[60px] bg-primary-foreground",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {orderedGroups.map((group) => (
        <section
          key={group.id}
          className="flex w-full shrink-0 flex-col items-start"
        >
          <RoomListItem
            roomTypes={group.roomTypes}
            building={group.building}
            displayBuilding={group.displayBuilding}
          />
        </section>
      ))}
    </div>
  );
}

export default RoomTypeList;
