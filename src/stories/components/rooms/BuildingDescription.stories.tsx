import type { Meta, StoryObj } from "@storybook/react-vite";
import { BuildingDescription } from "@/components/rooms/BuildingDescription";

const description =
  "Built into the hillside above the Lodge, Alpine is home to ten of the Cowboy's most iconic rooms. Every suite pairs a freestanding clawfoot tub in front of a picture window, with the forest and mountains doing the decorating outside.";

const meta = {
  title: "Components/Rooms/RoomTypeList/BuildingDescription",
  component: BuildingDescription,
  tags: ["autodocs"],
  args: {
    buildingName: "Alpine",
    description,
    tagline: "This is where you come to soak, slow down and disappear for a while.",
    tone: "default",
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof BuildingDescription>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    (Story) => (
      <div className="bg-secondary-foreground p-10">
        <Story />
      </div>
    ),
  ],
};

export const Inverse: Story = {
  args: {
    tone: "inverse",
  },
  decorators: [
    (Story) => (
      <div className="bg-primary-foreground p-10">
        <Story />
      </div>
    ),
  ],
};
