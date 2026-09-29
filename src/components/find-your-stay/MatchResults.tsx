import { useMemo } from 'react';
import { useBooking } from '../../booking/BookingContext';
import { rankFromState } from '../../booking/recommendationAdapter';
import { getRoomsForAvailability } from '../../booking/mockData';
import TopMatchPanel from './TopMatchPanel';
import RoomCard from './RoomCard';
import EmptyState from '../states/EmptyState';

export default function MatchResults() {
  const { state, setView, goBack, openDrawer } = useBooking();
  const prefs = state.recommendationPreferences;

  const results = useMemo(() => {
    if (!prefs) return [];
    return rankFromState(prefs, state.children, state.checkIn);
  }, [prefs, state.children, state.checkIn]);

  const totalAvailable = useMemo(
    () => getRoomsForAvailability(state.checkIn, state.checkOut, state.adults, state.children).length,
    [state.checkIn, state.checkOut, state.adults, state.children],
  );

  function selectRoom(roomId: string) {
    const room = results.find((r) => r.room.id === roomId)?.room;
    if (!room) return;
    openDrawer(room);
  }

  if (!prefs) {
    return (
      <EmptyState
        heading="No preferences found"
        body="Go back and answer the questions first."
        action={{ label: 'Help Me Choose', onClick: () => setView('help-me-choose') }}
      />
    );
  }

  if (results.length === 0) {
    return (
      <main className="min-h-screen bg-[#ebe8e0]">
        <div className="max-w-4xl mx-auto px-5 md:px-10 pt-10 pb-20">
          <button
            onClick={goBack}
            className="text-xs tracking-widest uppercase text-[#767470] hover:text-[#4e332d] mb-8 transition-colors"
            style={{ fontFamily: 'var(--font-brothers)' }}
          >
            ← Back
          </button>
          <EmptyState
            heading="No rooms match these criteria"
            body="Your dog filter may have removed all options. Try adjusting your search or browsing all rooms."
            action={{ label: 'Browse All Rooms', onClick: () => setView('all-rooms') }}
          />
        </div>
      </main>
    );
  }

  const [top, ...alternates] = results;

  return (
    <main className="min-h-screen bg-[#ebe8e0]">
      <div className="max-w-5xl mx-auto px-5 md:px-10 pt-10 pb-20">
        {/* Back */}
        <button
          onClick={goBack}
          className="text-xs tracking-widest uppercase text-[#767470] hover:text-[#4e332d] mb-8 transition-colors"
          style={{ fontFamily: 'var(--font-brothers)' }}
        >
          ← Back
        </button>

        {/* Heading */}
        <div className="mb-8">
          <p
            className="text-xs tracking-widest uppercase text-[#9a5636] mb-2"
            style={{ fontFamily: 'var(--font-brothers)' }}
          >
            Matched for You
          </p>
          <h1
            className="text-4xl md:text-5xl text-[#4e332d] leading-none"
            style={{ fontFamily: 'var(--font-desert)', fontWeight: 700 }}
          >
            Your Best Match
          </h1>
        </div>

        {/* Top match */}
        <div className="mb-10">
          <TopMatchPanel
            result={top}
            onViewRoom={() => selectRoom(top.room.id)}
          />
        </div>

        {/* Alternates */}
        {alternates.length > 0 && (
          <>
            <div className="mb-5">
              <p
                className="text-xs tracking-widest uppercase text-[#9a5636]"
                style={{ fontFamily: 'var(--font-brothers)' }}
              >
                {top.explanation?.alternate_match_heading || 'Also a Strong Fit'}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
              {alternates.map((r) => (
                <RoomCard
                  key={r.room.id}
                  room={r.room}
                  matchBadge={r.matchedInterests.length > 0 ? 'GREAT FIT' : undefined}
                  score={r.score}
                  onSelect={() => selectRoom(r.room.id)}
                />
              ))}
            </div>
          </>
        )}

        {/* View all rooms escape */}
        <div className="text-center pt-4 border-t border-[#ccc7bb]">
          <p className="text-sm text-[#767470] mb-3" style={{ fontFamily: 'var(--font-uchen)' }}>
            Not seeing what you're after?
          </p>
          <button
            onClick={() => setView('all-rooms')}
            className="text-xs tracking-widest uppercase text-[#9a5636] hover:underline"
            style={{ fontFamily: 'var(--font-brothers)' }}
          >
            Browse All {totalAvailable} Rooms →
          </button>
        </div>
      </div>
    </main>
  );
}
