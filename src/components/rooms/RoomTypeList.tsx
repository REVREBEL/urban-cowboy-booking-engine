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

/**
 * Figma RoomTypeList (1352:14825).
 *
 * Building groups and cards are collection-driven so the component can render
 * the real booking-engine inventory rather than the illustrative slot count
 * shown in Figma.
 */
export function RoomTypeList({
  groups,
  className = "",
}: RoomTypeListProps) {
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
      {groups.map((group) => (
        <section
          key={group.id}
          className="flex w-full shrink-0 flex-col items-start overflow-clip"
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
