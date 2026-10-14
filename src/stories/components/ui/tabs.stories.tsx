import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Components/UI/Tabs',
  component: Tabs,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="alpine" className="w-100">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="alpine">Alpine</TabsTrigger>
        <TabsTrigger value="walden">Walden</TabsTrigger>
      </TabsList>
      <TabsContent value="alpine" className="p-2 text-sm">Alpine Bathing Suites with copper tubs.</TabsContent>
      <TabsContent value="walden" className="p-2 text-sm">Walden Forest Cabins with cedar tubs.</TabsContent>
    </Tabs>
  ),
};
