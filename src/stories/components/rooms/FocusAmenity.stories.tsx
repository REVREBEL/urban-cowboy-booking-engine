import type { Meta, StoryObj } from "@storybook/react-vite";
import { FocusAmenity } from "@/components/rooms/FocusAmenity";

const meta = {
  title: "Components/Rooms/FocusAmenity",
  component: FocusAmenity,
  tags: ["autodocs"],
  args: { count: 1, icon: "tub", title: "Clawfoot soaking tub", active: false, onSelect: () => {} },
  parameters: { layout: "centered" },
} satisfies Meta<typeof FocusAmenity>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Active: Story = { args: { active: true } };
