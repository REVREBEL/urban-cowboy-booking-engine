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
    design: { type: "figma", url: "https://www.figma.com/design/2dpdHI6BTGjXcK54hTx2DK/Urban-Cowboy?node-id=1352-9306" },
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
