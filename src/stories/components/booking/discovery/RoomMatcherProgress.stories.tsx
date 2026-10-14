import type { Meta, StoryObj } from '@storybook/react-vite';
import { MatcherProgress } from '@/components/booking/discovery/RoomMatcherProgress';

const meta: Meta<typeof MatcherProgress> = {
  title: 'Components/Booking/Discovery/RoomMatcherProgress',
  component: MatcherProgress,
  tags: ['autodocs'],
  args: {
    step: 2,
  },
};

export default meta;
type Story = StoryObj<typeof MatcherProgress>;

export const Default: Story = {};
