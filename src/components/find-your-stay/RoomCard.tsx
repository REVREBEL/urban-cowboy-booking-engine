import type { RoomProduct } from '../../booking/types';

type Props = {
  room: RoomProduct;
  matchBadge?: string;
  score?: number;
  onSelect: () => void;
  compact?: boolean;
};

export default function RoomCard({ room, matchBadge, onSelect, compact = false }: Props) {
  return (
    <article
      className="rounded-xl overflow-hidden bg-white shadow hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={onSelect}
    >
      {/* Thumb */}
      <div className={`relative overflow-hidden ${compact ? 'h-40' : 'h-52'}`}>
        <img
          src={room.thumbImage}
          alt={room.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&auto=format&fit=crop&q=70';
          }}
        />
        {matchBadge && (
          <div className="absolute top-3 left-3">
            <span
              className="bg-[#9a5636] text-white text-[9px] tracking-widest uppercase px-2.5 py-0.5 rounded-full"
              style={{ fontFamily: 'var(--font-brothers)' }}
            >
              {matchBadge}
            </span>
          </div>
        )}
        {/* Feature pills */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
          {room.features.indoorTub && (
            <span className="bg-black/50 text-white text-[9px] px-2 py-0.5 rounded-full backdrop-blur-sm">Copper Tub</span>
          )}
          {room.features.outdoorSoak && (
            <span className="bg-black/50 text-white text-[9px] px-2 py-0.5 rounded-full backdrop-blur-sm">Outdoor Soak</span>
          )}
          {room.features.dogFriendly && (
            <span className="bg-black/50 text-white text-[9px] px-2 py-0.5 rounded-full backdrop-blur-sm">Dog Friendly</span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <p
          className="text-[10px] tracking-widest uppercase text-[#9a5636] mb-1"
          style={{ fontFamily: 'var(--font-brothers)' }}
        >
          {room.experience}
        </p>
        <h3
          className="text-base text-[#4e332d] leading-tight mb-1"
          style={{ fontFamily: 'var(--font-desert)', fontWeight: 700 }}
        >
          {room.name}
        </h3>
        <p className="text-xs text-[#767470] mb-3 line-clamp-2" style={{ fontFamily: 'var(--font-uchen)' }}>
          {room.tagline}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-[#767470]" style={{ fontFamily: 'var(--font-inter)' }}>from </span>
            <span
              className="text-lg text-[#4e332d]"
              style={{ fontFamily: 'var(--font-uchen)' }}
            >
              ${room.startingFrom}
            </span>
            <span className="text-xs text-[#767470]" style={{ fontFamily: 'var(--font-inter)' }}>/night</span>
          </div>
          <span
            className="text-[10px] tracking-widest uppercase text-[#9a5636] hover:underline"
            style={{ fontFamily: 'var(--font-brothers)' }}
          >
            View →
          </span>
        </div>
      </div>
    </article>
  );
}
