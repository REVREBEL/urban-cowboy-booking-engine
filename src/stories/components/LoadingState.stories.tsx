import type { Meta, StoryObj } from '@storybook/react-vite';
import LoadingState from '../../components/feedback/loading-state';

const meta: Meta<typeof LoadingState> = {
  title: 'Components/Feedback/LoadingState',
  component: LoadingState,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Loading spinner and progress feedback message component.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    message: { control: 'text', description: 'Loading status message' },
  },
} satisfies Meta<typeof LoadingState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: 'Finding your stay…',
  },
};

export const CustomMessage: Story = {
  args: {
    message: 'Checking live rate availability…',
  },
};
