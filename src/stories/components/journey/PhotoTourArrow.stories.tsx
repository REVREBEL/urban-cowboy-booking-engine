import type { Meta, StoryObj } from "@storybook/react-vite";
import { PhotoTourArrow } from "@/journey/PhotoTourArrow";

const meta = {
  title: "Journey/Photo Tour Arrow",
  component: PhotoTourArrow,
  tags: ["autodocs"],
  args: { direction: "right", size: 24, chevron: false },
  argTypes: {
    direction: { control: "select", options: ["up", "down", "left", "right"] },
    size: { control: { type: "range", min: 12, max: 48, step: 2 } },
    chevron: { control: "boolean" },
  },
  decorators: [(Story) => <div className="flex min-h-32 items-center justify-center bg-smoke text-paper"><Story /></div>],
} satisfies Meta<typeof PhotoTourArrow>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Arrow: Story = {};
export const Chevron: Story = { args: { chevron: true } };
export const Back: Story = { args: { direction: "left", size: 16 } };
