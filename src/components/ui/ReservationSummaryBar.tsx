import React from 'react';
import { ArrowRight, Check } from 'lucide-react';

export interface ReservationSummaryBarProps {
  roomName: string;
  rateTitle: string;
  nights: number;
  extrasTotal?: number;
  selectedItemCount?: number;
  hasScheduledTiming?: boolean;
  actionLabel?: string;
  onAction: () => void;
  className?: string;
}

export const ReservationSummaryBar: React.FC<ReservationSummaryBarProps> = ({
  roomName,
  rateTitle,
  nights,
  extrasTotal = 0,
  selectedItemCount = 0,
  hasScheduledTiming = false,
  actionLabel = 'Proceed to Guest Details & Pay',
  onAction,
  className = ''
}) => {
  return (
    <aside 
      aria-label="Reservation Summary Bar"
      className={`sticky bottom-6 z-40 bg-[#221C18] text-white p-4 sm:p-5 rounded-3xl shadow-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-[1600px] mx-auto backdrop-blur-md ${className}`}
    >
      <div className="text-center sm:text-left">
        <span className="font-woodblock text-[11px] uppercase tracking-widest text-[#D1C9BE] block">
          RESERVATION SUMMARY
        </span>
        <div className="font-serif text-sm text-white mt-0.5">
          <span className="font-bold">{roomName}</span> ·{' '}
          <span className="text-[#F2AAA9]">{rateTitle}</span> ({nights} {nights === 1 ? 'night' : 'nights'})
        </div>
        {extrasTotal > 0 && (
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1">
            <span className="text-xs font-mono font-bold text-[#F2AAA9] bg-white/10 px-2 py-0.5 rounded-full">
              +${extrasTotal.toFixed(2)} in add-ons
            </span>
            <span className="text-xs text-[#EBE8E0]/70 font-sans">
              ({selectedItemCount} {selectedItemCount === 1 ? 'item' : 'items'} selected)
            </span>
            {hasScheduledTiming && (
              <span className="text-[11px] text-[#D1C9BE] font-sans flex items-center gap-1">
                <Check className="w-3 h-3 text-[#F2AAA9]" />
                <span>Scheduled with personalized timing</span>
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
        <button
          type="button"
          onClick={onAction}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#9A5636] hover:bg-[#783224] active:scale-[0.98] text-[#EBE8E0] px-8 py-3.5 rounded-full font-woodblock text-xs sm:text-sm uppercase tracking-widest cursor-pointer transition-all shadow-md group"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </aside>
  );
};
