import type { Meta, StoryObj } from '@storybook/react-vite';
import { RatingPill, ScarcityBadge, UrgencyBanner, SavingsBadge, TrustRow } from '@/components/booking/conversion';

const meta: Meta<typeof RatingPill> = {
  title: 'Components/Booking/Conversion',
  component: RatingPill,
  tags: ['autodocs'],
  args: { score: '9.8', count: 142 },
};

export default meta;
type Story = StoryObj<typeof RatingPill>;

export const Rating: Story = {};
export const ScarcityBadgeVariant: Story = { render: () => <ScarcityBadge count={2} /> };
export const UrgencyBannerVariant: Story = { render: () => <UrgencyBanner title="High Demand" body="Only 1 room remaining for these dates." /> };
export const SavingsBadgeVariant: Story = { render: () => <SavingsBadge from={340} max={425} /> };
export const TrustRowVariant: Story = { render: () => <TrustRow /> };
