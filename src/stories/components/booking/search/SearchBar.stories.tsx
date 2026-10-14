import type { Meta, StoryObj } from '@storybook/react-vite';
import { SearchBar } from '@/components/booking/search/SearchBar';

const meta: Meta<typeof SearchBar> = {
  title: 'Components/Booking/Search/SearchBar',
  component: SearchBar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SearchBar>;

export const Default: Story = {};
