import type { Meta, StoryObj } from "@storybook/react-vite";
import { FocusAmenityCount } from "@/components/rooms/FocusAmenityCount";
import "@/styles/focus-amenity.css";

const meta = {
  title: "Components/Rooms/FocusAmenityCount",
  component: FocusAmenityCount,
  tags: ["autodocs"],
  args: { count: "01", state: "Default" },
  argTypes: { state: { control: "inline-radio", options: ["Default", "Hover", "Active"] } },
} satisfies Meta<typeof FocusAmenityCount>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Hover: Story = { args: { state: "Hover" } };
export const Active: Story = { args: { state: "Active" } };