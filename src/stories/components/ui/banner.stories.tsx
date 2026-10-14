import type { Meta, StoryObj } from '@storybook/react-vite';
import { Banner } from '@/components/ui/banner';

const meta: Meta<typeof Banner> = {
  title: 'Components/UI/Banner',
  component: Banner,
  tags: ['autodocs'],
  args: { children: 'Welcome to Urban Cowboy Catskills — Book direct for best rates guaranteed.' },
};

export default meta;
type Story = StoryObj<typeof Banner>;

export const Default: Story = {};
