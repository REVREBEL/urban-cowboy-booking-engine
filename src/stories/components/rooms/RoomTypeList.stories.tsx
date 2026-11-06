import type { Meta, StoryObj } from "@storybook/react-vite";
import { RoomTypeList } from "@/components/rooms/RoomTypeList";

const meta = {
  title: "Components/Rooms/RoomTypeList",
  component: RoomTypeList,
  tags: ["autodocs"],
  argTypes: {
    buildingGroup1: {
      control: false,
      description: "ReactNode slot for BuildingGroup1.",
      table: { type: { summary: "ReactNode" } },
    },
    buildingGroup2: {
      control: false,
      description: "ReactNode slot for BuildingGroup2.",
      table: { type: { summary: "ReactNode" } },
    },
    buildingGroup3: {
      control: false,
      description: "ReactNode slot for BuildingGroup3.",
      table: { type: { summary: "ReactNode" } },
    },
  },
  parameters: {
    layout: "fullscreen",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/2dpdHI6BTGjXcK54hTx2DK/Urban-Cowboy?node-id=1352-14825",
    },
  },
} satisfies Meta<typeof RoomTypeList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FigmaReference: Story = {};
