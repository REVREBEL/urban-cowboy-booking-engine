import type { Meta, StoryObj } from '@storybook/react-vite';
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink } from '@/components/ui/navigation-menu';

const meta: Meta<typeof NavigationMenu> = {
  title: 'Components/UI/NavigationMenu',
  component: NavigationMenu,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof NavigationMenu>;

export const Default: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Accommodations</NavigationMenuTrigger>
          <NavigationMenuContent className="p-4 w-60">
            <NavigationMenuLink className="block py-1 hover:underline">Alpine Suites</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};
