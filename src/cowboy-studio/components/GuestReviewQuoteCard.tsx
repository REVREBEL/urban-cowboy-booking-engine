import React from 'react';

export interface GuestReviewQuoteCardProps {
  quote?: string;
  reviewer?: string;
  date?: string;
  site?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const GuestReviewQuoteCard: React.FC<GuestReviewQuoteCardProps> = ({
  quote = 'We went all out and stayed in the Alpine Suite - beautiful, clean room with heated bathroom floors and a hot tub ideally located for night time star gazing.',
  reviewer = 'Ben',
  date = 'May 27, 2025',
  site = 'Google Reviews',
  className = '',
  size = 'md'
}) => {
  const textSizeClass =
    size === 'sm'
      ? 'text-lg sm:text-xl'
      : size === 'lg'
      ? 'text-2xl sm:text-3xl md:text-[34px]'
      : 'text-xl sm:text-2xl md:text-[25px]';

  return (
    <div
      className={`bg-white rounded-2xl border border-[#4E332D]/20 shadow-xs px-5 py-6 sm:px-8 sm:py-8 text-center ${className}`}
    >
      <blockquote
        className={`font-cedarville ${textSizeClass} text-[#964828] font-normal leading-relaxed tracking-wide max-w-2xl mx-auto`}
      >
        "{quote}"
      </blockquote>
      <p className="font-sans text-[11px] sm:text-xs tracking-[0.22em] text-[#964828]/85 uppercase mt-5 sm:mt-6 font-medium">
        — {reviewer}{date ? `, ${date}` : ''}{site ? ` · ${site}` : ''}
      </p>
    </div>
  );
};
