import type { Meta, StoryObj } from '@storybook/react-vite';
import { Brand } from '@/components/brand/brand';

const meta: Meta<typeof Brand> = {
  title: 'Components/Brand/Brand',
  component: Brand,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Urban Cowboy brand logotype component with subtle transparency toggle.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    subtle: { control: 'boolean', description: 'Applies 70% opacity subtle styling' },
    alt: { control: 'boolean', description: 'Use the full SVG brand lockup' },
    className: { control: 'text', description: 'Additional CSS classes' },
  },
} satisfies Meta<typeof Brand>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    subtle: false,
    className: 'w-44',
  },
};

export const Subtle: Story = {
  args: {
    subtle: true,
    className: 'w-44',
  },
};

export const Full: Story = { args: { alt: true, className: 'w-64' } };
