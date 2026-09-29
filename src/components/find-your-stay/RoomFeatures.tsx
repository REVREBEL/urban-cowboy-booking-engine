import type { RoomFeatures as RoomFeaturesType } from '../../booking/types';

type Props = { features: RoomFeaturesType };

const FEATURE_MAP: { key: keyof RoomFeaturesType; label: string; icon: string }[] = [
  { key: 'indoorTub', label: 'Copper Soaking Tub', icon: '🛁' },
  { key: 'outdoorSoak', label: 'Outdoor Cedar Tub', icon: '🌲' },
  { key: 'fireplace', label: 'Wood-burning Fireplace', icon: '🔥' },
  { key: 'privateDeck', label: 'Private Deck', icon: '🏡' },
  { key: 'scenicView', label: 'Scenic Views', icon: '🏔' },
  { key: 'heatedFloors', label: 'Heated Floors', icon: '🌡' },
  { key: 'ownPlace', label: 'Your Own Private Place', icon: '🗝' },
  { key: 'simpleCozy', label: 'Simple & Cozy', icon: '☕' },
  { key: 'dogFriendly', label: 'Dog Friendly', icon: '🐾' },
];

export default function RoomFeatures({ features }: Props) {
  const active = FEATURE_MAP.filter(({ key }) => features[key]);

  if (active.length === 0) return null;

  return (
    <div>
      <h3
        className="text-sm tracking-widest uppercase text-[#9a5636] mb-4"
        style={{ fontFamily: 'var(--font-brothers)' }}
      >
        What's Included
      </h3>
      <ul className="grid grid-cols-2 gap-2">
        {active.map(({ key, label, icon }) => (
          <li
            key={key}
            className="flex items-center gap-2 text-sm text-[#4e332d]"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            <span aria-hidden="true">{icon}</span>
            {label}
          </li>
        ))}
      </ul>
      <div className="mt-4 pt-4 border-t border-[#ebe8e0] flex gap-6 text-xs text-[#767470]" style={{ fontFamily: 'var(--font-inter)' }}>
        {features.sleeps && <span>Sleeps {features.sleeps}</span>}
        {features.beds && <span>{features.beds}</span>}
        {features.adults21Plus && <span className="text-[#9a5636]">21+ only</span>}
      </div>
    </div>
  );
}
