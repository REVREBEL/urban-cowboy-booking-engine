import type { Meta, StoryObj } from '@storybook/react-vite';
import { PropertyLocationLabel } from '@/components/booking/search/PropertyLocationLabel';

const meta: Meta<typeof PropertyLocationLabel> = {
  title: 'Components/Booking/Search/PropertyLocationLabel',
  component: PropertyLocationLabel,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PropertyLocationLabel>;

export const Default: Story = {};
