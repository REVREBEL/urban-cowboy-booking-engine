import { BuildingDescription, type BuildingDescriptionTone } from "./BuildingDescription";
import { BuildingIcon } from "./BuildingIcon";
import { RoomTypeCard, type RoomTypeCardProps } from "./RoomTypeCard";
import { ROOM_TYPE_GROUP_PRESENTATION } from "@/data/roomTypeGroupPresentation";
import type { RoomTypeGroupKey } from "@/types/accommodations";

export type RoomTypeCardData = RoomTypeCardProps & {
  id: string;
  /** Canonical room slug used by ROOM_TYPE_GROUP_PRESENTATION.roomOrder. */
  roomKey?: string;
};

export interface RoomListItemBuilding {
  group: RoomTypeGroupKey;
  name: string;
  description: string;
  tagline?: string | null;
  displayIcon?: boolean;
  tone?: BuildingDescriptionTone;
  panel?: boolean;
}

export interface RoomListItemProps {
  roomTypes: readonly RoomTypeCardData[];
  building?: RoomListItemBuilding | null;
  displayBuilding?: boolean;
  className?: string;
}

const orderRoomTypes = (
  roomTypes: readonly RoomTypeCardData[],
  group: RoomTypeGroupKey | null,
): RoomTypeCardData[] => {
  if (!group) return [...roomTypes];

  const canonicalOrder = new Map(
    ROOM_TYPE_GROUP_PRESENTATION[group].roomOrder.map((key, index) => [
      key,
      index,
    ]),
  );

  return [...roomTypes].sort((a, b) => {
    const aIndex = canonicalOrder.get(a.roomKey ?? a.id);
    const bIndex = canonicalOrder.get(b.roomKey ?? b.id);

    if (aIndex == null && bIndex == null) return 0;
    if (aIndex == null) return 1;
    if (bIndex == null) return -1;
    return aIndex - bIndex;
  });
};

/**
 * Figma RoomListItem (1352:15461).
 *
 * The Figma canvas shows six card slots for illustration. Production rendering
 * is collection-driven: every item in roomTypes becomes a RoomTypeCard.
 * Canonical room slugs are ordered through the shared presentation registry.
 */
export function RoomListItem({
  roomTypes,
  building = null,
  displayBuilding = true,
  className = "",
}: RoomListItemProps) {
  const orderedRoomTypes = orderRoomTypes(
    roomTypes,
    building?.group ?? null,
  );

  return (
    <div
      data-figma-node="1352:15461"
      className={[
        "flex w-full max-w-[1790px] flex-col items-stretch gap-[40px] p-[20px] xl:flex-row xl:items-center",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {displayBuilding && building ? (
        <aside className="flex w-full shrink-0 self-stretch xl:w-[400px]">
          <div
            className={[
              "flex h-full w-full flex-col items-start justify-center px-[20px] py-[40px]",
              building.panel ? "bg-secondary-foreground" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className="flex w-full flex-col items-start justify-center gap-[40px] py-[10px]">
              {building.displayIcon ? (
                <BuildingIcon group={building.group} decorative />
              ) : null}
              <BuildingDescription
                buildingName={building.name}
                description={building.description}
                tagline={building.tagline}
                tone={
                  building.tone ??
                  (building.panel ? "default" : "inverse")
                }
              />
            </div>
          </div>
        </aside>
      ) : null}

      <div
        data-name="List"
        className="grid min-w-0 w-full flex-1 grid-cols-1 content-start items-start justify-items-center gap-[20px] p-[20px] sm:grid-cols-2 xl:justify-items-start 2xl:grid-cols-3"
      >
        {orderedRoomTypes.map(({ id, roomKey: _roomKey, ...roomType }) => (
          <RoomTypeCard key={id} {...roomType} />
        ))}
      </div>
    </div>
  );
}

export default RoomListItem;
