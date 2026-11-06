import type { Meta, StoryObj } from "@storybook/react-vite";
import { BuildingDescription } from "@/components/rooms/BuildingDescription";
import { RoomListItem, type RoomTypeCardData } from "@/components/rooms/RoomListItem";

const makeRoomTypes = (count: number): RoomTypeCardData[] =>
  Array.from({ length: count }, (_, index) => ({
    id: "room-" + (index + 1),
    roomTypeName: "Opa's Cabin 4 Bedroom",
    buildingName: "Opa's Cabin",
    numberOfBeds: "8 beds",
    price: "$596",
    state: index === 1 ? "Focus" : "Default",
  }));

const rowBuilding = <BuildingDescription layout="Row" />;
const stackedBuilding = <BuildingDescription layout="StackedCenter" />;

const meta = {
  title: "Components/Rooms/RoomListItem",
  component: RoomListItem,
  tags: ["autodocs"],
  args: {
    layout: "Default",
    displayBuilding: true,
    roomTypes: makeRoomTypes(4),
    buildingSectionSlot: rowBuilding,
  },
  argTypes: {
    layout: {
      control: "select",
      options: ["Default", "Row", "Row Reverse"],
    },
    displayBuilding: {
      control: "boolean",
    },
  },
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="w-full overflow-x-auto p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RoomListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Row: Story = {
  args: {
    layout: "Row",
    roomTypes: makeRoomTypes(6),
    buildingSectionSlot: stackedBuilding,
  },
};

export const RowReverse: Story = {
  args: {
    layout: "Row Reverse",
    roomTypes: makeRoomTypes(6),
    buildingSectionSlot: stackedBuilding,
  },
};
