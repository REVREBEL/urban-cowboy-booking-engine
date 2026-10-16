// src/stories/components/rooms/FocusAmenity.tsx

import type { Meta, StoryObj } from "@storybook/react-vite";
import { FocusAmenity } from "@/components/rooms/FocusAmenity";

const meta: Meta<typeof FocusAmenity> = {
  title: "Components/Rooms/FocusAmenity",
  component: FocusAmenity,
  tags: ["autodocs"],
  args: { count: 1, icon: "tub", title: "Clawfoot soaking tub", active: false, onSelect: () => {} },
  argTypes: {
    icon: { control: 'select', options: [ 'robes', 'tub', 'window', 'outdoor-tub', 'seat', 'window', 'stove'],},
    active: { control: 'boolean' },
  },
} satisfies Meta<typeof FocusAmenity>;
export default meta;

type Story = StoryObj<typeof FocusAmenity>;


export const Default: Story = {};
export const Active: Story = { args: { active: true } };