import React, { useEffect, useId, useRef } from 'react';

interface SearchBarPromoDropdownProps {
  value: string;
  onChange: (value: string) => void;
  onApply: (value: string) => void;
  onClose?: () => void;
  className?: string;
}

export const SearchBarPromoDropdown: React.FC<SearchBarPromoDropdownProps> = ({ value, onChange, onApply, onClose, className = '' }) => {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => inputRef.current?.focus(), []);

  return (
    <div role="dialog" aria-label="Promo code entry" className={`box-border w-[275px] max-w-[calc(100vw-2rem)] border-2 border-[#343833] bg-[#FAF9F9] p-6 shadow-xl ${className}`}>
      <label htmlFor={inputId} className="block font-brothers text-sm uppercase tracking-wider text-[#343833]">Promo</label>
      <div className="mt-2 flex items-center border-b border-[#4E332D]">
        <input
          ref={inputRef}
          id={inputId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') onApply(value);
            if (event.key === 'Escape') onClose?.();
          }}
          placeholder="Promo/Group Code"
          className="h-11 min-w-0 flex-1 bg-transparent font-uchen text-base text-[#4E332D] outline-none placeholder:text-[#4E332D]"
        />
        <button type="button" onClick={() => onApply(value)} className="font-brothers text-xs uppercase text-[#4E332D]">Apply</button>
      </div>
    </div>
  );
};
