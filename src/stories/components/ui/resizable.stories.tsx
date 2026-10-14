import type { Meta, StoryObj } from '@storybook/react-vite';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

const meta: Meta<typeof ResizablePanelGroup> = {
  title: 'Components/UI/Resizable',
  component: ResizablePanelGroup,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ResizablePanelGroup>;

export const Default: Story = {
  render: () => (
    <ResizablePanelGroup orientation="horizontal" className="max-w-md rounded-lg border h-48">
      <ResizablePanel defaultSize={50} className="flex items-center justify-center p-4">Room List</ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={50} className="flex items-center justify-center p-4">Map View</ResizablePanel>
    </ResizablePanelGroup>
  ),
};
