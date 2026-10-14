import type { Meta, StoryObj } from '@storybook/react-vite';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

const meta: Meta<typeof Accordion> = {
  title: 'Components/UI/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  args: { type: 'single', collapsible: true },
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
  render: (args) => (
    <Accordion {...args} className="w-full max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>Cancellation Policy</AccordionTrigger>
        <AccordionContent>Free cancellation up to 14 days before check-in date.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Check-in & Check-out</AccordionTrigger>
        <AccordionContent>Check-in starts at 3:00 PM. Check-out is by 11:00 AM.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
