import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#4E332D] text-[#EBE8E0] pt-14 pb-12 mt-20 border-t-4 border-[#343833]">
      <div className="booking-shell">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-10 border-b border-[#EBE8E0]/15 text-center md:text-left">
          <div>
            <img
              src="/assets/logos/urban-cowboy.svg"
              alt="Urban Cowboy"
              className="h-10 sm:h-12 w-auto object-contain mx-auto md:mx-0 select-none"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 font-woodblock text-xs uppercase tracking-widest text-[#EBE8E0]/80">
            <span>The Catskills (Big Indian, NY)</span>
            <span>·</span>
            <span>Nashville, TN</span>
            <span>·</span>
            <span>Denver, CO</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-[11px] text-[#EBE8E0]/60 font-sans">
          <span>
            © {new Date().getFullYear()} Urban Cowboy Lodge & Bathing Suites. All rights reserved.
          </span>
          <div className="flex items-center gap-4 font-woodblock uppercase tracking-wider text-[10px]">
            <span>Privacy Policy</span>
            <span>·</span>
            <span>Terms & Conditions</span>
            <span>·</span>
            <span>Accessibility</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
