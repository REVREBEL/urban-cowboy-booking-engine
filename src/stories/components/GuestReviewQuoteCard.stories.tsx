import type { Meta, StoryObj } from '@storybook/react-vite';
import { GuestReviewQuoteCard } from '../../components/rooms/GuestReviewQuoteCard';

const meta: Meta<typeof GuestReviewQuoteCard> = {
  title: 'Components/GuestReviewQuoteCard',
  component: GuestReviewQuoteCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A card component displaying a styled guest review quote with optional attribution, date, site, and link.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    quote: {
      control: 'text',
      description: 'Review quote text',
    },
    reviewer: {
      control: 'text',
      description: 'Name of the reviewer',
    },
    date: {
      control: 'text',
      description: 'Date of the review',
    },
    site: {
      control: 'text',
      description: 'Source site or publication name',
    },
    sourceUrl: {
      control: 'text',
      description: 'URL linking to the full review source',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Typography and padding size variant',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof GuestReviewQuoteCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    quote: 'The freestanding clawfoot tub facing the snow-dusted pines was magic.',
    reviewer: 'Sarah Jenkins',
    date: 'October 2025',
    site: 'Condé Nast Traveler',
    sourceUrl: 'https://example.com/review',
    size: 'md',
  },
};

export const SmallSize: Story = {
  args: {
    ...Default.args,
    size: 'sm',
  },
};

export const LargeSize: Story = {
  args: {
    ...Default.args,
    size: 'lg',
  },
};

export const QuoteOnly: Story = {
  args: {
    quote: 'Arrive as strangers. Leave as friends.',
    reviewer: null,
    date: null,
    site: null,
    sourceUrl: null,
    size: 'md',
  },
};

export const WithAttributionNoLink: Story = {
  args: {
    quote: 'An incredible Catskills escape with wood-burning stoves and rustic elegance.',
    reviewer: 'Michael & Elena',
    date: 'Fall 2025',
    site: 'Travel + Leisure',
    sourceUrl: null,
    size: 'md',
  },
};
