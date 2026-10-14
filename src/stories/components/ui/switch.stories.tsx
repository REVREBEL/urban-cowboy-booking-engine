import type { Meta, StoryObj } from '@storybook/react-vite';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const meta: Meta<typeof Switch> = {
  title: 'Components/UI/Switch',
  component: Switch,
  tags: ['autodocs'],
  args: { checked: false, disabled: false },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  render: (args) => (
    <div className="flex items-center space-x-2">
      <Switch id="dog" {...args} />
      <Label htmlFor="dog">Dog Friendly Room (+ $75)</Label>
    </div>
  ),
};
