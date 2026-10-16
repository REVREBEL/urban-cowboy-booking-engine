import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';

const meta: Meta<typeof Card> = {
  title: 'Components/UI/Card',
  component: Card,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Alpine Bathing Suite</CardTitle>
        <CardDescription>Copper clawfoot tub with forest views.</CardDescription>
      </CardHeader>
      <CardContent><p className="text-sm font-semibold">$425 / night</p></CardContent>
      <CardFooter><Button className="w-full">Select Room</Button></CardFooter>
    </Card>
  ),
};
