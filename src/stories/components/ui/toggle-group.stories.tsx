import type { Meta, StoryObj } from '@storybook/react-vite';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const meta: Meta<typeof ToggleGroup> = {
  title: 'Components/UI/ToggleGroup',
  component: ToggleGroup,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ToggleGroup>;

export const Default: Story = {
  render: () => (
    <ToggleGroup type="single" defaultValue="all">
      <ToggleGroupItem value="all">All Rooms</ToggleGroupItem>
      <ToggleGroupItem value="tub">Indoor Tub</ToggleGroupItem>
    </ToggleGroup>
  ),
};
