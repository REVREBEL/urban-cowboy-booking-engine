import type { RoomFeatureSet } from "../model";

const FEATURE_MAP: { key: keyof RoomFeatureSet; label: string; icon: string }[] = [
  { key: "indoorTub", label: "Copper Soaking Tub", icon: "🛁" },
  { key: "outdoorSoak", label: "Outdoor Cedar Tub", icon: "🌲" },
  { key: "fireplace", label: "Fireplace", icon: "🔥" },
  { key: "privateDeck", label: "Private Deck", icon: "🏡" },
  { key: "scenicView", label: "Scenic Views", icon: "🏔" },
  { key: "heatedFloors", label: "Heated Floors", icon: "♨" },
  { key: "ownPlace", label: "Your Own Private Place", icon: "🗝" },
  { key: "simpleCozy", label: "Simple + Cozy", icon: "✦" },
  { key: "dogFriendly", label: "Dog Friendly", icon: "🐾" },
];

export function RoomFeatures({ features }: { features: RoomFeatureSet }) {
  const active = FEATURE_MAP.filter(({ key }) => features[key]);
  if (!active.length) return null;

  return (
    <div>
      <h3 className="mb-4 text-sm uppercase tracking-widest text-[#9a5636]" style={{ fontFamily: "var(--font-brothers)" }}>
        What’s Included
      </h3>
      <ul className="grid grid-cols-2 gap-2">
        {active.map(({ key, label, icon }) => (
          <li key={key} className="flex items-center gap-2 text-sm text-umber">
            <span aria-hidden="true">{icon}</span>
            {label}
          </li>
        ))}
      </ul>
      <div className="mt-4 flex gap-6 border-t border-linen pt-4 text-xs text-[#767470]">
        {features.sleeps && <span>Sleeps {features.sleeps}</span>}
        {features.beds && <span>{features.beds}</span>}
        {features.adults21Plus && <span className="text-[#9a5636]">21+ only</span>}
      </div>
    </div>
  );
}
