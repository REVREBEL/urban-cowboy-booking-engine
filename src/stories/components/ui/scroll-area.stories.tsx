import type { Meta, StoryObj } from '@storybook/react-vite';
import { ScrollArea } from '@/components/ui/scroll-area';

const meta: Meta<typeof ScrollArea> = {
  title: 'Components/UI/ScrollArea',
  component: ScrollArea,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ScrollArea>;

export const Default: Story = {
  render: () => (
    <ScrollArea className="h-40 w-64 rounded-md border p-4 text-sm">
      <p className="font-bold mb-2">Amenities</p>
      <ul><li>Copper Clawfoot Tub</li><li>Cast Iron Wood Stove</li></ul>
    </ScrollArea>
  ),
};
