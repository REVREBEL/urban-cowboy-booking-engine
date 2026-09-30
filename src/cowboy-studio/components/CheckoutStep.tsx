import React, { useState } from 'react';
import { BookingState } from '../types';
import { EXTRAS } from '../data/hotelData';
import { ShieldCheck, Check, Calendar, Users, MapPin, ArrowLeft, Printer, Sparkles } from 'lucide-react';

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
        <p className="text-sm font-woodblock">Please select a room and rate first.</p>
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
  };

  if (isConfirmed) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white border-4 border-[#4E332D] rounded-[40px] p-8 sm:p-12 shadow-2xl text-center">
          <div className="w-16 h-16 bg-[#0E301A] text-[#F2AAA9] rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8" />
          </div>

          <span className="font-woodblock text-xs uppercase tracking-widest text-[#9A5636] font-bold block mb-1">
            RESERVATION CONFIRMED
          </span>
          <h1 className="font-display font-bold text-4xl text-[#4E332D] uppercase tracking-wide mb-2">
            See You in the Catskills
          </h1>
          <p className="font-editorial italic text-base text-[#6B6259] mb-6">
            "Arrive as Strangers. Leave as Friends."
          </p>

          <div className="bg-[#FAF9F9] border-2 border-dashed border-[#D1C9BE] rounded-2xl p-6 mb-8 text-left space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#EBE8E0]">
              <span className="font-woodblock text-xs uppercase tracking-wider text-[#73716D]">
                Confirmation Code:
              </span>
              <span className="font-display font-bold text-xl text-[#4E332D] tracking-widest">
                {confCode}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              <div>
                <span className="text-[#73716D] block">Guest Name</span>
                <span className="font-bold text-[#221C18]">
                  {formData.firstName} {formData.lastName}
                </span>
              </div>
              <div>
                <span className="text-[#73716D] block">Dates</span>
                <span className="font-bold text-[#221C18]">
                  {searchCriteria.checkIn} to {searchCriteria.checkOut} ({searchCriteria.nights} nights)
                </span>
              </div>
              <div>
                <span className="text-[#73716D] block">Suite & Building</span>
                <span className="font-bold text-[#221C18]">
                  {selectedRoom.name} ({selectedRoom.buildingName})
                </span>
              </div>
              <div>
                <span className="text-[#73716D] block">Rate Package</span>
                <span className="font-bold text-[#221C18]">
                  {selectedRate.title} (${rawNightly}/nt)
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#EBE8E0] flex justify-between items-center text-sm font-bold text-[#4E332D]">
              <span>Total Stay Cost (Taxes & Fees Included):</span>
              <span className="font-display text-xl">${total}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-6 py-3 rounded-full border border-[#4E332D] text-[#4E332D] hover:bg-[#EBE8E0] font-woodblock text-xs uppercase tracking-wider cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Itinerary</span>
            </button>
            <button
              onClick={onResetBooking}
              className="bg-[#4E332D] hover:bg-[#343833] text-white px-8 py-3 rounded-full font-woodblock text-xs uppercase tracking-widest cursor-pointer"
            >
              Book Another Stay
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-shell py-10">
      <button
        onClick={onBackToExtras}
        className="inline-flex items-center gap-2 font-woodblock text-xs uppercase tracking-widest text-[#73716D] hover:text-[#4E332D] mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Extras</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Form: Guest Info */}
        <div className="lg:col-span-7">
          <div className="mb-6">
            <span className="font-woodblock text-xs uppercase tracking-widest text-[#9A5636] font-bold block mb-1">
              STEP 5 OF 5 · GUEST DETAILS & PAYMENT
            </span>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#4E332D] uppercase">
              Guest Information
            </h1>
            <p className="font-editorial text-sm text-[#6B6259] mt-1">
              Urban Cowboy Catskills · 378 The Drive, Big Indian, NY 12410
            </p>
          </div>

          <form onSubmit={handleSubmitBooking} className="space-y-4 font-sans text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#4E332D] mb-1">First Name *</label>
                <input
                  required
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="e.g. Gary"
                  className="w-full bg-white border border-[#D1C9BE] rounded-xl px-3.5 py-2.5 text-[#221C18] focus:border-[#4E332D] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#4E332D] mb-1">Last Name *</label>
                <input
                  required
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="e.g. Stringham"
                  className="w-full bg-white border border-[#D1C9BE] rounded-xl px-3.5 py-2.5 text-[#221C18] focus:border-[#4E332D] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#4E332D] mb-1">Email Address *</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="gary@example.com"
                  className="w-full bg-white border border-[#D1C9BE] rounded-xl px-3.5 py-2.5 text-[#221C18] focus:border-[#4E332D] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#4E332D] mb-1">Mobile Phone *</label>
                <input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 000-0000"
                  className="w-full bg-white border border-[#D1C9BE] rounded-xl px-3.5 py-2.5 text-[#221C18] focus:border-[#4E332D] focus:outline-none"
                />
              </div>
            </div>

            {selectedRoom.isDogFriendly && (
              <div className="p-4 bg-white rounded-xl border border-[#D1C9BE] space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hasDog"
                    checked={formData.hasDog}
                    onChange={(e) => setFormData({ ...formData, hasDog: e.target.checked })}
                    className="w-4 h-4 accent-[#9A5636]"
                  />
                  <label htmlFor="hasDog" className="font-semibold text-[#4E332D]">
                    Bringing a dog companion? (This suite is dog-friendly)
                  </label>
                </div>
                {formData.hasDog && (
                  <input
                    type="text"
                    placeholder="Dog's name and breed"
                    value={formData.dogName || ''}
                    onChange={(e) => setFormData({ ...formData, dogName: e.target.value })}
                    className="w-full bg-[#FAF9F9] border border-[#D1C9BE] rounded-lg px-3 py-1.5 text-xs text-[#221C18]"
                  />
                )}
              </div>
            )}

            <div>
              <label className="block font-semibold text-[#4E332D] mb-1">
                Special Requests or Notes for the Lodge
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Dietary preferences, anticipated arrival time, celebrating an anniversary..."
                className="w-full bg-white border border-[#D1C9BE] rounded-xl px-3.5 py-2.5 text-[#221C18] focus:border-[#4E332D] focus:outline-none"
              />
            </div>

            <div className="pt-4 border-t border-[#D1C9BE]">
              <div className="flex items-center gap-2 text-xs text-[#6B6259] mb-4">
                <ShieldCheck className="w-4 h-4 text-[#0E301A]" />
                <span>
                  Your reservation is protected under our{' '}
                  <strong className="text-[#4E332D]">{selectedRate.cancellationPolicy}</strong>.
                </span>
              </div>

              <button
                type="submit"
                className="w-full bg-[#4E332D] hover:bg-[#343833] text-white py-4 rounded-full font-woodblock text-sm uppercase tracking-widest cursor-pointer shadow-lg transition-transform active:scale-95"
              >
                Confirm & Guarantee Stay (${total})
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Reservation Breakdown */}
        <div className="lg:col-span-5">
          <div className="bg-white border-2 border-[#4E332D] rounded-3xl p-6 shadow-md sticky top-24">
            <div className="pb-4 border-b border-[#D1C9BE] mb-4">
              <span className="font-woodblock text-[10px] uppercase tracking-widest text-[#9A5636] font-bold">
                {selectedRoom.buildingName.toUpperCase()}
              </span>
              <h3 className="font-display font-bold text-2xl text-[#221C18]">
                {selectedRoom.name}
              </h3>
              <span className="text-xs text-[#73716D] font-sans">
                {selectedRoom.bedType} · {selectedRoom.squareFeet} Sq Ft
              </span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm font-sans pb-4 border-b border-[#D1C9BE]">
              <div className="flex justify-between">
                <span className="text-[#6B6259]">
                  {selectedRate.title} (${rawNightly} × {searchCriteria.nights} nights)
                </span>
                <span className="font-semibold text-[#221C18]">${roomSubtotal}</span>
              </div>

              {extrasSubtotal > 0 && (
                <div className="flex justify-between text-[#9A5636]">
                  <span>Curated Add-on Experiences</span>
                  <span className="font-semibold">+${extrasSubtotal}</span>
                </div>
              )}

              <div className="flex justify-between text-[#6B6259]">
                <span>Catskill Trail & Hearth Amenity Fee</span>
                <span className="font-semibold text-[#221C18]">${resortFee}</span>
              </div>

              <div className="flex justify-between text-[#6B6259]">
                <span>State & Local Occupancy Taxes (8.5%)</span>
                <span className="font-semibold text-[#221C18]">${taxes}</span>
              </div>
            </div>

            <div className="pt-4 flex justify-between items-baseline">
              <div>
                <span className="block font-woodblock text-xs uppercase tracking-wider text-[#73716D]">
                  Total Balance
                </span>
                <span className="text-[11px] text-[#8A7E74]">All taxes & fees included</span>
              </div>
              <span className="font-display font-bold text-3xl text-[#4E332D]">
                ${total}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
