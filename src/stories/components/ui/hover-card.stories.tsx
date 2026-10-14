import type { Meta, StoryObj } from '@storybook/react-vite';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';

const meta: Meta<typeof HoverCard> = {
  title: 'Components/UI/HoverCard',
  component: HoverCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof HoverCard>;

export const Default: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild><Button variant="transparent">Hover for Details</Button></HoverCardTrigger>
      <HoverCardContent className="w-80">
        <h4 className="text-sm font-semibold">Copper Soaking Tub</h4>
        <p className="text-xs text-muted-foreground">Freestanding clawfoot tub in front of picture window.</p>
      </HoverCardContent>
    </HoverCard>
  ),
};
