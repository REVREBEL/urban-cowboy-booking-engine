import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const meta: Meta<typeof ChartContainer> = {
  title: 'Components/UI/Chart',
  component: ChartContainer,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ChartContainer>;

export const Default: Story = {
  render: () => (
    <ChartContainer config={{ rate: { label: 'Rate', color: '#9a5636' } }} className="min-h-[150px] w-full max-w-md">
      <div className="p-4 border rounded-md text-sm">
        <p className="font-bold">Rates Chart</p>
        <ChartTooltip content={<ChartTooltipContent />} />
      </div>
    </ChartContainer>
  ),
};
