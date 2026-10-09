import React from 'react';
import type { SearchCriteria } from '@/types';
import { Compass, Eye, Sparkles, Calendar, ArrowRight, ArrowLeft, Check } from 'lucide-react';

interface MatchOrBrowseScreenProps {
  criteria: SearchCriteria;
  availableCount?: number;
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
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#FAF9F9] text-[#1C1917] selection:bg-[#4E332D] selection:text-white animate-in fade-in duration-300">
      <div className="max-w-[1000px] w-full mx-auto space-y-10 sm:space-y-12">
        
        {/* Top Stay Context Chip */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white border border-[#D1C9BE] shadow-2xs text-xs font-mono text-[#4E332D]">
            <Calendar className="w-3.5 h-3.5 text-[#9A5636]" />
            <span className="font-semibold">
              {formatDateDisplay(criteria.checkIn)} – {formatDateDisplay(criteria.checkOut)}
            </span>
            <span className="text-[#D1C9BE]" aria-hidden="true">·</span>
            <span>{criteria.nights} {criteria.nights === 1 ? 'Night' : 'Nights'}</span>
            <span className="text-[#D1C9BE]" aria-hidden="true">·</span>
            <span>{criteria.guests} {criteria.guests === 1 ? 'Guest' : 'Guests'}</span>
            <button
              type="button"
              onClick={onChangeDates}
              className="text-[#9A5636] hover:underline font-woodblock uppercase tracking-wider text-[11px] ml-1 cursor-pointer"
            >
              Change
            </button>
          </div>
        </div>

        {/* Hero Editorial Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="font-woodblock text-xs uppercase tracking-[0.25em] text-[#9A5636] font-bold block">
            URBAN COWBOY CATSKILLS · YOUR EXPERIENCE
          </span>

          <h1 className="font-display font-light text-3xl sm:text-5xl lg:text-6xl text-[#4E332D] tracking-wide uppercase leading-[1.15]">
            A property with character as big as ours means we have more options than most.
          </h1>

          <div className="pt-2 space-y-2">
            <h2 className="font-brothers text-xl sm:text-2xl text-[#1C1917] uppercase tracking-wider font-bold">
              Would you like us to help find your top options?
            </h2>
            <p className="font-sans text-sm sm:text-base text-[#60605E] max-w-xl mx-auto leading-relaxed">
              Answer a few questions and we'll match you to the right room, or browse everything available.
            </p>
          </div>
        </div>

        {/* Choice Path Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          
          {/* Path 1: Room Matcher (Recommended) */}
          <div 
            onClick={onFindYourStay}
            className="group relative bg-white border-2 border-[#4E332D] rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:shadow-xl transition-all duration-200 cursor-pointer overflow-hidden ring-1 ring-[#4E332D]/20 hover:scale-[1.01]"
          >
            <div className="absolute top-3.5 right-3.5 bg-[#0E301A] text-white px-3 py-1 rounded-full text-[10px] font-woodblock uppercase tracking-wider font-bold flex items-center gap-1 shadow-xs">
              <Sparkles className="w-3 h-3 text-[#F2AAA9]" />
              <span>Recommended</span>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EBE8E0]/70 flex items-center justify-center text-[#4E332D] group-hover:scale-110 transition-transform">
                <Compass className="w-6 h-6 stroke-[2]" />
              </div>

              <div>
                <span className="font-woodblock text-[11px] uppercase tracking-wider text-[#9A5636] font-bold block mb-1">
                  GUIDED MATCHER · 60 SECONDS
                </span>
                <h3 className="font-display font-normal text-2xl sm:text-3xl text-[#1C1917] uppercase">
                  Find Your Stay
                </h3>
                <p className="font-sans text-xs sm:text-sm text-[#60605E] mt-2 leading-relaxed">
                  Tell us who's coming (solo, couple, friends, family), if your pup is tagging along, and your escape focus. We'll reveal your perfect suite.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 text-xs font-sans text-[#4E332D]">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#0E301A]" />
                  <span>Custom narrative explaining why it's your #1 match</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#0E301A]" />
                  <span>Two curated runner-up options side-by-side</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#EBE8E0]">
              <button
                type="button"
                onClick={onFindYourStay}
                className="w-full bg-[#4E332D] group-hover:bg-[#221C18] text-white py-3.5 px-6 rounded-full font-woodblock text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
              >
                <span>Find Your Stay</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Path 2: Full Catalog Browse */}
          <div 
            onClick={onShowAllRooms}
            className="group bg-white border-2 border-[#D1C9BE] hover:border-[#4E332D]/60 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden hover:scale-[1.01]"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF9F9] border border-[#EBE8E0] flex items-center justify-center text-[#73716D] group-hover:text-[#4E332D] group-hover:scale-110 transition-all">
                <Eye className="w-6 h-6 stroke-[2]" />
              </div>

              <div>
                <span className="font-woodblock text-[11px] uppercase tracking-wider text-[#73716D] font-bold block mb-1">
                  SELF-DIRECTED · FULL CATALOG
                </span>
                <h3 className="font-display font-normal text-2xl sm:text-3xl text-[#1C1917] uppercase">
                  No, Show Me All Rooms
                </h3>
                <p className="font-sans text-xs sm:text-sm text-[#60605E] mt-2 leading-relaxed">
                  Browse all 10 soaking suites, historic lodge rooms, and pine cabin hideaways across Alpine Haus, Walden Haus, and The Lodge.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 text-xs font-sans text-[#73716D]">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#73716D]" />
                  <span>Filter by freestanding clawfoot or outdoor cedar tub</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#73716D]" />
                  <span>Compare rates, square footage & building vibes</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#EBE8E0]">
              <button
                type="button"
                onClick={onShowAllRooms}
                className="w-full bg-white group-hover:bg-[#EBE8E0]/60 border-2 border-[#4E332D] text-[#4E332D] py-3.5 px-6 rounded-full font-woodblock text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>No, Show Me All Rooms</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

        </div>

        {/* Back Link */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onChangeDates}
            className="inline-flex items-center gap-1.5 text-xs font-woodblock uppercase tracking-widest text-[#73716D] hover:text-[#4E332D] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Date Selection</span>
          </button>
        </div>

      </div>
    </div>
  );
};
