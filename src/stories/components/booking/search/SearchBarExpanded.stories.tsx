import type { Meta, StoryObj } from '@storybook/react-vite';
import { SearchBarExpanded } from '@/components/booking/search/SearchBarExpanded';

const meta: Meta<typeof SearchBarExpanded> = {
  title: 'Components/Booking/Search/SearchBarExpanded',
  component: SearchBarExpanded,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SearchBarExpanded>;

export const Default: Story = {};
