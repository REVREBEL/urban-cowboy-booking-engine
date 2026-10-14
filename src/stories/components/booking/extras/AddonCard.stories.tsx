import type { Meta, StoryObj } from '@storybook/react-vite';
import { AddonCard } from '@/components/booking/extras/AddonCard';
import type { MerchandisedAddOn } from '@/types/add-on-cms';
import { ROOM_IMAGE_ASSETS } from '@/data/roomImagePlaceholders';

const mockProduct: MerchandisedAddOn = {
  id: 'sauna-pass',
  displayId: 'sauna-pass',
  cmsItemId: 'sauna-pass',
  name: 'Estonian Sauna Session',
  description: 'Private 90-minute wood-fired sauna pass with cedar cold plunge access.',
  price: 45,
  currency: 'USD',
  chargingMode: 'perPerson',
  imageId: 'sauna',
  imageUrl: ROOM_IMAGE_ASSETS.ALPINE_BATHING_SUITE,
  contentSource: 'webflow',
  knownAddOn: null,
  property: 'Urban Cowboy Catskills',
};

const meta: Meta<typeof AddonCard> = {
  title: 'Components/Booking/Extras/AddonCard',
  component: AddonCard,
  tags: ['autodocs'],
  args: {
    product: mockProduct,
    imageBaseUrl: 'https://cdn.prod.website-files.com/6abc810fd801e90511049adb',
    selected: false,
    nightsCount: 3,
    guestsCount: 2,
  },
  argTypes: {
    selected: { control: 'boolean' },
    locked: { control: 'boolean' },
    onToggle: { action: 'onToggle' },
    onOpenCustomize: { action: 'onOpenCustomize' },
  },
};

export default meta;
type Story = StoryObj<typeof AddonCard>;

export const Default: Story = {};
export const Selected: Story = { args: { selected: true } };
export const Included: Story = { args: { locked: true, selected: true } };
