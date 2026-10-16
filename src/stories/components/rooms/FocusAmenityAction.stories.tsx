import type { Meta, StoryObj } from "@storybook/react-vite";
import { FocusAmenityAction } from "@/components/rooms/FocusAmenityAction";

const meta = {
  title: "Components/Rooms/FocusAmenityAction",
  component: FocusAmenityAction,
  tags: ["autodocs"],
  args: { state: "Default" },
  argTypes: { state: { control: "inline-radio", options: ["Default", "Hover", "Active"] } },
} satisfies Meta<typeof FocusAmenityAction>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Hover: Story = { args: { state: "Hover" } };
export const Active: Story = { args: { state: "Active" } };
