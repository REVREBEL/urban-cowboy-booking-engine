import type { Meta, StoryObj } from '@storybook/react-vite';
import { UpsellCard } from '@/components/booking/extras/upsell-card';
import type { ShapedProduct } from '@/types/mews';

const mockShapedProduct: ShapedProduct = {
  id: 'breakfast-in-bed',
  name: 'Breakfast in Bed Package',
  description: 'Fresh local Catskill eggs and Chemex coffee.',
  price: 75,
  currency: 'USD',
  chargingMode: 'PerPersonPerNight',
  imageId: 'img-bfast',
  knownAddOn: null,
  property: 'Urban Cowboy Catskills',
};

const meta: Meta<typeof UpsellCard> = {
  title: 'Components/Booking/Extras/UpsellCard',
  component: UpsellCard,
  tags: ['autodocs'],
  args: {
    product: mockShapedProduct,
    imageBaseUrl: 'https://cdn.prod.website-files.com/6abc810fd801e90511049adb',
    selected: false,
    nightsCount: 3,
    guestsCount: 2,
  },
  argTypes: {
    selected: { control: 'boolean' },
    locked: { control: 'boolean' },
    onToggle: { action: 'onToggle' },
  },
};

export default meta;
type Story = StoryObj<typeof UpsellCard>;

export const Default: Story = {};
