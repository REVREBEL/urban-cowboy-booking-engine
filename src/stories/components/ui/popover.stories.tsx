import type { Meta, StoryObj } from '@storybook/react-vite';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/Button';

const meta: Meta<typeof Popover> = {
  title: 'Components/UI/Popover',
  component: Popover,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild><Button variant="outline">Guests</Button></PopoverTrigger>
      <PopoverContent className="w-64 p-4 text-sm"><p className="font-semibold">2 Adults (21+ strictly enforced)</p></PopoverContent>
    </Popover>
  ),
};
