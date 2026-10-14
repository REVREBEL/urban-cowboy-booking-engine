import type { Meta, StoryObj } from '@storybook/react-vite';
import { BookingSummary } from '@/components/booking/summary/booking-summary';

const meta: Meta<typeof BookingSummary> = {
  title: 'Components/Booking/Summary/BookingSummary',
  component: BookingSummary,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BookingSummary>;

export const Default: Story = {};
