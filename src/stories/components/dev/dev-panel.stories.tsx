import type { Meta, StoryObj } from '@storybook/react-vite';
import { DevPanel } from '@/components/dev/dev-panel';

const meta: Meta<typeof DevPanel> = {
  title: 'Components/Dev/DevPanel',
  component: DevPanel,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DevPanel>;

export const Default: Story = {
  render: () => (
    <div className="p-8 min-h-[300px]">
      <DevPanel />
    </div>
  ),
};
