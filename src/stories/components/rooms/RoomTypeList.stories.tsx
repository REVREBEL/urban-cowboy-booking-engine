import type { Meta, StoryObj } from "@storybook/react-vite";
import { RoomTypeList, type RoomTypeListGroup } from "@/components/rooms/RoomTypeList";
import type { RoomTypeCardData } from "@/components/rooms/RoomListItem";

const makeCards = (
  prefix: string,
  buildingName: string,
  count: number,
): RoomTypeCardData[] =>
  Array.from({ length: count }, (_, index) => ({
    id: prefix + "-" + (index + 1),
    roomTypeName: index % 2 === 0 ? buildingName + " King" : buildingName + " Bathing Suite",
    buildingName,
    numberOfBeds: index % 2 === 0 ? "1 bed" : "2 beds",
    price: index % 2 === 0 ? "$396" : "$596",
    mediaSlot: <div aria-hidden="true" className="size-full bg-secondary-foreground" />,
    state: index === 2 ? "Focus" : "Default",
  }));

const groups: RoomTypeListGroup[] = [
  {
    id: "alpine",
    building: {
      group: "alpine",
      name: "Alpine",
      description:
        "Built into the hillside above the Lodge, Alpine is home to ten of the Cowboy's most iconic rooms. Every suite pairs a freestanding clawfoot tub in front of a picture window, with the forest and mountains doing the decorating outside.",
      tagline: "This is where you come to soak, slow down and disappear for a while.",
      displayIcon: false,
      panel: false,
      tone: "inverse",
    },
    roomTypes: makeCards("alpine", "Alpine", 6),
  },
  {
    id: "walden",
    building: {
      group: "walden",
      name: "Walden",
      description:
        "Walden sits closer to the woods, with private decks, forest views and cedar tubs made for soaking outside.",
      tagline: "This is where the Cowboy gets a little wilder.",
      displayIcon: true,
      panel: true,
      tone: "default",
    },
    roomTypes: makeCards("walden", "Walden", 5),
  },
  {
    id: "cabin",
    building: {
      group: "cabin",
      name: "Cabin",
      description:
        "Six hundred square feet, your own porch, a copper clawfoot tub and enough room to briefly consider never going home.",
      tagline: "Coffee works out there. Cocktails work better.",
      displayIcon: true,
      panel: true,
      tone: "default",
    },
    roomTypes: makeCards("cabin", "Cabin", 3),
  },
];

const meta = {
  title: "Components/Rooms/RoomTypeList/RoomTypeList",
  component: RoomTypeList,
  tags: ["autodocs"],
  args: {
    groups,
  },
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="min-w-[2175px] bg-primary-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RoomTypeList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FigmaReference: Story = {};
