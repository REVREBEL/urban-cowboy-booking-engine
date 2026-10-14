import type { Meta, StoryObj } from '@storybook/react-vite';
import { Photo } from '@/components/media/photo';

const meta: Meta<typeof Photo> = {
  title: 'Components/Media/Photo',
  component: Photo,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Image component with lazy loading, error state handling, and fallback gradient display.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    src: { control: 'text', description: 'Image source URL' },
    alt: { control: 'text', description: 'Alt text description' },
    className: { control: 'text', description: 'CSS classes for sizing and styling' },
    gradient: { control: 'text', description: 'Tailwind gradient classes for fallback state' },
  },
} satisfies Meta<typeof Photo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    src: "https://cdn.prod.website-files.com/6abc810fd801e90511049adb/6ac85bc2a6a679fb6f2dd9e4_Alpine%20Copper%20Soaking%20Tub%20Day.jpg",
    alt: 'Alpine Bathing Suite Room',
    className: 'w-80 h-52 object-cover rounded-xl shadow-md',
  },
};

export const MissingSourceFallback: Story = {
  args: {
    src: null,
    alt: 'Fallback image illustration',
    className: 'w-80 h-52 rounded-xl shadow-md',
    gradient: 'from-turquoise via-turquoise-vivid to-creole',
  },
};

export const BrokenImageFallback: Story = {
  args: {
    src: 'https://invalid-domain-name-404.com/nonexistent.jpg',
    alt: 'Broken image fallback',
    className: 'w-80 h-52 rounded-xl shadow-md',
  },
};
