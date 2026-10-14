import React, { useState } from 'react';
import { OffersCard as OffersCardV1 } from './v1/RideEasyOffersCard';
import { OffersCard as OffersCardV2 } from './v2/RideEasyOffersCard';
import { CheckCircle2 } from 'lucide-react';

export const RideEasySoloPage: React.FC = () => {
  const [version, setVersion] = useState<'v1' | 'v2'>('v2');
  const [variant, setVariant] = useState<'default' | 'compact'>('default');
  const [isExpanded, setIsExpanded] = useState(true);
  const [confirmationNotice, setConfirmationNotice] = useState<string | null>(null);

  const ActiveOffersCard = version === 'v1' ? OffersCardV1 : OffersCardV2;

  const handleConfirm = () => {
    setConfirmationNotice(`Booking Confirmed on Ride Easy (${version.toUpperCase()})!`);
    setTimeout(() => {
      setConfirmationNotice(null);
    }, 3500);
  };

  return (
    <div className="min-h-screen w-full bg-paper flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 relative">
      {/* Toast Notification */}
      {confirmationNotice && (
        <div className="fixed top-6 z-50 animate-bounce bg-lake-forest text-paper px-6 py-3 rounded-full shadow-xl flex items-center gap-3 border border-nude-ember/40 text-sm font-sans">
          <CheckCircle2 className="w-5 h-5 text-nude-ember" />
          <span>{confirmationNotice}</span>
        </div>
      )}

      {/* Top minimal controls for testing states */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-3 bg-white/90 backdrop-blur-xs border border-smoke/20 px-5 py-2.5 rounded-full shadow-xs">
        {/* Version Switcher */}
        <span className="font-sans text-xs uppercase tracking-wider text-smoke-fade font-bold">
          Version:
        </span>
        <div className="flex items-center bg-paper border border-smoke/20 rounded-full p-0.5 text-xs">
          <button
            onClick={() => setVersion('v1')}
            className={`px-3 py-1 rounded-full text-xs font-sans font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              version === 'v1'
                ? 'bg-smoke text-white shadow-xs'
                : 'text-smoke-fade hover:text-smoke'
            }`}
          >
            V1 (Stored)
          </button>
          <button
            onClick={() => setVersion('v2')}
            className={`px-3 py-1 rounded-full text-xs font-sans font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              version === 'v2'
                ? 'bg-bandana-red text-white shadow-xs'
                : 'text-smoke-fade hover:text-bandana-red'
            }`}
          >
            V2 (Active)
          </button>
        </div>

        <div className="h-4 w-0.25 bg-smoke/20 mx-1 hidden sm:block" />

        <span className="font-sans text-xs uppercase tracking-wider text-smoke-fade font-bold">
          Layout:
        </span>
        <button
          onClick={() => setVariant('default')}
          className={`px-3 py-1 rounded-full text-xs font-sans font-semibold uppercase tracking-wider transition-all cursor-pointer ${
            variant === 'default'
              ? 'bg-smoke text-white shadow-xs'
              : 'text-smoke-fade hover:text-smoke'
          }`}
        >
          Normal
        </button>
        <button
          onClick={() => setVariant('compact')}
          className={`px-3 py-1 rounded-full text-xs font-sans font-semibold uppercase tracking-wider transition-all cursor-pointer ${
            variant === 'compact'
              ? 'bg-smoke text-white shadow-xs'
              : 'text-smoke-fade hover:text-smoke'
          }`}
        >
          Compact
        </button>

        <div className="h-4 w-0.25 bg-smoke/20 mx-1 hidden sm:block" />

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`px-3.5 py-1 rounded-full text-xs font-sans font-semibold uppercase tracking-wider transition-all cursor-pointer ${
            isExpanded
              ? 'bg-bandana-red text-white shadow-xs'
              : 'bg-neutral-100 text-smoke hover:bg-neutral-200'
          }`}
        >
          {isExpanded ? 'Drawer Open (Active)' : 'Drawer Closed'}
        </button>
      </div>

      {/* Render the Active Version of Ride Easy Component Card in the center */}
      <div className="w-full flex justify-center items-center">
        <ActiveOffersCard
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
