import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const meta: Meta<typeof Select> = {
  title: 'Components/UI/Select',
  component: Select,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: () => (
    <Select defaultValue="2">
      <SelectTrigger className="w-[180px]"><SelectValue placeholder="Select Guests" /></SelectTrigger>
      <SelectContent><SelectItem value="1">1 Adult (21+)</SelectItem><SelectItem value="2">2 Adults (21+)</SelectItem></SelectContent>
    </Select>
  ),
};
