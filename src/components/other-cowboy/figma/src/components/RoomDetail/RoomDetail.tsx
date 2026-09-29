import { useState } from 'react';
import { useBooking } from '../../booking/BookingContext';
import BookingSummary from './BookingSummary';
import RoomFeatures from './RoomFeatures';
import ErrorState from '../states/ErrorState';

export default function RoomDetail() {
  const { state, dispatch, setView, goBack } = useBooking();
  const [activeImg, setActiveImg] = useState(0);

  const room = state.selectedRoom;

  if (!room) {
    return (
      <ErrorState
        message="Room not found. Please select a room."
        onRetry={() => setView('find-your-stay')}
      />
    );
  }

  function handleSeeRates() {
    setView('rate-selection');
  }

  const images = room.images.length > 0 ? room.images : [room.thumbImage];

  return (
    <main className="min-h-screen bg-[#ebe8e0]">
      {/* Hero image carousel */}
      <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden bg-[#4e332d]">
        <img
          key={images[activeImg]}
          src={images[activeImg]}
          alt={room.name}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&auto=format&fit=crop&q=70';
          }}
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Back */}
        <button
          onClick={goBack}
          className="absolute top-5 left-5 flex items-center gap-2 text-white text-xs tracking-widest uppercase bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-black/50 transition-colors"
          style={{ fontFamily: 'var(--font-brothers)' }}
        >
          ← Back
        </button>

        {/* Thumb strip */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-5">
            {images.map((img, idx) => (
              <button
                key={img}
                onClick={() => setActiveImg(idx)}
                className={[
                  'w-12 h-8 rounded overflow-hidden border-2 transition-all',
                  idx === activeImg ? 'border-white opacity-100' : 'border-transparent opacity-50 hover:opacity-75',
                ].join(' ')}
                aria-label={`View image ${idx + 1}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content grid */}
      <div className="max-w-6xl mx-auto px-5 md:px-10 py-10 grid grid-cols-1 md:grid-cols-[1fr_320px] gap-10">
        {/* Left — room info */}
        <div>
          {/* Eyebrow + name */}
          <p
            className="text-xs tracking-widest uppercase text-[#9a5636] mb-2"
            style={{ fontFamily: 'var(--font-brothers)' }}
          >
            {room.experience}
          </p>
          <h1
            className="text-4xl md:text-5xl text-[#4e332d] leading-none mb-3"
            style={{ fontFamily: 'var(--font-desert)', fontWeight: 700 }}
          >
            {room.name}
          </h1>
          <p
            className="text-lg text-[#767470] mb-8 leading-relaxed max-w-xl"
            style={{ fontFamily: 'var(--font-uchen)' }}
          >
            {room.description}
          </p>

          {/* Divider */}
          <div className="border-t border-[#ccc7bb] my-8" />

          {/* Features */}
          <RoomFeatures features={room.features} />

          {/* Divider */}
          <div className="border-t border-[#ccc7bb] my-8" />

          {/* Rate teaser */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#767470] mb-1" style={{ fontFamily: 'var(--font-inter)' }}>Starting from</p>
              <p
                className="text-3xl text-[#4e332d]"
                style={{ fontFamily: 'var(--font-uchen)' }}
              >
                ${room.startingFrom}
                <span className="text-sm text-[#767470] ml-1" style={{ fontFamily: 'var(--font-inter)' }}>/night</span>
              </p>
            </div>

            {/* Mobile CTA */}
            <div className="md:hidden">
              <button
                onClick={handleSeeRates}
                className="px-6 py-3 bg-[#9a5636] text-white text-sm tracking-wide rounded-full hover:bg-[#8b3a2e] transition-colors"
                style={{ fontFamily: 'var(--font-urbanist)', fontWeight: 600 }}
              >
                See Rates
              </button>
            </div>
          </div>
        </div>

        {/* Right — booking summary (desktop sticky) */}
        <div className="hidden md:block">
          <div className="sticky top-24">
            <BookingSummary onSeeRates={handleSeeRates} />
          </div>
        </div>
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#ebe8e0]/95 backdrop-blur-sm border-t border-[#ccc7bb] px-5 py-4 z-30">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-[#767470]" style={{ fontFamily: 'var(--font-inter)' }}>from</p>
            <p className="text-lg text-[#4e332d]" style={{ fontFamily: 'var(--font-uchen)' }}>
              ${room.startingFrom}<span className="text-xs text-[#767470]">/night</span>
            </p>
          </div>
          <button
            onClick={handleSeeRates}
            className="flex-1 py-3 bg-[#9a5636] text-white text-sm tracking-wide rounded-full hover:bg-[#8b3a2e] transition-colors text-center"
            style={{ fontFamily: 'var(--font-urbanist)', fontWeight: 600 }}
          >
            See Rates
          </button>
        </div>
      </div>

      {/* Bottom padding for mobile sticky bar */}
      <div className="md:hidden h-24" />
    </main>
  );
}
