import type { Meta, StoryObj } from "@storybook/react-vite";
import { RoomTypeCard } from "@/components/rooms/RoomTypeCard";
import { ROOM_IMAGE_ASSETS } from "@/data/roomImagePlaceholders";

const roomImage = (
  <img
    src={ROOM_IMAGE_ASSETS.CABIN_SIDE_VIEW_SITTING_AREA}
    alt="Cabin sitting area"
    className="block size-full max-w-none rounded-[8px] object-cover"
  />
);

const meta = {
  title: "Components/Rooms/RoomTypeCard",
  component: RoomTypeCard,
  tags: ["autodocs"],
  args: {
    buildingName: "Opa's Cabin",
    numberOfBeds: "8 beds",
    price: "$596",
    roomTypeName: "Opa's Cabin 4 Bedroom",
    roomTypeImage: roomImage,
    state: "Default",
  },
  argTypes: {
    state: {
      control: "select",
      options: ["Default", "Focus"],
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
