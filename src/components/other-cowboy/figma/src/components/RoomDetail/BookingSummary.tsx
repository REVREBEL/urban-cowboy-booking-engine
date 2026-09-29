import { useBooking } from '../../booking/BookingContext';

function fmt(d: string) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

type Props = {
  onSeeRates: () => void;
};

export default function BookingSummary({ onSeeRates }: Props) {
  const { state, setView } = useBooking();
  const { checkIn, checkOut, adults, children } = state;

  const hasDate = checkIn && checkOut;
  const nights = hasDate
    ? Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 0;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-[#ebe8e0]">
      {/* Calendar icon header */}
      <div className="flex items-center gap-2 mb-4">
        <img src="/assets/fi-calendar-1.svg" alt="" aria-hidden="true" className="h-4 opacity-60" />
        <span
          className="text-[10px] tracking-widest uppercase text-[#9a5636]"
          style={{ fontFamily: 'var(--font-brothers)' }}
        >
          Your Stay
        </span>
      </div>

      {hasDate ? (
        /* Dates already selected */
        <>
          <div className="flex items-baseline justify-between mb-1">
            <p
              className="text-lg text-[#4e332d]"
              style={{ fontFamily: 'var(--font-uchen)' }}
            >
              {fmt(checkIn)} – {fmt(checkOut)}
            </p>
            <button
              onClick={() => setView('availability')}
              className="text-[10px] tracking-widest uppercase text-[#9a5636] hover:underline ml-3"
              style={{ fontFamily: 'var(--font-brothers)' }}
            >
              Change
            </button>
          </div>
          <p className="text-xs text-[#767470] mb-4" style={{ fontFamily: 'var(--font-inter)' }}>
            {nights} night{nights !== 1 ? 's' : ''} · {adults} adult{adults !== 1 ? 's' : ''}
            {children > 0 ? ` · ${children} child${children !== 1 ? 'ren' : ''}` : ''}
          </p>

          <button
            onClick={onSeeRates}
            className="w-full py-3 bg-[#9a5636] text-white text-sm tracking-wide rounded-full hover:bg-[#8b3a2e] transition-colors"
            style={{ fontFamily: 'var(--font-urbanist)', fontWeight: 600 }}
          >
            See Rates
          </button>
        </>
      ) : (
        /* No dates — prompt */
        <>
          <p className="text-sm text-[#767470] mb-4" style={{ fontFamily: 'var(--font-uchen)' }}>
            Select your dates to see rates for this room.
          </p>
          <button
            onClick={() => setView('availability')}
            className="w-full py-3 border-2 border-[#9a5636] text-[#9a5636] text-sm tracking-wide rounded-full hover:bg-[#9a5636] hover:text-white transition-colors"
            style={{ fontFamily: 'var(--font-urbanist)', fontWeight: 600 }}
          >
            Choose Dates
          </button>
        </>
      )}
    </div>
  );
}
