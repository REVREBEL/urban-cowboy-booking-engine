import { useBooking } from '../booking/BookingContext';
import type { BookingView } from '../booking/types';

const STEPS: { num: number; label: string; views: BookingView[] }[] = [
  { num: 1, label: 'Stay',    views: ['availability'] },
  { num: 2, label: 'Room',    views: ['find-your-stay', 'help-me-choose', 'match-results', 'all-rooms', 'room-detail', 'rate-selection'] },
  { num: 3, label: 'Details', views: ['details'] },
  { num: 4, label: 'Extras',  views: ['extras'] },
  { num: 5, label: 'Pay',     views: ['pay'] },
];

function stepIndex(view: BookingView): number {
  return STEPS.findIndex((s) => s.views.includes(view));
}

export default function BookingChrome() {
  const { view } = useBooking();
  const activeIdx = stepIndex(view);

  return (
    <header className="sticky top-0 z-40 bg-[#ebe8e0] border-b border-[#ccc7bb]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 md:px-10 h-14 md:h-16">
        <a href="#" aria-label="Urban Cowboy home">
          <img src="/assets/logo-dark.svg" alt="Urban Cowboy" className="h-7 md:h-8" />
        </a>
        <div className="flex items-center gap-1.5">
          <img src="/assets/best-rate-guaranteed-icon.svg" alt="" aria-hidden="true" className="h-4" />
          <span
            className="text-[10px] tracking-widest uppercase text-[#9a5636]"
            style={{ fontFamily: 'var(--font-brothers)' }}
          >
            Best Rate Guarantee
          </span>
        </div>
      </div>

      {/* Step progress */}
      <div className="px-5 md:px-10 pb-3" role="navigation" aria-label="Booking steps">
        <ol className="flex items-center gap-0">
          {STEPS.map((step, idx) => {
            const isActive = idx === activeIdx;
            const isCompleted = idx < activeIdx;

            return (
              <li key={step.label} className="flex items-center">
                {/* Circle + label */}
                <div className="flex items-center gap-1.5">
                  {/* Numbered circle */}
                  <span
                    className={[
                      'w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition-colors',
                      isActive
                        ? 'bg-[#9a5636] text-white'
                        : isCompleted
                        ? 'bg-[#4e332d] text-white'
                        : 'bg-[#ccc7bb] text-white',
                    ].join(' ')}
                    style={{ fontFamily: 'var(--font-brothers)', fontWeight: 700, lineHeight: 1 }}
                    aria-hidden="true"
                  >
                    {step.num}
                  </span>
                  {/* Label — show on active; hide on mobile for inactive */}
                  <span
                    className={[
                      'text-[11px] tracking-widest uppercase transition-colors',
                      isActive
                        ? 'text-[#9a5636]'
                        : isCompleted
                        ? 'text-[#4e332d]'
                        : 'text-[#767470] hidden sm:inline',
                    ].join(' ')}
                    style={{ fontFamily: 'var(--font-brothers)', fontWeight: isActive ? 700 : 400 }}
                    aria-current={isActive ? 'step' : undefined}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector */}
                {idx < STEPS.length - 1 && (
                  <span className="mx-2 text-[#ccc7bb] text-xs select-none" aria-hidden="true">
                    ·
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </header>
  );
}
