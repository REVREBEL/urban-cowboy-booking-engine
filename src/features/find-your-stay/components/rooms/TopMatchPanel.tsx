import type { TopMatchCopy, RecommendationResult } from "../../types";

type Props = {
  result: RecommendationResult;
  onViewRoom: () => void;
};

export default function TopMatchPanel({ result, onViewRoom }: Props) {
  const copy: TopMatchCopy = result.explanation ?? {
    match_badge: 'TOP MATCH',
    room_type: result.room.experience,
    party_summary: '',
    interest_summary: '',
    top_match_reason: result.room.tagline,
    benefit_1: '',
    benefit_2: '',
    benefit_3: '',
    season_label: 'fall',
    alternate_match_heading: '',
  };

  return (
    <div className="rounded-2xl overflow-hidden bg-white shadow-lg flex flex-col md:flex-row">
      {/* Photo strip */}
      <div className="md:w-[45%] relative overflow-hidden min-h-[220px] md:min-h-auto">
        <img
          src={result.room.thumbImage}
          alt={result.room.name}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&auto=format&fit=crop&q=70';
          }}
        />
        <div className="absolute top-4 left-4">
          <span
            className="bg-[#9a5636] text-white text-[10px] tracking-widest uppercase px-3 py-1 rounded-full"
            style={{ fontFamily: 'var(--font-brothers)' }}
          >
            {copy.match_badge}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
        <div>
          <p
            className="text-xs tracking-widest uppercase text-[#9a5636] mb-1"
            style={{ fontFamily: 'var(--font-brothers)' }}
          >
            {copy.room_type}
          </p>
          <h2
            className="text-2xl md:text-3xl text-[#4e332d] leading-tight mb-2"
            style={{ fontFamily: 'var(--font-desert)', fontWeight: 700 }}
          >
            {result.room.name}
          </h2>
          <p className="text-sm text-[#767470] mb-4" style={{ fontFamily: 'var(--font-uchen)' }}>
            {copy.top_match_reason}
          </p>

          {/* Benefit bullets */}
          <ul className="flex flex-col gap-2 mb-6">
            {[copy.benefit_1, copy.benefit_2, copy.benefit_3].filter(Boolean).map((b) => (
              <li key={b} className="flex items-center gap-2 text-sm text-[#4e332d]" style={{ fontFamily: 'var(--font-inter)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#9a5636] flex-shrink-0" />
                {b}
              </li>
            ))}
          </ul>

          {/* Match tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {copy.party_summary && (
              <span className="text-xs px-3 py-1 rounded-full bg-[#ebe8e0] text-[#4e332d]" style={{ fontFamily: 'var(--font-inter)' }}>
                {copy.party_summary}
              </span>
            )}
            {copy.interest_summary && (
              <span className="text-xs px-3 py-1 rounded-full bg-[#ebe8e0] text-[#4e332d]" style={{ fontFamily: 'var(--font-inter)' }}>
                {copy.interest_summary}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#767470]" style={{ fontFamily: 'var(--font-inter)' }}>Starting from</p>
            <p
              className="text-2xl text-[#4e332d]"
              style={{ fontFamily: 'var(--font-uchen)' }}
            >
              ${result.room.startingFrom}<span className="text-sm text-[#767470]">/night</span>
            </p>
          </div>
          <button
            onClick={onViewRoom}
            className="px-6 py-3 bg-[#9a5636] text-white text-sm tracking-wide rounded-full hover:bg-[#8b3a2e] transition-colors"
            style={{ fontFamily: 'var(--font-urbanist)', fontWeight: 600 }}
          >
            View Room
          </button>
        </div>
      </div>
    </div>
  );
}
