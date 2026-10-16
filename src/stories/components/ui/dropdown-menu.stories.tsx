import type { Meta, StoryObj } from '@storybook/react-vite';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/Button';

const meta: Meta<typeof DropdownMenu> = {
  title: 'Components/UI/DropdownMenu',
  component: DropdownMenu,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DropdownMenu>;

export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="outline">Currency</Button></DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuLabel>Select Currency</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>USD ($)</DropdownMenuItem>
        <DropdownMenuItem>EUR (€)</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
