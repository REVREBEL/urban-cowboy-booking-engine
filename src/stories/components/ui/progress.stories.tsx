import type { Meta, StoryObj } from '@storybook/react-vite';
import { Progress } from '@/components/ui/progress';

const meta: Meta<typeof Progress> = {
  title: 'Components/UI/Progress',
  component: Progress,
  tags: ['autodocs'],
  args: { value: 66 },
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  render: (args) => <Progress {...args} className="w-[300px]" />,
};
