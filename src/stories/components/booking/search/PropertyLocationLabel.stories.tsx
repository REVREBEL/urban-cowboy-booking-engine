import type { Meta, StoryObj } from '@storybook/react-vite';
import { PropertyLocationLabel } from '@/components/booking/search/PropertyLocationLabel';

const meta: Meta<typeof PropertyLocationLabel> = {
  title: 'Components/Booking/Search/PropertyLocationLabel',
  component: PropertyLocationLabel,
  tags: ['autodocs'],
  args: {
    location: 'catskills',
  },
};

export default meta;
type Story = StoryObj<typeof PropertyLocationLabel>;

export const Default: Story = {};
