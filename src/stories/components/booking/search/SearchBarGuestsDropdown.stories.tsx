import type { Meta, StoryObj } from '@storybook/react-vite';
import { SearchBarGuestDropdown } from '@/components/booking/search/SearchBarGuestsDropdown';

const meta: Meta<typeof SearchBarGuestDropdown> = {
  title: 'Components/Booking/Search/SearchBarGuestDropdown',
  component: SearchBarGuestDropdown,
  tags: ['autodocs'],
  args: {
    initialCounts: { adults: 2, children: 0, infants: 0, accessible: false },
  },
  argTypes: {
    onChange: { action: 'onChange' },
    onClose: { action: 'onClose' },
  },
};

export default meta;
type Story = StoryObj<typeof SearchBarGuestDropdown>;

export const Default: Story = {};
