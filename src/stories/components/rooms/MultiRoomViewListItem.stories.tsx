import type { Meta, StoryObj } from "@storybook/react-vite";
import { MultiRoomViewBuilding } from "@/components/rooms/MultiRoomViewBuilding";
import {
  MultiRoomViewListItem,
  type MultiRoomViewRoomTypeCardData,
} from "@/components/rooms/MultiRoomViewListItem";

const makeRoomTypes = (count: number): MultiRoomViewRoomTypeCardData[] =>
  Array.from({ length: count }, (_, index) => ({
    id: "room-" + (index + 1),
    roomTypeName: "Opa's Cabin 4 Bedroom",
    buildingName: "Opa's Cabin",
    numberOfBeds: "8 beds",
    price: "$596",
    state: index === 1 ? "Focus" : "Default",
  }));

const rowBuilding = <MultiRoomViewBuilding layout="Row" />;
const stackedBuilding = <MultiRoomViewBuilding layout="StackedCenter" />;

const meta = {
  title: "Components/Rooms/MultiRoomViewList/MultiRoomViewListItem",
  component: MultiRoomViewListItem,
  tags: ["autodocs"],
  args: {
    layout: "Default",
    displayBuilding: true,
    roomTypes: makeRoomTypes(4),
  },
  argTypes: {
    layout: {
      control: "select",
      options: ["Default", "Row", "RowReverse"],
    },
    displayBuilding: {
      control: "boolean",
    },
    buildingSectionSlot: {
      control: false,
      description: "ReactNode slot for the Figma BuildingSection component.",
      table: {
        type: { summary: "ReactNode" },
        defaultValue: { summary: "null" },
      },
    },
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/2dpdHI6BTGjXcK54hTx2DK/Urban-Cowboy?node-id=1352-15460",
    },
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="w-full min-w-0 box-border p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MultiRoomViewListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <MultiRoomViewListItem {...args} buildingSectionSlot={rowBuilding} />
  ),
};

export const Row: Story = {
  args: {
    layout: "Row",
    roomTypes: makeRoomTypes(6),
  },
  render: (args) => (
    <MultiRoomViewListItem {...args} buildingSectionSlot={stackedBuilding} />
  ),
};

export const RowReverse: Story = {
  args: {
    layout: "RowReverse",
    roomTypes: makeRoomTypes(6),
  },
  render: (args) => (
    <MultiRoomViewListItem {...args} buildingSectionSlot={stackedBuilding} />
  ),
};
