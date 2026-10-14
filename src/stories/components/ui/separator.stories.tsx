import type { Meta, StoryObj } from '@storybook/react-vite';
import { Separator } from '@/components/ui/separator';

const meta: Meta<typeof Separator> = {
  title: 'Components/UI/Separator',
  component: Separator,
  tags: ['autodocs'],
  args: { orientation: 'horizontal' },
};

export default meta;
type Story = StoryObj<typeof Separator>;

export const Default: Story = {
  render: (args) => (
    <div className="w-64 space-y-2 text-sm">
      <div>Alpine Bathing Suite</div>
      <Separator {...args} />
      <div>$425 / night</div>
    </div>
  ),
};
