import type { Meta, StoryObj } from '@storybook/react-vite';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/table';

const meta: Meta<typeof Table> = {
  title: 'Components/UI/Table',
  component: Table,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Table>;

export const Default: Story = {
  render: () => (
    <Table className="max-w-md">
      <TableHeader><TableRow><TableHead>Night</TableHead><TableHead className="text-right">Price</TableHead></TableRow></TableHeader>
      <TableBody><TableRow><TableCell>Oct 24</TableCell><TableCell className="text-right">$425.00</TableCell></TableRow></TableBody>
    </Table>
  ),
};
