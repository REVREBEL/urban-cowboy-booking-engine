import React, { useState, useEffect, useMemo } from 'react';
import type { ShapedProduct } from '@/types/mews';
import { imgUrl, money } from '@/lib/format';
import type { AddonSchedulePreference, AddonStayCriteria } from './addon-types';
import { X, Check, Clock, Heart, Gift, Wine, Dog, Sparkles, ArrowRight } from 'lucide-react';

interface AddonCustomizerModalProps {
  isOpen: boolean;
  addon: ShapedProduct;
  imageBaseUrl: string;
  searchCriteria: AddonStayCriteria;
  currentPreference?: AddonSchedulePreference;
  onSave: (preference: AddonSchedulePreference) => void;
  onClose: () => void;
}

export const AddonCustomizerModal: React.FC<AddonCustomizerModalProps> = ({
  isOpen,
  addon,
  imageBaseUrl,
  searchCriteria,
  currentPreference,
  onSave,
  onClose
}) => {
  const addonKind = useMemo(() => {
    if (addon.knownAddOn === 'FLOWER_BOUQUET') return 'fresh-cut-flowers';
    if (addon.knownAddOn === 'WELCOME_WINE') return 'wine-bottle';
    if (addon.knownAddOn === 'HUMMUS_AND_CRUDITES') return 'hummus-crudites';
    if (addon.knownAddOn === 'LETS_EAT_CHOCOLATE_TRUFFLES') return 'chocolate-truffles';

    const searchable = `${addon.name} ${addon.description}`.toLowerCase();
    if (/flower|bouquet|bloom/.test(searchable)) return 'fresh-cut-flowers';
    if (/cake|birthday|anniversary/.test(searchable)) return 'celebration-cake';
    if (/wine|bottle|sommelier/.test(searchable)) return 'wine-bottle';
    if (/pup|pet|dog/.test(searchable)) return 'pup-stay';
    if (/hummus|crudite/.test(searchable)) return 'hummus-crudites';
    if (/chocolate|truffle/.test(searchable)) return 'chocolate-truffles';
    return 'standard';
  }, [addon]);
  // Generate list of nights for the stay
  const stayDates = useMemo(() => {
    const dates = [];
    const [year, month, day] = (searchCriteria.checkIn || '2026-10-14').split('-').map(Number);
    const startDate = new Date(year, month - 1, day);
    const nightsCount = searchCriteria.nights || 1;

    for (let i = 0; i < nightsCount; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
      const monthDay = d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
      const fullLabel = i === 0 
        ? `${dayName}, ${monthDay} (Arrival Night)` 
        : i === nightsCount - 1
        ? `${dayName}, ${monthDay} (Final Night)`
        : `${dayName}, ${monthDay}`;

      dates.push({
        index: i,
        isoDate: d.toISOString().split('T')[0],
        dayName,
        monthDay,
        fullLabel,
        isArrival: i === 0,
        isDepartureNight: i === nightsCount - 1
      });
    }
    return dates;
  }, [searchCriteria.checkIn, searchCriteria.nights]);

  const isOneNightStay = searchCriteria.nights <= 1;
  const arrivalDateInfo = stayDates[0] || {
    dayName: 'Thursday',
    monthDay: '06/20',
    fullLabel: 'Thursday, 06/20 (Arrival Night)',
    isoDate: '2026-06-20'
  };

  // State initialization with smart defaults
  const [deliveryType, setDeliveryType] = useState<'waiting-in-room' | 'scheduled-day' | 'gift-surprise'>(
    currentPreference?.deliveryType || (addonKind === 'fresh-cut-flowers' ? 'waiting-in-room' : 'scheduled-day')
  );

  const [isGift, setIsGift] = useState<boolean>(
    currentPreference?.isGift ?? (addonKind === 'celebration-cake')
  );

  const [selectedDateIso, setSelectedDateIso] = useState<string>(
    currentPreference?.selectedDateIso || arrivalDateInfo.isoDate
  );

  const [selectedTime, setSelectedTime] = useState<string>(
    currentPreference?.selectedTime || 'Prior to check-in (waiting in suite at 4:00 PM)'
  );

  const [customTime, setCustomTime] = useState<string>(currentPreference?.customTime || '');

  const [giftRecipient, setGiftRecipient] = useState<string>(
    currentPreference?.giftRecipient || ''
  );

  const [includeCard, setIncludeCard] = useState<boolean>(
    currentPreference?.includeCard ?? (addonKind === 'celebration-cake' || addonKind === 'fresh-cut-flowers')
  );

  const [cardMessage, setCardMessage] = useState<string>(
    currentPreference?.cardMessage || ''
  );

  const [itemCustomization, setItemCustomization] = useState<string>(
    currentPreference?.itemCustomization || ''
  );

  const [dietaryNote, setDietaryNote] = useState<string>(
    currentPreference?.dietaryNote || ''
  );

  useEffect(() => {
    if (isOpen) {
      if (currentPreference) {
        setDeliveryType(currentPreference.deliveryType || 'waiting-in-room');
        setIsGift(currentPreference.isGift ?? false);
        setSelectedDateIso(currentPreference.selectedDateIso || arrivalDateInfo.isoDate);
        setSelectedTime(currentPreference.selectedTime || 'Prior to check-in (waiting in suite at 4:00 PM)');
        setCustomTime(currentPreference.customTime || '');
        setGiftRecipient(currentPreference.giftRecipient || '');
        setIncludeCard(currentPreference.includeCard ?? false);
        setCardMessage(currentPreference.cardMessage || '');
        setItemCustomization(currentPreference.itemCustomization || '');
        setDietaryNote(currentPreference.dietaryNote || '');
      } else {
        if (addonKind === 'fresh-cut-flowers') {
          setDeliveryType('waiting-in-room');
          setIsGift(false);
          setSelectedTime('Waiting in suite prior to 4:00 PM arrival');
          setIncludeCard(false);
        } else if (addonKind === 'celebration-cake') {
          setDeliveryType('scheduled-day');
          setIsGift(true);
          setSelectedTime('Evening service (post-dinner, 8:00 PM)');
          setIncludeCard(true);
          setItemCustomization('');
        } else if (addonKind === 'wine-bottle') {
          setItemCustomization('Natural Red (Earth & Fruit)');
          setSelectedTime('Chilled & waiting in suite upon check-in');
        } else if (addonKind === 'pup-stay') {
          setItemCustomization('');
          setSelectedTime('Ready in room prior to arrival');
        } else {
          setSelectedTime('Waiting in suite prior to check-in');
        }
      }
    }
  }, [isOpen, addonKind, currentPreference, arrivalDateInfo.isoDate]);

  if (!isOpen) return null;

  const selectedDateObj = stayDates.find((d) => d.isoDate === selectedDateIso) || arrivalDateInfo;

  const handleConfirm = () => {
    const formattedDate = isOneNightStay 
      ? arrivalDateInfo.fullLabel 
      : selectedDateObj.fullLabel;

    const finalPreference: AddonSchedulePreference = {
      deliveryType,
      selectedDate: formattedDate,
      selectedDateIso: isOneNightStay ? arrivalDateInfo.isoDate : selectedDateIso,
      selectedTime: selectedTime === 'Other custom time' && customTime ? customTime : selectedTime,
      customTime,
      isGift,
      giftRecipient,
      includeCard,
      cardMessage: includeCard ? cardMessage : undefined,
      itemCustomization,
      dietaryNote
    };

    onSave(finalPreference);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 lg:p-8 2xl:p-12 animate-in fade-in duration-200">
      <div 
        className="bg-[#FAF9F9] border-2 border-[#4E332D] rounded-[24px] sm:rounded-[32px] 2xl:rounded-[40px] w-full max-w-lg sm:max-w-2xl lg:max-w-[1100px] 2xl:max-w-[1520px] shadow-2xl overflow-hidden flex flex-col my-auto relative transition-all duration-300"
        style={{ maxHeight: '92vh' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="addon-modal-title"
      >
        {/* ================= TOP BRAND STRIP ================= */}
        <div className="bg-[#EBE8E0] px-5 sm:px-8 lg:px-10 2xl:px-14 py-4 sm:py-5 2xl:py-6 border-b border-[#4E332D]/20 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="font-woodblock uppercase tracking-[0.2em] text-[11px] sm:text-xs 2xl:text-sm font-bold text-[#9A5636]">
              URBAN COWBOY CATSKILLS
            </span>
            <span className="text-[#4E332D]/40" aria-hidden="true">·</span>
            <span className="font-sans text-[11px] sm:text-xs 2xl:text-sm uppercase tracking-wider text-[#73716D]">
              BESPOKE STAY CONCIERGE
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 sm:w-10 sm:h-10 2xl:w-12 2xl:h-12 rounded-full bg-white/80 hover:bg-white text-[#4E332D] flex items-center justify-center transition-all cursor-pointer border border-[#4E332D]/20 shadow-2xs hover:scale-105"
            aria-label="Close dialogue"
          >
            <X className="w-5 h-5 2xl:w-6 2xl:h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* ================= MULTI-TIER RESPONSIVE CONVERSATIONAL BODY ================= */}
        {/* Mobile: 1-column scroll | Normal Desktop: 2-column 1100px | Widescreen: 2-column 1520px Cinema */}
        <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row">

          {/* LEFT PANE: Visual Cinema & Concierge Heritage */}
          {/* Mobile: Full width top hero | Desktop: 380px | Widescreen: 480px-520px */}
          <div className="w-full lg:w-[380px] 2xl:w-[480px] shrink-0 bg-[#F4F1EA] p-5 sm:p-7 lg:p-8 2xl:p-12 border-b lg:border-b-0 lg:border-r border-[#4E332D]/15 flex flex-col justify-between">
            <div className="space-y-5 sm:space-y-6 2xl:space-y-8">
              {/* Item Card Artwork */}
              <div className="relative rounded-2xl 2xl:rounded-3xl overflow-hidden shadow-md border border-[#4E332D]/15 group">
                <img 
                  src={imgUrl(imageBaseUrl, addon.imageId, 900) ?? undefined}
                  alt={addon.name}
                  className="w-full h-48 sm:h-56 2xl:h-72 object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute top-3.5 right-3.5 2xl:top-5 2xl:right-5 bg-white px-3.5 py-1.5 2xl:px-4 2xl:py-2 shadow-md">
                  <span className="font-bold text-lg sm:text-xl 2xl:text-2xl text-[#343833] tracking-tight">
                    {money(addon.price, addon.currency)}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h3 
                  id="addon-modal-title"
                  className="font-brothers text-xl sm:text-2xl lg:text-3xl 2xl:text-4xl text-[#1C1917] uppercase tracking-[-0.4px] leading-tight"
                  style={{ fontFamily: "'BrothersOT', 'Cinzel', serif" }}
                >
                  {addon.name}
                </h3>
                <p className="font-uchen text-xs sm:text-sm lg:text-base 2xl:text-lg text-[#60605E] mt-2.5 2xl:mt-4 leading-relaxed">
                  {addon.description}
                </p>
              </div>

              {/* Concierge Delivery Timeline (Extra Widescreen Delight) */}
              <div className="bg-white/80 p-4 sm:p-5 2xl:p-6 rounded-2xl 2xl:rounded-3xl border border-[#4E332D]/15 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-woodblock text-[10px] 2xl:text-xs uppercase tracking-widest text-[#9A5636] font-bold">
                    CONCIERGE DELIVERY TIMELINE
                  </span>
                  <Clock className="w-3.5 h-3.5 text-[#9A5636]" />
                </div>
                
                <div className="space-y-2 text-xs 2xl:text-sm font-sans">
                  <div className="flex items-center gap-2 text-[#73716D]">
                    <div className="w-2 h-2 rounded-full bg-[#D1C9BE]" />
                    <span>Arrival Check-in · 4:00 PM</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold text-[#4E332D]">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#9A5636] animate-pulse" />
                    <span>
                      {addonKind === 'fresh-cut-flowers' && !isGift
                        ? 'Arranged In Room Prior to Arrival'
                        : `${isOneNightStay ? arrivalDateInfo.dayName : selectedDateObj.dayName} · ${selectedTime.split('(')[0].trim()}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[#73716D]">
                    <div className="w-2 h-2 rounded-full bg-[#D1C9BE]" />
                    <span>Fireside Hearth & Evening Libations</span>
                  </div>
                </div>
              </div>

              {/* Live Tactile Letterpress Card Preview if card is active */}
              {includeCard && cardMessage && (
                <div className="bg-[#FAF9F9] border-2 border-dashed border-[#D1C9BE] p-4 sm:p-5 2xl:p-7 rounded-2xl 2xl:rounded-3xl shadow-sm space-y-2.5 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between border-b border-[#D1C9BE]/50 pb-2">
                    <span className="font-woodblock text-[10px] 2xl:text-xs uppercase tracking-widest text-[#9A5636] font-bold">
                      LETTERPRESS STATIONERY PREVIEW
                    </span>
                    <Heart className="w-3.5 h-3.5 text-[#9A5636]" />
                  </div>
                  {giftRecipient && (
                    <p className="font-editorial text-sm 2xl:text-base font-bold text-[#4E332D]">
                      {giftRecipient}
                    </p>
                  )}
                  <p className="font-editorial italic text-sm sm:text-base 2xl:text-lg text-[#221C18] whitespace-pre-wrap leading-relaxed">
                    "{cardMessage}"
                  </p>
                  <span className="block text-[10px] 2xl:text-xs font-mono text-[#73716D] text-right pt-2 border-t border-[#D1C9BE]/40">
                    — Hand-Penned at the Urban Cowboy Lodge Desk
                  </span>
                </div>
              )}
            </div>

            {/* Stay Itinerary Footnote */}
            <div className="pt-5 mt-6 border-t border-[#4E332D]/15 text-xs 2xl:text-sm text-[#73716D] font-sans">
              <span className="block font-bold text-[#221C18] uppercase tracking-wider text-[10px] 2xl:text-xs">
                YOUR ITINERARY
              </span>
              <span className="block mt-1">
                {searchCriteria.checkIn} to {searchCriteria.checkOut} · {searchCriteria.nights} {searchCriteria.nights === 1 ? 'Night' : 'Nights'}
              </span>
            </div>
          </div>

          {/* RIGHT PANE: Conversational Questions (Spacious, Roomy, Scaled on Widescreen) */}
          {/* Mobile: Comfortable padding | Desktop: p-8 | Widescreen: p-12-p-14 with 2xl:text-scale */}
          <div className="flex-1 p-5 sm:p-8 lg:p-10 2xl:p-14 space-y-6 sm:space-y-8 2xl:space-y-12 bg-[#FAF9F9]">

            {/* ================= 1. FLOWERS SPECIAL QUESTION: "JUST FOR YOU" VS "A GIFT" ================= */}
            {addonKind === 'fresh-cut-flowers' && (
              <div className="space-y-4 2xl:space-y-6">
                <div>
                  <h4 className="font-display text-xl sm:text-2xl lg:text-3xl 2xl:text-4xl text-[#1C1917] tracking-tight">
                    Will these fresh blooms be waiting for you, or is this a gift?
                  </h4>
                  <p className="font-uchen text-xs sm:text-sm lg:text-base 2xl:text-lg text-[#60605E] mt-2 leading-relaxed">
                    We arrange local seasonal botanical bouquets daily in our floral studio.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 2xl:gap-6 pt-1">
                  {/* Option A: Just for you in the room */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsGift(false);
                      setDeliveryType('waiting-in-room');
                      setSelectedTime('Waiting in suite prior to check-in (4:00 PM)');
                    }}
                    className={`p-5 sm:p-6 2xl:p-8 rounded-2xl 2xl:rounded-3xl text-left border-2 transition-all cursor-pointer flex flex-col justify-between group ${
                      !isGift
                        ? 'border-[#4E332D] bg-[#EBE8E0]/70 shadow-sm ring-1 ring-[#4E332D]'
                        : 'border-[#4E332D]/15 bg-white hover:border-[#4E332D]/40 hover:bg-[#FAF9F9]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-brothers text-base sm:text-lg 2xl:text-xl uppercase text-[#1C1917] font-bold">
                          Just for us in the suite
                        </span>
                        {!isGift && (
                          <span className="w-6 h-6 2xl:w-7 2xl:h-7 rounded-full bg-[#0E301A] text-white flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <p className="font-uchen text-xs sm:text-sm 2xl:text-base text-[#60605E] leading-relaxed mt-2">
                        Arranged in a glass vase and waiting in your suite prior to 4:00 PM check-in, so you can enjoy fresh flowers throughout your entire stay.
                      </p>
                    </div>

                    <span className="mt-4 2xl:mt-6 inline-flex items-center gap-1.5 text-xs 2xl:text-sm font-mono uppercase tracking-wider text-[#9A5636] font-bold">
                      <Sparkles className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />
                      <span>Ready Upon Arrival</span>
                    </span>
                  </button>

                  {/* Option B: A Gift or Surprise */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsGift(true);
                      setDeliveryType('gift-surprise');
                      setIncludeCard(true);
                    }}
                    className={`p-5 sm:p-6 2xl:p-8 rounded-2xl 2xl:rounded-3xl text-left border-2 transition-all cursor-pointer flex flex-col justify-between group ${
                      isGift
                        ? 'border-[#4E332D] bg-[#EBE8E0]/70 shadow-sm ring-1 ring-[#4E332D]'
                        : 'border-[#4E332D]/15 bg-white hover:border-[#4E332D]/40 hover:bg-[#FAF9F9]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-brothers text-base sm:text-lg 2xl:text-xl uppercase text-[#1C1917] font-bold flex items-center gap-2">
                          <Gift className="w-4 h-4 2xl:w-5 2xl:h-5 text-[#9A5636]" />
                          <span>A gift or surprise</span>
                        </span>
                        {isGift && (
                          <span className="w-6 h-6 2xl:w-7 2xl:h-7 rounded-full bg-[#0E301A] text-white flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <p className="font-uchen text-xs sm:text-sm 2xl:text-base text-[#60605E] leading-relaxed mt-2">
                        Hand-delivered with a personalized letterpress card at your chosen moment during the stay.
                      </p>
                    </div>

                    <span className="mt-4 2xl:mt-6 inline-flex items-center gap-1.5 text-xs 2xl:text-sm font-mono uppercase tracking-wider text-[#9A5636] font-bold">
                      <span>Includes Handwritten Card</span>
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* ================= 2. SMART DATE & TIME SCHEDULING ================= */}
            {(addonKind !== 'fresh-cut-flowers' || isGift) && (
              <div className="space-y-5 sm:space-y-6 2xl:space-y-8 pt-1">
                {/* Conversational Header */}
                <div>
                  <h4 className="font-display text-xl sm:text-2xl lg:text-3xl 2xl:text-4xl text-[#1C1917] tracking-tight">
                    {isOneNightStay
                      ? `What time should we deliver it on ${arrivalDateInfo.dayName}, ${arrivalDateInfo.monthDay}?`
                      : `Which day of your stay should we schedule this?`}
                  </h4>
                  <p className="font-uchen text-xs sm:text-sm lg:text-base 2xl:text-lg text-[#60605E] mt-2 leading-relaxed">
                    {isOneNightStay
                      ? `Since you are staying one night, we’ll prepare and deliver your provisions on your arrival evening.`
                      : `Select the evening or moment that fits your plans best.`}
                  </p>
                </div>

                {/* Multi-night day selection cards */}
                {!isOneNightStay && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 2xl:gap-5">
                    {stayDates.map((dateObj) => {
                      const isSelected = selectedDateIso === dateObj.isoDate;
                      return (
                        <button
                          key={dateObj.isoDate}
                          type="button"
                          onClick={() => setSelectedDateIso(dateObj.isoDate)}
                          className={`p-4 2xl:p-6 rounded-2xl 2xl:rounded-3xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-[#4E332D] text-white border-[#4E332D] shadow-md ring-2 ring-[#4E332D]/30'
                              : 'bg-white text-[#221C18] border-[#4E332D]/20 hover:border-[#4E332D]/50 hover:bg-[#FAF9F9]'
                          }`}
                        >
                          <span className={`block text-xs 2xl:text-sm font-mono uppercase tracking-wider ${isSelected ? 'text-[#EBE8E0]/80' : 'text-[#73716D]'}`}>
                            {dateObj.isArrival ? 'Night 1 · Arrival' : `Night ${dateObj.index + 1}`}
                          </span>
                          <span className="block font-bold text-base sm:text-lg 2xl:text-xl mt-1 font-sans">
                            {dateObj.dayName}
                          </span>
                          <span className={`block text-xs sm:text-sm 2xl:text-base mt-0.5 ${isSelected ? 'text-[#EBE8E0]/90' : 'text-[#60605E]'}`}>
                            {dateObj.monthDay}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Delivery Timing Options (Generous Touch Targets) */}
                <div className="space-y-3 2xl:space-y-4 pt-1">
                  <label className="block font-brothers text-sm sm:text-base 2xl:text-lg uppercase text-[#4E332D] tracking-wide">
                    {isOneNightStay 
                      ? 'Preferred Delivery Timing:' 
                      : `Preferred Timing on ${selectedDateObj.dayName}:`}
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-2 gap-3 2xl:gap-4">
                    {[
                      selectedDateObj.isArrival ? 'Waiting in room prior to check-in (4:00 PM)' : 'Morning delivery (10:00 AM)',
                      'Late afternoon refresh (4:30 PM)',
                      'Evening service (post-dinner, 8:00 PM)',
                      'Late night fireside (9:30 PM)',
                      'Other custom time'
                    ].map((timeOption) => {
                      const isSelected = selectedTime === timeOption;
                      return (
                        <button
                          key={timeOption}
                          type="button"
                          onClick={() => setSelectedTime(timeOption)}
                          className={`px-4 sm:px-5 py-3.5 sm:py-4 2xl:px-6 2xl:py-5 rounded-2xl 2xl:rounded-3xl border-2 text-left text-xs sm:text-sm lg:text-base 2xl:text-lg font-sans transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'border-[#4E332D] bg-[#EBE8E0] font-bold text-[#1C1917] shadow-2xs'
                              : 'border-[#4E332D]/15 bg-white text-[#60605E] hover:border-[#4E332D]/35 hover:bg-[#FAF9F9]'
                          }`}
                        >
                          <span>{timeOption}</span>
                          {isSelected && <Check className="w-4 h-4 2xl:w-5 2xl:h-5 text-[#4E332D] stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>

                  {selectedTime === 'Other custom time' && (
                    <div className="pt-2 animate-in fade-in duration-200">
                      <input
                        type="text"
                        value={customTime}
                        onChange={(e) => setCustomTime(e.target.value)}
                        placeholder="Tell us what time suits you best, e.g. '7:15 PM right after dining'"
                        className="w-full bg-white border-2 border-[#4E332D]/30 rounded-xl 2xl:rounded-2xl px-4 py-3 sm:py-3.5 2xl:py-4 text-sm sm:text-base 2xl:text-lg text-[#1C1917] focus:outline-none focus:border-[#4E332D]"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ================= 3. BESPOKE ITEM CUSTOMIZATIONS ================= */}

            {/* CELEBRATION CAKE: Piped message */}
            {addonKind === 'celebration-cake' && (
              <div className="space-y-3 2xl:space-y-4 bg-[#EBE8E0]/40 p-5 sm:p-6 2xl:p-8 rounded-2xl 2xl:rounded-3xl border border-[#4E332D]/20">
                <label className="block font-brothers text-base sm:text-lg 2xl:text-xl uppercase text-[#4E332D]">
                  Piped Cake Inscription (Optional)
                </label>
                <p className="font-uchen text-xs sm:text-sm lg:text-base 2xl:text-lg text-[#60605E]">
                  What would you like our local Catskills baker to pipe in icing on the cake?
                </p>
                <input
                  type="text"
                  value={itemCustomization}
                  onChange={(e) => setItemCustomization(e.target.value)}
                  placeholder="e.g., Happy 30th Birthday Alex! or Happy Anniversary!"
                  maxLength={50}
                  className="w-full bg-white border-2 border-[#4E332D]/20 rounded-xl 2xl:rounded-2xl px-4 py-3 sm:py-3.5 2xl:py-4 text-sm sm:text-base 2xl:text-lg text-[#1C1917] focus:outline-none focus:border-[#4E332D]"
                />
              </div>
            )}

            {/* WINE BOTTLE: Varietal selection */}
            {addonKind === 'wine-bottle' && (
              <div className="space-y-4 2xl:space-y-5 bg-[#EBE8E0]/40 p-5 sm:p-6 2xl:p-8 rounded-2xl 2xl:rounded-3xl border border-[#4E332D]/20">
                <label className="block font-brothers text-base sm:text-lg 2xl:text-xl uppercase text-[#4E332D] flex items-center gap-2">
                  <Wine className="w-5 h-5 2xl:w-6 2xl:h-6 text-[#9A5636]" />
                  <span>Choose Your Wine Varietal</span>
                </label>
                <p className="font-uchen text-xs sm:text-sm lg:text-base 2xl:text-lg text-[#60605E]">
                  Select your preferred style, curated by the Cowboy Sommelier:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 2xl:gap-4 pt-1">
                  {[
                    'Natural Red (Earth & Fruit)',
                    'Crisp Mineral White',
                    'Sparkling Pet-Nat',
                    'Chilled Orange Skin-Contact',
                    'Dry Mountain Rosé'
                  ].map((wineType) => (
                    <button
                      key={wineType}
                      type="button"
                      onClick={() => setItemCustomization(wineType)}
                      className={`p-3.5 2xl:p-5 rounded-xl 2xl:rounded-2xl border-2 text-xs sm:text-sm 2xl:text-base font-sans text-left transition-all cursor-pointer ${
                        itemCustomization === wineType
                          ? 'bg-[#4E332D] text-white border-[#4E332D] font-bold shadow-xs'
                          : 'bg-white text-[#221C18] border-[#4E332D]/15 hover:border-[#4E332D]/40'
                      }`}
                    >
                      {wineType}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PUP STAY: Dog's Name & Details */}
            {addonKind === 'pup-stay' && (
              <div className="space-y-4 2xl:space-y-5 bg-[#EBE8E0]/40 p-5 sm:p-6 2xl:p-8 rounded-2xl 2xl:rounded-3xl border border-[#4E332D]/20">
                <label className="block font-brothers text-base sm:text-lg 2xl:text-xl uppercase text-[#4E332D] flex items-center gap-2">
                  <Dog className="w-5 h-5 2xl:w-6 2xl:h-6 text-[#9A5636]" />
                  <span>Tell Us About Your Dog</span>
                </label>
                <p className="font-uchen text-xs sm:text-sm lg:text-base 2xl:text-lg text-[#60605E]">
                  We'll have a plush Cowboy dog bed, ceramic water bowl, and house-made treats ready for your companion.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 2xl:gap-6">
                  <div>
                    <label className="block text-xs 2xl:text-sm font-mono uppercase tracking-wider text-[#73716D] mb-1.5">
                      Dog's Name:
                    </label>
                    <input
                      type="text"
                      value={itemCustomization}
                      onChange={(e) => setItemCustomization(e.target.value)}
                      placeholder="e.g., Barnaby"
                      className="w-full bg-white border-2 border-[#4E332D]/20 rounded-xl 2xl:rounded-2xl px-4 py-3 2xl:py-4 text-sm sm:text-base 2xl:text-lg text-[#1C1917] focus:outline-none focus:border-[#4E332D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs 2xl:text-sm font-mono uppercase tracking-wider text-[#73716D] mb-1.5">
                      Breed or Weight:
                    </label>
                    <input
                      type="text"
                      value={dietaryNote}
                      onChange={(e) => setDietaryNote(e.target.value)}
                      placeholder="e.g., Golden Retriever, 65 lbs"
                      className="w-full bg-white border-2 border-[#4E332D]/20 rounded-xl 2xl:rounded-2xl px-4 py-3 2xl:py-4 text-sm sm:text-base 2xl:text-lg text-[#1C1917] focus:outline-none focus:border-[#4E332D]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* FOOD/SNACKS: Dietary notes */}
            {(addonKind === 'hummus-crudites' || addonKind === 'chocolate-truffles') && (
              <div className="space-y-2">
                <label className="block font-brothers text-sm sm:text-base 2xl:text-lg uppercase text-[#4E332D]">
                  Dietary Preferences or Allergies (Optional)
                </label>
                <input
                  type="text"
                  value={dietaryNote}
                  onChange={(e) => setDietaryNote(e.target.value)}
                  placeholder="e.g., Gluten-free crackers requested, nut allergy..."
                  className="w-full bg-white border-2 border-[#4E332D]/20 rounded-xl 2xl:rounded-2xl px-4 py-3 2xl:py-4 text-sm sm:text-base 2xl:text-lg text-[#1C1917] focus:outline-none focus:border-[#4E332D]"
                />
              </div>
            )}

            {/* ================= 4. COMPLIMENTARY HANDWRITTEN LETTERPRESS CARD ================= */}
            {(addonKind === 'celebration-cake' || addonKind === 'fresh-cut-flowers' || isGift) && (
              <div className="border-2 border-[#4E332D]/20 rounded-2xl 2xl:rounded-3xl p-5 sm:p-6 2xl:p-8 bg-white space-y-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 2xl:w-6 2xl:h-6 text-[#9A5636]" />
                    <div>
                      <span className="font-brothers text-base sm:text-lg 2xl:text-xl uppercase text-[#1C1917] font-bold block">
                        Include Handwritten Cowboy Note Card?
                      </span>
                      <span className="text-xs sm:text-sm 2xl:text-base text-[#73716D] font-sans">
                        Complimentary letterpress card hand-penned by our front desk team.
                      </span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={includeCard}
                      onChange={(e) => setIncludeCard(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 2xl:w-14 2xl:h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 2xl:after:h-6 2xl:after:w-6 after:transition-all peer-checked:bg-[#4E332D]"></div>
                  </label>
                </div>

                {includeCard && (
                  <div className="space-y-4 pt-3 border-t border-[#4E332D]/15 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-xs 2xl:text-sm font-mono uppercase tracking-wider text-[#73716D] mb-1.5 font-bold">
                        Recipient Name:
                      </label>
                      <input
                        type="text"
                        value={giftRecipient}
                        onChange={(e) => setGiftRecipient(e.target.value)}
                        placeholder="e.g., To: Sarah / For: The Happy Couple"
                        className="w-full bg-[#FAF9F9] border-2 border-[#4E332D]/20 rounded-xl 2xl:rounded-2xl px-4 py-3 2xl:py-3.5 text-sm sm:text-base 2xl:text-lg text-[#1C1917] focus:outline-none focus:border-[#4E332D]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs 2xl:text-sm font-mono uppercase tracking-wider text-[#73716D] mb-1.5 font-bold">
                        Your Personal Note:
                      </label>
                      <textarea
                        rows={4}
                        value={cardMessage}
                        onChange={(e) => setCardMessage(e.target.value)}
                        placeholder="Write your note here... e.g., 'Happy anniversary my love, here is to slow mornings and mountain memories together!'"
                        className="w-full bg-[#FAF9F9] border-2 border-[#4E332D]/20 rounded-xl 2xl:rounded-2xl p-4 text-sm sm:text-base 2xl:text-lg text-[#1C1917] font-serif focus:outline-none focus:border-[#4E332D] leading-relaxed"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* ================= SPACIOUS RESPONSIVE FOOTER ================= */}
        <div className="bg-[#EBE8E0] px-5 sm:px-8 lg:px-10 2xl:px-14 py-4 sm:py-5 2xl:py-6 border-t border-[#4E332D]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs sm:text-sm lg:text-base 2xl:text-lg text-[#73716D] text-center sm:text-left font-sans">
            <span className="font-bold text-[#221C18]">Summary: </span>
            {addonKind === 'fresh-cut-flowers' && !isGift ? (
              <span>Arranged in suite prior to check-in ({arrivalDateInfo.dayName})</span>
            ) : (
              <span>
                {isOneNightStay ? arrivalDateInfo.dayName : selectedDateObj.dayName} · {selectedTime}
                {includeCard && cardMessage ? ' · With letterpress note' : ''}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-5 sm:px-6 2xl:px-8 py-3 2xl:py-4 rounded-full border-2 border-[#4E332D]/30 text-[#4E332D] hover:bg-white text-xs sm:text-sm 2xl:text-base font-woodblock uppercase tracking-wider transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 sm:flex-initial bg-[#4E332D] hover:bg-[#221C18] text-white px-7 sm:px-8 2xl:px-12 py-3 sm:py-3.5 2xl:py-4.5 rounded-full text-xs sm:text-sm 2xl:text-base font-woodblock uppercase tracking-widest transition-all cursor-pointer shadow-md active:scale-95 flex items-center justify-center gap-2 group"
            >
              <span>Confirm Experience & Add to Stay</span>
              <ArrowRight className="w-4 h-4 2xl:w-5 2xl:h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
