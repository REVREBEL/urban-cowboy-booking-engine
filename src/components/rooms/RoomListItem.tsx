import { BuildingDescription, type BuildingDescriptionTone } from "./BuildingDescription";
import { BuildingIcon } from "./BuildingIcon";
import { RoomTypeCard, type RoomTypeCardProps } from "./RoomTypeCard";
import type { RoomTypeGroupKey } from "@/types/accommodations";

export type RoomTypeCardData = RoomTypeCardProps & {
  id: string;
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

/**
 * Figma RoomListItem (1352:15461).
 *
 * The Figma canvas shows six card slots for illustration. Production rendering
 * is collection-driven: every item in roomTypes becomes a RoomTypeCard.
 */
export function RoomListItem({
  roomTypes,
  building = null,
  displayBuilding = true,
  className = "",
}: RoomListItemProps) {
  return (
    <div
      data-figma-node="1352:15461"
      className={[
        "flex w-[1790px] max-w-full items-center gap-[40px] p-[20px]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {displayBuilding && building ? (
        <aside className="flex w-[400px] shrink-0 self-stretch">
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
                tone={building.tone}
              />
            </div>
          </div>
        </aside>
      ) : null}

      <div
        data-name="List"
        className="flex w-[1330px] max-w-full shrink-0 flex-wrap content-start items-start gap-[20px] p-[20px]"
      >
        {roomTypes.map(({ id, ...roomType }) => (
          <RoomTypeCard key={id} {...roomType} />
        ))}
      </div>
    </div>
  );
}

export default RoomListItem;
