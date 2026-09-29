import { useMemo, useState } from 'react';
import { useBooking } from '../../booking/BookingContext';
import { getRoomsForAvailability } from '../../booking/mockData';
import type { RoomExperience, RoomProduct } from '../../booking/types';
import EmptyState from '../states/EmptyState';

// ── Feature icon mapping for card display ────────────────────────────────────
const CARD_FEATURE_ICONS: { key: keyof RoomProduct['features']; icon: string; label: string }[] = [
  { key: 'indoorTub',   icon: '/assets/simple-icons/copper_clawfoot_soaking_tub.svg', label: 'Copper Tub' },
  { key: 'outdoorSoak', icon: '/assets/simple-icons/outdoor_cedar_soaking_tub.svg',  label: 'Outdoor Soak' },
  { key: 'dogFriendly', icon: '/assets/simple-icons/dog_friendly.svg',               label: 'Dog Friendly' },
  { key: 'fireplace',   icon: '/assets/simple-icons/enameled_gas_fireplace.svg',     label: 'Fireplace' },
  { key: 'fullKitchen', icon: '/assets/simple-icons/full_kitchen.svg',               label: 'Full Kitchen' },
  { key: 'privateDeck', icon: '/assets/simple-icons/private_balcony.svg',            label: 'Private Deck' },
  { key: 'separateLivingRoom', icon: '/assets/simple-icons/separate_living_room.svg', label: 'Living Room' },
  { key: 'castIronStove', icon: '/assets/simple-icons/cast_iron_wood_stove.svg',     label: 'Cast Iron Stove' },
  { key: 'walkInShower', icon: '/assets/simple-icons/walk-in_rain_shower.svg',       label: 'Rain Shower' },
];

// ── Filter definitions ────────────────────────────────────────────────────────
type FeatureKey = keyof RoomProduct['features'];

const FEATURE_FILTERS: { key: FeatureKey; label: string; icon: string }[] = [
  { key: 'outdoorSoak',        label: 'Outdoor Cedar Soaking Tub',   icon: '/assets/simple-icons/outdoor_cedar_soaking_tub.svg' },
  { key: 'indoorTub',          label: 'Copper Clawfoot Soaking Tub', icon: '/assets/simple-icons/copper_clawfoot_soaking_tub.svg' },
  { key: 'walkInShower',       label: 'Walk-in Rain Shower',         icon: '/assets/simple-icons/walk-in_rain_shower.svg' },
  { key: 'castIronStove',      label: 'Cast Iron Wood Stove',        icon: '/assets/simple-icons/cast_iron_wood_stove.svg' },
  { key: 'fireplace',          label: 'Fireplace',                   icon: '/assets/simple-icons/enameled_gas_fireplace.svg' },
  { key: 'privateDeck',        label: 'Private Deck or Porch',       icon: '/assets/simple-icons/private_balcony.svg' },
  { key: 'wrapAroundPorch',    label: 'Wrap-Around Porch',           icon: '/assets/simple-icons/peak_balcony.svg' },
  { key: 'fullKitchen',        label: 'Full Kitchen & Dining',       icon: '/assets/simple-icons/full_kitchen.svg' },
  { key: 'separateLivingRoom', label: 'Separate Living Room',        icon: '/assets/simple-icons/separate_living_room.svg' },
  { key: 'wetBar',             label: 'Wet Bar & Lounge',            icon: '/assets/simple-icons/private_bar.svg' },
  { key: 'trailheadAccess',    label: 'Direct Trailhead Access',     icon: '/assets/simple-icons/direct_trail_head_access_copy.svg' },
  { key: 'esopusCreek',        label: 'Esopus Creek Access',         icon: '/assets/simple-icons/esopus_creek_access.svg' },
  { key: 'familyFriendly',     label: 'Family-Friendly',             icon: '/assets/simple-icons/family_friendly.svg' },
  { key: 'den',                label: 'Den',                         icon: '/assets/simple-icons/sitting_area.svg' },
];

type SortKey = 'price-asc' | 'price-desc' | 'size-asc' | 'size-desc' | null;

// ── Building editorial copy ──────────────────────────────────────────────────
const BUILDING_COPY: Partial<Record<RoomExperience, {
  num: string; tagline: string; body: string; restriction?: string;
}>> = {
  'Alpine': {
    num: '01',
    tagline: 'This is where you come to soak, slow down and disappear for a while.',
    body: "Built into the hillside above the Lodge, Alpine is home to some of the Cowboy's most iconic rooms. Every suite pairs a freestanding clawfoot tub in front of a picture window, with the forest and mountains doing the decorating outside.",
    restriction: 'Alpine is reserved for guests 21+',
  },
  'Walden': {
    num: '02',
    tagline: 'This is where the Cowboy gets a little wilder.',
    body: "Walden sits closer to the woods. Its cabin-style rooms trade Alpine's lodge-like romance for something quieter and more elemental: private decks, forest views, and cedar tubs made for soaking outside.",
  },
  'Lodge': {
    num: '03',
    tagline: 'Where it all started.',
    body: "The Lodge is the original. Shared porch, hand-hewn timber, and rooms that know what they are. It's not trying to be a hotel, and that's the whole point.",
  },
  'Forest House': {
    num: '04',
    tagline: 'The run of the place, all to yourself.',
    body: 'A private home deep in the forest. Three bedrooms, a full kitchen, two decks, and no front desk. Best for groups who want space without the resort.',
  },
  'Cabin': {
    num: '05',
    tagline: 'Yours alone, tucked in the pines.',
    body: "A private cabin with a wood-burning fireplace, full kitchen, and a porch built for long evenings. The kind of place you forget to check your phone.",
  },
  'Chalet': {
    num: '06',
    tagline: 'A ridge-top perch with views to match.',
    body: 'Floor-to-ceiling windows, a deck that faces the valley, and enough room for the whole crew to spread out.',
  },
  "Opa's": {
    num: '07',
    tagline: 'A quiet corner at the main house.',
    body: "Named for the original owner's grandfather. Small, precise, and exactly enough.",
  },
};

const EXPERIENCE_ORDER: RoomExperience[] = [
  'Alpine', 'Walden', 'Lodge', 'Forest House', 'Cabin', 'Chalet', "Opa's",
];

// ── Sub-components ────────────────────────────────────────────────────────────

function FeatureIcons({ features, dark = false }: { features: RoomProduct['features']; dark?: boolean }) {
  const visible = CARD_FEATURE_ICONS.filter(f => features[f.key]).slice(0, 5);
  if (visible.length === 0) return null;
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {visible.map(f => (
        <img
          key={f.key}
          src={f.icon}
          alt={f.label}
          title={f.label}
          className={`h-7 w-7 object-contain flex-shrink-0 ${dark ? 'brightness-0 invert opacity-70' : 'opacity-60'}`}
        />
      ))}
    </div>
  );
}

function Badges({ features, dark = false }: { features: RoomProduct['features']; dark?: boolean }) {
  const cls = `text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full border`;
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {features.sleeps && (
        <span className={`${cls} ${dark ? 'border-white/30 text-white/60' : 'border-[#ccc7bb] text-[#767470]'}`}
          style={{ fontFamily: 'var(--font-brothers)' }}>
          {features.sleeps} Guests
        </span>
      )}
      {features.beds && (
        <span className={`${cls} ${dark ? 'border-white/30 text-white/60' : 'border-[#ccc7bb] text-[#767470]'}`}
          style={{ fontFamily: 'var(--font-brothers)' }}>
          {features.beds}
        </span>
      )}
      {features.dogFriendly && (
        <span className={`${cls} ${dark ? 'border-white/30 text-white/60' : 'border-[#ccc7bb] text-[#767470]'}`}
          style={{ fontFamily: 'var(--font-brothers)' }}>
          Dog Friendly
        </span>
      )}
      {features.adults21Plus && (
        <span className={`${cls} ${dark ? 'border-[#9a5636]/60 text-[#c87a58]' : 'border-[#9a5636]/40 text-[#9a5636]'}`}
          style={{ fontFamily: 'var(--font-brothers)' }}>
          21+
        </span>
      )}
    </div>
  );
}

function ArrowBtn({ dark = false, onClick }: { dark?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 ${dark ? 'bg-[#f2aaa9] text-[#343833]' : 'bg-[#4e332d] text-white'}`}
      aria-label="View room">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

function TextBtn({ label, onClick, dark = false }: { label: string; onClick: () => void; dark?: boolean }) {
  return (
    <button onClick={onClick}
      className={`px-5 py-2.5 rounded-full text-[11px] tracking-widest uppercase transition-colors ${dark ? 'bg-[#9a5636] text-white hover:bg-[#8b3a2e]' : 'bg-[#4e332d] text-[#ebe8e0] hover:bg-[#3a2620]'}`}
      style={{ fontFamily: 'var(--font-brothers)', fontWeight: 700 }}>
      {label}
    </button>
  );
}

// ── Card variants ─────────────────────────────────────────────────────────────
function HeroCard({ room, onSelect }: { room: RoomProduct; onSelect: () => void }) {
  return (
    <article className="relative w-full overflow-hidden rounded-2xl bg-[#f5f3ef] cursor-pointer group" style={{ minHeight: 420 }} onClick={onSelect}>
      <div className="absolute inset-y-0 right-0 w-[58%]">
        <img src={room.images[0] || room.thumbImage} alt={room.name}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
          onError={e => { (e.target as HTMLImageElement).src = room.thumbImage; }} />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#f5f3ef]/60" />
      </div>
      <div className="relative z-10 flex flex-col justify-center gap-4 px-8 py-10 max-w-[52%]" style={{ minHeight: 420 }}>
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#9a5636] italic" style={{ fontFamily: 'var(--font-uchen)' }}>{room.tagline}</p>
        <h3 className="text-3xl md:text-4xl text-[#4e332d] leading-none uppercase" style={{ fontFamily: 'var(--font-brothers)', fontWeight: 700, letterSpacing: '0.02em' }}>{room.name}</h3>
        <p className="text-sm text-[#5a4a44] leading-relaxed max-w-xs" style={{ fontFamily: 'var(--font-uchen)' }}>{room.description}</p>
        <FeatureIcons features={room.features} />
        <Badges features={room.features} />
        <div className="flex items-center gap-3 mt-1">
          <ArrowBtn onClick={onSelect} />
          <span className="text-xs text-[#767470]" style={{ fontFamily: 'var(--font-brothers)' }}>from ${room.startingFrom}/night</span>
        </div>
      </div>
    </article>
  );
}

function DarkCard({ room, onSelect, flip = false }: { room: RoomProduct; onSelect: () => void; flip?: boolean }) {
  return (
    <article className="relative w-full overflow-hidden rounded-2xl cursor-pointer group" style={{ background: '#343833', minHeight: 380 }} onClick={onSelect}>
      <div className={`absolute inset-y-0 ${flip ? 'left-0' : 'right-0'} w-[45%] overflow-hidden`}>
        <img src={room.images[0] || room.thumbImage} alt={room.name}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
          onError={e => { (e.target as HTMLImageElement).src = room.thumbImage; }} />
        <div className={`absolute inset-0 bg-gradient-to-${flip ? 'r' : 'l'} from-transparent to-[#343833]`} />
      </div>
      <div className={`relative z-10 flex flex-col justify-center gap-4 px-8 py-10 ${flip ? 'ml-[45%]' : ''}`}
        style={{ minHeight: 380, maxWidth: '60%', marginLeft: flip ? 'auto' : undefined }}>
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#c87a58] italic" style={{ fontFamily: 'var(--font-uchen)' }}>{room.tagline}</p>
        <h3 className="text-3xl md:text-4xl text-[#ebe8e0] leading-none uppercase" style={{ fontFamily: 'var(--font-brothers)', fontWeight: 700, letterSpacing: '0.02em' }}>{room.name}</h3>
        <p className="text-sm text-[rgba(235,232,224,0.7)] leading-relaxed max-w-xs" style={{ fontFamily: 'var(--font-uchen)' }}>{room.description}</p>
        <FeatureIcons features={room.features} dark />
        <Badges features={room.features} dark />
        <div className="flex items-center gap-3 mt-1">
          <TextBtn label="View Rates" onClick={onSelect} dark />
          <span className="text-xs text-[rgba(235,232,224,0.4)]" style={{ fontFamily: 'var(--font-brothers)' }}>from ${room.startingFrom}</span>
        </div>
      </div>
    </article>
  );
}

function CenteredCard({ room, onSelect }: { room: RoomProduct; onSelect: () => void }) {
  return (
    <article className="relative w-full overflow-hidden rounded-2xl cursor-pointer group" style={{ minHeight: 420 }} onClick={onSelect}>
      <img src={room.images[0] || room.thumbImage} alt={room.name}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
        onError={e => { (e.target as HTMLImageElement).src = room.thumbImage; }} />
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl px-8 py-7 max-w-sm w-full shadow-xl flex flex-col gap-3" onClick={e => e.stopPropagation()}>
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#9a5636] italic" style={{ fontFamily: 'var(--font-uchen)' }}>{room.tagline}</p>
          <h3 className="text-2xl md:text-3xl text-[#4e332d] leading-tight uppercase" style={{ fontFamily: 'var(--font-brothers)', fontWeight: 700, letterSpacing: '0.02em' }}>{room.name}</h3>
          <p className="text-xs text-[#5a4a44] leading-relaxed" style={{ fontFamily: 'var(--font-uchen)' }}>{room.description}</p>
          <FeatureIcons features={room.features} />
          <Badges features={room.features} />
          <div className="flex items-center justify-between mt-1">
            <TextBtn label="Select Rate" onClick={onSelect} />
            <span className="text-xs text-[#767470]" style={{ fontFamily: 'var(--font-brothers)' }}>${room.startingFrom}/night</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function HorizontalCard({ room, onSelect, flip = false }: { room: RoomProduct; onSelect: () => void; flip?: boolean }) {
  return (
    <article className={`flex ${flip ? 'flex-row-reverse' : 'flex-row'} overflow-hidden rounded-2xl bg-[#f5f3ef] cursor-pointer group`} style={{ minHeight: 320 }} onClick={onSelect}>
      <div className="flex-1 flex flex-col justify-center gap-4 px-8 py-8">
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#9a5636] italic" style={{ fontFamily: 'var(--font-uchen)' }}>{room.tagline}</p>
        <h3 className="text-2xl md:text-3xl text-[#4e332d] leading-tight uppercase" style={{ fontFamily: 'var(--font-brothers)', fontWeight: 700, letterSpacing: '0.02em' }}>{room.name}</h3>
        <p className="text-sm text-[#5a4a44] leading-relaxed" style={{ fontFamily: 'var(--font-uchen)' }}>{room.description}</p>
        <FeatureIcons features={room.features} />
        <Badges features={room.features} />
        <div className="flex items-center gap-3 mt-1">
          <TextBtn label="Select Room" onClick={onSelect} />
          <span className="text-xs text-[#767470]" style={{ fontFamily: 'var(--font-brothers)' }}>from ${room.startingFrom}/night</span>
        </div>
      </div>
      <div className="w-[42%] flex-shrink-0 overflow-hidden">
        <img src={room.images[0] || room.thumbImage} alt={room.name}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
          onError={e => { (e.target as HTMLImageElement).src = room.thumbImage; }} />
      </div>
    </article>
  );
}

function ForestCard({ room, onSelect }: { room: RoomProduct; onSelect: () => void }) {
  return (
    <article className="relative flex items-stretch overflow-hidden rounded-2xl cursor-pointer group" style={{ background: '#0e301a', minHeight: 380 }} onClick={onSelect}>
      <div className="flex-shrink-0 flex items-center pl-8 py-8">
        <div className="overflow-hidden rounded-full shadow-2xl flex-shrink-0" style={{ width: 220, height: 220 }}>
          <img src={room.images[0] || room.thumbImage} alt={room.name}
            className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-700"
            onError={e => { (e.target as HTMLImageElement).src = room.thumbImage; }} />
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center gap-4 px-8 py-10">
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#f2aaa9] italic" style={{ fontFamily: 'var(--font-uchen)' }}>{room.tagline}</p>
        <h3 className="text-3xl md:text-4xl text-[#ebe8e0] leading-none uppercase" style={{ fontFamily: 'var(--font-brothers)', fontWeight: 700, letterSpacing: '0.02em' }}>{room.name}</h3>
        <p className="text-sm text-[rgba(235,232,224,0.7)] leading-relaxed max-w-xs" style={{ fontFamily: 'var(--font-uchen)' }}>{room.description}</p>
        <FeatureIcons features={room.features} dark />
        <Badges features={room.features} dark />
        <div className="flex items-center gap-3 mt-1">
          <ArrowBtn dark onClick={onSelect} />
          <span className="text-xs text-[rgba(235,232,224,0.4)]" style={{ fontFamily: 'var(--font-brothers)' }}>from ${room.startingFrom}</span>
        </div>
      </div>
    </article>
  );
}

type CardVariant = 'hero' | 'dark' | 'centered' | 'horizontal' | 'forest';

const SECTION_SEQUENCES: Record<string, CardVariant[]> = {
  'Alpine':       ['hero', 'dark'],
  'Walden':       ['forest', 'horizontal', 'centered'],
  'Lodge':        ['horizontal'],
  'Forest House': ['dark'],
  'Cabin':        ['centered'],
  'Chalet':       ['hero'],
  "Opa's":        ['horizontal'],
};

function RoomCardVariant({ room, variant, idx, onSelect }: { room: RoomProduct; variant: CardVariant; idx: number; onSelect: () => void }) {
  if (variant === 'hero')     return <HeroCard room={room} onSelect={onSelect} />;
  if (variant === 'dark')     return <DarkCard room={room} onSelect={onSelect} flip={idx % 2 === 1} />;
  if (variant === 'centered') return <CenteredCard room={room} onSelect={onSelect} />;
  if (variant === 'forest')   return <ForestCard room={room} onSelect={onSelect} />;
  return <HorizontalCard room={room} onSelect={onSelect} flip={idx % 2 === 1} />;
}

function BuildingHeader({ experience, align = 'left' }: { experience: RoomExperience; align?: 'left' | 'right' }) {
  const copy = BUILDING_COPY[experience];
  if (!copy) return null;
  return (
    <div className={`flex flex-col ${align === 'right' ? 'items-end text-right' : 'items-start'} gap-3 pb-6`}>
      <p className="text-[10px] tracking-[0.3em] uppercase text-[#9a5636]" style={{ fontFamily: 'var(--font-brothers)' }}>
        Building {copy.num}
      </p>
      <h2 className="text-6xl md:text-8xl text-[#4e332d] leading-none" style={{ fontFamily: 'var(--font-brothers)', fontWeight: 700, letterSpacing: '-0.01em' }}>
        {experience.toUpperCase()}
      </h2>
      <p className="text-sm text-[#5a4a44] leading-relaxed max-w-sm" style={{ fontFamily: 'var(--font-uchen)' }}>{copy.body}</p>
      <p className="text-[10px] tracking-[0.2em] uppercase text-[#9a5636] mt-1" style={{ fontFamily: 'var(--font-brothers)' }}>{copy.tagline}</p>
      {copy.restriction && (
        <p className="text-[10px] tracking-wider uppercase text-[#9a5636]/60 flex items-center gap-1.5" style={{ fontFamily: 'var(--font-brothers)' }}>
          → {copy.restriction}
        </p>
      )}
    </div>
  );
}

// ── Filter pill ───────────────────────────────────────────────────────────────
function Pill({ label, icon, active, onClick }: { label: string; icon?: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] tracking-wider uppercase whitespace-nowrap transition-all ${
        active
          ? 'bg-[#9a5636] border-[#9a5636] text-white'
          : 'bg-transparent border-[#ccc7bb] text-[#4e332d] hover:border-[#9a5636] hover:text-[#9a5636]'
      }`}
      style={{ fontFamily: 'var(--font-brothers)', letterSpacing: '0.08em' }}
    >
      {icon && (
        <img
          src={icon}
          alt=""
          aria-hidden="true"
          className={`h-3.5 w-3.5 object-contain flex-shrink-0 ${active ? 'brightness-0 invert' : 'opacity-60'}`}
        />
      )}
      {label}
    </button>
  );
}

// ── Sort arrow button ─────────────────────────────────────────────────────────
function SortPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-[10px] tracking-wider uppercase whitespace-nowrap transition-all ${
        active
          ? 'bg-[#4e332d] border-[#4e332d] text-[#ebe8e0]'
          : 'bg-transparent border-[#ccc7bb] text-[#4e332d] hover:border-[#4e332d]'
      }`}
      style={{ fontFamily: 'var(--font-brothers)', letterSpacing: '0.08em' }}
    >
      {label}
    </button>
  );
}

// ── Filter bar ────────────────────────────────────────────────────────────────
function FilterBar({
  sort, setSort,
  beds, toggleBed,
  features, toggleFeature,
  activeCount, onClear,
}: {
  sort: SortKey;
  setSort: (k: SortKey) => void;
  beds: Set<string>;
  toggleBed: (k: string) => void;
  features: Set<string>;
  toggleFeature: (k: string) => void;
  activeCount: number;
  onClear: () => void;
}) {
  return (
    <div className="bg-white border border-[#e8e4dc] rounded-2xl p-5 mb-8 flex flex-col gap-4">
      {/* Row 1: Sort */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-[9px] tracking-[0.2em] uppercase text-[#9a5636] w-16 flex-shrink-0" style={{ fontFamily: 'var(--font-brothers)' }}>Sort</span>
        <div className="flex items-center gap-2 flex-wrap">
          <SortPill label="Price ↑" active={sort === 'price-asc'} onClick={() => setSort(sort === 'price-asc' ? null : 'price-asc')} />
          <SortPill label="Price ↓" active={sort === 'price-desc'} onClick={() => setSort(sort === 'price-desc' ? null : 'price-desc')} />
          <SortPill label="Smallest" active={sort === 'size-asc'} onClick={() => setSort(sort === 'size-asc' ? null : 'size-asc')} />
          <SortPill label="Largest" active={sort === 'size-desc'} onClick={() => setSort(sort === 'size-desc' ? null : 'size-desc')} />
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#ebe8e0]" />

      {/* Row 2: Beds */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-[9px] tracking-[0.2em] uppercase text-[#9a5636] w-16 flex-shrink-0" style={{ fontFamily: 'var(--font-brothers)' }}>Beds</span>
        <div className="flex items-center gap-2 flex-wrap">
          <Pill label="One Bed"  icon="/assets/simple-icons/one_bed.svg"  active={beds.has('one')} onClick={() => toggleBed('one')} />
          <Pill label="Two Beds" icon="/assets/simple-icons/two_beds.svg" active={beds.has('two')} onClick={() => toggleBed('two')} />
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#ebe8e0]" />

      {/* Row 3: Features */}
      <div className="flex items-start gap-3">
        <span className="text-[9px] tracking-[0.2em] uppercase text-[#9a5636] w-16 flex-shrink-0 pt-1.5" style={{ fontFamily: 'var(--font-brothers)' }}>Features</span>
        <div className="flex flex-wrap gap-2">
          {FEATURE_FILTERS.map(f => (
            <Pill
              key={f.key}
              label={f.label}
              icon={f.icon}
              active={features.has(f.key)}
              onClick={() => toggleFeature(f.key)}
            />
          ))}
        </div>
      </div>

      {/* Clear */}
      {activeCount > 0 && (
        <div className="flex justify-end">
          <button
            onClick={onClear}
            className="text-[10px] tracking-widest uppercase text-[#767470] hover:text-[#9a5636] underline underline-offset-2 transition-colors"
            style={{ fontFamily: 'var(--font-brothers)' }}
          >
            Clear all filters ({activeCount})
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AllRoomsGrid() {
  const { state, dispatch, setView, goBack, openDrawer } = useBooking();

  const [sort, setSort] = useState<SortKey>(null);
  const [filterBeds, setFilterBeds] = useState<Set<string>>(new Set());
  const [filterFeatures, setFilterFeatures] = useState<Set<string>>(new Set());

  function toggleBed(k: string) {
    setFilterBeds(prev => { const n = new Set(prev); n.has(k) ? n.delete(k) : n.add(k); return n; });
  }
  function toggleFeature(k: string) {
    setFilterFeatures(prev => { const n = new Set(prev); n.has(k) ? n.delete(k) : n.add(k); return n; });
  }
  function clearAll() {
    setSort(null);
    setFilterBeds(new Set());
    setFilterFeatures(new Set());
  }

  const activeCount = (sort ? 1 : 0) + filterBeds.size + filterFeatures.size;

  const available = useMemo(
    () => getRoomsForAvailability(state.checkIn, state.checkOut, state.adults, state.children),
    [state.checkIn, state.checkOut, state.adults, state.children],
  );

  const filtered = useMemo(() => {
    let rooms = [...available];

    if (state.children > 0) rooms = rooms.filter(r => !r.features.adults21Plus);

    // Beds
    if (filterBeds.size > 0) {
      rooms = rooms.filter(r =>
        (filterBeds.has('one') && r.features.oneBed) ||
        (filterBeds.has('two') && r.features.twoBeds)
      );
    }

    // Features
    for (const key of filterFeatures) {
      rooms = rooms.filter(r => r.features[key as FeatureKey]);
    }

    // Sort
    if (sort === 'price-asc')  return rooms.sort((a, b) => a.startingFrom - b.startingFrom);
    if (sort === 'price-desc') return rooms.sort((a, b) => b.startingFrom - a.startingFrom);
    if (sort === 'size-asc')   return rooms.sort((a, b) => (a.features.sqft ?? 0) - (b.features.sqft ?? 0));
    if (sort === 'size-desc')  return rooms.sort((a, b) => (b.features.sqft ?? 0) - (a.features.sqft ?? 0));

    // Default: by experience order
    return rooms.sort((a, b) => {
      const ia = EXPERIENCE_ORDER.indexOf(a.experience);
      const ib = EXPERIENCE_ORDER.indexOf(b.experience);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
  }, [available, sort, filterBeds, filterFeatures, state.children]);

  // Only group by experience when no sort override
  const grouped = useMemo(() => {
    if (sort !== null) return null;
    const groups: { experience: RoomExperience; rooms: RoomProduct[] }[] = [];
    for (const room of filtered) {
      const last = groups[groups.length - 1];
      if (last && last.experience === room.experience) {
        last.rooms.push(room);
      } else {
        groups.push({ experience: room.experience, rooms: [room] });
      }
    }
    return groups;
  }, [filtered, sort]);

  function selectRoom(room: RoomProduct) {
    openDrawer(room);
  }

  const sectionAligns: ('left' | 'right')[] = ['left', 'right', 'left', 'right', 'left', 'right', 'left'];

  return (
    <main className="min-h-screen bg-[#ebe8e0]">
      <div className="px-5 md:px-10 pt-10 max-w-7xl mx-auto">
        {/* Back */}
        <button onClick={goBack}
          className="text-xs tracking-widest uppercase text-[#767470] hover:text-[#4e332d] mb-6 transition-colors block"
          style={{ fontFamily: 'var(--font-brothers)' }}>
          ← Back to Dates
        </button>

        {/* Page heading */}
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <p className="text-[11px] tracking-[0.3em] uppercase text-[#9a5636] mb-2" style={{ fontFamily: 'var(--font-brothers)' }}>
              {filtered.length} Room Experience{filtered.length !== 1 ? 's' : ''} Available
            </p>
            <h1 className="text-5xl md:text-7xl text-[#4e332d] leading-none" style={{ fontFamily: 'var(--font-desert)', fontWeight: 700 }}>
              Find Your Stay
            </h1>
          </div>
        </div>

        {/* Filter bar */}
        <FilterBar
          sort={sort}
          setSort={setSort}
          beds={filterBeds}
          toggleBed={toggleBed}
          features={filterFeatures}
          toggleFeature={toggleFeature}
          activeCount={activeCount}
          onClear={clearAll}
        />
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="max-w-4xl mx-auto px-5 pb-20">
          <EmptyState
            heading="No rooms match these filters"
            body="Try removing some filters to see more options."
            action={{ label: 'Clear All Filters', onClick: clearAll }}
          />
        </div>
      ) : grouped ? (
        <div className="flex flex-col gap-20 pb-24">
          {grouped.map(({ experience, rooms }, groupIdx) => {
            const sequence = SECTION_SEQUENCES[experience] ?? ['hero', 'horizontal'];
            const align = sectionAligns[groupIdx % sectionAligns.length];
            return (
              <section key={experience} className="px-5 md:px-10 max-w-7xl mx-auto w-full">
                <BuildingHeader experience={experience} align={align} />
                <div className="flex flex-col gap-5">
                  {rooms.map((room, roomIdx) => {
                    const variant = sequence[roomIdx % sequence.length];
                    return (
                      <RoomCardVariant key={room.id} room={room} variant={variant} idx={roomIdx} onSelect={() => selectRoom(room)} />
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        /* Sorted flat list — still use card variants but cycle globally */
        <div className="flex flex-col gap-5 px-5 md:px-10 max-w-7xl mx-auto pb-24">
          {filtered.map((room, idx) => {
            const variants: CardVariant[] = ['hero', 'horizontal', 'dark', 'centered', 'horizontal'];
            const variant = variants[idx % variants.length];
            return <RoomCardVariant key={room.id} room={room} variant={variant} idx={idx} onSelect={() => selectRoom(room)} />;
          })}
        </div>
      )}
    </main>
  );
}
