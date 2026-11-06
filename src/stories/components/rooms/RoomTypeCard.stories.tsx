import type { Meta, StoryObj } from "@storybook/react-vite";
import { RoomTypeCard } from "@/components/rooms/RoomTypeCard";

const media = (
  <div
    aria-label="Room image placeholder"
    className="size-full bg-secondary-foreground"
  />
);

const meta = {
  title: "Components/Rooms/RoomTypeList/RoomTypeCard",
  component: RoomTypeCard,
  tags: ["autodocs"],
  args: {
    roomTypeName: "Opa's Cabin 4 Bedroom",
    buildingName: "Opa's Cabin",
    numberOfBeds: "8 beds",
    price: "$596",
    mediaSlot: media,
    state: "Default",
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
