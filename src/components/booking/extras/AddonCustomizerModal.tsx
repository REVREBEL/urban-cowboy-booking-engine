import React, { useState, useEffect, useMemo } from 'react';
import type { MerchandisedAddOn } from '@/types/add-on-cms';
import { fmtDate, imgUrl, money } from '@/lib/format';
import type { AddonSchedulePreference, AddonStayCriteria } from './addon-types';
import {
  addOnKind,
  addOnStayDates,
  deliveryTimeOptions,
  normalizeAddOnPreference,
  WINE_PREFERENCES,
} from './addon-smart-logic';
import { X, Check, Clock, Heart, Gift, Wine, Dog, Sparkles, ArrowRight } from 'lucide-react';

interface AddonCustomizerModalProps {
  isOpen: boolean;
  addon: MerchandisedAddOn;
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
  const addonKind = useMemo(() => addOnKind(addon), [addon]);
  const stayDates = useMemo(
    () => addOnStayDates(searchCriteria),
    [searchCriteria.checkIn, searchCriteria.nights],
  );
  const isOneNightStay = searchCriteria.nights <= 1;
  const arrivalDateInfo = stayDates[0];
  const smartPreference = useMemo(
    () => normalizeAddOnPreference(addon, searchCriteria, currentPreference),
    [addon, searchCriteria.checkIn, searchCriteria.checkOut, searchCriteria.nights, currentPreference],
  );

  // The Add-ons step owns the smart preference. This modal edits that shared
  // model rather than inventing a separate set of defaults.
  const [deliveryType, setDeliveryType] = useState(
    smartPreference.deliveryType ?? 'scheduled-day',
  );
  const [isGift, setIsGift] = useState(smartPreference.isGift ?? false);
  const [selectedDateIso, setSelectedDateIso] = useState(
    smartPreference.selectedDateIso ?? arrivalDateInfo.isoDate,
  );
  const [selectedTime, setSelectedTime] = useState(
    smartPreference.selectedTime ?? 'Waiting in room prior to check-in',
  );
  const [customTime, setCustomTime] = useState(smartPreference.customTime ?? '');
  const [giftRecipient, setGiftRecipient] = useState(smartPreference.giftRecipient ?? '');
  const [includeCard, setIncludeCard] = useState(smartPreference.includeCard ?? false);
  const [cardMessage, setCardMessage] = useState(smartPreference.cardMessage ?? '');
  const [itemCustomization, setItemCustomization] = useState(
    smartPreference.itemCustomization ?? '',
  );
  const [dietaryNote, setDietaryNote] = useState(smartPreference.dietaryNote ?? '');

  useEffect(() => {
    if (!isOpen) return;
    setDeliveryType(smartPreference.deliveryType ?? 'scheduled-day');
    setIsGift(smartPreference.isGift ?? false);
    setSelectedDateIso(smartPreference.selectedDateIso ?? arrivalDateInfo.isoDate);
    setSelectedTime(smartPreference.selectedTime ?? 'Waiting in room prior to check-in');
    setCustomTime(smartPreference.customTime ?? '');
    setGiftRecipient(smartPreference.giftRecipient ?? '');
    setIncludeCard(smartPreference.includeCard ?? false);
    setCardMessage(smartPreference.cardMessage ?? '');
    setItemCustomization(smartPreference.itemCustomization ?? '');
    setDietaryNote(smartPreference.dietaryNote ?? '');
  }, [isOpen, smartPreference, arrivalDateInfo.isoDate]);

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
        className="bg-paper border-2 border-cowboy-umber rounded-panel-sm sm:rounded-modal 2xl:rounded-modal-xl w-full max-w-lg sm:max-w-2xl lg:max-w-275 2xl:max-w-380 shadow-2xl overflow-hidden flex flex-col my-auto relative transition-all duration-300"
        style={{ maxHeight: '92vh' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="addon-modal-title"
      >
        {/* ================= TOP BRAND STRIP ================= */}
        <div className="bg-alpine-linen px-5 sm:px-8 lg:px-10 2xl:px-14 py-4 sm:py-5 2xl:py-6 border-b border-cowboy-umber/20 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="font-label uppercase tracking-[0.2em] text-[11px] sm:text-xs 2xl:text-sm font-bold text-copper">
              URBAN COWBOY CATSKILLS
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 sm:w-10 sm:h-10 2xl:w-12 2xl:h-12 rounded-full bg-white/80 hover:bg-white text-cowboy-umber flex items-center justify-center transition-all cursor-pointer border border-cowboy-umber/20 shadow-2xs hover:scale-105"
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
          <div className="w-full lg:w-95 2xl:w-120 shrink-0 bg-alpine-linen-fade p-5 sm:p-7 lg:p-8 2xl:p-12 border-b lg:border-b-0 lg:border-r border-cowboy-umber/15 flex flex-col justify-between">
            <div className="space-y-5 sm:space-y-6 2xl:space-y-8">
              {/* Item Card Artwork */}
              <div className="relative rounded-2xl 2xl:rounded-3xl overflow-hidden shadow-md border border-cowboy-umber/15 group">
                <img 
                  src={addon.imageUrl ?? imgUrl(imageBaseUrl, addon.imageId, 900) ?? undefined}
                  alt={addon.name}
                  className="w-full h-48 sm:h-56 2xl:h-72 object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute top-3.5 right-3.5 2xl:top-5 2xl:right-5 bg-white px-3.5 py-1.5 2xl:px-4 2xl:py-2 shadow-md">
                  <span className="font-bold text-lg sm:text-xl 2xl:text-2xl text-smoke tracking-tight">
                    {money(addon.price, addon.currency)}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h3 
                  id="addon-modal-title"
                  className="font-label text-xl sm:text-2xl lg:text-3xl 2xl:text-4xl text-smoke uppercase tracking-[-0.4px] leading-tight"
                  style={{ fontFamily: "'BrothersOT', 'Cinzel', serif" }}
                >
                  {addon.name}
                </h3>
                <p className="font-body text-xs sm:text-sm lg:text-base 2xl:text-lg text-ash-900 mt-2.5 2xl:mt-4 leading-relaxed">
                  {addon.description}
                </p>
              </div>

              {/* Concierge Delivery Timeline (Extra Widescreen Delight) */}
              <div className="bg-white/80 p-4 sm:p-5 2xl:p-6 rounded-2xl 2xl:rounded-3xl border border-cowboy-umber/15 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-label text-[10px] 2xl:text-xs uppercase tracking-widest text-copper font-bold">
                    REQUESTED DELIVERY TIME
                  </span>
                  <Clock className="w-3.5 h-3.5 text-copper" />
                </div>
                
                <div className="space-y-2 text-xs 2xl:text-sm font-sans">
                  <div className="flex items-center gap-2 text-smoke-fade">
                    <div className="w-2 h-2 rounded-full bg-alpine-linen" />
                    <span>Arrival Check-in · 4:00 PM</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold text-cowboy-umber">
                    <div className="w-2.5 h-2.5 rounded-full bg-copper animate-pulse" />
                    <span>
                      {addonKind === 'fresh-cut-flowers' && !isGift
                        ? 'Arranged In Room Prior to Arrival'
                        : `${isOneNightStay ? arrivalDateInfo.dayName : selectedDateObj.dayName} · ${selectedTime.split('(')[0].trim()}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-smoke-fade">
                    <div className="w-2 h-2 rounded-full bg-alpine-linen" />
                    <span>Fireside Hearth & Evening Libations</span>
                  </div>
                </div>
              </div>

              {/* Live Tactile Letterpress Card Preview if card is active */}
              {includeCard && cardMessage && (
                <div className="bg-paper border-2 border-dashed border-alpine-linen p-4 sm:p-5 2xl:p-7 rounded-2xl 2xl:rounded-3xl shadow-sm space-y-2.5 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between border-b border-alpine-linen/50 pb-2">
                    <span className="font-label text-[10px] 2xl:text-xs uppercase tracking-widest text-copper font-bold">
                      LETTERPRESS STATIONERY PREVIEW
                    </span>
                    <Heart className="w-3.5 h-3.5 text-copper" />
                  </div>
                  {giftRecipient && (
                    <p className="font-body text-sm 2xl:text-base font-bold text-cowboy-umber">
                      {giftRecipient}
                    </p>
                  )}
                  <p className="font-body italic text-sm sm:text-base 2xl:text-lg text-smoke whitespace-pre-wrap leading-relaxed">
                    "{cardMessage}"
                  </p>
                  <span className="block text-[10px] 2xl:text-xs font-mono text-smoke-fade text-right pt-2 border-t border-alpine-linen/40">
                    — Hand-Penned at the Urban Cowboy Lodge Desk
                  </span>
                </div>
              )}
            </div>

            {/* Stay Itinerary Footnote */}
            <div className="pt-5 mt-6 border-t border-cowboy-umber/15 text-xs 2xl:text-sm text-smoke-fade font-sans">
              <span className="block font-bold text-smoke uppercase tracking-wider text-[10px] 2xl:text-xs">
                YOUR ITINERARY
              </span>
              <span className="block mt-1">
                {fmtDate(searchCriteria.checkIn)} to {fmtDate(searchCriteria.checkOut)} · {searchCriteria.nights} {searchCriteria.nights === 1 ? 'Night' : 'Nights'}
              </span>
            </div>
          </div>

          {/* RIGHT PANE: Conversational Questions (Spacious, Roomy, Scaled on Widescreen) */}
          {/* Mobile: Comfortable padding | Desktop: p-8 | Widescreen: p-12-p-14 with 2xl:text-scale */}
          <div className="flex-1 p-5 sm:p-8 lg:p-10 2xl:p-14 space-y-6 sm:space-y-8 2xl:space-y-12 bg-paper">

            {/* ================= 1. FLOWERS SPECIAL QUESTION: "JUST FOR YOU" VS "A GIFT" ================= */}
            {addonKind === 'fresh-cut-flowers' && (
              <div className="space-y-4 2xl:space-y-6">
                <div>
                  <h4 className="font-heading text-xl sm:text-2xl lg:text-3xl 2xl:text-4xl text-smoke tracking-tight">
                    Will these fresh blooms be waiting for you, or is this a gift?
                  </h4>
                  <p className="font-body text-xs sm:text-sm lg:text-base 2xl:text-lg text-ash-900 mt-2 leading-relaxed">
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
                      setSelectedTime('Waiting in room prior to check-in (4:00 PM)');
                    }}
                    className={`p-5 sm:p-6 2xl:p-8 rounded-2xl 2xl:rounded-3xl text-left border-2 transition-all cursor-pointer flex flex-col justify-between group ${
                      !isGift
                        ? 'border-cowboy-umber bg-alpine-linen/70 shadow-sm ring-1 ring-cowboy-umber'
                        : 'border-cowboy-umber/15 bg-white hover:border-cowboy-umber/40 hover:bg-paper'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-label text-base sm:text-lg 2xl:text-xl uppercase text-smoke font-bold">
                          Just for us in the room
                        </span>
                        {!isGift && (
                          <span className="w-6 h-6 2xl:w-7 2xl:h-7 rounded-full bg-lake-forest text-white flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <p className="font-body text-xs sm:text-sm 2xl:text-base text-ash-900 leading-relaxed mt-2">
                        Arranged in a glass vase and waiting in your room prior to 4:00 PM check-in, so you can enjoy fresh flowers throughout your entire stay.
                      </p>
                    </div>

                    <span className="mt-4 2xl:mt-6 inline-flex items-center gap-1.5 text-xs 2xl:text-sm font-mono uppercase tracking-wider text-copper font-bold">
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
                        ? 'border-cowboy-umber bg-alpine-linen/70 shadow-sm ring-1 ring-cowboy-umber'
                        : 'border-cowboy-umber/15 bg-white hover:border-cowboy-umber/40 hover:bg-paper'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-label text-base sm:text-lg 2xl:text-xl uppercase text-smoke font-bold flex items-center gap-2">
                          <Gift className="w-4 h-4 2xl:w-5 2xl:h-5 text-copper" />
                          <span>A gift or surprise</span>
                        </span>
                        {isGift && (
                          <span className="w-6 h-6 2xl:w-7 2xl:h-7 rounded-full bg-lake-forest text-white flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <p className="font-body text-xs sm:text-sm 2xl:text-base text-ash-900 leading-relaxed mt-2">
                        Hand-delivered with a personalized letterpress card at your chosen moment during the stay.
                      </p>
                    </div>

                    <span className="mt-4 2xl:mt-6 inline-flex items-center gap-1.5 text-xs 2xl:text-sm font-mono uppercase tracking-wider text-copper font-bold">
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
                  <h4 className="font-heading text-xl sm:text-2xl lg:text-3xl 2xl:text-4xl text-smoke tracking-tight">
                    {isOneNightStay
                      ? `Requested Delivery Time on ${arrivalDateInfo.fullDateLabel}?`
                      : `Which day of your stay should we schedule this?`}
                  </h4>
                  <p className="font-body text-xs sm:text-sm lg:text-base 2xl:text-lg text-ash-900 mt-2 leading-relaxed">
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
                              ? 'bg-cowboy-umber text-white border-cowboy-umber shadow-md ring-2 ring-cowboy-umber/30'
                              : 'bg-white text-smoke border-cowboy-umber/20 hover:border-cowboy-umber/50 hover:bg-paper'
                          }`}
                        >
                          <span className={`block text-xs 2xl:text-sm font-mono uppercase tracking-wider ${isSelected ? 'text-alpine-linen/80' : 'text-smoke-fade'}`}>
                            {dateObj.isArrival ? 'Night 1 · Arrival' : `Night ${dateObj.index + 1}`}
                          </span>
                          <span className="block font-bold text-base sm:text-lg 2xl:text-xl mt-1 font-sans">
                            {dateObj.dayName}
                          </span>
                          <span className={`block text-xs sm:text-sm 2xl:text-base mt-0.5 ${isSelected ? 'text-alpine-linen/90' : 'text-ash-900'}`}>
                            {dateObj.fullDateLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Delivery Timing Options (Generous Touch Targets) */}
                <div className="space-y-3 2xl:space-y-4 pt-1">
                  <label className="block font-label text-sm sm:text-base 2xl:text-lg uppercase text-cowboy-umber tracking-wide">
                    {isOneNightStay 
                      ? 'Preferred Delivery Timing:' 
                      : `Preferred Timing on ${selectedDateObj.dayName}:`}
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-2 gap-3 2xl:gap-4">
                    {deliveryTimeOptions(selectedDateObj).map((timeOption) => {
                      const isSelected = selectedTime === timeOption;
                      return (
                        <button
                          key={timeOption}
                          type="button"
                          onClick={() => setSelectedTime(timeOption)}
                          className={`px-4 sm:px-5 py-3.5 sm:py-4 2xl:px-6 2xl:py-5 rounded-2xl 2xl:rounded-3xl border-2 text-left text-xs sm:text-sm lg:text-base 2xl:text-lg font-sans transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'border-cowboy-umber bg-alpine-linen font-bold text-smoke shadow-2xs'
                              : 'border-cowboy-umber/15 bg-white text-ash-900 hover:border-cowboy-umber/35 hover:bg-paper'
                          }`}
                        >
                          <span>{timeOption}</span>
                          {isSelected && <Check className="w-4 h-4 2xl:w-5 2xl:h-5 text-cowboy-umber stroke-[3]" />}
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
                        className="w-full bg-white border-2 border-cowboy-umber/30 rounded-xl 2xl:rounded-2xl px-4 py-3 sm:py-3.5 2xl:py-4 text-sm sm:text-base 2xl:text-lg text-smoke focus:outline-none focus:border-cowboy-umber"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ================= 3. BESPOKE ITEM CUSTOMIZATIONS ================= */}

            {/* CELEBRATION CAKE: Piped message */}
            {addonKind === 'celebration-cake' && (
              <div className="space-y-3 2xl:space-y-4 bg-alpine-linen/40 p-5 sm:p-6 2xl:p-8 rounded-2xl 2xl:rounded-3xl border border-cowboy-umber/20">
                <label className="block font-label text-base sm:text-lg 2xl:text-xl uppercase text-cowboy-umber">
                  Piped Cake Inscription (Optional)
                </label>
                <p className="font-body text-xs sm:text-sm lg:text-base 2xl:text-lg text-ash-900">
                  What would you like our local Catskills baker to pipe in icing on the cake?
                </p>
                <input
                  type="text"
                  value={itemCustomization}
                  onChange={(e) => setItemCustomization(e.target.value)}
                  placeholder="e.g., Happy 30th Birthday Alex! or Happy Anniversary!"
                  maxLength={50}
                  className="w-full bg-white border-2 border-cowboy-umber/20 rounded-xl 2xl:rounded-2xl px-4 py-3 sm:py-3.5 2xl:py-4 text-sm sm:text-base 2xl:text-lg text-smoke focus:outline-none focus:border-cowboy-umber"
                />
              </div>
            )}

            {/* WINE BOTTLE: Varietal selection */}
            {addonKind === 'wine-bottle' && (
              <div className="space-y-4 2xl:space-y-5 bg-alpine-linen/40 p-5 sm:p-6 2xl:p-8 rounded-2xl 2xl:rounded-3xl border border-cowboy-umber/20">
                <label className="block font-label text-base sm:text-lg 2xl:text-xl uppercase text-cowboy-umber flex items-center gap-2">
                  <Wine className="w-5 h-5 2xl:w-6 2xl:h-6 text-copper" />
                  <span>Choose Your Wine Varietal</span>
                </label>
                <p className="font-body text-xs sm:text-sm lg:text-base 2xl:text-lg text-ash-900">
                  Select your preferred style, curated by the Cowboy Sommelier:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 2xl:gap-4 pt-1">
                  {WINE_PREFERENCES.map((wineType) => (
                    <button
                      key={wineType}
                      type="button"
                      onClick={() => setItemCustomization(wineType)}
                      className={`p-3.5 2xl:p-5 rounded-xl 2xl:rounded-2xl border-2 text-xs sm:text-sm 2xl:text-base font-sans text-left transition-all cursor-pointer ${
                        itemCustomization === wineType
                          ? 'bg-cowboy-umber text-white border-cowboy-umber font-bold shadow-xs'
                          : 'bg-white text-smoke border-cowboy-umber/15 hover:border-cowboy-umber/40'
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
              <div className="space-y-4 2xl:space-y-5 bg-alpine-linen/40 p-5 sm:p-6 2xl:p-8 rounded-2xl 2xl:rounded-3xl border border-cowboy-umber/20">
                <label className="block font-label text-base sm:text-lg 2xl:text-xl uppercase text-cowboy-umber flex items-center gap-2">
                  <Dog className="w-5 h-5 2xl:w-6 2xl:h-6 text-copper" />
                  <span>Tell Us About Your Dog</span>
                </label>
                <p className="font-body text-xs sm:text-sm lg:text-base 2xl:text-lg text-ash-900">
                  We'll have a plush Cowboy dog bed, ceramic water bowl, and house-made treats ready for your companion.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 2xl:gap-6">
                  <div>
                    <label className="block text-xs 2xl:text-sm font-mono uppercase tracking-wider text-smoke-fade mb-1.5">
                      Dog's Name:
                    </label>
                    <input
                      type="text"
                      value={itemCustomization}
                      onChange={(e) => setItemCustomization(e.target.value)}
                      placeholder="e.g., Barnaby"
                      className="w-full bg-white border-2 border-cowboy-umber/20 rounded-xl 2xl:rounded-2xl px-4 py-3 2xl:py-4 text-sm sm:text-base 2xl:text-lg text-smoke focus:outline-none focus:border-cowboy-umber"
                    />
                  </div>
                  <div>
                    <label className="block text-xs 2xl:text-sm font-mono uppercase tracking-wider text-smoke-fade mb-1.5">
                      Breed or Weight:
                    </label>
                    <input
                      type="text"
                      value={dietaryNote}
                      onChange={(e) => setDietaryNote(e.target.value)}
                      placeholder="e.g., Golden Retriever, 65 lbs"
                      className="w-full bg-white border-2 border-cowboy-umber/20 rounded-xl 2xl:rounded-2xl px-4 py-3 2xl:py-4 text-sm sm:text-base 2xl:text-lg text-smoke focus:outline-none focus:border-cowboy-umber"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* FOOD/SNACKS: Dietary notes */}
            {(addonKind === 'hummus-crudites' || addonKind === 'chocolate-truffles') && (
              <div className="space-y-2">
                <label className="block font-label text-sm sm:text-base 2xl:text-lg uppercase text-cowboy-umber">
                  Dietary Preferences or Allergies (Optional)
                </label>
                <input
                  type="text"
                  value={dietaryNote}
                  onChange={(e) => setDietaryNote(e.target.value)}
                  placeholder="e.g., Gluten-free crackers requested, nut allergy..."
                  className="w-full bg-white border-2 border-cowboy-umber/20 rounded-xl 2xl:rounded-2xl px-4 py-3 2xl:py-4 text-sm sm:text-base 2xl:text-lg text-smoke focus:outline-none focus:border-cowboy-umber"
                />
              </div>
            )}

            {/* ================= 4. COMPLIMENTARY HANDWRITTEN LETTERPRESS CARD ================= */}
            {(addonKind === 'celebration-cake' || addonKind === 'fresh-cut-flowers' || isGift) && (
              <div className="border-2 border-cowboy-umber/20 rounded-2xl 2xl:rounded-3xl p-5 sm:p-6 2xl:p-8 bg-white space-y-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 2xl:w-6 2xl:h-6 text-copper" />
                    <div>
                      <span className="font-label text-base sm:text-lg 2xl:text-xl uppercase text-smoke font-bold block">
                        Include Handwritten Cowboy Note Card?
                      </span>
                      <span className="text-xs sm:text-sm 2xl:text-base text-smoke-fade font-sans">
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
                    <div className="w-12 h-6 2xl:w-14 2xl:h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 2xl:after:h-6 2xl:after:w-6 after:transition-all peer-checked:bg-cowboy-umber"></div>
                  </label>
                </div>

                {includeCard && (
                  <div className="space-y-4 pt-3 border-t border-cowboy-umber/15 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-xs 2xl:text-sm font-mono uppercase tracking-wider text-smoke-fade mb-1.5 font-bold">
                        Recipient Name:
                      </label>
                      <input
                        type="text"
                        value={giftRecipient}
                        onChange={(e) => setGiftRecipient(e.target.value)}
                        placeholder="e.g., To: Sarah / For: The Happy Couple"
                        className="w-full bg-paper border-2 border-cowboy-umber/20 rounded-xl 2xl:rounded-2xl px-4 py-3 2xl:py-3.5 text-sm sm:text-base 2xl:text-lg text-smoke focus:outline-none focus:border-cowboy-umber"
                      />
                    </div>

                    <div>
                      <label className="block text-xs 2xl:text-sm font-mono uppercase tracking-wider text-smoke-fade mb-1.5 font-bold">
                        Your Personal Note:
                      </label>
                      <textarea
                        rows={4}
                        value={cardMessage}
                        onChange={(e) => setCardMessage(e.target.value)}
                        placeholder="Write your note here... e.g., 'Happy anniversary my love, here is to slow mornings and mountain memories together!'"
                        className="w-full bg-paper border-2 border-cowboy-umber/20 rounded-xl 2xl:rounded-2xl p-4 text-sm sm:text-base 2xl:text-lg text-smoke font-serif focus:outline-none focus:border-cowboy-umber leading-relaxed"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* ================= SPACIOUS RESPONSIVE FOOTER ================= */}
        <div className="bg-alpine-linen px-5 sm:px-8 lg:px-10 2xl:px-14 py-4 sm:py-5 2xl:py-6 border-t border-cowboy-umber/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs sm:text-sm lg:text-base 2xl:text-lg text-smoke-fade text-center sm:text-left font-sans">
            <span className="font-bold text-smoke">Summary: </span>
            {addonKind === 'fresh-cut-flowers' && !isGift ? (
              <span>Arranged in room prior to check-in ({arrivalDateInfo.dayName})</span>
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
              className="flex-1 sm:flex-initial px-5 sm:px-6 2xl:px-8 py-3 2xl:py-4 rounded-full border-2 border-cowboy-umber/30 text-cowboy-umber hover:bg-white text-xs sm:text-sm 2xl:text-base font-label uppercase tracking-wider transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 sm:flex-initial bg-cowboy-umber hover:bg-smoke text-white px-7 sm:px-8 2xl:px-12 py-3 sm:py-3.5 2xl:py-4.5 rounded-full text-xs sm:text-sm 2xl:text-base font-label uppercase tracking-widest transition-all cursor-pointer shadow-md active:scale-95 flex items-center justify-center gap-2 group"
            >
              <span>Confirm & Add to Stay</span>
              <ArrowRight className="w-4 h-4 2xl:w-5 2xl:h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
