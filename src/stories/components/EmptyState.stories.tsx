import type { Meta, StoryObj } from '@storybook/react-vite';
import EmptyState from '../../components/feedback/empty-state';

const meta: Meta<typeof EmptyState> = {
  title: 'Components/Feedback/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Empty state illustration and message component used when search results or lists return empty.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    heading: { control: 'text', description: 'Heading text' },
    body: { control: 'text', description: 'Subtext message' },
    action: { control: 'object', description: 'Optional action button with label and onClick' },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    heading: 'Nothing available for these dates',
    body: 'Try different dates or adjust your guest count.',
  },
};

export const WithAction: Story = {
  args: {
    heading: 'No matching rooms found',
    body: 'We couldn’t find any rooms matching all selected filters.',
    action: {
      label: 'Reset Filters',
      onClick: () => alert('Reset filters clicked'),
    },
  },
};
