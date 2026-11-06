import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  BuildingIcon,
  type BuildingIconName,
} from "@/components/rooms/BuildingIcon";

const variants: BuildingIconName[] = [
  "Default",
  "Alpine",
  "SlideMountain",
  "Ralphs",
  "Chalet",
  "ForestHaus",
  "MountianViewHaus",
  "EstonianSauna",
  "Cabin",
  "OpasCabin",
];

const meta = {
  title: "Components/Rooms/BuildingIcon",
  component: BuildingIcon,
  tags: ["autodocs"],
  args: {
    buildingName: "Default",
  },
  argTypes: {
    buildingName: {
      control: "select",
      options: variants,
    },
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof BuildingIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllFigmaVariants: Story = {
  render: () => (
    <div className="flex w-[325px] flex-col items-center gap-[24px] p-[20px]">
      {variants.map((buildingName) => (
        <BuildingIcon
          key={buildingName}
          buildingName={buildingName}
        />
      ))}
    </div>
  ),
};
