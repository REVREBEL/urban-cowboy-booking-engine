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
  const icon = buildingIconSlot ?? <BuildingIcon decorative />;

  if (layout === "Row" || layout === "Row Reverse") {
    const iconSlot = displayBuildingIcon ? (
      <div
        data-name="BuildingIcon Slot"
        className="flex w-[300px] shrink-0 items-start overflow-clip p-[10px]"
      >
        {icon}
      </div>
    ) : null;

    const copy = (
      <div
        data-name="BuildingDecriptionWrapper"
        className="flex w-[555px] shrink-0 flex-col items-start justify-end gap-[10px] self-end text-balance [word-break:break-word]"
      >
        <p className={[headingClass, "shrink-0 whitespace-nowrap"].join(" ")}>
          {buildingName}
        </p>
        <p className={[descriptionClass, "min-w-full w-[min-content] shrink-0"].join(" ")}>
          {buildingDescription}
        </p>
        <p className={[taglineClass, "min-w-full w-[min-content] shrink-0"].join(" ")}>
          {buildingTagline}
        </p>
      </div>
    );

    return (
      <div
        data-figma-node={layout === "Row" ? "1352:9404" : "1357:16082"}
        data-layout={layout}
        className={[
          "grid w-[894px] grid-cols-[fit-content(100%)_minmax(0,1fr)] grid-rows-[repeat(1,fit-content(100%))] gap-x-[30px] gap-y-[10px]",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {layout === "Row" ? iconSlot : copy}
        {layout === "Row" ? copy : iconSlot}
      </div>
    );
  }

  const iconSlot = displayBuildingIcon ? (
    <div
      data-name="BuildingIcon Slot"
      className={[
        "flex w-full shrink-0 items-start overflow-clip py-[10px] z-[2]",
        layout === "StackedCenter" ? "justify-center" : "justify-start",
      ].join(" ")}
    >
      {icon}
    </div>
  ) : null;

  const copy =
    layout === "StackedCenter" ? (
      <div
        data-name="BuildingDecriptionWrapper"
        className="flex w-full shrink-0 flex-col items-start gap-[20px] text-balance text-center z-[1] [word-break:break-word]"
      >
        <div data-name="ContentWrapper" className="flex w-full shrink-0 flex-col items-start gap-[10px]">
          <p className={[headingClass, "w-[360px] shrink-0"].join(" ")}>
            {buildingName}
          </p>
          <p className={[descriptionClass, "w-[360px] shrink-0"].join(" ")}>
            {buildingDescription}
          </p>
        </div>
        <p className={[taglineClass, "w-full shrink-0"].join(" ")}>
          {buildingTagline}
        </p>
      </div>
    ) : (
      <div
        data-name="BuildingDecriptionWrapper"
        className="flex w-full shrink-0 flex-col items-start gap-[20px] text-balance z-[1] [word-break:break-word]"
      >
        <div data-name="ContentWrapper" className="relative h-[158px] w-[360px] shrink-0">
          <p className={[headingClass, "absolute left-0 top-0 w-[360px]"].join(" ")}>
            {buildingName}
          </p>
          <p className={[descriptionClass, "absolute left-0 top-[53px] w-[360px] text-pretty"].join(" ")}>
            {buildingDescription}
          </p>
        </div>
        <p className={[taglineClass, "min-w-full w-[min-content] shrink-0 text-balance"].join(" ")}>
          {buildingTagline}
        </p>
      </div>
    );

  return (
    <div
      data-figma-node={layout === "StackedCenter" ? "1352:15526" : "1357:16091"}
      data-layout={layout}
      className={[
        "isolate flex w-[400px] flex-col items-start gap-[40px] p-[20px]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {iconSlot}
      {copy}
    </div>
  );
}

export default BuildingDescription;
