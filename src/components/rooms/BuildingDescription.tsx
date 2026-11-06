export type BuildingDescriptionTone = "default" | "inverse";

export interface BuildingDescriptionProps {
  buildingName: string;
  description: string;
  tagline?: string | null;
  tone?: BuildingDescriptionTone;
  className?: string;
}

/**
 * Figma BuildingDescription (1352:15529).
 *
 * Typography is translated onto the booking engine's global font tokens:
 * Desert Rain for the building name, Uchen for body copy, and Brothers for
 * the uppercase tagline.
 */
export function BuildingDescription({
  buildingName,
  description,
  tagline,
  tone = "default",
  className = "",
}: BuildingDescriptionProps) {
  const headingColor = tone === "inverse" ? "text-primary" : "text-card-foreground";
  const bodyColor = tone === "inverse" ? "text-primary" : "text-popover-foreground";
  const taglineColor =
    tone === "inverse" ? "text-secondary-foreground" : "text-emphasis";

  return (
    <div
      data-figma-node="1352:15529"
      className={[
        "flex w-full max-w-[360px] flex-col items-start gap-[20px] text-balance text-center [word-break:break-word]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex w-full flex-col items-start gap-[10px]">
        <h2
          className={[
            "w-full font-heading text-[48px] font-bold leading-[0.9]",
            headingColor,
          ].join(" ")}
        >
          {buildingName}
        </h2>
        <p
          className={[
            "w-full font-body text-[13px] font-normal leading-[1.6]",
            bodyColor,
          ].join(" ")}
        >
          {description}
        </p>
      </div>

      {tagline ? (
        <p
          className={[
            "w-full font-label text-[11px] leading-[1.5] uppercase",
            taglineColor,
          ].join(" ")}
        >
          {tagline}
        </p>
      ) : null}
    </div>
  );
}

export default BuildingDescription;
