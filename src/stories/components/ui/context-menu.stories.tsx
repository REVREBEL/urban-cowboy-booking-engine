import type { Meta, StoryObj } from '@storybook/react-vite';
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem } from '@/components/ui/context-menu';

const meta: Meta<typeof ContextMenu> = {
  title: 'Components/UI/ContextMenu',
  component: ContextMenu,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ContextMenu>;

export const Default: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
        Right click here
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem>View Room Details</ContextMenuItem>
        <ContextMenuItem>Share Link</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};
