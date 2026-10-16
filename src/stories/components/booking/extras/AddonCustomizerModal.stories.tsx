import type { Meta, StoryObj } from '@storybook/react-vite';
import { AddonCustomizerModal } from '@/components/booking/extras/AddonCustomizerModal';
import type { MerchandisedAddOn } from '@/types/add-on-cms';
import { ROOM_IMAGE_ASSETS } from '@/data/roomImagePlaceholders';

const mockProduct: MerchandisedAddOn = {
  id: 'sauna-pass',
  displayId: 'sauna-pass',
  cmsItemId: 'sauna-pass',
  name: 'Estonian Sauna Session',
  description: 'Private 90-minute wood-fired sauna pass.',
  price: 45,
  currency: 'USD',
  chargingMode: 'perPerson',
  imageId: 'sauna',
  imageUrl: ROOM_IMAGE_ASSETS.ALPINE_BATHING_SUITE,
  contentSource: 'webflow',
  knownAddOn: null,
  property: 'Urban Cowboy Catskills',
};

const meta: Meta<typeof AddonCustomizerModal> = {
  title: 'Components/Booking/Extras/AddonCustomizerModal',
  component: AddonCustomizerModal,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="min-h-[900px]">
        <Story />
      </div>
    ),
  ],
  args: {
    isOpen: true,
    addon: mockProduct,
    imageBaseUrl: 'https://cdn.prod.website-files.com/6abc810fd801e90511049adb',
    searchCriteria: { checkIn: '2026-10-24', checkOut: '2026-10-27', nights: 3 },
  },
  argTypes: {
    onClose: { action: 'onClose' },
    onSave: { action: 'onSave' },
  },
};

export default meta;
type Story = StoryObj<typeof AddonCustomizerModal>;

export const Open: Story = {};
