import type { Meta, StoryObj } from '@storybook/react-vite';
import { StepProgress } from '@/components/booking/layout/step-progress';

const meta: Meta<typeof StepProgress> = {
  title: 'Components/Booking/Layout/StepProgress',
  component: StepProgress,
  tags: ['autodocs'],
  args: {
    steps: [
      { key: 'dates', label: 'Dates' },
      { key: 'results', label: 'Rooms' },
      { key: 'guest', label: 'Details' },
    ],
    currentKey: 'results',
  },
};

export default meta;
type Story = StoryObj<typeof StepProgress>;

export const Default: Story = {};
