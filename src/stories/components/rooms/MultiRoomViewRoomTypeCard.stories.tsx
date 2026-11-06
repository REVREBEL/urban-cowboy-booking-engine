

import type { Meta, StoryObj } from "@storybook/react-vite";
import { MultiRoomViewRoomTypeCard } from "@/components/rooms/MultiRoomViewRoomTypeCard";

const meta = {
  title: "Components/Rooms/MultiRoomViewList/MultiRoomViewRoomTypeCard",
  component: MultiRoomViewRoomTypeCard,
  tags: ["autodocs"],
  args: {
    buildingName: "Opa's Cabin",
    numberOfBeds: "8 beds",
    price: "$596",
    roomTypeName: "Opa's Cabin 4 Bedroom",
    state: "Default",
  },
  argTypes: {
    state: {
      control: "select",
      options: ["Default", "Focus"],
    },
    roomTypeImage: {
      control: false,
      description: "ReactNode slot for the room type image.",
      table: {
        type: { summary: "ReactNode" },
        defaultValue: { summary: "Figma default image" },
      },
    },
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/2dpdHI6BTGjXcK54hTx2DK/Urban-Cowboy?node-id=1352-14810",
    },
    layout: "centered",
  },
} satisfies Meta<typeof MultiRoomViewRoomTypeCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Focus: Story = {
  args: {
    state: "Focus",
  },
};
