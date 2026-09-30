import React from 'react';
import { ExtraItem, AddonSchedulePreference } from '../types';
import { Plus, Minus, Check, Clock, Edit2 } from 'lucide-react';

export interface AddonCardProps {
  addon: ExtraItem;
  count: number;
  preference?: AddonSchedulePreference;
  onUpdateCount: (count: number) => void;
  onOpenCustomize?: () => void;
  className?: string;
}

function getPrefSummary(addon: ExtraItem, preference?: AddonSchedulePreference): string {
  if (!preference) return 'Ready upon arrival';
  if (addon.id === 'fresh-cut-flowers') {
    if (!preference.isGift) {
      return 'Waiting in suite prior to check-in';
    }
    return `Gift surprise${preference.giftRecipient ? ` for ${preference.giftRecipient}` : ''}`;
  }
  if (addon.id === 'celebration-cake') {
    const day = preference.selectedDate ? preference.selectedDate.split('(')[0].trim() : 'Arrival';
    const hasCard = preference.includeCard && preference.cardMessage ? ' + Note' : '';
    return `${day} delivery${hasCard}`;
  }
  if (preference.selectedDate) {
    const day = preference.selectedDate.split('(')[0].trim();
    return `${day}`;
  }
  return preference.selectedTime || 'Ready upon arrival';
}

/**
 * AddonCard
 * Reconstructed based on exact Figma reference specification:
 * - Card: width 461.35px, height 449px, background #EBE8E0, border-radius 17px, padding 17px 20px, gap 21px, flex-col, items-end
 * - add-on-item: width 421.35px, height 346px, border-radius 16px, gap 12px, flex-col, items-start
 * - item-image-wrapper: width 421.35px, height 236.99px, border-radius 16px, overflow hidden
 * - item-price: absolute (top: 27.52px, right: 28px / left: 292.79px), width 91px, height 39px, background #FFFFFF, padding 5px, font 'Bianco Sans' 24px bold #343833
 * - item-name: height 28px, font 'Brothers OT' 28px regular #1C1917, letter-spacing -0.449px, padding-left 8px
 * - item-description: height 57px, font 'Uchen' 14px line-height 17px #60605E, letter-spacing -0.15px, padding 0 8px
 * - Button: width 151px, height 48px, background #4E332D, border-radius 25px, padding 2px 30px 0, font 'Brothers OT' 14px bold #FFFFFF, letter-spacing 0.05em
 */
export const AddonCard: React.FC<AddonCardProps> = ({
  addon,
  count,
  preference,
  onUpdateCount,
  onOpenCustomize,
  className = ''
}) => {
  const isSelected = count > 0;
  const formattedPrice = addon.priceDisplay || `$${addon.price.toFixed(2)}`;

  const handleAddClick = () => {
    onUpdateCount(1);
    if (onOpenCustomize) {
      onOpenCustomize();
    }
  };

  return (
    <div
      className={`bg-[#EBE8E0] rounded-[17px] flex flex-col items-end w-full max-w-[461.35px] h-[449px] transition-all duration-300 relative group shrink-0 ${
        isSelected ? 'ring-2 ring-[#4E332D]' : 'hover:shadow-md'
      } ${className}`}
      style={{
        width: '461.35px',
        maxWidth: '100%',
        height: '449px',
        backgroundColor: '#EBE8E0',
        borderRadius: '17px',
        padding: '17px 20px',
        gap: '21px',
      }}
    >
      {/* ================= ADD-ON ITEM (421.35px x 346px) ================= */}
      <div
        className="w-full flex flex-col items-start self-stretch shrink-0"
        style={{
          width: '100%',
          maxWidth: '421.35px',
          height: '346px',
          gap: '12px',
          borderRadius: '16px',
        }}
      >
        {/* Item Image Wrapper (421.35px x 236.99px) */}
        <div
          className="w-full relative shrink-0 overflow-hidden"
          style={{
            width: '100%',
            height: '236.99px',
            borderRadius: '16px',
          }}
        >
          <img
            src={addon.image}
            alt={addon.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
            style={{
              width: '100%',
              height: '236.99px',
              borderRadius: '16px',
            }}
          />

          {/* Floating Price Tag (Exact: top 27.52px, right 28px / left 292.79px, width 91px, height 39px) */}
          <div
            className="absolute flex flex-col items-start justify-center shadow-xs"
            style={{
              position: 'absolute',
              top: '27.52px',
              right: '28px',
              minWidth: '91px',
              height: '39px',
              padding: '5px 10px',
              backgroundColor: '#FFFFFF',
              gap: '10px',
            }}
          >
            <span
              className="select-none tracking-tight whitespace-nowrap"
              style={{
                fontFamily: "'Bianco Sans', 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
                fontWeight: 700,
                fontSize: '24px',
                lineHeight: '29px',
                color: '#343833',
              }}
            >
              {formattedPrice}
            </span>
          </div>
        </div>

        {/* Item Name (Exact: width 421.35px, height 28px, font 'Brothers OT' 28px, color #1C1917) */}
        <div
          className="w-full relative"
          style={{
            width: '100%',
            height: '28px',
            paddingLeft: '8px',
            paddingRight: '8px',
          }}
        >
          <h3
            className="truncate uppercase"
            style={{
              fontFamily: "'BrothersOT', 'Brothers OT', 'Cinzel', serif",
              fontWeight: 400,
              fontSize: '28px',
              lineHeight: '100%',
              letterSpacing: '-0.449219px',
              color: '#1C1917',
              margin: 0,
            }}
            title={addon.title}
          >
            {addon.title}
          </h3>
        </div>

        {/* Item Description (Exact: width 421.35px, height 57px, font 'Uchen' 14px, line-height 17px, color #60605E) */}
        <div
          className="w-full flex flex-col items-start"
          style={{
            width: '100%',
            height: '57px',
            padding: '0px 8px',
            gap: '4px',
            overflow: 'hidden',
          }}
        >
          <p
            className="line-clamp-3 m-0"
            style={{
              fontFamily: "'Uchen', Georgia, serif",
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '17px',
              letterSpacing: '-0.150391px',
              color: '#60605E',
              maxWidth: '405px',
              height: '50px',
            }}
          >
            {addon.description}
          </p>
        </div>
      </div>

      {/* ================= BUTTON ROW ================= */}
      <div
        className={`w-full flex items-center ${count > 0 ? 'justify-between' : 'justify-end'}`}
        style={{
          width: '100%',
          height: '48px',
        }}
      >
        {count > 0 && onOpenCustomize && (
          <button
            type="button"
            onClick={onOpenCustomize}
            className="flex items-center gap-1.5 text-left text-xs font-sans text-[#73716D] hover:text-[#4E332D] transition-colors cursor-pointer group pr-2 shrink min-w-0"
            title="Click to customize delivery day, timing, or card note"
          >
            <Clock className="w-3.5 h-3.5 text-[#9A5636] shrink-0" />
            <span className="truncate max-w-[210px] text-[11px] leading-tight">
              <span className="text-[#4E332D] font-bold block truncate">
                {getPrefSummary(addon, preference)}
              </span>
              <span className="text-[#9A5636] underline group-hover:text-[#4E332D] font-medium inline-flex items-center gap-0.5">
                <span>Customize</span>
                <Edit2 className="w-2.5 h-2.5" />
              </span>
            </span>
          </button>
        )}

        {count === 0 ? (
          <button
            type="button"
            onClick={handleAddClick}
            className="hover:brightness-110 active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0"
            style={{
              width: '151px',
              height: '48px',
              backgroundColor: '#4E332D',
              borderRadius: '25px',
              padding: '2px 30px 0px',
              border: 'none',
            }}
            aria-label={`Add ${addon.title} to stay`}
          >
            <span
              style={{
                fontFamily: "'BrothersOT', 'Brothers OT', 'Cinzel', serif",
                fontWeight: 700,
                fontSize: '14px',
                lineHeight: '14px',
                letterSpacing: '0.05em',
                color: '#FFFFFF',
                textTransform: 'uppercase',
                userSelect: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              ADD TO STAY
            </span>
          </button>
        ) : (
          <div
            className="flex items-center justify-between px-3 shadow-xs transition-all shrink-0"
            style={{
              width: '151px',
              height: '48px',
              backgroundColor: '#0E301A',
              borderRadius: '25px',
              border: '1px solid #0E301A',
            }}
          >
            <button
              type="button"
              onClick={() => onUpdateCount(count - 1)}
              className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/35 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Remove one"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>

            <div className="flex items-center gap-1 select-none">
              <Check className="w-3.5 h-3.5 text-[#F2AAA9]" />
              <span
                className="font-bold text-[13px] uppercase tracking-wider text-white"
                style={{ fontFamily: "'BrothersOT', 'Cinzel', serif" }}
              >
                {count > 1 ? `${count}x` : 'ADDED'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onUpdateCount(count + 1)}
              className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/35 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Add another"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
