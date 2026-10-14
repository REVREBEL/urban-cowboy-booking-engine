import type { Meta, StoryObj } from '@storybook/react-vite';
import { BookingHeader } from '@/components/booking/chrome/header';

const meta: Meta<typeof BookingHeader> = {
  title: 'Components/Booking/Chrome/Header',
  component: BookingHeader,
  tags: ['autodocs'],
  args: { step: 'dates', canNavigate: () => true },
  argTypes: {
    step: { control: 'select', options: ['dates', 'results', 'guest', 'extras', 'payment', 'confirmation'] },
    onNavigate: { action: 'onNavigate' },
    onHome: { action: 'onHome' },
  },
};

export default meta;
type Story = StoryObj<typeof BookingHeader>;

export const DatesStep: Story = {};
export const ResultsStep: Story = { args: { step: 'results' } };
export const ExtrasStep: Story = { args: { step: 'extras' } };
