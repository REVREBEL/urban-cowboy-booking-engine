import type { Meta, StoryObj } from '@storybook/react-vite';
import { Brand } from '../../components/brand/brand';

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
    className: { control: 'text', description: 'Additional CSS classes' },
  },
} satisfies Meta<typeof Brand>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    subtle: false,
    className: 'text-cowboy-umber',
  },
};

export const Subtle: Story = {
  args: {
    subtle: true,
    className: 'text-cowboy-umber',
  },
};
