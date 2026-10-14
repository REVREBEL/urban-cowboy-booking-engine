import type { Meta, StoryObj } from '@storybook/react-vite';
import { ExtrasStep } from '@/components/booking/summary/ExtrasStep';

const meta: Meta<typeof ExtrasStep> = {
  title: 'Components/Booking/Summary/ExtrasStep',
  component: ExtrasStep,
  tags: ['autodocs'],
  args: {
    products: [],
    imageBaseUrl: 'https://cdn.prod.website-files.com/6abc810fd801e90511049adb',
    selectedProductIds: [],
    selectedDisplayByProduct: {},
    preferences: {},
    lockedProductIds: new Set(),
    nightsCount: 3,
    guestsCount: 2,
    checkIn: '2026-10-24',
    checkOut: '2026-10-27',
    extrasTotal: 0,
    currency: 'USD',
    airportTransfer: false,
  },
  argTypes: {
    onToggleAirportTransfer: { action: 'onToggleAirportTransfer' },
    onToggle: { action: 'onToggle' },
    onSavePreference: { action: 'onSavePreference' },
    onProceedToPay: { action: 'onProceedToPay' },
    onBack: { action: 'onBack' },
  },
};

export default meta;
type Story = StoryObj<typeof ExtrasStep>;

export const Default: Story = {};
