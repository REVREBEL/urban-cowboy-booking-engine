import type { Meta, StoryObj } from '@storybook/react-vite';
import { Textarea } from '@/components/ui/textarea';

const meta: Meta<typeof Textarea> = {
  title: 'Components/UI/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  args: { placeholder: 'Tell us about your trip...' },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {};
