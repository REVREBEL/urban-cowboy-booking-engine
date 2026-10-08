import React from 'react';
import { SearchCriteria } from '../types';
import { Calendar, ArrowLeft } from 'lucide-react';

interface MatchOrBrowseScreenProps {
  criteria: SearchCriteria;
  onFindYourStay: () => void;
  onShowAllRooms: () => void;
  onChangeDates: () => void;
}

export const MatchOrBrowseScreen: React.FC<MatchOrBrowseScreenProps> = ({
  criteria,
  onFindYourStay,
  onShowAllRooms,
  onChangeDates
}) => {
  // Format dates helper
  const formatDateDisplay = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex flex-col justify-center items-center py-10 sm:py-16 px-4 sm:px-8 selection:bg-[#4E332D] selection:text-white relative"
      style={{
        backgroundColor: '#5C483B',
        backgroundImage: `
          repeating-linear-gradient(0deg, rgba(0,0,0,0.14) 0px, rgba(0,0,0,0.14) 1px, transparent 1px, transparent 4px),
          repeating-linear-gradient(90deg, rgba(0,0,0,0.14) 0px, rgba(0,0,0,0.14) 1px, transparent 1px, transparent 4px),
          repeating-linear-gradient(45deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, transparent 1px, transparent 4px)
        `
      }}
    >
      {/* Top Floating Stay Context Chip */}
      <div className="mb-6 sm:mb-8 flex items-center justify-center">
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#3B2C24]/85 text-[#F2D078] border border-[#2A1D17] text-xs font-mono shadow-md backdrop-blur-xs">
          <Calendar className="w-3.5 h-3.5 text-[#F5C748]" />
          <span>
            {formatDateDisplay(criteria.checkIn)} – {formatDateDisplay(criteria.checkOut)}
          </span>
          <span className="text-[#F2D078]/40">·</span>
          <span>{criteria.nights} {criteria.nights === 1 ? 'Night' : 'Nights'}</span>
          <span className="text-[#F2D078]/40">·</span>
          <span>{criteria.guests} {criteria.guests === 1 ? 'Guest' : 'Guests'}</span>
          <button
            type="button"
            onClick={onChangeDates}
            className="text-[#F8A8A2] hover:text-white uppercase font-woodblock tracking-wider text-[11px] ml-2 underline cursor-pointer transition-colors"
          >
            Change
          </button>
        </div>
      </div>

      {/* Main Grid: Left Framed Card + Right Action Tickets */}
      <div className="max-w-[1240px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
        
        {/* ================= LEFT CARD (DARK SLATE/WOOD) ================= */}
        <div className="lg:col-span-7 bg-[#544139] border-[3px] border-[#2C1E18] p-8 sm:p-12 lg:p-14 flex flex-col justify-between shadow-2xl relative">
          
          {/* Subtle Inner Framing Border */}
          <div className="absolute inset-2 sm:inset-3 border border-[#3E2D26]/70 pointer-events-none" />

          {/* Top Headline Statement */}
          <div className="relative z-10 space-y-6 sm:space-y-8">
            <h2 className="font-desert font-medium text-lg sm:text-2xl text-[#EBD08B] tracking-wide leading-snug">
              A Place With This Much Character Comes With More Ways to Stay.
            </h2>

            {/* Main Big Question */}
            <div className="space-y-1 py-4 sm:py-6">
              <div className="font-display font-bold text-4xl sm:text-5xl lg:text-[62px] text-[#F5C748] tracking-wider leading-[1.08] uppercase drop-shadow-xs">
                WANT HELP
              </div>
              <div className="font-display font-bold text-4xl sm:text-5xl lg:text-[62px] text-[#F5C748] tracking-wider leading-[1.08] uppercase drop-shadow-xs">
                FINDING THE
              </div>
              <div className="font-display font-bold text-4xl sm:text-5xl lg:text-[62px] text-[#F5C748] tracking-wider leading-[1.08] uppercase drop-shadow-xs">
                RIGHT ONE?
              </div>
            </div>
          </div>

          {/* Bottom Narrative Description */}
          <div className="relative z-10 pt-6 mt-4 border-t border-[#3E2D26]/80">
            <p className="font-desert text-sm sm:text-base text-[#EBD08B] leading-relaxed max-w-xl">
              Tell us a Little About Your Stay and we’ll Point you Toward Your Best Matches, or you can Browse Everything Available.
            </p>
          </div>

        </div>

        {/* ================= RIGHT BUTTONS STACK ================= */}
        <div className="lg:col-span-5 flex flex-col gap-6 sm:gap-8 justify-between">
          
          {/* Top Block: Pink "YES" Button (Takes them to Room Matcher) */}
          <button
            type="button"
            onClick={onFindYourStay}
            aria-label="Yes, help me find the right room"
            className="flex-1 min-h-[160px] sm:min-h-[190px] bg-[#F8A8A2] hover:bg-[#F99D96] active:bg-[#F28D85] text-[#1C1917] p-8 flex items-center justify-center border-2 border-[#2C1E18] shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer group hover:scale-[1.015] active:scale-[0.985]"
          >
            <span className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl tracking-wider uppercase text-[#1C1917] group-hover:scale-105 transition-transform duration-200 select-none">
              YES
            </span>
          </button>

          {/* Bottom Block: Yellow "no thanks SHOW ME ALL ROOMS" Button (Takes them to normal all rooms) */}
          <button
            type="button"
            onClick={onShowAllRooms}
            aria-label="No thanks, show me all rooms"
            className="flex-1 min-h-[180px] sm:min-h-[220px] bg-[#FEE474] hover:bg-[#FEDF5A] active:bg-[#FBD63F] text-[#1C1917] p-8 flex flex-col items-center justify-center text-center border-2 border-[#2C1E18] shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer group hover:scale-[1.015] active:scale-[0.985] space-y-2"
          >
            <span className="font-desert lowercase text-xl sm:text-2xl text-[#1C1917] font-normal tracking-wide select-none">
              no thanks
            </span>
            <div className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl uppercase tracking-wider text-[#1C1917] leading-[1.05] group-hover:scale-105 transition-transform duration-200 select-none">
              SHOW ME
              <br />
              ALL ROOMS
            </div>
          </button>

        </div>

      </div>

      {/* Return to Date Selection Back Link */}
      <div className="mt-8 sm:mt-10">
        <button
          type="button"
          onClick={onChangeDates}
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#EBD08B]/80 hover:text-[#F5C748] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Date Selection</span>
        </button>
      </div>

    </div>
  );
};
