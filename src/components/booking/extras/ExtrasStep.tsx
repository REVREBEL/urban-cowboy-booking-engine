import React, { useState } from 'react';
import { ExtraItem, BookingState, AddonSchedulePreference } from '../types';
import { EXTRAS } from '../data/hotelData';
import { AddonCard } from './AddonCard';
import { AddonCustomizerModal } from './AddonCustomizerModal';
import { ArrowRight, ArrowLeft, Calendar, Clock, Heart, Check, Sparkles } from 'lucide-react';

interface ExtrasStepProps {
  bookingState: BookingState;
  onUpdateExtras: (extraId: string, count: number) => void;
  onUpdateExtraPreference?: (extraId: string, preference: AddonSchedulePreference) => void;
  onProceedToPay: () => void;
  onBackToRates: () => void;
}

export const ExtrasStep: React.FC<ExtrasStepProps> = ({
  bookingState,
  onUpdateExtras,
  onUpdateExtraPreference,
  onProceedToPay,
  onBackToRates
}) => {
  const { selectedRoom, selectedRate, selectedExtras, extraPreferences = {}, searchCriteria } = bookingState;
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [customizingAddon, setCustomizingAddon] = useState<ExtraItem | null>(null);

  const calculateExtrasTotal = () => {
    return Object.entries(selectedExtras).reduce((total, [extraId, count]) => {
      const item = EXTRAS.find((e) => e.id === extraId);
      return total + (item ? item.price * count : 0);
    }, 0);
  };

  const totalSelectedCount = Object.values(selectedExtras).reduce((sum, c) => sum + c, 0);
  const extrasTotal = calculateExtrasTotal();

  const filteredExtras = EXTRAS.filter((extra) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'dining' && extra.category === 'dining') return true;
    if (activeFilter === 'wellness' && extra.category === 'wellness') return true;
    if (activeFilter === 'celebration' && extra.category === 'celebration') return true;
    if (activeFilter === 'pets' && extra.category === 'pets') return true;
    return true;
  });

  const handleSavePreference = (pref: AddonSchedulePreference) => {
    if (!customizingAddon) return;
    if (onUpdateExtraPreference) {
      onUpdateExtraPreference(customizingAddon.id, pref);
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Back Navigation */}
      <button
        onClick={onBackToRates}
        className="inline-flex items-center gap-2 font-woodblock text-xs uppercase tracking-widest text-[#73716D] hover:text-[#4E332D] mb-6 transition-colors cursor-pointer group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Rate Selection</span>
      </button>

      {/* Header Bar */}
      <div className="mb-8 pb-6 border-b border-[#D1C9BE] flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="font-woodblock text-xs uppercase tracking-widest text-[#9A5636] font-bold block mb-1">
            STEP 4 OF 5 · CURATED ADD-ONS & EXPERIENCES
          </span>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#221C18] uppercase tracking-tight">
            Add-ons & Personal Touches
          </h1>
          <p className="font-editorial text-sm sm:text-base text-[#6B6259] mt-2 max-w-2xl">
            From fresh Catskill bouquets waiting in your room to celebration cakes and fireside s'mores, schedule every detail and add custom notes for our front desk.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'All Add-ons' },
            { id: 'dining', label: 'Food & Drink' },
            { id: 'wellness', label: 'Bathing & Spa' },
            { id: 'celebration', label: 'Celebrations' },
            { id: 'pets', label: 'Dogs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-woodblock uppercase tracking-wider transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-[#4E332D] text-[#EBE8E0] shadow-xs font-bold'
                  : 'bg-white/70 hover:bg-white text-[#73716D] border border-[#D1C9BE]/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ================= ADDONS GRID (Matching 461.35px Figma Spec) ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center mb-24">
        {filteredExtras.map((addon) => {
          const count = selectedExtras[addon.id] || 0;
          const preference = extraPreferences[addon.id];
          return (
            <AddonCard
              key={addon.id}
              addon={addon}
              count={count}
              preference={preference}
              onUpdateCount={(newCount) => {
                onUpdateExtras(addon.id, Math.max(0, newCount));
              }}
              onOpenCustomize={() => setCustomizingAddon(addon)}
            />
          );
        })}
      </div>

      {/* ================= FLOATING SUMMARY & SCHEDULE BAR ================= */}
      <div className="sticky bottom-6 z-40 bg-[#221C18] text-white p-4 sm:p-5 rounded-3xl shadow-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-[1600px] mx-auto">
        <div className="text-center sm:text-left">
          <span className="font-woodblock text-[11px] uppercase tracking-widest text-[#D1C9BE] block">
            RESERVATION SUMMARY
          </span>
          <div className="font-serif text-sm text-white mt-0.5">
            <span className="font-bold">{selectedRoom?.name || 'Selected Suite'}</span> ·{' '}
            <span className="text-[#F2AAA9]">{selectedRate?.title || 'Selected Rate'}</span> ({searchCriteria.nights} {searchCriteria.nights === 1 ? 'night' : 'nights'})
          </div>
          {extrasTotal > 0 && (
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1">
              <span className="text-xs font-mono font-bold text-[#F2AAA9] bg-white/10 px-2 py-0.5 rounded-full">
                +${extrasTotal.toFixed(2)} in add-ons
              </span>
              <span className="text-xs text-[#EBE8E0]/70 font-sans">
                ({totalSelectedCount} {totalSelectedCount === 1 ? 'item' : 'items'} selected)
              </span>
              {Object.keys(extraPreferences).length > 0 && (
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
            onClick={onProceedToPay}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#9A5636] hover:bg-[#783224] active:scale-[0.98] text-[#EBE8E0] px-8 py-3.5 rounded-full font-woodblock text-xs sm:text-sm uppercase tracking-widest cursor-pointer transition-all shadow-md group"
          >
            <span>Proceed to Guest Details & Pay</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* ================= SMART TAILORING MODAL ================= */}
      {customizingAddon && (
        <AddonCustomizerModal
          isOpen={true}
          addon={customizingAddon}
          searchCriteria={searchCriteria}
          currentPreference={extraPreferences[customizingAddon.id]}
          onSave={handleSavePreference}
          onClose={() => setCustomizingAddon(null)}
        />
      )}
    </div>
  );
};
