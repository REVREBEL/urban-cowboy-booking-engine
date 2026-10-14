import type { Meta, StoryObj } from '@storybook/react-vite';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';

const meta: Meta<typeof Collapsible> = {
  title: 'Components/UI/Collapsible',
  component: Collapsible,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Collapsible>;

export const Default: Story = {
  render: () => (
    <Collapsible className="w-[350px] space-y-2">
      <div className="flex items-center justify-between px-4 py-2 border rounded-md">
        <h4 className="text-sm font-semibold">Price Breakdown</h4>
        <CollapsibleTrigger asChild><Button variant="transparent" size="small">Toggle</Button></CollapsibleTrigger>
      </div>
      <CollapsibleContent className="px-4 py-2 text-sm border rounded-md">
        <div className="flex justify-between"><span>3 Nights @ $425</span><span>$1,275</span></div>
      </CollapsibleContent>
    </Collapsible>
  ),
};
