import type { Meta, StoryObj } from '@storybook/react-vite';
import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem } from '@/components/ui/menubar';

const meta: Meta<typeof Menubar> = {
  title: 'Components/UI/Menubar',
  component: Menubar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Menubar>;

export const Default: Story = {
  render: () => (
    <Menubar className="max-w-md">
      <MenubarMenu>
        <MenubarTrigger>Buildings</MenubarTrigger>
        <MenubarContent><MenubarItem>Alpine Haus</MenubarItem><MenubarItem>Walden Haus</MenubarItem></MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};
