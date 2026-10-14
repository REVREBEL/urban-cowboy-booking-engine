import type { Meta, StoryObj } from '@storybook/react-vite';
import { CheckoutStep } from '@/components/booking/summary/CheckoutStep';

const meta: Meta<typeof CheckoutStep> = {
  title: 'Components/Booking/Summary/CheckoutStep',
  component: CheckoutStep,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CheckoutStep>;

export const Default: Story = {};
