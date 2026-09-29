import { useMemo, useRef } from 'react';
import { useBooking } from '../../booking/BookingContext';
import { getRatesForRoom } from '../../booking/mockData';
import type { RateOffer } from '../../booking/types';
import RateCard from './RateCard';
import LoadingState from '../states/LoadingState';
import EmptyState from '../states/EmptyState';

function fmt(d: string) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function RateSelection() {
  const { state, dispatch, setView, goBack } = useBooking();
  const railRef = useRef<HTMLDivElement>(null);

  const room = state.selectedRoom;
  const { checkIn, checkOut, adults, children } = state;

  const rates = useMemo(() => {
    if (!room) return [];
    return getRatesForRoom(room.id, checkIn, checkOut, adults);
  }, [room, checkIn, checkOut, adults]);

  const nights = checkIn && checkOut
    ? Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 0;

  if (!room) {
    return (
      <EmptyState
        heading="No room selected"
        action={{ label: 'Choose a Room', onClick: () => setView('find-your-stay') }}
      />
    );
  }

  function handleSelect(rate: RateOffer) {
    dispatch({ type: 'SELECT_RATE', rate });
    setView('details');
  }

  function scrollRail(dir: 'left' | 'right') {
    if (!railRef.current) return;
    const amount = railRef.current.clientWidth * 0.8;
    railRef.current.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' });
  }

  return (
    <main className="min-h-screen bg-[#ddc5a4]">
      {/* Back */}
      <div className="px-5 md:px-10 pt-8 pb-0 max-w-7xl mx-auto">
        <button
          onClick={goBack}
          className="text-xs tracking-widest uppercase text-[#767470] hover:text-[#4e332d] mb-6 block transition-colors"
          style={{ fontFamily: 'var(--font-brothers)' }}
        >
          ← Back
        </button>
      </div>

      {/* Heading row */}
      <div className="px-5 md:px-10 max-w-7xl mx-auto">
        <div className="flex items-start justify-between flex-wrap gap-6 mb-10">
          {/* Left: room summary */}
          <div>
            <p
              className="text-xs tracking-widest uppercase text-[#9a5636] mb-2"
              style={{ fontFamily: 'var(--font-brothers)' }}
            >
              {room.experience} · {room.name}
            </p>
            <h1
              className="text-5xl md:text-7xl text-[#4e332d] leading-none"
              style={{ fontFamily: 'var(--font-desert)', fontWeight: 700 }}
            >
              Select Your<br />Experience
            </h1>
          </div>

          {/* Right: booking summary card */}
          {checkIn && checkOut && (
            <div
              className="rounded-2xl p-5 min-w-[240px]"
              style={{ background: 'rgba(255,255,255,0.50)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <img src="/assets/fi-calendar-1.svg" alt="" aria-hidden="true" className="h-4 opacity-60" />
                <span
                  className="text-[10px] tracking-widest uppercase text-[#9a5636]"
                  style={{ fontFamily: 'var(--font-brothers)' }}
                >
                  Your Stay
                </span>
              </div>
              <p
                className="text-base text-[#4e332d] mb-1"
                style={{ fontFamily: 'var(--font-uchen)' }}
              >
                {fmt(checkIn)} – {fmt(checkOut)}
              </p>
              <p className="text-xs text-[#767470] mb-3" style={{ fontFamily: 'var(--font-inter)' }}>
                {nights} night{nights !== 1 ? 's' : ''} · {adults} adult{adults !== 1 ? 's' : ''}
                {children > 0 ? ` · ${children} child${children !== 1 ? 'ren' : ''}` : ''}
              </p>
              <button
                onClick={() => setView('availability')}
                className="text-[10px] tracking-widest uppercase text-[#9a5636] hover:underline"
                style={{ fontFamily: 'var(--font-brothers)' }}
              >
                Change Dates
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Rate card rail */}
      {rates.length === 0 ? (
        <div className="px-5 md:px-10 pb-20">
          <EmptyState
            heading="No rates available"
            body="Try different dates or contact the property."
            action={{ label: 'Change Dates', onClick: () => setView('availability') }}
          />
        </div>
      ) : (
        <>
          {/* Desktop nav buttons */}
          <div className="hidden md:flex items-center justify-end gap-2 px-10 mb-4 max-w-7xl mx-auto">
            <button
              onClick={() => scrollRail('left')}
              className="w-8 h-8 rounded-full border border-[#ccc7bb] flex items-center justify-center text-[#4e332d] hover:bg-[#4e332d] hover:text-white transition-colors"
              aria-label="Scroll left"
            >
              ‹
            </button>
            <button
              onClick={() => scrollRail('right')}
              className="w-8 h-8 rounded-full border border-[#ccc7bb] flex items-center justify-center text-[#4e332d] hover:bg-[#4e332d] hover:text-white transition-colors"
              aria-label="Scroll right"
            >
              ›
            </button>
          </div>

          {/* Horizontal scroll rail */}
          <div
            ref={railRef}
            className="flex gap-5 overflow-x-auto pb-10 px-5 md:px-10 snap-x snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            role="list"
            aria-label="Rate options"
          >
            {rates.map((rate) => (
              <div
                key={rate.id}
                role="listitem"
                className="flex-none w-[80vw] md:w-[340px] snap-start"
              >
                <RateCard rate={rate} onSelect={() => handleSelect(rate)} />
              </div>
            ))}
            {/* Edge peek spacer */}
            <div className="flex-none w-5 md:w-10" aria-hidden="true" />
          </div>
        </>
      )}

      {/* Taxes note */}
      <p
        className="text-center text-xs text-[#767470] pb-8 px-5"
        style={{ fontFamily: 'var(--font-inter)' }}
      >
        All rates shown per night. Taxes and fees added at checkout.
      </p>
    </main>
  );
}
