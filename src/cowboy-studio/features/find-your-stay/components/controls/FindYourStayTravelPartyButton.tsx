import React from 'react';
import type { PartyType } from '../../../../types';

export interface TravelPartyItem {
  id: PartyType;
  title: string;
  subtitle: string;
}

export const TRAVEL_PARTY_OPTIONS: TravelPartyItem[] = [
  { id: 'friends', title: 'FRIENDS', subtitle: 'A crew weekend' },
  { id: 'solo', title: 'SOLO', subtitle: 'Time to myself' },
  { id: 'family', title: 'FAMILY', subtitle: 'Grown-ups and kids' },
  { id: 'partner', title: 'PARTNER', subtitle: 'Just the two of us' }
];

interface Props extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onSelect'> {
  option: TravelPartyItem;
  selected: boolean;
  onSelect: (value: PartyType) => void;
}

export function FindYourStayTravelPartyButton({
  option,
  selected,
  onSelect,
  className = '',
  ...props
}: Props) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(option.id)}
      className={`group flex min-h-[100px] w-full flex-col items-start justify-center gap-1.5 rounded-2xl border-2 px-5 py-5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BE5B35] focus-visible:ring-offset-4 focus-visible:ring-offset-[#103922] ${
        selected
          ? 'border-[#EBE8E0] bg-[#EBE8E0] text-[#4E332D] shadow-lg'
          : 'border-[#A79996] bg-white/25 text-[#D1C9BE] hover:bg-white/35'
      } ${className}`}
      {...props}
    >
      <span className="font-brothers text-[22px] leading-none tracking-[1.2px]">
        {option.title}
      </span>
      <span className="font-editorial text-xs leading-4 opacity-80">
        {option.subtitle}
      </span>
    </button>
  );
}

