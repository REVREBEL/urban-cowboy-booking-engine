import React, { useState } from 'react';
import { BookingState } from '../types';
import { EXTRAS } from '../data/hotelData';
import { ShieldCheck, Check, Calendar, Users, MapPin, ArrowLeft, ArrowRight, Printer, Sparkles, Heart, Clock, Phone, Mail, Dog, DoorOpen } from 'lucide-react';

interface CheckoutStepProps {
  bookingState: BookingState;
  onUpdateGuestInfo: (info: BookingState['guestInfo']) => void;
  onBackToExtras: () => void;
  onResetBooking: () => void;
}

export const CheckoutStep: React.FC<CheckoutStepProps> = ({
  bookingState,
  onUpdateGuestInfo,
  onBackToExtras,
  onResetBooking
}) => {
  const { selectedRoom, selectedRate, selectedExtras, searchCriteria, guestInfo } = bookingState;
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confCode, setConfCode] = useState('');

  const [formData, setFormData] = useState(guestInfo);

  if (!selectedRoom || !selectedRate) {
    return (
      <div className="text-center py-20">
        <p className="text-base font-woodblock text-[#4E332D]">Please select a room and rate first.</p>
      </div>
    );
  }

  const rawNightly = Math.round(selectedRoom.basePrice * selectedRate.rateMultiplier);
  const roomSubtotal = rawNightly * searchCriteria.nights;

  const extrasSubtotal = Object.entries(selectedExtras).reduce((acc, [id, count]) => {
    const item = EXTRAS.find((e) => e.id === id);
    return acc + (item ? item.price * count : 0);
  }, 0);

  const resortFee = 25;
  const taxes = Math.round((roomSubtotal + extrasSubtotal) * 0.085);
  const total = roomSubtotal + extrasSubtotal + resortFee + taxes;

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateGuestInfo(formData);
    const generated = `UCW-${Math.floor(100000 + Math.random() * 900000)}`;
    setConfCode(generated);
    setIsConfirmed(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // =========================================================================
  // CONFIRMATION VIEW (3-Tier Responsive: Mobile -> Desktop -> Widescreen Cinema)
  // =========================================================================
  if (isConfirmed) {
    return (
      <div className="w-full max-w-xl sm:max-w-3xl lg:max-w-5xl 2xl:max-w-[1360px] mx-auto px-4 sm:px-6 2xl:px-8 py-8 sm:py-12 2xl:py-16">
        <div className="bg-white border-2 sm:border-4 border-[#4E332D] rounded-[28px] sm:rounded-[36px] 2xl:rounded-[48px] p-6 sm:p-10 lg:p-12 2xl:p-16 shadow-2xl text-center transition-all duration-300">
          
          {/* Badge & Big Headlines */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 2xl:w-20 2xl:h-20 bg-[#0E301A] text-[#F2AAA9] rounded-full flex items-center justify-center mx-auto mb-4 2xl:mb-6 shadow-md">
            <Check className="w-7 h-7 sm:w-8 sm:h-8 2xl:w-10 2xl:h-10 stroke-[2.5]" />
          </div>

          <span className="font-woodblock text-xs sm:text-sm 2xl:text-base uppercase tracking-[0.2em] text-[#9A5636] font-bold block mb-1 2xl:mb-2">
            RESERVATION CONFIRMED & GUARANTEED
          </span>
          <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl text-[#4E332D] uppercase tracking-tight mb-2 2xl:mb-3">
            See You in the Catskills
          </h1>
          <p className="font-editorial italic text-base sm:text-lg 2xl:text-xl text-[#6B6259] mb-8 2xl:mb-10">
            "Arrive as Strangers. Leave as Friends."
          </p>

          {/* Luxury Resort Folio Ticket (2-Column on Widescreen) */}
          <div className="bg-[#FAF9F9] border-2 border-dashed border-[#D1C9BE] rounded-2xl 2xl:rounded-3xl p-6 sm:p-8 2xl:p-10 mb-8 2xl:mb-12 text-left space-y-6 2xl:space-y-8">
            
            {/* Confirmation Code Header Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 2xl:pb-6 border-b border-[#EBE8E0] gap-2">
              <div>
                <span className="font-woodblock text-xs sm:text-sm 2xl:text-base uppercase tracking-wider text-[#73716D] block">
                  Confirmation Code:
                </span>
                <span className="text-xs 2xl:text-sm text-[#8A7E74] font-sans">
                  Guaranteed via {selectedRate.title}
                </span>
              </div>
              <span className="font-display font-bold text-2xl sm:text-3xl 2xl:text-4xl text-[#4E332D] tracking-widest font-mono">
                {confCode}
              </span>
            </div>

            {/* Grid of Key Reservation Specs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 2xl:gap-6 text-sm 2xl:text-base font-sans">
              <div className="bg-white p-4 rounded-xl 2xl:rounded-2xl border border-[#D1C9BE]/50">
                <span className="text-xs 2xl:text-sm text-[#73716D] uppercase font-mono block">Primary Guest</span>
                <span className="font-bold text-base 2xl:text-lg text-[#221C18] block mt-0.5">
                  {formData.firstName} {formData.lastName}
                </span>
                <span className="text-xs 2xl:text-sm text-[#73716D] block mt-0.5">{formData.email}</span>
              </div>

              <div className="bg-white p-4 rounded-xl 2xl:rounded-2xl border border-[#D1C9BE]/50">
                <span className="text-xs 2xl:text-sm text-[#73716D] uppercase font-mono block">Stay Dates</span>
                <span className="font-bold text-base 2xl:text-lg text-[#221C18] block mt-0.5">
                  {searchCriteria.checkIn} to {searchCriteria.checkOut}
                </span>
                <span className="text-xs 2xl:text-sm text-[#9A5636] font-bold block mt-0.5">
                  {searchCriteria.nights} {searchCriteria.nights === 1 ? 'Night' : 'Nights'} ({searchCriteria.guests} Guests)
                </span>
              </div>

              <div className="bg-white p-4 rounded-xl 2xl:rounded-2xl border border-[#D1C9BE]/50">
                <span className="text-xs 2xl:text-sm text-[#73716D] uppercase font-mono block">Suite & Lodge</span>
                <span className="font-bold text-base 2xl:text-lg text-[#221C18] block mt-0.5">
                  {selectedRoom.name}
                </span>
                <span className="text-xs 2xl:text-sm text-[#73716D] block mt-0.5">
                  {selectedRoom.buildingName} · {selectedRoom.bedType}
                </span>
              </div>

              <div className="bg-white p-4 rounded-xl 2xl:rounded-2xl border border-[#D1C9BE]/50">
                <span className="text-xs 2xl:text-sm text-[#73716D] uppercase font-mono block">Rate Package</span>
                <span className="font-bold text-base 2xl:text-lg text-[#221C18] block mt-0.5">
                  {selectedRate.title}
                </span>
                <span className="text-xs 2xl:text-sm text-[#73716D] block mt-0.5">
                  ${rawNightly}/night · {selectedRate.cancellationPolicy}
                </span>
              </div>
            </div>

            {/* Scheduled Experiences Section */}
            {Object.keys(selectedExtras).length > 0 && (
              <div className="pt-4 2xl:pt-6 border-t border-[#EBE8E0]">
                <div className="flex items-center justify-between mb-3 2xl:mb-4">
                  <span className="font-woodblock uppercase tracking-widest text-xs 2xl:text-sm text-[#9A5636] font-bold flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>SCHEDULED EXPERIENCES & CONCIERGE DELIVERIES</span>
                  </span>
                  <span className="text-xs 2xl:text-sm font-mono text-[#73716D]">
                    {Object.values(selectedExtras).reduce((a, b) => a + b, 0)} Items Arranged
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 2xl:gap-4">
                  {Object.entries(selectedExtras).map(([extraId, count]) => {
                    const item = EXTRAS.find((e) => e.id === extraId);
                    if (!item || count <= 0) return null;
                    const pref = bookingState.extraPreferences?.[extraId];
                    return (
                      <div key={extraId} className="bg-white p-4 2xl:p-5 rounded-xl 2xl:rounded-2xl border border-[#D1C9BE]/60 text-xs sm:text-sm 2xl:text-base flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <span className="font-bold text-[#221C18] block text-sm sm:text-base 2xl:text-lg">
                            {item.title} {count > 1 ? `(${count}x)` : ''}
                          </span>
                          <span className="text-xs sm:text-sm 2xl:text-base text-[#9A5636] font-medium block">
                            {pref?.selectedDate ? `${pref.selectedDate} · ` : ''}{pref?.selectedTime || 'Waiting in suite upon arrival'}
                          </span>
                          {pref?.includeCard && pref?.cardMessage && (
                            <span className="block text-xs 2xl:text-sm italic text-[#6B6259] pt-1">
                              Letterpress Note: "{pref.cardMessage}"
                            </span>
                          )}
                          {pref?.itemCustomization && (
                            <span className="block text-xs 2xl:text-sm text-[#6B6259]">
                              Details: {pref.itemCustomization}
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-[#4E332D] text-sm sm:text-base 2xl:text-lg shrink-0">
                          ${(item.price * count).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Total Balance Row */}
            <div className="pt-4 2xl:pt-6 border-t border-[#EBE8E0] flex flex-col sm:flex-row justify-between items-start sm:items-center text-base sm:text-lg 2xl:text-xl font-bold text-[#4E332D] gap-2">
              <span>Total Stay Investment (All Taxes & Resort Fees Included):</span>
              <span className="font-display text-2xl sm:text-3xl 2xl:text-4xl text-[#4E332D]">
                ${total}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 2xl:gap-6">
            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 2xl:py-4 rounded-full border-2 border-[#4E332D] text-[#4E332D] hover:bg-[#EBE8E0] font-woodblock text-xs sm:text-sm 2xl:text-base uppercase tracking-wider cursor-pointer transition-all hover:scale-105"
            >
              <Printer className="w-4 h-4 2xl:w-5 2xl:h-5" />
              <span>Print Guest Itinerary</span>
            </button>
            <button
              onClick={onResetBooking}
              className="w-full sm:w-auto bg-[#4E332D] hover:bg-[#343833] text-white px-8 sm:px-10 py-3.5 2xl:py-4 rounded-full font-woodblock text-xs sm:text-sm 2xl:text-base uppercase tracking-widest cursor-pointer transition-all shadow-md hover:scale-105"
            >
              Book Another Stay
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN CHECKOUT VIEW (3-Tier Responsive: Mobile -> Desktop -> Widescreen)
  // =========================================================================
  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-8 sm:py-10 2xl:py-14">
      {/* Top Navigation */}
      <button
        onClick={onBackToExtras}
        className="inline-flex items-center gap-2 font-woodblock text-xs sm:text-sm uppercase tracking-widest text-[#73716D] hover:text-[#4E332D] mb-6 2xl:mb-8 transition-colors cursor-pointer group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Curated Add-ons</span>
      </button>

      {/* Main Layout Grid (Mobile: 1 col | Desktop: 7/5 | Widescreen: Expansive 7/5 with 2xl:gap-14) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 2xl:gap-14 items-start">
        
        {/* ================= LEFT FORM COLUMN (lg:col-span-7) ================= */}
        <div className="lg:col-span-7 space-y-6 2xl:space-y-8">
          
          {/* Section Header */}
          <div>
            <span className="font-woodblock text-xs 2xl:text-sm uppercase tracking-widest text-[#9A5636] font-bold block mb-1">
              STEP 5 OF 5 · GUEST DETAILS & RESERVATION GUARANTEE
            </span>
            <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-4xl 2xl:text-5xl text-[#4E332D] uppercase tracking-tight">
              Guest Information
            </h1>
            <p className="font-editorial text-sm sm:text-base 2xl:text-lg text-[#6B6259] mt-1.5 leading-relaxed">
              Urban Cowboy Catskills · 378 The Drive, Big Indian, NY 12410
            </p>
          </div>

          <form onSubmit={handleSubmitBooking} className="space-y-5 sm:space-y-6 2xl:space-y-7">
            
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 2xl:gap-6">
              <div>
                <label className="block font-brothers text-xs sm:text-sm 2xl:text-base uppercase tracking-wider text-[#4E332D] mb-1.5 font-bold">
                  First Name *
                </label>
                <input
                  required
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="e.g. Gary"
                  className="w-full bg-white border-2 border-[#D1C9BE] rounded-xl 2xl:rounded-2xl px-4 py-3 sm:py-3.5 2xl:py-4 text-sm sm:text-base 2xl:text-lg text-[#221C18] focus:border-[#4E332D] focus:outline-none transition-all shadow-2xs"
                />
              </div>
              <div>
                <label className="block font-brothers text-xs sm:text-sm 2xl:text-base uppercase tracking-wider text-[#4E332D] mb-1.5 font-bold">
                  Last Name *
                </label>
                <input
                  required
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="e.g. Stringham"
                  className="w-full bg-white border-2 border-[#D1C9BE] rounded-xl 2xl:rounded-2xl px-4 py-3 sm:py-3.5 2xl:py-4 text-sm sm:text-base 2xl:text-lg text-[#221C18] focus:border-[#4E332D] focus:outline-none transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Contact Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 2xl:gap-6">
              <div>
                <label className="block font-brothers text-xs sm:text-sm 2xl:text-base uppercase tracking-wider text-[#4E332D] mb-1.5 font-bold">
                  Email Address *
                </label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="gary@example.com"
                  className="w-full bg-white border-2 border-[#D1C9BE] rounded-xl 2xl:rounded-2xl px-4 py-3 sm:py-3.5 2xl:py-4 text-sm sm:text-base 2xl:text-lg text-[#221C18] focus:border-[#4E332D] focus:outline-none transition-all shadow-2xs"
                />
              </div>
              <div>
                <label className="block font-brothers text-xs sm:text-sm 2xl:text-base uppercase tracking-wider text-[#4E332D] mb-1.5 font-bold">
                  Mobile Phone *
                </label>
                <input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 000-0000"
                  className="w-full bg-white border-2 border-[#D1C9BE] rounded-xl 2xl:rounded-2xl px-4 py-3 sm:py-3.5 2xl:py-4 text-sm sm:text-base 2xl:text-lg text-[#221C18] focus:border-[#4E332D] focus:outline-none transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Dog Friendly Prompt */}
            {selectedRoom.isDogFriendly && (
              <div className="p-5 2xl:p-6 bg-white rounded-2xl 2xl:rounded-3xl border-2 border-[#D1C9BE] space-y-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="hasDog"
                    checked={formData.hasDog}
                    onChange={(e) => setFormData({ ...formData, hasDog: e.target.checked })}
                    className="w-5 h-5 2xl:w-6 2xl:h-6 accent-[#9A5636] cursor-pointer"
                  />
                  <label htmlFor="hasDog" className="font-brothers text-sm sm:text-base 2xl:text-lg uppercase text-[#4E332D] cursor-pointer font-bold">
                    Bringing a four-legged companion? ({selectedRoom.name} is Dog-Friendly)
                  </label>
                </div>
                {formData.hasDog && (
                  <input
                    type="text"
                    placeholder="Dog's name, breed, and size (e.g., Barnaby, Golden Retriever, 65 lbs)"
                    value={formData.dogName || ''}
                    onChange={(e) => setFormData({ ...formData, dogName: e.target.value })}
                    className="w-full bg-[#FAF9F9] border-2 border-[#D1C9BE] rounded-xl 2xl:rounded-2xl px-4 py-3 text-sm sm:text-base text-[#221C18] focus:border-[#4E332D] focus:outline-none animate-in fade-in"
                  />
                )}
              </div>
            )}

            {/* Notes / Special Requests */}
            <div>
              <label className="block font-brothers text-xs sm:text-sm 2xl:text-base uppercase tracking-wider text-[#4E332D] mb-1.5 font-bold">
                Special Requests or Notes for the Lodge
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Dietary preferences, anticipated arrival hour, special anniversary or celebration..."
                className="w-full bg-white border-2 border-[#D1C9BE] rounded-xl 2xl:rounded-2xl p-4 text-sm sm:text-base 2xl:text-lg text-[#221C18] focus:border-[#4E332D] focus:outline-none transition-all shadow-2xs leading-relaxed"
              />
            </div>

            {/* Policy & Confirm CTA */}
            <div className="pt-4 2xl:pt-6 border-t-2 border-[#D1C9BE]">
              <div className="flex items-start sm:items-center gap-3 text-xs sm:text-sm 2xl:text-base text-[#6B6259] mb-5 2xl:mb-6">
                <ShieldCheck className="w-5 h-5 2xl:w-6 2xl:h-6 text-[#0E301A] shrink-0 mt-0.5 sm:mt-0" />
                <span>
                  Your reservation is protected under our{' '}
                  <strong className="text-[#4E332D] font-bold">{selectedRate.cancellationPolicy}</strong>.
                </span>
              </div>

              <button
                type="submit"
                className="w-full bg-[#4E332D] hover:bg-[#221C18] text-white py-4 sm:py-5 2xl:py-6 rounded-full font-woodblock text-sm sm:text-base 2xl:text-lg uppercase tracking-widest cursor-pointer shadow-lg hover:shadow-xl active:scale-[0.99] transition-all flex items-center justify-center gap-2 group"
              >
                <span>Confirm & Guarantee Stay (${total})</span>
                <ArrowRight className="w-5 h-5 2xl:w-6 2xl:h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>
        </div>

        {/* ================= RIGHT FOLIO COLUMN (lg:col-span-5) ================= */}
        {/* On Widescreen: Generous room folio with photo preview, clear typography, and add-on timeline */}
        <div className="lg:col-span-5">
          <div className="bg-white border-2 sm:border-3 border-[#4E332D] rounded-[28px] 2xl:rounded-[36px] p-6 sm:p-8 2xl:p-10 shadow-lg sticky top-24 space-y-5 2xl:space-y-6">
            
            {/* Suite Header with Room Photo Preview */}
            <div className="pb-5 2xl:pb-6 border-b border-[#D1C9BE] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-woodblock text-xs 2xl:text-sm uppercase tracking-widest text-[#9A5636] font-bold">
                  {selectedRoom.buildingName.toUpperCase()}
                </span>
                <span className="text-xs 2xl:text-sm font-mono text-[#73716D]">
                  {searchCriteria.nights} {searchCriteria.nights === 1 ? 'Night' : 'Nights'}
                </span>
              </div>

              {selectedRoom.images?.[0] && (
                <div className="h-36 sm:h-44 2xl:h-52 rounded-xl 2xl:rounded-2xl overflow-hidden border border-[#D1C9BE]">
                  <img 
                    src={selectedRoom.images[0]} 
                    alt={selectedRoom.name}
                    className="w-full h-full object-cover" 
                  />
                </div>
              )}

              <div>
                <h3 className="font-display font-bold text-2xl sm:text-3xl 2xl:text-4xl text-[#221C18] leading-tight">
                  {selectedRoom.name}
                </h3>
                <span className="text-xs sm:text-sm 2xl:text-base text-[#73716D] font-sans mt-0.5 block">
                  {selectedRoom.bedType} · {selectedRoom.squareFeet} Sq Ft · Max {selectedRoom.maxGuests} Guests
                </span>
              </div>
            </div>

            {/* Financial Line Items (No Squinting, Clear Scale) */}
            <div className="space-y-3.5 2xl:space-y-4 text-xs sm:text-sm 2xl:text-base font-sans pb-5 2xl:pb-6 border-b border-[#D1C9BE]">
              <div className="flex justify-between items-baseline">
                <span className="text-[#6B6259]">
                  {selectedRate.title} (${rawNightly} × {searchCriteria.nights} nights)
                </span>
                <span className="font-bold text-[#221C18]">${roomSubtotal}</span>
              </div>

              {/* Curated Add-ons Breakdown with Custom Notes */}
              {extrasSubtotal > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between text-[#9A5636] font-bold">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />
                      <span>Curated Add-on Experiences</span>
                    </span>
                    <span>+${extrasSubtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="space-y-2 pl-3 border-l-2 border-[#9A5636]/40">
                    {Object.entries(selectedExtras).map(([extraId, count]) => {
                      const item = EXTRAS.find((e) => e.id === extraId);
                      if (!item || count <= 0) return null;
                      const pref = bookingState.extraPreferences?.[extraId];
                      return (
                        <div key={extraId} className="text-xs sm:text-sm 2xl:text-base text-[#6B6259] leading-snug">
                          <div className="flex justify-between text-[#221C18] font-medium">
                            <span>{item.title} {count > 1 ? `(${count}x)` : ''}</span>
                            <span>+${(item.price * count).toFixed(2)}</span>
                          </div>
                          {pref && (
                            <div className="text-[11px] sm:text-xs 2xl:text-sm text-[#9A5636] mt-0.5">
                              <span>
                                {pref.selectedDate ? `${pref.selectedDate} · ` : ''}
                                {pref.selectedTime || 'Waiting in room'}
                              </span>
                              {pref.includeCard && pref.cardMessage && (
                                <span className="block italic text-[#6B6259]">
                                  Note: "{pref.cardMessage}"
                                </span>
                              )}
                              {pref.itemCustomization && (
                                <span className="block text-[#6B6259]">
                                  Details: {pref.itemCustomization}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-baseline">
                <span className="text-[#6B6259]">Catskill Trail & Hearth Amenity Fee</span>
                <span className="font-bold text-[#221C18]">${resortFee}</span>
              </div>

              <div className="flex justify-between items-baseline">
                <span className="text-[#6B6259]">State & Local Occupancy Taxes (8.5%)</span>
                <span className="font-bold text-[#221C18]">${taxes}</span>
              </div>
            </div>

            {/* Total Balance */}
            <div className="pt-2 flex justify-between items-baseline">
              <div>
                <span className="block font-woodblock text-xs sm:text-sm 2xl:text-base uppercase tracking-wider text-[#73716D]">
                  Total Balance
                </span>
                <span className="text-xs 2xl:text-sm text-[#8A7E74]">All taxes & resort fees included</span>
              </div>
              <span className="font-display font-bold text-3xl sm:text-4xl 2xl:text-5xl text-[#4E332D]">
                ${total}
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
