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
  },
  decorators: [
    (Story) => (
      <div className="w-full overflow-x-auto bg-primary-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RoomTypeList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FigmaReference: Story = {};
