import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@/components/ui/Button';

const meta: Meta<typeof Button> = {
  title: 'Components/UI/Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    children: 'Book Your Stay',
    variant: 'filled',
    colorScheme: 'cowboy-umber',
    size: 'default',
    hasIcon: false,
    iconPosition: 'right',
    isLoading: false,
    disabled: false,
  },
  argTypes: {
    variant: { control: 'select', options: ['filled', 'outline', 'transparent'] },
    colorScheme: {
      control: 'select',
      options: [
        'dark', 'light', 'alpine-linen', 'cowboy-umber', 'smoke',
        'lake-forest', 'copper', 'oxblood', 'oxidized-teal', 'bandana-red',
        'whiskey-sour', 'lodge-yellow', 'nude-ember', 'ash', 'paper'
      ],
    },
    size: { control: 'select', options: ['xsmall', 'small', 'default', 'medium', 'large', 'xlarge'] },
    hasIcon: { control: 'boolean' },
    iconPosition: { control: 'radio', options: ['left', 'right'] },
    isLoading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {};

export const Outline: Story = {
  args: { variant: 'outline', colorScheme: 'copper' },
};

export const Transparent: Story = {
  args: { variant: 'transparent', colorScheme: 'lake-forest' },
};

export const WithIcon: Story = {
  args: { hasIcon: true, children: 'Explore Suites' },
};

export const Loading: Story = {
  args: { isLoading: true, children: 'Checking Availability...' },
};

export const Disabled: Story = {
  args: { disabled: true, children: 'Sold Out' },
};
