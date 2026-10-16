//stories/components/FeatureFocus.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-vite';
import {FocusAmenityCount as Component} from '@/components/rooms/FocusAmenityCount';

const meta: Meta<typeof FocusAmenityCount> = {
  title: 'Components/Rooms/FocusAmenityCount',
  component: FocusAmenityCount,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FocusAmenityCount>;

export const Default: Story = {
  args: {
    count: '01',
    state: 'Default',
  },
};

export const Active: Story = {
  args: {
    ...Default.args,
    State: 'Active',
  }
};

export const Hover: Story = {
  args: {
    ...Default.args,
    State: 'Hover',
  }
};

