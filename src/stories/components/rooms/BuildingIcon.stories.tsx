import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  BuildingIcon,
  type BuildingIconColor,
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

const colors: BuildingIconColor[] = [
  "Smoke",
  "Snow",
  "LakeForest",
  "Ash",
  "Alpine",
];

const meta = {
  title: "Components/Rooms/BuildingIcon",
  component: BuildingIcon,
  tags: ["autodocs"],
  args: {
    buildingName: "Default",
    color: "Smoke",
  },
  argTypes: {
    buildingName: {
      control: "select",
      options: variants,
    },
    color: {
      control: "select",
      options: colors,
      description:
        "Figma BuildingIconColors state folded into BuildingIcon (component set 1352:15806).",
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
  render: (args) => (
    <div className="flex w-[325px] flex-col items-center gap-[24px] p-[20px]">
      {variants.map((buildingName) => (
        <BuildingIcon
          key={buildingName}
          {...args}
          buildingName={buildingName}
        />
      ))}
    </div>
  ),
};


export const AllColors: Story = {
  render: (args) => (
    <div className="flex w-[325px] flex-col items-center gap-[24px] p-[20px]">
      {colors.map((color) => (
        <div key={color} className="flex w-full flex-col items-center gap-[8px]">
          <BuildingIcon {...args} color={color} />
          <span className="font-label text-[11px] uppercase text-smoke">
            {color}
          </span>
        </div>
      ))}
    </div>
  ),
};
