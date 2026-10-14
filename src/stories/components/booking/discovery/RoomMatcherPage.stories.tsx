import type { Meta, StoryObj } from '@storybook/react-vite';
import { RoomMatcherPage } from '@/components/booking/discovery/RoomMatcherPage';

const meta: Meta<typeof RoomMatcherPage> = {
  title: 'Components/Booking/Discovery/RoomMatcherPage',
  component: RoomMatcherPage,
  tags: ['autodocs'],
  argTypes: {
    onBack: { action: 'onBack' },
    onSubmit: { action: 'onSubmit' },
    onViewAllRooms: { action: 'onViewAllRooms' },
  },
};

export default meta;
type Story = StoryObj<typeof RoomMatcherPage>;

export const Default: Story = {};
