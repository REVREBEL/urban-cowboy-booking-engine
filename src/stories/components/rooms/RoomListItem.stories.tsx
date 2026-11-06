import type { Meta, StoryObj } from "@storybook/react-vite";
import { RoomListItem, type RoomTypeCardData } from "@/components/rooms/RoomListItem";

const roomTypes: RoomTypeCardData[] = Array.from({ length: 6 }, (_, index) => ({
  id: "opa-" + (index + 1),
  roomTypeName: index % 2 === 0 ? "Opa's Cabin 4 Bedroom" : "Opa's Cabin 2 Bedroom",
  buildingName: "Opa's Cabin",
  numberOfBeds: index % 2 === 0 ? "8 beds" : "4 beds",
  price: index % 2 === 0 ? "$596" : "$396",
  mediaSlot: <div aria-hidden="true" className="size-full bg-secondary-foreground" />,
  state: index === 3 ? "Focus" : "Default",
}));

const meta = {
  title: "Components/Rooms/RoomTypeList/RoomListItem",
  component: RoomListItem,
  tags: ["autodocs"],
  args: {
    roomTypes,
    displayBuilding: true,
    building: {
      group: "alpine",
      name: "Alpine",
      description:
        "Built into the hillside above the Lodge, Alpine is home to ten of the Cowboy's most iconic rooms. Every suite pairs a freestanding clawfoot tub in front of a picture window, with the forest and mountains doing the decorating outside.",
      tagline: "This is where you come to soak, slow down and disappear for a while.",
      displayIcon: true,
      panel: true,
      tone: "default",
    },
  },
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof RoomListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithBuilding: Story = {};

export const CardsOnly: Story = {
  args: {
    displayBuilding: false,
  },
};
