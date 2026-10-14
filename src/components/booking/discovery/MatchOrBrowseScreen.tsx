import type { FC } from 'react';
import type { SearchCriteria } from '@/types';
import { Compass, Eye, Sparkles, Calendar, ArrowRight, ArrowLeft, Check } from 'lucide-react';

interface MatchOrBrowseScreenProps {
  criteria: SearchCriteria;
  availableCount?: number;
  onFindYourStay: () => void;
  onShowAllRooms: () => void;
  onChangeDates: () => void;
}

export const MatchOrBrowseScreen: FC<MatchOrBrowseScreenProps> = ({
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
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-background text-foreground selection:bg-background selection:text-foreground animate-in fade-in duration-300">
      <div className="max-w-250 w-full mx-auto space-y-10 sm:space-y-12">
        
        {/* Top Stay Context Chip */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-background border border-foreground shadow-2xs text-xs font-mono text-foreground">
            <Calendar className="w-3.5 h-3.5 text-accent" />
            <span className="font-semibold">
              {formatDateDisplay(criteria.checkIn)} – {formatDateDisplay(criteria.checkOut)}
            </span>
            <span className="text-accent" aria-hidden="true">·</span>
            <span>{criteria.nights} {criteria.nights === 1 ? 'Night' : 'Nights'}</span>
            <span className="text-accent" aria-hidden="true">·</span>
            <span>{criteria.guests} {criteria.guests === 1 ? 'Guest' : 'Guests'}</span>
            <button
              type="button"
              onClick={onChangeDates}
              className="text-accent hover:underline font-woodblock uppercase tracking-wider text-[11px] ml-1 cursor-pointer"
            >
              Change
            </button>
          </div>
        </div>

        {/* Hero Editorial Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="font-eyebrow text-xs uppercase tracking-[0.25em] text-accent font-bold block">
            URBAN COWBOY CATSKILLS · YOUR EXPERIENCE
          </span>

          <h1 className="font-heading font-light text-2xl sm:text-3xl lg:text-3xl text-foreground tracking-wide uppercase leading-[1.15]">
            A property with character as big as ours means we have more options than most.
          </h1>

          <div className="pt-2 space-y-2">
            <h2 className="font-subheading text-xl sm:text-2xl text-foreground uppercase tracking-wider font-bold">
              Would you like us to help find your top options?
            </h2>
            <p className="font-body text-sm sm:text-base text-foreground max-w-xl mx-auto leading-relaxed">
              Answer a few questions and we'll match you to the right room, or browse everything available.
            </p>
          </div>
        </div>

        {/* Choice Path Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          
          {/* Path 1: Room Matcher (Recommended) */}
          <div 
            onClick={onFindYourStay}
            className="group relative bg-background border-2 border-foreground rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:shadow-xl transition-all duration-200 cursor-pointer overflow-hidden ring-1 ring-foreground/20 hover:scale-[1.01]"
          >
            <div className="absolute top-3.5 right-3.5 bg-foreground text-background px-3 py-1 rounded-full text-[10px] font-woodblock uppercase tracking-wider font-bold flex items-center gap-1 shadow-xs">
              <Sparkles className="w-3 h-3 text-emphasis" />
              <span>Recommended</span>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary/70 flex items-center justify-center text-foreground group-hover:scale-110 transition-transform">
                <Compass className="w-6 h-6 stroke-2" />
              </div>

              <div>
                <span className="font-woodblock text-[11px] uppercase tracking-wider text-[#9A5636] font-bold block mb-1">
                  GUIDED MATCHER · 60 SECONDS
                </span>
                <h3 className="font-display font-normal text-2xl sm:text-3xl text-foreground uppercase">
                  Find Your Stay
                </h3>
                <p className="font-sans text-xs sm:text-sm text-foreground mt-2 leading-relaxed">
                  Tell us who's coming (solo, couple, friends, family), if your pup is tagging along, and your escape focus. We'll reveal your perfect suite.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 text-xs font-sans text-foreground">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-foreground" />
                  <span>Custom narrative explaining why it's your #1 match</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-foreground" />
                  <span>Two curated runner-up options side-by-side</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-secondary">
              <button
                type="button"
                onClick={onFindYourStay}
                className="w-full bg-foreground group-hover:bg-[#221C18] text-background py-3.5 px-6 rounded-full font-woodblock text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
              >
                <span>Find Your Stay</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Path 2: Full Catalog Browse */}
          <div 
            onClick={onShowAllRooms}
            className="group bg-background border-2 border-foreground hover:border-foreground/60 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden hover:scale-[1.01]"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF9F9] border border-secondary flex items-center justify-center text-[#73716D] group-hover:text-foreground group-hover:scale-110 transition-all">
                <Eye className="w-6 h-6 stroke-2" />
              </div>

              <div>
                <span className="font-woodblock text-[11px] uppercase tracking-wider text-[#73716D] font-bold block mb-1">
                  SELF-DIRECTED · FULL CATALOG
                </span>
                <h3 className="font-display font-normal text-2xl sm:text-3xl text-foreground uppercase">
                  No, Show Me All Rooms
                </h3>
                <p className="font-sans text-xs sm:text-sm text-foreground mt-2 leading-relaxed">
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

            <div className="mt-6 pt-4 border-t border-secondary">
              <button
                type="button"
                onClick={onShowAllRooms}
                className="w-full bg-background group-hover:bg-secondary/60 border-2 border-foreground text-foreground py-3.5 px-6 rounded-full font-woodblock text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2"
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
            className="inline-flex items-center gap-1.5 text-xs font-woodblock uppercase tracking-widest text-[#73716D] hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Date Selection</span>
          </button>
        </div>

      </div>
    </div>
  );
};
