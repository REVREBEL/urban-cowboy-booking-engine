import type { Meta, StoryObj } from '@storybook/react-vite';
import { SearchBarLocationDropdown } from '@/components/booking/search/SearchBarLocationDropdown';

const meta: Meta<typeof SearchBarLocationDropdown> = {
  title: 'Components/Booking/Search/SearchBarLocationDropdown',
  component: SearchBarLocationDropdown,
  tags: ['autodocs'],
  args: { value: 'CATSKILLS' },
};

export default meta;
type Story = StoryObj<typeof SearchBarLocationDropdown>;

export const Default: Story = {};
