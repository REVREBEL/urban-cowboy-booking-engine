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
<FocusAmenity
  active={false}
  count={1}
  icon="tub"
  onSelect={() => {}}
  title="Clawfoot soaking tub"
/>



export const IconsDefault: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3 rounded-xl bg-paper p-4">
      <FocusAmenity  active={false} count={1} icon="robes" onSelect={() => {}} title="Pendleton Robes"/>
      <FocusAmenity  active={false} count={1} icon="seat" onSelect={() => {}} title="Sitting Area"/>
      <FocusAmenity  active={false} count={1} icon="window" onSelect={() => {}} title="Architectural Diamond Window"/>
      <FocusAmenity  active={false} count={1} icon="stove" onSelect={() => {}} title="Cast Iron Wood Stove"/>
      <FocusAmenity  active={false} count={1} icon="desk" onSelect={() => {}} title="Letter Writing Desk"/>
    </div>
  ),
};

export const IconsActive: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3 rounded-xl bg-paper p-4">
      <FocusAmenity  active={true} count={1} icon="robes" onSelect={() => {}} title="Pendleton Robes"/>
      <FocusAmenity  active={true} count={1} icon="seat" onSelect={() => {}} title="Sitting Area"/>
      <FocusAmenity  active={true} count={1} icon="window" onSelect={() => {}} title="Architectural Diamond Window"/>
      <FocusAmenity  active={true} count={1} icon="stove" onSelect={() => {}} title="Cast Iron Wood Stove"/>
      <FocusAmenity  active={false} count={1} icon="desk" onSelect={() => {}} title="Letter Writing Desk"/>
    </div>
  ),
};


export const Playground: Story = {};
/** Alias preserved for links pointing to the original Button story. */
export const Default: Story = {};

export const Active: Story = { args: { active: true } };