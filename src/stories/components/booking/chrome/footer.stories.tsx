import type { Meta, StoryObj } from '@storybook/react-vite';
import { BookingFooter } from '@/components/booking/chrome/footer';

const meta: Meta<typeof BookingFooter> = {
  title: 'Components/Booking/Chrome/Footer',
  component: BookingFooter,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BookingFooter>;

export const Default: Story = {};
