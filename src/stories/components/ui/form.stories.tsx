import type { Meta, StoryObj } from '@storybook/react-vite';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const meta: Meta<typeof Form> = {
  title: 'Components/UI/Form',
  component: Form,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Form>;

const FormExample = () => {
  const form = useForm({ defaultValues: { guestName: '' } });
  return (
    <Form {...form}>
      <form className="space-y-4 max-w-sm">
        <FormField
          control={form.control}
          name="guestName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Guest Name</FormLabel>
              <FormControl><Input placeholder="Jane Doe" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

export const Default: Story = { render: () => <FormExample /> };
