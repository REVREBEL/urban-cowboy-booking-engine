import type { Meta, StoryObj } from '@storybook/react-vite';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ROOM_IMAGE_ASSETS } from '@/data/roomImagePlaceholders';

const meta: Meta<typeof Carousel> = {
  title: 'Components/UI/Carousel',
  component: Carousel,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Carousel>;

export const Default: Story = {
  render: () => (
    <div className="w-full max-w-xs mx-auto px-10">
      <Carousel>
        <CarouselContent>
          <CarouselItem><img src={ROOM_IMAGE_ASSETS.ALPINE_BATHING_SUITE} alt="1" className="rounded-lg h-48 w-full object-cover" /></CarouselItem>
          <CarouselItem><img src={ROOM_IMAGE_ASSETS.WALDEN_SUNRISE_BATHING_SUITE} alt="2" className="rounded-lg h-48 w-full object-cover" /></CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
};
