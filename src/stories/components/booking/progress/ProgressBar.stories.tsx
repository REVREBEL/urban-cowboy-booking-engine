import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressBar, ProgressStep } from '@/components/booking/progress/ProgressBar';

const meta: Meta<typeof ProgressBar> = {
  title: 'Components/Booking/Progress/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
  args: {
    currentStep: 2,
    steps: [
      { step: 1, label: 'Stay' },
      { step: 2, label: 'Room' },
      { step: 3, label: 'Details' },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Default: Story = {};
export const StepComponent: Story = {
  render: () => (
    <div className="flex gap-4">
      <ProgressStep step={1} label="Stay" state="complete" />
      <ProgressStep step={2} label="Room" state="current" />
      <ProgressStep step={3} label="Details" state="default" />
    </div>
  ),
};
