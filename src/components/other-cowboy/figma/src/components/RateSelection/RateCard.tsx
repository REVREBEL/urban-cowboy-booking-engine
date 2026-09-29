import type { RateOffer } from '../../booking/types';

type RateCardProps = {
  rate: RateOffer;
  size?: 'default' | 'compact';
  onSelect?: (rate: RateOffer) => void;
};

type CardSize = 'default' | 'compact';

// ── Shared helpers ────────────────────────────────────────────────────────────

function fmtPrice(n: number) {
  return `$${Math.round(n)} Nightly`;
}

function BookBtn({
  label,
  bgColor,
  textColor,
  borderColor,
  onClick,
}: {
  label: string;
  bgColor?: string;
  textColor: string;
  borderColor: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center px-10 py-4 rounded-full border-[3px] transition-opacity hover:opacity-80 active:scale-[0.98]"
      style={{
        background: bgColor ?? 'transparent',
        borderColor,
        fontFamily: 'var(--font-brothers)',
        color: textColor,
        fontSize: 20,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
      }}
    >
      {label}
    </button>
  );
}

function CancelNote({ text, color }: { text: string; color: string }) {
  return (
    <p className="text-center text-[12px] tracking-wide" style={{ fontFamily: 'var(--font-lato)', color }}>
      {text}
    </p>
  );
}

// ── RIDE EASY ────────────────────────────────────────────────────────────────

function RideEasyCard({ rate, size, onSelect }: { rate: RateOffer; size: CardSize; onSelect?: (r: RateOffer) => void }) {
  const compact = size === 'compact';
  const w = compact ? 340 : 500;
  const minH = compact ? 480 : 720;

  return (
    <div
      className="bg-[#e2e2e1] border-4 border-[#343833] rounded-[50px] p-[5px] flex items-stretch shrink-0"
      style={{ width: w, minHeight: minH }}
    >
      <div className="bg-white border-4 border-[#343833] rounded-[44px] flex flex-col items-center justify-between w-full px-7 py-10 gap-6">
        {/* Top: eyebrow + headline split */}
        <div className="flex flex-col items-start w-full gap-2">
          <p
            className="text-[#d65241] text-sm tracking-[2.5px] uppercase font-bold"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            {rate.eyebrow || 'Best Flexible Rate'}
          </p>
          {/* Split: big serif left, smaller serif right */}
          <div className="flex items-end gap-1 w-full">
            <div
              style={{
                fontFamily: "'Noto Serif Tibetan', var(--font-quattrocento), Georgia, serif",
                fontWeight: 700,
                fontSize: compact ? 60 : 78,
                lineHeight: 0.88,
                color: '#343833',
                letterSpacing: -3,
                whiteSpace: 'pre-line',
                flexShrink: 0,
              }}
            >
              {'RIDE\nEASY'}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-quattrocento)',
                fontWeight: 700,
                fontSize: compact ? 22 : 30,
                lineHeight: 1.15,
                color: '#343833',
                letterSpacing: -0.5,
                whiteSpace: 'pre-line',
                paddingBottom: 4,
                marginLeft: 8,
              }}
            >
              {'Keep\nYour\nOptions\nOpen.'}
            </div>
          </div>
        </div>

        {/* Description + badge — default only */}
        {!compact && (
          <div className="flex flex-col gap-4 w-full">
            <p className="text-black text-[16px] leading-relaxed tracking-wide" style={{ fontFamily: 'var(--font-lato)' }}>
              {rate.description || 'Our standard rate for guests who want a little more freedom around their plans.'}
            </p>
            <div className="flex items-center gap-2">
              <img src="/assets/best-rate-guaranteed-icon.svg" alt="" aria-hidden="true" className="h-7 w-auto shrink-0" />
              <span className="text-black text-[14px] tracking-wide font-bold uppercase" style={{ fontFamily: 'var(--font-lato)' }}>
                The Cowboy Best Rate Guarantee
              </span>
            </div>
          </div>
        )}

        {/* Price */}
        <div className="w-full">
          <p
            className="text-black leading-tight"
            style={{ fontFamily: 'var(--font-quattrocento)', fontWeight: 700, fontSize: compact ? 30 : 40, letterSpacing: -1 }}
          >
            {fmtPrice(rate.nightlyRate)}
          </p>
          <p className="text-right text-xs tracking-wide text-black" style={{ fontFamily: 'var(--font-lato)' }}>
            Excluding Taxes + Fees
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3 w-full">
          <BookBtn
            label={compact ? 'Select Rate' : 'Book This Rate'}
            textColor="#343833"
            borderColor="#343833"
            onClick={() => onSelect?.(rate)}
          />
          <CancelNote text={rate.cancellationPolicy || 'Free Cancellation until May 31, 2027'} color="#343833" />
        </div>
      </div>
    </div>
  );
}

// ── SUNUP ────────────────────────────────────────────────────────────────────

function SunupCard({ rate, size, onSelect }: { rate: RateOffer; size: CardSize; onSelect?: (r: RateOffer) => void }) {
  const compact = size === 'compact';
  const w = compact ? 340 : 500;
  const minH = compact ? 480 : 720;

  return (
    <div
      className="relative flex flex-col items-center justify-between overflow-hidden shrink-0"
      style={{ background: '#ebe8e0', width: w, minHeight: minH, padding: compact ? '28px 24px 36px' : '40px 36px 52px' }}
    >
      {/* Decorative SVG border overlay */}
      <img
        src={compact ? '/assets/sunup-decoration-compact.svg' : '/assets/sunup-decoration.svg'}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 w-full h-full"
        style={{ objectFit: 'fill' }}
      />
      <div className="relative z-10 flex flex-col items-center w-full h-full justify-between gap-5">
        <div className="flex flex-col items-center gap-2 w-full">
          {/* Default: category label above headline */}
          {!compact && (
            <p
              className="uppercase text-center tracking-[-0.5px]"
              style={{
                fontFamily: "'Noto Serif Tibetan', var(--font-quattrocento), serif",
                fontWeight: 700,
                fontSize: 20,
                color: '#69253a',
              }}
            >
              {rate.eyebrow || 'Room + Breakfast'}
            </p>
          )}
          <div
            className="text-center"
            style={{
              fontFamily: 'var(--font-quattrocento)',
              fontWeight: 700,
              fontSize: compact ? 52 : 68,
              lineHeight: 0.92,
              color: '#9a5636',
              letterSpacing: -4,
              whiteSpace: 'pre-line',
            }}
          >
            {'SUNUP\nBEFORE THE TRAIL'}
          </div>
          {/* Compact: category label below headline */}
          {compact && (
            <p
              className="uppercase text-center"
              style={{
                fontFamily: "'Noto Serif Tibetan', var(--font-quattrocento), serif",
                fontWeight: 700,
                fontSize: 16,
                color: '#69253a',
              }}
            >
              Room + Breakfast
            </p>
          )}
        </div>

        {/* Description — default only */}
        {!compact && (
          <p
            className="text-center text-[16px] leading-relaxed tracking-wide"
            style={{ fontFamily: "'Noto Serif Tibetan', var(--font-lato), serif", color: '#9a5636' }}
          >
            {rate.description || 'Start the day slowly with your room and breakfast wrapped into one easy stay.'}
          </p>
        )}

        {/* Price */}
        <div className="w-full text-center">
          <p
            style={{
              fontFamily: 'var(--font-quattrocento)',
              fontWeight: 700,
              fontSize: compact ? 30 : 40,
              color: '#9a5636',
              letterSpacing: -3,
              textTransform: 'uppercase',
            }}
          >
            {fmtPrice(rate.nightlyRate)}
          </p>
          <p className="text-right text-xs tracking-wide" style={{ fontFamily: 'var(--font-lato)', color: '#4e332d' }}>
            Excluding Taxes + Fees
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3 w-full">
          <BookBtn
            label={compact ? 'Select Rate' : 'Book This Rate'}
            bgColor="#9a5636"
            textColor="#ebe8e0"
            borderColor="#9a5636"
            onClick={() => onSelect?.(rate)}
          />
          <CancelNote text={rate.cancellationPolicy || 'Free Cancellation until May 31, 2027'} color="#69253a" />
        </div>
      </div>
    </div>
  );
}

// ── PLAN AHEAD ───────────────────────────────────────────────────────────────

function PlanAheadCard({ rate, size, onSelect }: { rate: RateOffer; size: CardSize; onSelect?: (r: RateOffer) => void }) {
  const compact = size === 'compact';
  const w = compact ? 340 : 500;
  const minH = compact ? 480 : 720;

  return (
    <div
      className="border-[5px] border-[#343833] flex flex-col items-center justify-between shrink-0"
      style={{ background: '#f2f2f2', borderRadius: 50, width: w, minHeight: minH, padding: compact ? '32px 28px 40px' : '48px 36px 52px' }}
    >
      <div
        className="text-center"
        style={{
          fontFamily: 'var(--font-league-spartan)',
          fontWeight: 700,
          fontSize: compact ? 50 : 66,
          color: '#000',
          letterSpacing: -1,
          lineHeight: 0.9,
          transform: 'rotate(0.31deg)',
          whiteSpace: 'pre-line',
        }}
      >
        {(rate.headline || 'PLAN\nAHEAD').toUpperCase()}
      </div>

      {/* Description — default only */}
      {!compact && (
        <p className="text-[16px] leading-relaxed tracking-wide text-[#343833]" style={{ fontFamily: 'var(--font-arvo)' }}>
          {rate.description || 'Book in advance and lock in a lower rate. Non-refundable.'}
        </p>
      )}

      <p className="text-[#343833] uppercase tracking-[3px] font-semibold text-xs" style={{ fontFamily: 'var(--font-league-spartan)' }}>
        {rate.eyebrow || 'Advance Purchase'}
      </p>

      {/* Price */}
      <div className="w-full">
        <p
          style={{
            fontFamily: 'var(--font-league-spartan)',
            fontWeight: 600,
            fontSize: compact ? 26 : 34,
            color: '#343833',
            letterSpacing: -1,
            textTransform: 'uppercase',
          }}
        >
          {fmtPrice(rate.nightlyRate)}
        </p>
        <p className="text-right text-xs tracking-wide text-[#343833]" style={{ fontFamily: 'var(--font-lato)' }}>
          Excluding Taxes + Fees
        </p>
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center gap-3 w-full">
        <BookBtn
          label={compact ? 'Select Rate' : 'Book This Rate'}
          bgColor="#343833"
          textColor="#f9f9f9"
          borderColor="#343833"
          onClick={() => onSelect?.(rate)}
        />
        <CancelNote text={rate.cancellationPolicy || 'Non-refundable'} color="#343833" />
      </div>
    </div>
  );
}

// ── STAY A WHILE ─────────────────────────────────────────────────────────────

function StayAWhileCard({ rate, size, onSelect }: { rate: RateOffer; size: CardSize; onSelect?: (r: RateOffer) => void }) {
  const compact = size === 'compact';
  const w = compact ? 340 : 500;
  const minH = compact ? 480 : 720;

  return (
    <div
      className="flex flex-col items-center justify-between shrink-0"
      style={{ background: '#343833', width: w, minHeight: minH, padding: compact ? '32px 28px 40px' : '48px 36px 52px' }}
    >
      <p className="uppercase text-center tracking-[3px] text-xs font-bold" style={{ fontFamily: 'var(--font-bianco)', color: '#ebe8e0', letterSpacing: 2 }}>
        {rate.eyebrow || 'Extended Stay'}
      </p>

      <div className="h-[5px] w-full bg-[#ebe8e0]" />

      <div
        className="text-center"
        style={{
          fontFamily: 'var(--font-quattrocento)',
          fontWeight: 700,
          fontSize: compact ? 44 : 60,
          color: '#fff',
          letterSpacing: -2,
          lineHeight: 0.9,
          whiteSpace: 'pre-line',
        }}
      >
        {(rate.headline || 'STAY\nA WHILE').toUpperCase()}
      </div>

      <div className="h-[5px] w-full bg-[#ebe8e0]" />

      {/* Description — default only */}
      {!compact && (
        <p className="text-[16px] leading-relaxed tracking-wide text-center" style={{ fontFamily: 'var(--font-quattrocento)', color: '#ebe8e0' }}>
          {rate.description || 'Stay three nights or more and settle in at a better rate.'}
        </p>
      )}

      {/* Price */}
      <div className="w-full text-center">
        <p
          style={{ fontFamily: 'var(--font-quattrocento)', fontWeight: 700, fontSize: compact ? 26 : 36, color: '#fff', textTransform: 'uppercase', letterSpacing: -1 }}
        >
          {fmtPrice(rate.nightlyRate)}
        </p>
        <p className="text-xs tracking-wide text-right" style={{ fontFamily: 'var(--font-lato)', color: '#ebe8e0' }}>
          Excluding Taxes + Fees
        </p>
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center gap-3 w-full">
        <BookBtn
          label={compact ? 'Select Rate' : 'Book This Rate'}
          bgColor="#ebe8e0"
          textColor="#343833"
          borderColor="#ebe8e0"
          onClick={() => onSelect?.(rate)}
        />
        <CancelNote text={rate.cancellationPolicy || 'Free Cancellation until May 31, 2027'} color="#ebe8e0" />
      </div>
    </div>
  );
}

// ── OUTFIT ───────────────────────────────────────────────────────────────────

function OutfitCard({ rate, size, onSelect }: { rate: RateOffer; size: CardSize; onSelect?: (r: RateOffer) => void }) {
  const compact = size === 'compact';
  const w = compact ? 340 : 500;
  const minH = compact ? 480 : 720;

  return (
    <div
      className="flex flex-col items-stretch shrink-0 overflow-hidden"
      style={{ background: '#0e301a', width: w, minHeight: minH }}
    >
      <div
        className="flex flex-col items-center justify-between flex-1"
        style={{ padding: compact ? '32px 28px 32px' : '48px 36px 40px', gap: compact ? 16 : 24 }}
      >
        {/* Fineday script eyebrow */}
        <p className="text-center text-xl" style={{ fontFamily: 'var(--font-fineday)', color: '#ebe8e0' }}>
          {rate.eyebrow || 'book direct & save'}
        </p>

        {/* League Gothic headline */}
        <div
          className="text-center"
          style={{
            fontFamily: 'var(--font-league-gothic)',
            fontWeight: 400,
            fontSize: compact ? 64 : 86,
            color: '#f2aaa9',
            letterSpacing: 5,
            lineHeight: 0.92,
            textTransform: 'uppercase',
            whiteSpace: 'pre-line',
          }}
        >
          {(rate.headline || 'OUTFIT\nYOUR TRIP').toUpperCase()}
        </div>

        {/* Fineday sub-label */}
        <p className="text-center text-lg" style={{ fontFamily: 'var(--font-fineday)', color: '#ebe8e0' }}>
          member rate
        </p>

        {/* Description — default only */}
        {!compact && (
          <p
            className="text-center text-[15px] leading-relaxed"
            style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, color: '#ebe8e0', fontVariationSettings: '"opsz" 14' }}
          >
            {rate.description || 'Exclusive savings for Urban Cowboy members. Sign in or join to unlock this rate.'}
          </p>
        )}

        {/* Price */}
        <div className="w-full text-center">
          <p
            style={{ fontFamily: 'var(--font-league-gothic)', fontWeight: 400, fontSize: compact ? 34 : 46, color: '#f2aaa9', letterSpacing: 2, textTransform: 'uppercase' }}
          >
            {fmtPrice(rate.nightlyRate)}
          </p>
          <p className="text-right text-xs tracking-wide" style={{ fontFamily: 'var(--font-lato)', color: '#ebe8e0' }}>
            Excluding Taxes + Fees
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3 w-full">
          <BookBtn
            label={compact ? 'Select Rate' : 'Book This Rate'}
            bgColor="#f2aaa9"
            textColor="#0e301a"
            borderColor="#f2aaa9"
            onClick={() => onSelect?.(rate)}
          />
          <CancelNote text={rate.cancellationPolicy || 'Free Cancellation until May 31, 2027'} color="#ebe8e0" />
        </div>
      </div>

      {/* Pink banner — default only */}
      {!compact && (
        <div className="w-full px-8 py-4" style={{ background: '#f2aaa9', borderBottomLeftRadius: 50, borderBottomRightRadius: 50 }}>
          <p
            className="text-center text-[13px] font-bold tracking-wide"
            style={{ fontFamily: 'var(--font-dm-sans)', color: '#0e301a', fontVariationSettings: '"opsz" 14' }}
          >
            Members save 15% or more — every stay.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function RateCard({ rate, size = 'default', onSelect }: RateCardProps) {
  const props = { rate, size: size as CardSize, onSelect };

  switch (rate.variant) {
    case 'ride-easy':    return <RideEasyCard {...props} />;
    case 'sunup':        return <SunupCard {...props} />;
    case 'plan-ahead':   return <PlanAheadCard {...props} />;
    case 'stay-a-while': return <StayAWhileCard {...props} />;
    case 'outfit':       return <OutfitCard {...props} />;
    default:             return <RideEasyCard {...props} />;
  }
}
