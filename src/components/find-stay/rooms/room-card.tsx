import type { RoomProduct } from "../model";

export function FindStayRoomCard({
  room,
  matchBadge,
  onSelect,
  compact = false,
}: {
  room: RoomProduct;
  matchBadge?: string;
  onSelect: () => void;
  compact?: boolean;
}) {
  return (
    <article
      className="group cursor-pointer overflow-hidden rounded-xl bg-white shadow transition-shadow hover:shadow-lg"
      onClick={onSelect}
    >
      <div className={"relative overflow-hidden " + (compact ? "h-40" : "h-52")}>
        <img
          src={room.thumbImage}
          alt={room.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {matchBadge && (
          <span
            className="absolute left-3 top-3 rounded-full bg-[#9a5636] px-2.5 py-0.5 text-[9px] uppercase tracking-widest text-white"
            style={{ fontFamily: "var(--font-brothers)" }}
          >
            {matchBadge}
          </span>
        )}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
          {room.features.indoorTub && <FeaturePill label="Copper Tub" />}
          {room.features.outdoorSoak && <FeaturePill label="Outdoor Soak" />}
          {room.features.dogFriendly && <FeaturePill label="Dog Friendly" />}
        </div>
      </div>

      <div className="p-4">
        <p className="mb-1 text-[10px] uppercase tracking-widest text-[#9a5636]" style={{ fontFamily: "var(--font-brothers)" }}>
          {room.experience}
        </p>
        <h3 className="mb-1 text-base leading-tight text-umber" style={{ fontFamily: "var(--font-desert)", fontWeight: 700 }}>
          {room.name}
        </h3>
        <p className="mb-3 line-clamp-2 text-xs text-[#767470]" style={{ fontFamily: "var(--font-uchen)" }}>
          {room.tagline}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-[#767470]">from </span>
            <span className="text-lg text-umber">{"$"}{room.startingFrom}</span>
            <span className="text-xs text-[#767470]">/night</span>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-[#9a5636]">View →</span>
        </div>
      </div>
    </article>
  );
}

function FeaturePill({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-black/50 px-2 py-0.5 text-[9px] text-white backdrop-blur-sm">
      {label}
    </span>
  );
}
