import React, { useState } from 'react';
import { OffersCard } from './RideEasyOffersCard';
import { CheckCircle2 } from 'lucide-react';

export const RideEasySoloPage: React.FC = () => {
  const [variant, setVariant] = useState<'default' | 'compact'>('default');
  const [isExpanded, setIsExpanded] = useState(true);
  const [confirmationNotice, setConfirmationNotice] = useState<string | null>(null);

  const handleConfirm = () => {
    setConfirmationNotice('Booking Confirmed on Ride Easy!');
    setTimeout(() => {
      setConfirmationNotice(null);
    }, 3500);
  };

  return (
    <div className="min-h-screen w-full bg-paper flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 relative">
      {confirmationNotice && (
        <div className="fixed top-6 z-50 animate-bounce bg-lake-forest text-paper px-6 py-3 rounded-full shadow-xl flex items-center gap-3 border border-nude-ember/40 text-sm font-sans">
          <CheckCircle2 className="w-5 h-5 text-nude-ember" />
          <span>{confirmationNotice}</span>
        </div>
      )}

      <div className="mb-8 flex flex-wrap items-center justify-center gap-3 bg-white/90 backdrop-blur-xs border border-smoke/20 px-5 py-2.5 rounded-full shadow-xs">
        <span className="font-sans text-xs uppercase tracking-wider text-smoke-fade font-bold">
          Layout:
        </span>
        <button
          onClick={() => setVariant('default')}
          className={`px-3 py-1 rounded-full text-xs font-sans font-semibold uppercase tracking-wider transition-all cursor-pointer ${
            variant === 'default' ? 'bg-smoke text-white shadow-xs' : 'text-smoke-fade hover:text-smoke'
          }`}
        >
          Normal
        </button>
        <button
          onClick={() => setVariant('compact')}
          className={`px-3 py-1 rounded-full text-xs font-sans font-semibold uppercase tracking-wider transition-all cursor-pointer ${
            variant === 'compact' ? 'bg-smoke text-white shadow-xs' : 'text-smoke-fade hover:text-smoke'
          }`}
        >
          Compact
        </button>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`px-3.5 py-1 rounded-full text-xs font-sans font-semibold uppercase tracking-wider transition-all cursor-pointer ${
            isExpanded ? 'bg-bandana-red text-white shadow-xs' : 'bg-neutral-100 text-smoke hover:bg-neutral-200'
          }`}
        >
          {isExpanded ? 'Drawer Open (Active)' : 'Drawer Closed'}
        </button>
      </div>

      <div className="w-full flex justify-center items-center">
        <OffersCard
          variant={variant}
          price="$145"
          priceUnit="Nightly"
          isExpanded={isExpanded}
          onToggleExpand={() => setIsExpanded(!isExpanded)}
          onConfirmBooking={handleConfirm}
          pricingDetails={{
            nightly: 823.08,
            subtotal: 411.54,
            taxesAndFees: 411.54,
            total: 823.08,
            dueToday: 411.54,
            remaining: 411.54,
          }}
          cancellationText="Free Cancellation until May 19"
        />
      </div>
    </div>
  );
};
