import type { ReactNode } from "react";
import { BuildingIcon } from "./BuildingIcon";

export type BuildingDescriptionLayout =
  | "StackedCenter"
  | "Row"
  | "StackedLeft"
  | "Row Reverse";

export interface BuildingDescriptionProps {
  className?: string;
  buildingDescription?: string;
  buildingName?: string;
  buildingTagline?: string;
  buildingIconSlot?: ReactNode | null;
  displayBuildingIcon?: boolean;
  layout?: BuildingDescriptionLayout;
}

const DEFAULT_DESCRIPTION =
  "Built into the hillside above the Lodge, Alpine is home to ten of The Cowboy's most iconic rooms. Every suite pairs a freestanding clawfoot tub in front of a picture window, with the forest and mountains doing the decorating outside.";

const DEFAULT_TAGLINE =
  "This is Where you Come to Soak, Slow Down and Disappear for a While.";

const headingClass =
  "font-heading text-[48px] font-bold leading-[0.9] [color:var(--building-name-color,var(--smoke))]";
const descriptionClass =
  "text-[13px] font-normal leading-[1.6] [font-family:Inter,sans-serif] [color:var(--building-description-color,var(--cowboy-umber))]";
const taglineClass =
  "font-label text-[11px] font-normal leading-[1.5] uppercase [color:var(--building-tagline-color,var(--copper))]";

/**
 * Figma BuildingSection component set (1352:15525), exposed under the
 * requested React component name BuildingDescription.
 *
 * The public properties mirror Figma: four Layout variants, a building-icon
 * slot, DisplayBuildingIcon, and the three text properties.
 */
export function BuildingDescription({
  className = "",
  buildingDescription = DEFAULT_DESCRIPTION,
  buildingName = "Alpine",
  buildingTagline = DEFAULT_TAGLINE,
  buildingIconSlot = null,
  displayBuildingIcon = false,
  layout = "Row",
}: BuildingDescriptionProps) {
  const icon = buildingIconSlot ?? <BuildingIcon />;
  const isRow = layout === "Row";
  const isRowReverse = layout === "Row Reverse";
  const isStackedCenter = layout === "StackedCenter";

  if (isRow || isRowReverse) {
    const iconSlot = displayBuildingIcon ? (
      <div
        data-name="BuildingIcon Slot"
        className="flex w-full max-w-[300px] min-w-0 items-start overflow-clip p-[10px] md:shrink-0"
      >
        {icon}
      </div>
    ) : null;

    const copy = (
      <div
        data-name="BuildingDecriptionWrapper"
        className="flex w-full max-w-[555px] min-w-0 flex-col items-start justify-end gap-[10px] text-balance [word-break:break-word]"
      >
        <h2 className={[headingClass, "max-w-full min-w-0 break-words"].join(" ")}>
          {buildingName}
        </h2>
        <p className={[descriptionClass, "w-full min-w-0 break-words"].join(" ")}>
          {buildingDescription}
        </p>
        <p className={[taglineClass, "w-full min-w-0 break-words"].join(" ")}>
          {buildingTagline}
        </p>
      </div>
    );

    return (
      <div
        data-figma-node={isRow ? "1352:9404" : "1357:16082"}
        data-layout={layout}
        className={[
          "flex w-full min-w-0 flex-col items-start gap-[10px]",
          displayBuildingIcon ? "max-w-[865px] md:flex-row" : "max-w-[555px]",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {isRow ? iconSlot : copy}
        {isRow ? copy : iconSlot}
      </div>
    );
  }

  const iconSlot = displayBuildingIcon ? (
    <div
      data-name="BuildingIcon Slot"
      className={[
        "flex w-full shrink-0 items-start overflow-clip py-[10px] z-[2]",
        isStackedCenter ? "justify-center" : "justify-start",
      ].join(" ")}
    >
      {icon}
    </div>
  ) : null;

  return (
    <div
      data-figma-node={isStackedCenter ? "1352:15526" : "1378:17369"}
      data-layout={layout}
      className={[
        "isolate flex w-full max-w-[350px] min-w-0 flex-col items-start gap-[40px] p-[20px]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {iconSlot}

      <div
        data-name="BuildingDecriptionWrapper"
        className={[
          "flex min-h-[212px] w-full min-w-0 shrink-0 flex-col justify-between text-balance z-[1] [word-break:break-word]",
          isStackedCenter ? "items-center text-center" : "items-start text-left",
        ].join(" ")}
      >
        <div
          data-name="ContentWrapper"
          className={[
            "flex min-h-[158px] w-full min-w-0 flex-col justify-between",
            isStackedCenter ? "items-center" : "items-start",
          ].join(" ")}
        >
          <h2 className={[headingClass, "w-full min-w-0 break-words"].join(" ")}>
            {buildingName}
          </h2>
          <p className={[descriptionClass, "w-full min-w-0 break-words"].join(" ")}>
            {buildingDescription}
          </p>
        </div>
        <p className={[taglineClass, "w-full min-w-0 break-words"].join(" ")}>
          {buildingTagline}
        </p>
      </div>
    </div>
  );
}

export default BuildingDescription;
