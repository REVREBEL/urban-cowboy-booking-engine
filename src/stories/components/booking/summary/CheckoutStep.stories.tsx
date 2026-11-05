import type { Meta, StoryObj } from '@storybook/react-vite';
import { CheckoutStep } from '@/components/booking/summary/CheckoutStep';
import { BookingProvider } from '@/state/booking';

const meta: Meta<typeof CheckoutStep> = {
  title: 'Components/Booking/Summary/CheckoutStep',
  component: CheckoutStep,
  tags: ['autodocs'],
  decorators: [(Story) => (
    <BookingProvider>
      <Story />
    </BookingProvider>
  )],
};

export default meta;
type Story = StoryObj<typeof CheckoutStep>;

export const Default: Story = {};
