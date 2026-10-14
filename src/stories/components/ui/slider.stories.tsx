import type { Meta, StoryObj } from '@storybook/react-vite';
import { Slider } from '@/components/ui/slider';

const meta: Meta<typeof Slider> = {
  title: 'Components/UI/Slider',
  component: Slider,
  tags: ['autodocs'],
  args: { defaultValue: [250], max: 1000, step: 25 },
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  render: (args) => (
    <div className="w-[300px] space-y-2">
      <Slider {...args} />
    </div>
  ),
};
