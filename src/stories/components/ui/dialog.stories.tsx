import type { Meta, StoryObj } from '@storybook/react-vite';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const meta: Meta<typeof Dialog> = {
  title: 'Components/UI/Dialog',
  component: Dialog,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild><Button>View Policy</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deposit Policy</DialogTitle>
          <DialogDescription>A 50% deposit is taken upon booking confirmation.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
};
