import type { Meta, StoryObj } from '@storybook/react-vite';
import { BookingFooter } from '@/components/booking/chrome/footer';
import { BookingProvider } from '@/state/booking';

const meta: Meta<typeof BookingFooter> = {
  title: 'Components/Booking/Chrome/Footer',
  component: BookingFooter,
  tags: ['autodocs'],
  // BookingFooter reads the booking context; application root supplies this in production.
  decorators: [(Story) => (
    <BookingProvider>
      <Story />
    </BookingProvider>
  )],
};

export default meta;
type Story = StoryObj<typeof BookingFooter>;

export const Default: Story = {};
