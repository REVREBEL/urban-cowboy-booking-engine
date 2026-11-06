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

export interface BuildingIconProps {
  className?: string;
  buildingName?: BuildingIconName;
}

const BUILDING_ICON_CONFIG: Record<
  BuildingIconName,
  { src: string; heightClass: string }
> = {
  Default: {
    src: "/assets/icons/buildings/lodge.svg",
    heightClass: "h-[154.88px]",
  },
  Alpine: {
    src: "/assets/icons/buildings/alpine.svg",
    heightClass: "h-[144.028px]",
  },
  SlideMountain: {
    src: "/assets/icons/buildings/slide_mountain_haus.svg",
    heightClass: "h-[196.149px]",
  },
  Ralphs: {
    src: "/assets/icons/buildings/ralphs_bar_bowling.svg",
    heightClass: "h-[130.089px]",
  },
  Chalet: {
    src: "/assets/icons/buildings/chalet.svg",
    heightClass: "h-[144.476px]",
  },
  ForestHaus: {
    src: "/assets/icons/buildings/forest_haus.svg",
    heightClass: "h-[228.762px]",
  },
  MountianViewHaus: {
    src: "/assets/icons/buildings/mountian_view_haus.svg",
    heightClass: "h-[131.991px]",
  },
  EstonianSauna: {
    src: "/assets/icons/buildings/estonian_sauna.svg",
    heightClass: "h-[171.469px]",
  },
  Cabin: {
    src: "/assets/icons/buildings/cabin.svg",
    heightClass: "h-[171.342px]",
  },
  OpasCabin: {
    src: "/assets/icons/buildings/opas_cabin.svg",
    heightClass: "h-[192.172px]",
  },
};

/**
 * Figma BuildingIcon component set (1352:9306).
 *
 * Variant names and geometry intentionally mirror the Figma component set,
 * including the source spelling "MountianViewHaus".
 */
export function BuildingIcon({
  className = "",
  buildingName = "Default",
}: BuildingIconProps) {
  const config = BUILDING_ICON_CONFIG[buildingName];

  return (
    <div
      data-figma-node="1352:9306"
      data-building-name={buildingName}
      className={["flex items-center justify-center", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={["relative w-[283px] shrink-0", config.heightClass].join(" ")}
        aria-hidden="true"
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 block size-full bg-smoke"
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
