import type { Meta, StoryObj } from '@storybook/react-vite';
import { MatchOrBrowseScreen } from '@/components/booking/discovery/MatchOrBrowseScreen';

const meta: Meta<typeof MatchOrBrowseScreen> = {
  title: 'Components/Booking/Discovery/MatchOrBrowseScreen',
  component: MatchOrBrowseScreen,
  tags: ['autodocs'],
  args: {
    criteria: {
      checkIn: '2026-10-24',
      checkOut: '2026-10-27',
      guests: 2,
      nights: 3,
      property: 'catskills',
      rooms: 1,
    },
  },
  argTypes: {
    onFindYourStay: { action: 'onFindYourStay' },
    onShowAllRooms: { action: 'onShowAllRooms' },
    onChangeDates: { action: 'onChangeDates' },
  },
};

export default meta;
type Story = StoryObj<typeof MatchOrBrowseScreen>;

export const Default: Story = {};
