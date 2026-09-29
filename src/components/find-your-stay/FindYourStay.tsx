import { useBooking } from '../../booking/BookingContext';
import { getRoomsForAvailability } from '../../booking/mockData';

function fmt(d: string) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function FindYourStay() {
  const { state, setView } = useBooking();

  const availableRooms = getRoomsForAvailability(
    state.checkIn,
    state.checkOut,
    state.adults,
    state.children,
  );

  const nights = state.checkIn && state.checkOut
    ? Math.max(1, Math.round((new Date(state.checkOut).getTime() - new Date(state.checkIn).getTime()) / 86400000))
    : 0;

  return (
    <main className="min-h-screen bg-[#ebe8e0]">
      {/* Sub-header — search summary */}
      <div className="bg-[#4e332d] text-[#ebe8e0] px-5 md:px-10 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 text-sm" style={{ fontFamily: 'var(--font-uchen)' }}>
            <span>{fmt(state.checkIn)} → {fmt(state.checkOut)}</span>
            {nights > 0 && <span className="opacity-60">· {nights} night{nights !== 1 ? 's' : ''}</span>}
            <span className="opacity-60">· {state.adults} adult{state.adults !== 1 ? 's' : ''}{state.children > 0 ? ` · ${state.children} child${state.children !== 1 ? 'ren' : ''}` : ''}</span>
          </div>
          <button
            onClick={() => setView('availability')}
            className="text-xs tracking-widest uppercase text-[#ccc7bb] hover:text-white underline underline-offset-2 transition-colors"
            style={{ fontFamily: 'var(--font-brothers)' }}
          >
            Change
          </button>
        </div>
      </div>

      {/* Hero text */}
      <div className="max-w-6xl mx-auto px-5 md:px-10 pt-12 pb-8">
        <p
          className="text-xs tracking-[0.25em] uppercase text-[#9a5636] mb-3"
          style={{ fontFamily: 'var(--font-brothers)' }}
        >
          {availableRooms.length} Room Experience{availableRooms.length !== 1 ? 's' : ''} Available
        </p>
        <h1
          className="text-4xl md:text-6xl text-[#4e332d] leading-none mb-4"
          style={{ fontFamily: 'var(--font-desert)', fontWeight: 700 }}
        >
          How Would You Like<br className="hidden md:block" /> to Find Your Stay?
        </h1>
        <p
          className="text-base text-[#767470] max-w-xl"
          style={{ fontFamily: 'var(--font-uchen)' }}
        >
          Answer a few questions and we'll match you to the right room — or browse everything available.
        </p>
      </div>

      {/* CTA tiles */}
      <div className="max-w-6xl mx-auto px-5 md:px-10 pb-16 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Help Me Choose */}
        <button
          onClick={() => setView('help-me-choose')}
          className="group text-left bg-[#4e332d] text-[#ebe8e0] rounded-2xl overflow-hidden relative hover:shadow-xl transition-shadow"
        >
          <div className="absolute inset-0 opacity-10">
            <img src="/assets/hammock.svg" alt="" aria-hidden="true" className="absolute bottom-0 right-0 h-full object-cover" />
          </div>
          <div className="relative p-8 md:p-10 flex flex-col h-full min-h-[260px] justify-between">
            <div>
              <p
                className="text-xs tracking-widest uppercase text-[#9a5636] mb-3"
                style={{ fontFamily: 'var(--font-brothers)' }}
              >
                Recommended
              </p>
              <h2
                className="text-3xl md:text-4xl leading-tight mb-3"
                style={{ fontFamily: 'var(--font-desert)', fontWeight: 700 }}
              >
                Help Me Choose
              </h2>
              <p
                className="text-sm opacity-70 max-w-xs leading-relaxed"
                style={{ fontFamily: 'var(--font-uchen)' }}
              >
                Tell us who's coming and what matters most. We'll find your match in 3 questions.
              </p>
            </div>
            <div className="flex items-center gap-2 mt-6">
              <span
                className="text-xs tracking-widest uppercase text-[#9a5636] group-hover:text-[#ccc7bb] transition-colors"
                style={{ fontFamily: 'var(--font-brothers)' }}
              >
                Get Matched
              </span>
              <img src="/assets/icon-arrow.svg" alt="" aria-hidden="true" className="h-3 opacity-60 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </button>

        {/* View All Rooms */}
        <button
          onClick={() => setView('all-rooms')}
          className="group text-left bg-[#ebe8e0] border-2 border-[#ccc7bb] text-[#4e332d] rounded-2xl overflow-hidden relative hover:border-[#4e332d] hover:shadow-xl transition-all"
        >
          <div className="absolute inset-0 opacity-5">
            <img src="/assets/steam-bath-icon.svg" alt="" aria-hidden="true" className="absolute bottom-0 right-0 h-full object-cover" />
          </div>
          <div className="relative p-8 md:p-10 flex flex-col h-full min-h-[260px] justify-between">
            <div>
              <p
                className="text-xs tracking-widest uppercase text-[#9a5636] mb-3"
                style={{ fontFamily: 'var(--font-brothers)' }}
              >
                Browse All
              </p>
              <h2
                className="text-3xl md:text-4xl leading-tight mb-3"
                style={{ fontFamily: 'var(--font-desert)', fontWeight: 700 }}
              >
                Show All Rooms
              </h2>
              <p
                className="text-sm text-[#767470] max-w-xs leading-relaxed"
                style={{ fontFamily: 'var(--font-uchen)' }}
              >
                Browse all {availableRooms.length} available room experiences — sorted by price.
              </p>
            </div>
            <div className="flex items-center gap-2 mt-6">
              <span
                className="text-xs tracking-widest uppercase text-[#9a5636] group-hover:text-[#4e332d] transition-colors"
                style={{ fontFamily: 'var(--font-brothers)' }}
              >
                See All Rooms
              </span>
              <img src="/assets/icon-arrow.svg" alt="" aria-hidden="true" className="h-3 opacity-40 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </button>
      </div>
    </main>
  );
}
