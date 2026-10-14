//stories/components/FeatureFocus.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-vite';
import { FeatureFocus } from '../../components/rooms/FeatureFocus';
import type { TourIcon } from '@/journey/tour';
import bed from '@/assets/feature-focus/bed.png.asset.json';
import tub from '@/assets/feature-focus/tub.png.asset.json';
import outdoorTub from '@/assets/feature-focus/outdoor-tub.png.asset.json';
import windowArt from '@/assets/feature-focus/window.png.asset.json';
import seat from '@/assets/feature-focus/seat.png.asset.json';
import stove from '@/assets/feature-focus/stove.png.asset.json';
import robes from '@/assets/feature-focus/robes.png.asset.json';
import speaker from '@/assets/feature-focus/speaker.png.asset.json';
import shower from '@/assets/feature-focus/shower.png.asset.json';
import floors from '@/assets/feature-focus/floors.png.asset.json';
import desk from '@/assets/feature-focus/desk.png.asset.json';
import balcony from '@/assets/feature-focus/balcony.png.asset.json';
import plus from '@/assets/feature-focus/plus.png.asset.json';
import close from '@/assets/feature-focus/close.png.asset.json';

const ART: Record<TourIcon, string> = {
  bed: bed.url, tub: tub.url, 'outdoor-tub': outdoorTub.url, window: windowArt.url, seat: seat.url,
  stove: stove.url, robes: robes.url, speaker: speaker.url, shower: shower.url, floors: floors.url,
  desk: desk.url, balcony: balcony.url,
};


const meta: Meta<typeof FeatureFocus> = {
  title: 'Components/Rooms/FeatureFocus',
  component: FeatureFocus,
  parameters: {},
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof FeatureFocus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

/** Hotspot marker from the Feature Focus design: count + toggle squares beside a ringed artwork medallion. */
export function FeatureFocus({ count, icon, title, active, onSelect }: {
  count: number; icon: TourIcon; title: string; active: boolean; onSelect: () => void;
}) {
  return (
    <button type="button" className={`j-focus ${active ? 'is-active' : ''}`} aria-pressed={active}
      aria-label={`${String(count).padStart(2, '0')} ${title}`} title={title} onClick={onSelect}>
      <span className="j-focus-medallion" aria-hidden="true"><img src={ART[icon]} alt="" draggable={false} /></span>
      <span className="j-focus-actions" aria-hidden="true">
        <span className="j-focus-square j-focus-count">{String(count).padStart(2, '0')}</span>
        <span className="j-focus-square"><img src={active ? close.url : plus.url} alt="" draggable={false} /></span>
      </span>
    </button>
  );
}

