import type { Meta, StoryObj } from '@storybook/react-vite';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

const meta: Meta<typeof TooltipProvider> = {
  title: 'Components/UI/Tooltip',
  component: TooltipProvider,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TooltipProvider>;

export const Default: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild><Button variant="outline">Non-refundable</Button></TooltipTrigger>
        <TooltipContent>Full prepayment upon booking.</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};
