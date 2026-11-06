import type { Meta, StoryObj } from "@storybook/react-vite";
import { RoomTypeCard } from "@/components/rooms/RoomTypeCard";
const meta = {
  title: "Components/Rooms/RoomTypeCard",
  component: RoomTypeCard,
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
    layout: "centered",
  },
} satisfies Meta<typeof RoomTypeCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Focus: Story = {
  args: {
    state: "Focus",
  },
};
