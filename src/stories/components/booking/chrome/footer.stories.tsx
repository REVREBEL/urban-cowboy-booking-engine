import type { Meta, StoryObj } from '@storybook/react-vite';
import { BookingFooter } from '@/components/booking/chrome/footer';
import { withBookingProvider } from '@/stories/decorators/withBookingProvider';

const meta: Meta<typeof BookingFooter> = {
  title: 'Components/Booking/Chrome/Footer',
  component: BookingFooter,
  tags: ['autodocs'],
  // The application root supplies this provider in production.
  decorators: [withBookingProvider],
};

export default meta;
type Story = StoryObj<typeof BookingFooter>;

export const Default: Story = {};
