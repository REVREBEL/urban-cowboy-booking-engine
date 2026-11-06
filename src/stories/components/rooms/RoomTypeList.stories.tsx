import type { Meta, StoryObj } from "@storybook/react-vite";
import { BuildingDescription } from "@/components/rooms/BuildingDescription";
import { BuildingIcon } from "@/components/rooms/BuildingIcon";
import { RoomListItem, type RoomTypeCardData } from "@/components/rooms/RoomListItem";
import { RoomTypeList } from "@/components/rooms/RoomTypeList";

const makeRoomTypes = (prefix: string): RoomTypeCardData[] =>
  Array.from({ length: 6 }, (_, index) => ({
    id: prefix + "-" + (index + 1),
    roomTypeName: "Opa's Cabin 4 Bedroom",
    buildingName: "Opa's Cabin",
    numberOfBeds: "8 beds",
    price: "$596",
    state: index === 3 ? "Focus" : "Default",
  }));

const buildingCopy = {
  buildingName: "Alpine",
  buildingDescription:
    "Built into the hillside above the Lodge, Alpine is home to ten of The Cowboy's most iconic rooms. Every suite pairs a freestanding clawfoot tub in front of a picture window, with the forest and mountains doing the decorating outside.",
  buildingTagline:
    "This is Where you Come to Soak, Slow Down and Disappear for a While.",
};

const buildingGroup1 = (
  <RoomListItem
    layout="Row"
    className="[--room-list-building-panel:transparent]"
    roomTypes={makeRoomTypes("group-1")}
    buildingSectionSlot={
      <BuildingDescription
        {...buildingCopy}
        layout="StackedCenter"
        className="[--building-name-color:var(--paper)] [--building-description-color:var(--paper)] [--building-tagline-color:var(--alpine-linen)]"
      />
    }
  />
);

const buildingGroup2 = (
  <RoomListItem
    layout="Row"
    roomTypes={makeRoomTypes("group-2")}
    buildingSectionSlot={
      <BuildingDescription
        {...buildingCopy}
        layout="StackedCenter"
        displayBuildingIcon
        buildingIconSlot={<BuildingIcon buildingName="Alpine" decorative />}
      />
    }
  />
);

const buildingGroup3 = (
  <RoomListItem
    layout="Row"
    roomTypes={makeRoomTypes("group-3")}
    buildingSectionSlot={
      <BuildingDescription {...buildingCopy} layout="StackedCenter" />
    }
  />
);

const meta = {
  title: "Components/Rooms/RoomTypeList",
  component: RoomTypeList,
  tags: ["autodocs"],
  args: {
    buildingGroup1,
    buildingGroup2,
    buildingGroup3,
  },
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="w-full overflow-x-auto bg-primary-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RoomTypeList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FigmaReference: Story = {};
