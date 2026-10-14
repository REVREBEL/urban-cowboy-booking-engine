import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const meta: Meta<typeof Toaster> = {
  title: 'Components/UI/Sonner',
  component: Toaster,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Toaster>;

export const Default: Story = {
  render: () => (
    <div>
      <Toaster />
      <Button onClick={() => toast.success('Room added!')}>Trigger Toast</Button>
    </div>
  ),
};
