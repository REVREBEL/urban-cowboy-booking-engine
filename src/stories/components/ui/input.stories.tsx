import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from '@/components/ui/input';

const meta: Meta<typeof Input> = {
  title: 'Components/UI/Input',
  component: Input,
  tags: ['autodocs'],
  args: { placeholder: 'Enter promo code...', type: 'text', disabled: false },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true, value: 'PROMO10' } };
