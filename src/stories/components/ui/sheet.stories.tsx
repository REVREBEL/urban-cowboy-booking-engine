import type { Meta, StoryObj } from '@storybook/react-vite';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

const meta: Meta<typeof Sheet> = {
  title: 'Components/UI/Sheet',
  component: Sheet,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Sheet>;

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild><Button variant="outline">Side Cart</Button></SheetTrigger>
      <SheetContent><SheetHeader><SheetTitle>Cart Summary</SheetTitle></SheetHeader></SheetContent>
    </Sheet>
  ),
};
