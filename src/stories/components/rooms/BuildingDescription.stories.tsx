import type { Meta, StoryObj } from "@storybook/react-vite";
import { BuildingDescription } from "@/components/rooms/BuildingDescription";
import { BuildingIcon } from "@/components/rooms/BuildingIcon";

const icon = <BuildingIcon buildingName="Alpine" />;

const meta = {
  title: "Components/Rooms/BuildingDescription",
  component: BuildingDescription,
  tags: ["autodocs"],
  args: {
    buildingName: "Alpine",
    buildingDescription:
      "Built into the hillside above the Lodge, Alpine is home to ten of The Cowboy's most iconic rooms. Every suite pairs a freestanding clawfoot tub in front of a picture window, with the forest and mountains doing the decorating outside.",
    buildingTagline:
      "This is Where you Come to Soak, Slow Down and Disappear for a While.",
    layout: "Row",
    displayBuildingIcon: false,
  },
  argTypes: {
    buildingIconSlot: { control: false, table: { disable: true } },
    layout: {
      control: "select",
      options: ["Row", "Row Reverse", "StackedCenter", "StackedLeft"],
    },
    displayBuildingIcon: {
      control: "boolean",
    },
    buildingIconSlot: {
      control: false,
      description: "ReactNode slot for a BuildingIcon instance.",
      table: {
        type: { summary: "ReactNode" },
        defaultValue: { summary: "null" },
      },
    },
  },
  parameters: {
    design: { type: "figma", url: "https://www.figma.com/design/2dpdHI6BTGjXcK54hTx2DK/Urban-Cowboy?node-id=1352-15525" },
    layout: "centered",
  },
} satisfies Meta<typeof BuildingDescription>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Row: Story = {};

export const RowWithIcon: Story = {
  args: {
    displayBuildingIcon: true,
  },
  render: (args) => (
    <BuildingDescription {...args} buildingIconSlot={icon} />
  ),
};

export const RowReverse: Story = {
  args: {
    layout: "Row Reverse",
  },
};

export const RowReverseWithIcon: Story = {
  args: {
    layout: "Row Reverse",
    displayBuildingIcon: true,
  },
  render: (args) => (
    <BuildingDescription {...args} buildingIconSlot={icon} />
  ),
};

export const StackedCenter: Story = {
  args: {
    layout: "StackedCenter",
  },
};

export const StackedCenterWithIcon: Story = {
  args: {
    layout: "StackedCenter",
    displayBuildingIcon: true,
  },
  render: (args) => (
    <BuildingDescription {...args} buildingIconSlot={icon} />
  ),
};

export const StackedLeft: Story = {
  args: {
    layout: "StackedLeft",
  },
};

export const StackedLeftWithIcon: Story = {
  args: {
    layout: "StackedLeft",
    displayBuildingIcon: true,
  },
  render: (args) => (
    <BuildingDescription {...args} buildingIconSlot={icon} />
  ),
};
