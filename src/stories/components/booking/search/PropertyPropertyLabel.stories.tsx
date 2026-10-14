import type { Meta, StoryObj } from '@storybook/react-vite';
import { PropertyPropertyLabel } from '@/components/booking/search/PropertyPropertyLabel';

const meta: Meta<typeof PropertyPropertyLabel> = {
  title: 'Components/Booking/Search/PropertyPropertyLabel',
  component: PropertyPropertyLabel,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PropertyPropertyLabel>;

export const Default: Story = {};
