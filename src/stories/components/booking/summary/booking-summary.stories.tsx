import type { Meta, StoryObj } from '@storybook/react-vite';
import { BookingSummary } from '@/components/booking/summary/booking-summary';
import { BookingProvider } from '@/state/booking';

const meta: Meta<typeof BookingSummary> = {
  title: 'Components/Booking/Summary/BookingSummary',
  component: BookingSummary,
  tags: ['autodocs'],
  decorators: [(Story) => (
    <BookingProvider>
      <Story />
    </BookingProvider>
  )],
};

export default meta;
type Story = StoryObj<typeof BookingSummary>;

export const Default: Story = {};
