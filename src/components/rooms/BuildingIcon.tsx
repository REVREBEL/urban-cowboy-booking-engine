export type BuildingIconName =
  | "Default"
  | "Alpine"
  | "SlideMountain"
  | "Ralphs"
  | "Chalet"
  | "ForestHaus"
  | "MountianViewHaus"
  | "EstonianSauna"
  | "Cabin"
  | "OpasCabin";

export type BuildingIconColor =
  | "Smoke"
  | "Snow"
  | "LakeForest"
  | "Ash"
  | "Alpine";

export interface BuildingIconProps {
  className?: string;
  buildingName?: BuildingIconName;
  color?: BuildingIconColor;
}

const BUILDING_ICON_CONFIG: Record<
  BuildingIconName,
  { src: string; heightClass: string; label: string }
> = {
  Default: {
    src: "/assets/icons/buildings/lodge.svg",
    heightClass: "h-[154.88px]",
    label: "The Lodge",
  },
  Alpine: {
    src: "/assets/icons/buildings/alpine.svg",
    heightClass: "h-[144.028px]",
    label: "Alpine",
  },
  SlideMountain: {
    src: "/assets/icons/buildings/slide_mountain_haus.svg",
    heightClass: "h-[196.149px]",
    label: "Slide Mountain Haus",
  },
  Ralphs: {
    src: "/assets/icons/buildings/ralphs_bar_bowling.svg",
    heightClass: "h-[130.089px]",
    label: "Ralph’s Bar and Bowling",
  },
  Chalet: {
    src: "/assets/icons/buildings/chalet.svg",
    heightClass: "h-[144.476px]",
    label: "Chalet",
  },
  ForestHaus: {
    src: "/assets/icons/buildings/forest_haus.svg",
    heightClass: "h-[228.762px]",
    label: "Forest Haus",
  },
  MountianViewHaus: {
    src: "/assets/icons/buildings/mountian_view_haus.svg",
    heightClass: "h-[131.991px]",
    label: "Mountain View Haus",
  },
  EstonianSauna: {
    src: "/assets/icons/buildings/estonian_sauna.svg",
    heightClass: "h-[171.469px]",
    label: "Estonian Sauna",
  },
  Cabin: {
    src: "/assets/icons/buildings/cabin.svg",
    heightClass: "h-[171.342px]",
    label: "Cabin",
  },
  OpasCabin: {
    src: "/assets/icons/buildings/opas_cabin.svg",
    heightClass: "h-[192.172px]",
    label: "Opa’s Cabin",
  },
};

/**
 * Figma BuildingIcon component set (1352:9306).
 *
 * Variant names and geometry intentionally mirror the Figma component set,
 * including the source spelling "MountianViewHaus".
 */
const BUILDING_ICON_COLOR_CLASS: Record<BuildingIconColor, string> = {
  Smoke: "bg-smoke",
  Snow: "bg-[var(--paper-50)]",
  LakeForest: "bg-lake-forest",
  Ash: "bg-[#ccc7bb]",
  Alpine: "bg-alpine-linen",
};

/**
 * Figma BuildingIconColors component set (1352:15806) documents this color
 * state as part of BuildingIcon. It is intentionally folded into this API.
 */
export function BuildingIcon({
  className = "",
  buildingName = "Default",
  color = "Smoke",
}: BuildingIconProps) {
  const config = BUILDING_ICON_CONFIG[buildingName];
  const colorClass = BUILDING_ICON_COLOR_CLASS[color];

  return (
    <div
      data-figma-node="1352:9306"
      data-building-name={buildingName}
      data-color={color}
      className={["flex items-center justify-center", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={["relative w-[283px] shrink-0", config.heightClass].join(" ")}
        role="img"
        aria-label={config.label}
      >
        <span
          aria-hidden="true"
          className={["absolute inset-0 block size-full", colorClass].join(" ")}
          style={{
            WebkitMask: `url("${config.src}") center / contain no-repeat`,
            mask: `url("${config.src}") center / contain no-repeat`,
          }}
        />
      </div>
    </div>
  );
}

export default BuildingIcon;
