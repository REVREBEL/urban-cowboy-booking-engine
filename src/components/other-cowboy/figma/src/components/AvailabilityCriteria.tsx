import { useState } from 'react';
import { useBooking } from '../booking/BookingContext';
import DatePicker from './DatePicker';

const PROPERTIES = [
  { value: 'nashville', label: 'Urban Cowboy Nashville' },
  { value: 'catskill', label: 'Urban Cowboy Catskill' },
  { value: 'denver', label: 'Urban Cowboy Denver' },
];

export default function AvailabilityCriteria() {
  const { state, dispatch, setView } = useBooking();

  const [property, setProperty] = useState(state.property ?? 'nashville');
  const [checkIn, setCheckIn] = useState(state.checkIn || '');
  const [checkOut, setCheckOut] = useState(state.checkOut || '');
  const [adults, setAdults] = useState(state.adults);
  const [children, setChildren] = useState(state.children);
  const [promo, setPromo] = useState(state.promoCode ?? '');
  const [showPromo, setShowPromo] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!checkIn || !checkOut) return;
    dispatch({ type: 'SET_DATES', checkIn, checkOut });
    dispatch({ type: 'SET_GUESTS', adults, children });
    if (promo) dispatch({ type: 'SET_PROMO', promoCode: promo });
    setView('find-your-stay');
  }

  const nights =
    checkIn && checkOut
      ? Math.max(
          0,
          Math.round(
            (new Date(checkOut + 'T00:00:00').getTime() -
              new Date(checkIn + 'T00:00:00').getTime()) /
              86400000,
          ),
        )
      : 0;

  const today = new Date().toISOString().split('T')[0];

  return (
    <main className="min-h-screen bg-[#ebe8e0]">
      {/* Hero panel */}
      <div className="relative overflow-hidden bg-[#4e332d] text-[#ebe8e0] px-5 md:px-10 pt-16 pb-20 md:pt-24 md:pb-28">
        <img
          src="/assets/hammock.svg"
          alt=""
          aria-hidden="true"
          className="absolute bottom-0 right-0 h-48 md:h-64 opacity-20"
        />
        <div className="relative max-w-3xl mx-auto text-center">
          <p
            className="text-xs tracking-[0.25em] uppercase mb-4 text-[#9a5636]"
            style={{ fontFamily: 'var(--font-brothers)' }}
          >
            Urban Cowboy
          </p>
          <h1
            className="text-5xl md:text-7xl leading-none mb-5"
            style={{ fontFamily: 'var(--font-desert)', fontWeight: 700 }}
          >
            Find Your Stay
          </h1>
          <p
            className="text-base md:text-lg opacity-75 max-w-md mx-auto"
            style={{ fontFamily: 'var(--font-uchen)' }}
          >
            20+ room experiences. One that's exactly right.
          </p>
        </div>
      </div>

      {/* Search card */}
      <div className="max-w-3xl mx-auto px-5 -mt-8 md:-mt-12 relative z-10">
        <form
          onSubmit={handleSearch}
          className="bg-white rounded-2xl shadow-xl overflow-visible"
          aria-label="Search availability"
        >
          {/* Property selector */}
          <div className="border-b border-[#ebe8e0] px-5 py-4 rounded-t-2xl">
            <p
              className="text-[10px] tracking-widest uppercase text-[#9a5636] mb-1.5"
              style={{ fontFamily: 'var(--font-brothers)' }}
            >
              Property
            </p>
            <div className="relative">
              <select
                value={property}
                onChange={(e) => setProperty(e.target.value)}
                className="w-full appearance-none bg-transparent text-base text-[#4e332d] cursor-pointer outline-none pr-6"
                style={{ fontFamily: 'var(--font-uchen)' }}
                aria-label="Select property"
              >
                {PROPERTIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-[#9a5636]"
                width="12"
                height="8"
                viewBox="0 0 12 8"
                fill="none"
                aria-hidden="true"
              >
                <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Dates + guests */}
          <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-[#ebe8e0]">
            {/* Check-in */}
            <div className="flex-1 px-5 py-4 hover:bg-[#faf9f9] transition-colors relative">
              <DatePicker
                label="Check In"
                value={checkIn}
                min={today}
                placeholder="Select date"
                onChange={(d) => {
                  setCheckIn(d);
                  if (checkOut && d >= checkOut) setCheckOut('');
                }}
              />
            </div>

            {/* Check-out */}
            <div className="flex-1 px-5 py-4 hover:bg-[#faf9f9] transition-colors relative">
              <DatePicker
                label="Check Out"
                value={checkOut}
                min={checkIn || today}
                placeholder="Select date"
                onChange={setCheckOut}
              />
              {nights > 0 && (
                <p className="text-[10px] text-[#9a5636] mt-0.5" style={{ fontFamily: 'var(--font-inter)' }}>
                  {nights} night{nights !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Guests */}
            <div className="flex-1 px-5 py-4">
              <p
                className="text-[10px] tracking-widest uppercase text-[#9a5636] mb-2"
                style={{ fontFamily: 'var(--font-brothers)' }}
              >
                Guests
              </p>
              <div className="flex items-center gap-5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-[#767470]" style={{ fontFamily: 'var(--font-inter)' }}>
                    Adults
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAdults((n) => Math.max(1, n - 1))}
                      className="w-6 h-6 rounded-full border border-[#ccc7bb] flex items-center justify-center text-[#4e332d] text-sm hover:border-[#9a5636] transition-colors"
                      aria-label="Decrease adults"
                    >
                      −
                    </button>
                    <span className="text-sm w-4 text-center" style={{ fontFamily: 'var(--font-uchen)' }}>
                      {adults}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAdults((n) => Math.min(8, n + 1))}
                      className="w-6 h-6 rounded-full border border-[#ccc7bb] flex items-center justify-center text-[#4e332d] text-sm hover:border-[#9a5636] transition-colors"
                      aria-label="Increase adults"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-[#767470]" style={{ fontFamily: 'var(--font-inter)' }}>
                    Children
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setChildren((n) => Math.max(0, n - 1))}
                      className="w-6 h-6 rounded-full border border-[#ccc7bb] flex items-center justify-center text-[#4e332d] text-sm hover:border-[#9a5636] transition-colors"
                      aria-label="Decrease children"
                    >
                      −
                    </button>
                    <span className="text-sm w-4 text-center" style={{ fontFamily: 'var(--font-uchen)' }}>
                      {children}
                    </span>
                    <button
                      type="button"
                      onClick={() => setChildren((n) => Math.min(6, n + 1))}
                      className="w-6 h-6 rounded-full border border-[#ccc7bb] flex items-center justify-center text-[#4e332d] text-sm hover:border-[#9a5636] transition-colors"
                      aria-label="Increase children"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Promo + search */}
          <div className="flex items-center justify-between px-5 py-3 bg-[#faf9f9] border-t border-[#ebe8e0] rounded-b-2xl">
            <div>
              {showPromo ? (
                <input
                  type="text"
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  placeholder="Promo code"
                  className="text-sm border-b border-[#ccc7bb] bg-transparent outline-none py-0.5 w-32"
                  style={{ fontFamily: 'var(--font-inter)' }}
                  aria-label="Promotional code"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setShowPromo(true)}
                  className="text-xs text-[#767470] hover:text-[#9a5636] transition-colors underline underline-offset-2"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  Add promo code
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={!checkIn || !checkOut}
              className="flex items-center gap-2 bg-[#9a5636] hover:bg-[#8b3a2e] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-full transition-colors"
              style={{ fontFamily: 'var(--font-urbanist)', fontWeight: 600 }}
            >
              <span className="text-sm tracking-wide">Search</span>
              <img src="/assets/icon-arrow.svg" alt="" aria-hidden="true" className="h-4 w-4 brightness-0 invert" />
            </button>
          </div>
        </form>
      </div>

      {/* Feature blocks */}
      <div className="max-w-5xl mx-auto px-5 md:px-10 py-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: '/assets/campfire.svg',
            rotate: false,
            heading: 'Private & Seclusive',
            body: 'Every room is designed for full privacy. No hallways, no neighbors, no front desk.',
          },
          {
            icon: '/assets/hammock.svg',
            rotate: false,
            heading: 'Immersed in Nature',
            body: 'Acres of forest, open sky, and intentional quiet — wherever you choose to stay.',
          },
          {
            icon: '/assets/steam-bath-icon.svg',
            rotate: true,
            heading: 'Hand-crafted Details',
            body: 'Copper tubs, cedar decks, hand-stitched leather — made by people who care.',
          },
        ].map((f) => (
          <div key={f.heading} className="flex flex-col items-center text-center gap-3">
            <img
              src={f.icon}
              alt=""
              aria-hidden="true"
              className="h-14 opacity-70"
              style={f.rotate ? { transform: 'rotate(180deg)' } : {}}
            />
            <h3
              className="text-xl text-[#4e332d]"
              style={{ fontFamily: 'var(--font-brothers)', fontWeight: 700 }}
            >
              {f.heading}
            </h3>
            <p className="text-sm text-[#767470] leading-relaxed" style={{ fontFamily: 'var(--font-inter)' }}>
              {f.body}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
