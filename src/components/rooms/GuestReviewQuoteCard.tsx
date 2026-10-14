import * as React from "react";

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
      className={`rounded-2xl border border-current/20 bg-transparent px-5 py-6 text-center shadow-xs sm:px-8 sm:py-8 ${className}`}
    >
      <blockquote
        style={{ fontFamily: 'var(--font-blockquote)' }}
        className={`mx-auto max-w-2xl ${textSizeClass} font-normal leading-relaxed tracking-wide text-inherit`}
      >
        &ldquo;{normalizedQuote}&rdquo;
      </blockquote>

      {(attribution || sourceLabel) && (
        <p style={{ fontFamily: "var(--font-body)" }} className="mt-5 text-[11px] font-medium uppercase tracking-[0.22em] text-inherit opacity-85 sm:mt-6 sm:text-xs">
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
