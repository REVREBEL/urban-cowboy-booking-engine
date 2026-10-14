import type { Meta, StoryObj } from '@storybook/react-vite';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const meta: Meta<typeof RadioGroup> = {
  title: 'Components/UI/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  args: { defaultValue: 'flexible' },
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  render: (args) => (
    <RadioGroup {...args} className="space-y-2">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="flexible" id="flexible" />
        <Label htmlFor="flexible">Best Flexible Rate ($425/nt)</Label>
      </div>
    </RadioGroup>
  ),
};
