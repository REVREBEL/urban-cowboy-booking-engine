import type { Meta, StoryObj } from '@storybook/react-vite';
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';

const meta: Meta<typeof SidebarProvider> = {
  title: 'Components/UI/Sidebar',
  component: SidebarProvider,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SidebarProvider>;

export const Default: Story = {
  render: () => (
    <SidebarProvider>
      <div className="flex h-48 border rounded-md overflow-hidden w-full max-w-lg">
        <Sidebar className="w-48"><SidebarContent><SidebarGroup><SidebarMenu><SidebarMenuItem><SidebarMenuButton>Overview</SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarGroup></SidebarContent></Sidebar>
        <div className="p-4 flex-1">Content</div>
      </div>
    </SidebarProvider>
  ),
};
