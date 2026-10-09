import React from "react";

export interface GuestReviewQuoteCardProps {
  quote: string;
  reviewer?: string | null;
  date?: string | null;
  site?: string | null;
  sourceUrl?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const GuestReviewQuoteCard: React.FC<GuestReviewQuoteCardProps> = ({
  quote,
  reviewer,
  date,
  site,
  sourceUrl,
  className = "",
  size = "md",
}) => {
  const normalizedQuote = quote.trim();
  if (!normalizedQuote) return null;

  const textSizeClass =
    size === "sm"
      ? "text-lg sm:text-xl"
      : size === "lg"
        ? "text-2xl sm:text-3xl md:text-[34px]"
        : "text-xl sm:text-2xl md:text-[25px]";

  const attribution = [reviewer, date].filter(Boolean).join(", ");
  const sourceLabel = site?.trim() || null;

  return (
    <div
      className={`rounded-2xl border border-cowboy-umber/20 bg-white px-5 py-6 text-center shadow-xs sm:px-8 sm:py-8 ${className}`}
    >
      <blockquote
        className={`mx-auto max-w-2xl font-cedarville ${textSizeClass} font-normal leading-relaxed tracking-wide text-copper`}
      >
        &ldquo;{normalizedQuote}&rdquo;
      </blockquote>

      {(attribution || sourceLabel) && (
        <p className="mt-5 font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-copper/85 sm:mt-6 sm:text-xs">
          {attribution ? <>— {attribution}</> : null}
          {attribution && sourceLabel ? " · " : null}
          {sourceLabel && sourceUrl ? (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-current/40 underline-offset-4 transition hover:decoration-current"
            >
              {sourceLabel}
            </a>
          ) : (
            sourceLabel
          )}
        </p>
      )}
    </div>
  );
};
