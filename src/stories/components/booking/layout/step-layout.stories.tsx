import type { Meta, StoryObj } from '@storybook/react-vite';
import { StepLayout } from '@/components/booking/layout/step-layout';

const meta: Meta<typeof StepLayout> = {
  title: 'Components/Booking/Layout/StepLayout',
  component: StepLayout,
  tags: ['autodocs'],
  args: {
    title: 'Select Accommodations',
    subtitle: 'Choose your room at Urban Cowboy Catskills',
    children: <div className="p-8 border rounded-lg">Step content</div>,
  },
};

export default meta;
type Story = StoryObj<typeof StepLayout>;

export const Default: Story = {};
