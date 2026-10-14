import type { Meta, StoryObj } from '@storybook/react-vite';
import * as CowboyIcons from '@/components/icons/cowboy-icons';

const IconGallery = () => (
  <div className="grid grid-cols-4 gap-6 p-4">
    {Object.entries(CowboyIcons).map(([name, Component]) => {
      if (typeof Component !== 'function') return null;
      const Icon = Component as React.ComponentType<{ className?: string }>;
      return (
        <div key={name} className="flex flex-col items-center p-3 border rounded-lg">
          <Icon className="w-6 h-6 text-cowboy-umber mb-2" />
          <span className="text-xs font-mono text-gray-600">{name}</span>
        </div>
      );
    })}
  </div>
);

const meta: Meta = {
  title: 'Components/Icons/CowboyIcons',
  component: IconGallery,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};
