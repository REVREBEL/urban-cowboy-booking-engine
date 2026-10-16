import type { Meta, StoryObj } from '@storybook/react-vite';
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/Button';

const meta: Meta<typeof Drawer> = {
  title: 'Components/UI/Drawer',
  component: Drawer,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Drawer>;

export const Default: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild><Button colorScheme="copper">Open Drawer</Button></DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Stay Summary</DrawerTitle>
          <DrawerDescription>Alpine Bathing Suite</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter><DrawerClose asChild><Button variant="outline">Close</Button></DrawerClose></DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};
