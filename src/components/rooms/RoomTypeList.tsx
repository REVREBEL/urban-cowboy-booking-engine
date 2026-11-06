import type { ReactNode } from "react";
import { BuildingDescription } from "./BuildingDescription";
import { BuildingIcon } from "./BuildingIcon";
import { RoomListItem, type RoomTypeCardData } from "./RoomListItem";

export interface RoomTypeListProps {
  className?: string;
  buildingGroup1?: ReactNode | null;
  buildingGroup2?: ReactNode | null;
  buildingGroup3?: ReactNode | null;
}

const DEFAULT_BUILDING_DESCRIPTION =
  "Built into the hillside above the Lodge, Alpine is home to ten of The Cowboy's most iconic rooms. Every suite pairs a freestanding clawfoot tub in front of a picture window, with the forest and mountains doing the decorating outside.";

const DEFAULT_BUILDING_TAGLINE =
  "This is Where you Come to Soak, Slow Down and Disappear for a While.";

const makeDefaultRoomTypes = (prefix: string): RoomTypeCardData[] =>
  Array.from({ length: 6 }, (_, index) => ({
    id: prefix + "-" + (index + 1),
    buildingName: "Opa's Cabin",
    numberOfBeds: "8 beds",
    price: "$596",
    roomTypeName: "Opa's Cabin 4 Bedroom",
    state: index === 3 ? "Focus" : "Default",
  }));

const buildingCopy = {
  buildingName: "Alpine",
  buildingDescription: DEFAULT_BUILDING_DESCRIPTION,
  buildingTagline: DEFAULT_BUILDING_TAGLINE,
};

const DEFAULT_BUILDING_GROUP_1 = (
  <RoomListItem
    layout="Row"
    className="[--room-list-building-panel:transparent]"
    roomTypes={makeDefaultRoomTypes("figma-group-1")}
    buildingSectionSlot={
      <BuildingDescription
        {...buildingCopy}
        layout="StackedCenter"
        className="[--building-name-color:var(--paper)] [--building-description-color:var(--paper)] [--building-tagline-color:var(--alpine-linen)]"
      />
    }
  />
);

const DEFAULT_BUILDING_GROUP_2 = (
  <RoomListItem
    layout="Row"
    roomTypes={makeDefaultRoomTypes("figma-group-2")}
    buildingSectionSlot={
      <BuildingDescription
        {...buildingCopy}
        layout="StackedCenter"
        displayBuildingIcon
        buildingIconSlot={<BuildingIcon buildingName="Alpine" />}
      />
    }
  />
);

const DEFAULT_BUILDING_GROUP_3 = (
  <RoomListItem
    layout="Row"
    roomTypes={makeDefaultRoomTypes("figma-group-3")}
    buildingSectionSlot={
      <BuildingDescription {...buildingCopy} layout="StackedCenter" />
    }
  />
);

/**
 * Figma RoomTypeList component (1352:14825).
 *
 * Figma exposes three optional BuildingGroup slots. With no slot overrides the
 * component renders the exact default three-group composition from the source
 * component; callers can replace any group independently.
 */
export function RoomTypeList({
  className = "",
  buildingGroup1 = null,
  buildingGroup2 = null,
  buildingGroup3 = null,
}: RoomTypeListProps) {
  return (
    <div
      data-figma-node="1352:14825"
      data-name="RoomTypeList"
      className={[
        "flex w-full max-w-[1513px] min-w-0 flex-col items-center gap-[60px] bg-primary-foreground",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        data-name="BuildingGroup1"
        className="flex w-full min-w-0 shrink-0 flex-col items-start"
      >
        {buildingGroup1 ?? DEFAULT_BUILDING_GROUP_1}
      </div>
      <div
        data-name="BuildingGroup2"
        className="flex w-full min-w-0 shrink-0 flex-col items-start"
      >
        {buildingGroup2 ?? DEFAULT_BUILDING_GROUP_2}
      </div>
      <div
        data-name="BuildingGroup3"
        className="flex w-full min-w-0 shrink-0 flex-col items-start"
      >
        {buildingGroup3 ?? DEFAULT_BUILDING_GROUP_3}
      </div>
    </div>
  );
}

export default RoomTypeList;
