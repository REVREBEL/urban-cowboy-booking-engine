export interface FocusAmenityCardProps {
  headline: string;
  description?: string | null;
  className?: string;
}

/**
 * Selected amenity detail card matching Figma node 1326:191.
 *
 * Uses the booking engine's typography and semantic color tokens while
 * preserving the Figma card geometry.
 */
export function FocusAmenityCard({
  headline,
  description,
  className = "",
}: FocusAmenityCardProps) {
  return (
    <article
      data-figma-node="1326:191"
      className={`box-border flex w-full max-w-[405px] flex-col items-start rounded-[11.06px] bg-primary px-[35px] py-[30px] text-secondary ${className}`}
    >
      <div className="flex w-full flex-col items-start gap-[10px] [word-break:break-word]">
        <h3 className="w-full font-heading text-[22.12px] leading-normal text-accent">
          {headline}
        </h3>
        {description && (
          <p className="w-full font-body text-[15.484px] leading-normal text-secondary">
            {description}
          </p>
        )}
      </div>
    </article>
  );
}

export default FocusAmenityCard;
