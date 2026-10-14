import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/UI/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  args: { disabled: false, checked: false },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  render: (args) => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" {...args} />
      <Label htmlFor="terms">Include Sauna Pass ($45)</Label>
    </div>
  ),
};
