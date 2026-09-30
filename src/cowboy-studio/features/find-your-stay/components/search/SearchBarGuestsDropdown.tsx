import React, { useId } from 'react';

export interface GuestCounts {
  adults: number;
  children: number;
  accessible: boolean;
}

interface SearchBarGuestsDropdownProps {
  counts: GuestCounts;
  onChange: (counts: GuestCounts) => void;
  className?: string;
}

const MinusIcon = () => (
  <svg width="12" height="2" viewBox="0 0 12 2" aria-hidden="true"><rect width="12" height="2" rx="1" fill="currentColor" /></svg>
);

const PlusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M5 0.5A.5.5 0 0 1 5.5 0h1a.5.5 0 0 1 .5.5V5h4.5a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H7v4.5a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5V7H.5a.5.5 0 0 1-.5-.5v-1A.5.5 0 0 1 .5 5H5V.5Z" fill="currentColor" /></svg>
);

interface StepperProps {
  label: string;
  value: number;
  min: number;
  onChange: (value: number) => void;
}

const Stepper: React.FC<StepperProps> = ({ label, value, min, onChange }) => (
  <div className="flex h-8 w-[100px] items-center justify-between">
    <button
      type="button"
      aria-label={`Decrease ${label}`}
      disabled={value <= min}
      onClick={() => onChange(Math.max(min, value - 1))}
      className="grid h-8 w-8 place-items-center rounded-full border border-[#343833] text-[#343833] transition hover:bg-[#F0EFEB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9A5636] disabled:cursor-not-allowed disabled:border-[#E1E0E0] disabled:text-[#C8C6C4]"
    >
      <MinusIcon />
    </button>
    <span aria-live="polite" className="w-7 text-center font-uchen text-base text-[#343833]">{value}</span>
    <button
      type="button"
      aria-label={`Increase ${label}`}
      onClick={() => onChange(value + 1)}
      className="grid h-8 w-8 place-items-center rounded-full border border-[#343833] text-[#343833] transition hover:bg-[#F0EFEB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9A5636]"
    >
      <PlusIcon />
    </button>
  </div>
);

export const SearchBarGuestsDropdown: React.FC<SearchBarGuestsDropdownProps> = ({ counts, onChange, className = '' }) => {
  const accessibleId = useId();

  return (
    <div role="dialog" aria-label="Guest selection" className={`box-border w-[360px] max-w-[calc(100vw-2rem)] border-2 border-[#343833] bg-[#FAF9F9] p-6 shadow-xl ${className}`}>
      <div className="flex min-h-[57px] items-center justify-between">
        <div><p className="m-0 font-brothers text-sm uppercase leading-[17px] text-[#343833]">Adults</p><p className="m-0 font-uchen text-[13px] leading-6 text-[#AFAEAE]">Age 13+</p></div>
        <Stepper label="adult guests" value={counts.adults} min={1} onChange={(adults) => onChange({ ...counts, adults })} />
      </div>
      <div className="h-px bg-[#E1E0E0]" />
      <div className="flex min-h-[58px] items-center justify-between">
        <div><p className="m-0 font-brothers text-sm uppercase leading-[17px] text-[#343833]">Children</p><p className="m-0 font-uchen text-[13px] leading-6 text-[#AFAEAE]">Age up to 12</p></div>
        <Stepper label="child guests" value={counts.children} min={0} onChange={(children) => onChange({ ...counts, children })} />
      </div>
      <div className="h-px bg-[#E1E0E0]" />
      <div className="flex min-h-[57px] items-center justify-between">
        <div><p id={accessibleId} className="m-0 font-brothers text-sm uppercase leading-[17px] text-[#343833]">Accessible</p><p className="m-0 font-uchen text-[13px] leading-6 text-[#AFAEAE]">ADA Rooms</p></div>
        <button
          type="button"
          role="switch"
          aria-checked={counts.accessible}
          aria-labelledby={accessibleId}
          onClick={() => onChange({ ...counts, accessible: !counts.accessible })}
          className={`relative flex h-8 w-[50px] items-center rounded-full p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9A5636] ${counts.accessible ? 'bg-[#343833]' : 'bg-[#E1E0E0]'}`}
        >
          <span className={`h-7 w-7 rounded-full bg-[#FAF9F9] shadow-sm transition-transform ${counts.accessible ? 'translate-x-[18px]' : 'translate-x-0'}`} />
        </button>
      </div>
    </div>
  );
};
