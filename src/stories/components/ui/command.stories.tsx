import type { Meta, StoryObj } from '@storybook/react-vite';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';

const meta: Meta<typeof Command> = {
  title: 'Components/UI/Command',
  component: Command,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Command>;

export const Default: Story = {
  render: () => (
    <Command className="rounded-lg border shadow-md max-w-md">
      <CommandInput placeholder="Search room types..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Buildings">
          <CommandItem>Alpine Haus</CommandItem>
          <CommandItem>Walden Haus</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};
