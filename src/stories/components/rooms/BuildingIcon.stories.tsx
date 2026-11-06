import type { Meta, StoryObj } from "@storybook/react-vite";
import { BuildingIcon } from "@/components/rooms/BuildingIcon";

const meta = {
  title: "Components/Rooms/RoomTypeList/BuildingIcon",
  component: BuildingIcon,
  tags: ["autodocs"],
  args: {
    group: "alpine",
  },
  argTypes: {
    group: {
      control: "select",
      options: [
        "alpine",
        "walden",
        "lodge",
        "forest-house",
        "cabin",
        "chalet",
        "opas",
        "slide-mountain",
        "mountain-view",
      ],
    },
    decorative: {
      control: "boolean",
    },
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof BuildingIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Alpine: Story = {};

export const OpaCabin: Story = {
  args: {
    group: "opas",
  },
};
