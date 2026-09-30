import React, { useId, useState } from 'react';

export const COWBOY_LOCATIONS = ['CATSKILLS', 'NASHVILLE', 'DENVER'] as const;

interface SearchBarLocationDropdownProps {
  value: string;
  onChange: (location: string) => void;
  onClose?: () => void;
  className?: string;
}

export const SearchBarLocationDropdown: React.FC<SearchBarLocationDropdownProps> = ({ value, onChange, onClose, className = '' }) => {
  const headerId = useId();
  const [focusedIndex, setFocusedIndex] = useState(0);

  const select = (location: string) => {
    onChange(location);
    onClose?.();
  };

  return (
    <div
      role="dialog"
      aria-labelledby={headerId}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          const direction = event.key === 'ArrowDown' ? 1 : -1;
          setFocusedIndex((focusedIndex + direction + COWBOY_LOCATIONS.length) % COWBOY_LOCATIONS.length);
        } else if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          select(COWBOY_LOCATIONS[focusedIndex]);
        } else if (event.key === 'Escape') onClose?.();
      }}
      className={`box-border w-[362px] max-w-[calc(100vw-2rem)] border-2 border-[#4E332D] bg-[#FAF9F9] p-[25px] shadow-xl outline-none ${className}`}
    >
      <p id={headerId} className="m-0 pb-2 font-brothers text-base uppercase leading-[19px] tracking-wider text-[#A79996]">Select a Cowboy</p>
      <div role="listbox">
        {COWBOY_LOCATIONS.map((location, index) => (
          <button
            key={location}
            type="button"
            role="option"
            aria-selected={value.toUpperCase() === location}
            onMouseEnter={() => setFocusedIndex(index)}
            onFocus={() => setFocusedIndex(index)}
            onClick={() => select(location)}
            className="group flex h-[48px] w-full items-center justify-between border-t border-[#E2E2E1] bg-transparent py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#9A5636]"
          >
            <span className="font-desert text-base font-bold uppercase leading-[19px] tracking-[2px] text-[#4E332D] transition-transform group-hover:translate-x-0.5">{location}</span>
            {value.toUpperCase() === location && <span aria-hidden="true" className="font-brothers text-sm text-[#4E332D]">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
};
