import type { Meta, StoryObj } from '@storybook/react-vite';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ROOM_IMAGE_ASSETS } from '@/data/roomImagePlaceholders';

const meta: Meta<typeof AspectRatio> = {
  title: 'Components/UI/AspectRatio',
  component: AspectRatio,
  tags: ['autodocs'],
  args: { ratio: 16 / 9 },
};

export default meta;
type Story = StoryObj<typeof AspectRatio>;

export const Default: Story = {
  render: (args) => (
    <div className="w-100">
      <AspectRatio {...args} className="bg-muted rounded-md overflow-hidden">
        <img src={ROOM_IMAGE_ASSETS.ALPINE_BATHING_SUITE} alt="Alpine" className="object-cover w-full h-full" />
      </AspectRatio>
    </div>
  ),
};
