import type { Meta, StoryObj } from '@storybook/react-vite';
import { DataBadge, SecureBadge } from '@/components/dev/data-badge';

const meta: Meta<typeof DataBadge> = {
  title: 'Components/Dev/DataBadge',
  component: DataBadge,
  tags: ['autodocs'],
  args: { label: 'LIVE MEWS DATA' },
};

export default meta;
type Story = StoryObj<typeof DataBadge>;

export const Default: Story = {};
export const SecureBadgeVariant: Story = { render: () => <SecureBadge /> };
