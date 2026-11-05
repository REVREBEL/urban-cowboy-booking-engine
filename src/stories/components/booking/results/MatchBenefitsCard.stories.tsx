import type { Meta, StoryObj } from '@storybook/react-vite';
import { MatchBenefitsCard } from '@/components/booking/results/MatchBenefitsCard';

const meta: Meta<typeof MatchBenefitsCard> = {
  title: 'Components/Booking/Results/MatchBenefitsCard',
  component: MatchBenefitsCard,
  tags: ['autodocs'],
  args: {
    room: {
      name: 'Alpine Bathing Suite',
      headline: 'Private soaking tub with forest views',
      blurb: 'A quiet hideaway built for long soaks and slow mornings.',
      features: [{ label: 'Clawfoot soaking tub' }, { label: 'Forest views' }],
    },
    reasons: ['Private soaking tub', 'A tucked-away forest setting'],
  },
};

export default meta;
type Story = StoryObj<typeof MatchBenefitsCard>;

export const Default: Story = {};
