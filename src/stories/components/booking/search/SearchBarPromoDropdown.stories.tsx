import type { Meta, StoryObj } from '@storybook/react-vite';
import { SearchBarPromoDropdown } from '@/components/booking/search/SearchBarPromoDropdown';

const meta: Meta<typeof SearchBarPromoDropdown> = {
  title: 'Components/Booking/Search/SearchBarPromoDropdown',
  component: SearchBarPromoDropdown,
  tags: ['autodocs'],
  args: { value: '' },
};

export default meta;
type Story = StoryObj<typeof SearchBarPromoDropdown>;

export const Default: Story = {};
