//stories/components/FeatureFocus.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-vite';
import { FeatureFocus } from '@/components/rooms/FeatureFocus';

const meta: Meta<typeof FeatureFocus> = {
  title: 'Components/Rooms/FeatureFocus',
  component: FeatureFocus,
  tags: ['autodocs'],
    args: {
      count: 1,
    icon: 'bed',
    title: 'Feature Hotspot',
    active: false,
    onSelect: () => { },
    },
    argTypes: {
    icon: { control: 'select', options: [ 'robes', 'tub', 'window', 'outdoor-tub', 'seat', 'window', 'stove'],},
    active: { control: 'boolean' },
  },
} satisfies Meta<typeof FeatureFocus>;
export default meta;

type Story = StoryObj<typeof FeatureFocus>;

export const Default: Story = {
  args: {
    count: 1,
    icon: 'bed',
    title: 'Feature Hotspot',
    active: false,
    onSelect: () => { },
  }
};

export const Active: Story = {
  args: { count: 1, icon: 'tub', title: 'Clawfoot soaking tub', active: true, onSelect: () => { } },
};
