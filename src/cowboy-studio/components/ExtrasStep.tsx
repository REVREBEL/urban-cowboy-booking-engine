import React from 'react';
import { ExtraItem, BookingState } from '../types';
import { EXTRAS } from '../data/hotelData';
import { Plus, Minus, Check, ArrowRight, ArrowLeft } from 'lucide-react';

interface ExtrasStepProps {
  bookingState: BookingState;
  onUpdateExtras: (extraId: string, count: number) => void;
  onProceedToPay: () => void;
  onBackToRates: () => void;
}

export const ExtrasStep: React.FC<ExtrasStepProps> = ({
  bookingState,
  onUpdateExtras,
  onProceedToPay,
  onBackToRates
}) => {
  const { selectedRoom, selectedRate, selectedExtras, searchCriteria } = bookingState;

  const calculateExtrasTotal = () => {
    return Object.entries(selectedExtras).reduce((total, [extraId, count]) => {
      const item = EXTRAS.find((e) => e.id === extraId);
      return total + (item ? item.price * count : 0);
    }, 0);
  };

  const extrasTotal = calculateExtrasTotal();

  return (
    <div className="booking-shell py-10">
      {/* Navigation */}
      <button
        onClick={onBackToRates}
        className="inline-flex items-center gap-2 font-woodblock text-xs uppercase tracking-widest text-[#73716D] hover:text-[#4E332D] mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Rate Selection</span>
      </button>

      {/* Header */}
      <div className="mb-8 pb-6 border-b border-[#D1C9BE]">
        <span className="font-woodblock text-xs uppercase tracking-widest text-[#9A5636] font-bold block mb-1">
          STEP 4 OF 5 · COWBOY EXTRAS
        </span>
        <h1 className="font-display font-bold text-4xl sm:text-5xl text-[#4E332D] uppercase tracking-tight">
          Enhance Your Stay
        </h1>
        <p className="font-editorial text-base text-[#6B6259] mt-2 max-w-2xl">
          Reserve your private thermal session, fireside pairing baskets, and in-room herbal tub rituals before you arrive.
        </p>
      </div>

      {/* Extras Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {EXTRAS.map((extra) => {
          const count = selectedExtras[extra.id] || 0;
          const isSelected = count > 0;

          // Note if sunup breakfast is already included
          const isSunupRate = selectedRate?.id === 'sunup';

          return (
            <div
              key={extra.id}
              className={`flex flex-col sm:flex-row rounded-2xl overflow-hidden border-2 transition-all ${
                isSelected
                  ? 'bg-white border-[#9A5636] shadow-md'
                  : 'bg-[#FAF9F9] border-[#D1C9BE] hover:border-[#4E332D]'
              }`}
            >
              <div className="sm:w-44 h-40 sm:h-auto shrink-0 relative">
                <img
                  src={extra.image}
                  alt={extra.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-display font-bold text-lg text-[#221C18]">
                      {extra.title}
                    </h3>
                    <span className="font-display font-bold text-lg text-[#4E332D] shrink-0">
                      ${extra.price}
                    </span>
                  </div>
                  <span className="font-woodblock text-[11px] uppercase tracking-wider text-[#9A5636] block mb-2 font-semibold">
                    {extra.subtitle}
                  </span>
                  <p className="font-editorial text-xs text-[#6B6259] leading-relaxed">
                    {extra.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 mt-3 border-t border-[#EBE8E0]">
                  <span className="text-xs text-[#73716D] font-sans">
                    {extra.perPerson ? 'Per person' : 'Per experience'}
                  </span>

                  <div className="flex items-center gap-3">
                    {count > 0 ? (
                      <div className="flex items-center gap-2 bg-[#EBE8E0] px-3 py-1 rounded-full">
                        <button
                          onClick={() => onUpdateExtras(extra.id, count - 1)}
                          className="w-6 h-6 rounded-full bg-white text-[#4E332D] flex items-center justify-center font-bold text-xs hover:bg-[#D1C9BE]"
                        >
                          -
                        </button>
                        <span className="font-woodblock text-xs font-bold text-[#4E332D] w-4 text-center">
                          {count}
                        </span>
                        <button
                          onClick={() => onUpdateExtras(extra.id, count + 1)}
                          className="w-6 h-6 rounded-full bg-white text-[#4E332D] flex items-center justify-center font-bold text-xs hover:bg-[#D1C9BE]"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => onUpdateExtras(extra.id, 1)}
                        className="flex items-center gap-1 bg-[#4E332D] hover:bg-[#343833] text-white px-4 py-1.5 rounded-full font-woodblock text-xs uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Summary Bar */}
      <div className="sticky bottom-4 z-30 bg-[#221C18] text-white p-5 rounded-3xl shadow-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-woodblock text-xs uppercase tracking-widest text-[#D1C9BE] block">
            RESERVATION SUMMARY
          </span>
          <div className="font-serif text-sm">
            <span className="font-bold text-white">{selectedRoom?.name}</span> ·{' '}
            <span className="text-[#F2AAA9]">{selectedRate?.title}</span> ({searchCriteria.nights} nights)
          </div>
          {extrasTotal > 0 && (
            <span className="text-xs text-[#9BA888]">
              + ${extrasTotal} in curated add-ons
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={onProceedToPay}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#9A5636] hover:bg-[#783224] text-[#EBE8E0] px-8 py-3 rounded-full font-woodblock text-xs sm:text-sm uppercase tracking-widest cursor-pointer transition-all shadow-md"
          >
            <span>Proceed to Guest Details & Pay</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
